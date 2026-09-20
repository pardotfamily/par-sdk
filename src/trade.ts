import {
  encodeAbiParameters, encodeFunctionData, keccak256, maxUint256, toHex, zeroAddress,
  type Address, type Hex, type PublicClient,
} from "viem";
import { getAddresses } from "./addresses.js";
import { erc20Abi, multiRouterAbi, quotePricerAbi, routerAbi } from "./abi.js";
import { ROBINHOOD_CHAIN_ID, getReference, isReference } from "./chain.js";
import type { ParLaunch, ParMarket } from "./launches.js";
import type { Hop } from "./pool.js";

/*
 * Trading. Every par pool is a plain Uniswap v4 pool, so any v4 router works
 * for a swap in the pool's own quote asset. The helpers here go through
 * par's routers, which add two things: paying in / receiving the chain's
 * reference asset for pools quoted in another asset (the router walks the
 * pricer's route reference -> quote -> token inside one PoolManager unlock),
 * and, for multi-market tokens, one trade split over all pools with the
 * slippage floor on the total.
 *
 * The reference asset is native ETH on Robinhood Chain and the USDC ERC-20
 * on Arc (see `getReference`). Every helper takes an optional trailing
 * `chainId` (Robinhood Chain by default) and picks the entry point that
 * chain has: the `*WithEth` names are kept for their callers and, on a
 * chain whose reference is an ERC-20, build the `*Reference` calls instead,
 * which are paid through an allowance (see `buildApprove`) rather than
 * `value`.
 *
 * Nothing here signs. `build*` return { to, data, value } for any wallet
 * library; `quote*` simulate against the chain.
 */

/** A transaction ready for `sendTransaction`. */
export type TxRequest = { to: Address; data: Hex; value: bigint };

/** How the reference asset reaches a market's quote asset. Empty hops for a market quoted in the reference. */
export type EthRoute = {
  /** reference -> quote, the order buys use. */
  buyHops: Hop[];
  /** quote -> reference, the order sells use. */
  sellHops: Hop[];
  /** Whether the pricer currently accepts the route (a stale one still trades). */
  qualifies: boolean;
};

const NO_HOPS: Hop[] = [];

/**
 * The route between the reference asset and a quote asset, as the pricer
 * stores it. Null when the quote has no route at all (then the market
 * trades in its quote only).
 */
export async function getEthRoute(client: PublicClient, pairToken: Address, chainId: number = ROBINHOOD_CHAIN_ID): Promise<EthRoute | null> {
  if (isReference(pairToken, chainId)) return { buyHops: NO_HOPS, sellHops: NO_HOPS, qualifies: true };
  const [hops, qualifies] = await client.readContract({
    address: getAddresses(chainId).quotePricer,
    abi: quotePricerAbi,
    functionName: "route",
    args: [pairToken],
  });
  if (hops.length === 0) return null;
  const sellHops = hops.map((h) => ({ key: { ...h.key }, v3: h.v3 }));
  return { buyHops: [...sellHops].reverse(), sellHops, qualifies };
}

/** Routes for every market of a launch, null entries for markets the reference cannot reach. */
export async function getEthRoutes(client: PublicClient, launch: ParLaunch, chainId: number = ROBINHOOD_CHAIN_ID): Promise<(EthRoute | null)[]> {
  return Promise.all(launch.markets.map((m) => getEthRoute(client, m.pairToken, chainId)));
}

/** Split `amount` over markets proportionally to `weights` (e.g. tokens left on each curve); equal split if no weights. */
export function splitAmount(amount: bigint, count: number, weights?: bigint[]): bigint[] {
  if (count === 0) return [];
  const w = weights && weights.length === count && weights.some((x) => x > 0n) ? weights : Array<bigint>(count).fill(1n);
  const total = w.reduce((a, b) => a + b, 0n);
  const parts = w.map((x) => (amount * x) / total);
  const rest = amount - parts.reduce((a, b) => a + b, 0n);
  parts[parts.indexOf(parts.reduce((a, b) => (b > a ? b : a)))] += rest; // dust to the largest slice
  return parts;
}

/** One market's slice of a multi-market trade: the pool index, the route to its quote and the input amount. */
export type Leg = { market: number; hops: Hop[]; amountIn: bigint };

/**
 * Legs for a multi-market trade: one slice per market that ETH can reach.
 * Markets without a route are skipped; the caller decides whether that is
 * acceptable. `weights` defaults to equal slices.
 */
export function buildLegs(launch: ParLaunch, routes: (EthRoute | null)[], amountIn: bigint, side: "buy" | "sell", weights?: bigint[]): Leg[] {
  const reachable = launch.markets.filter((_, i) => routes[i] !== null);
  const w = weights ? reachable.map((m) => weights[m.index]) : undefined;
  const slices = splitAmount(amountIn, reachable.length, w);
  return reachable.map((m, i) => ({
    market: m.index,
    hops: side === "buy" ? routes[m.index]!.buyHops : routes[m.index]!.sellHops,
    amountIn: slices[i],
  })).filter((l) => l.amountIn > 0n);
}

/**
 * Buy with the reference asset: native ETH on Robinhood Chain (sent as
 * `value`), the USDC ERC-20 on Arc (taken from an allowance, see
 * `buildBuyWithReference`). `minTokensOut` is the slippage floor on the
 * total received.
 */
export function buildBuyWithEth(launch: ParLaunch, routes: (EthRoute | null)[], ethIn: bigint, minTokensOut: bigint, recipient: Address, weights?: bigint[], chainId: number = ROBINHOOD_CHAIN_ID): TxRequest {
  const ref = getReference(chainId);
  if (!ref.isNative) return buildBuyWithReference(launch, routes, ethIn, minTokensOut, recipient, weights, chainId);
  const a = getAddresses(chainId);
  if (launch.kind === "single") {
    const m = launch.markets[0];
    const route = routes[0];
    if (!route) throw new Error(`no ETH route to ${m.quoteSymbol}; trade this pool in its quote asset`);
    if (m.pairToken === ref.address) {
      return {
        to: a.router,
        data: encodeFunctionData({
          abi: routerAbi,
          functionName: "swapExactIn",
          args: [m.poolKey, !m.tokenIsCurrency0, ethIn, minTokensOut, recipient],
        }),
        value: ethIn,
      };
    }
    return {
      to: a.router,
      data: encodeFunctionData({ abi: routerAbi, functionName: "buyWithEth", args: [m.poolKey, route.buyHops, minTokensOut, recipient] }),
      value: ethIn,
    };
  }
  const legs = buildLegs(launch, routes, ethIn, "buy", weights);
  if (legs.length === 0) throw new Error("no market of this token is reachable from ETH");
  return {
    to: a.multiRouter,
    data: encodeFunctionData({ abi: multiRouterAbi, functionName: "buyWithEth", args: [launch.token, legs, minTokensOut, recipient] }),
    value: ethIn,
  };
}

/**
 * Buy with the chain's reference asset paid as an ERC-20 (USDC on Arc):
 * the router must be approved for `amountIn` first (`buildApprove` with
 * `getReference(chainId).address`). On a chain whose reference is native
 * this is `buildBuyWithEth`. Single-market launches only have a reference
 * entry point for a pool quoted in the reference itself; the ERC-20 zap
 * through another quote exists on the multi router alone.
 */
export function buildBuyWithReference(launch: ParLaunch, routes: (EthRoute | null)[], amountIn: bigint, minTokensOut: bigint, recipient: Address, weights?: bigint[], chainId: number = ROBINHOOD_CHAIN_ID): TxRequest {
  const ref = getReference(chainId);
  if (ref.isNative) return buildBuyWithEth(launch, routes, amountIn, minTokensOut, recipient, weights, chainId);
  const a = getAddresses(chainId);
  if (launch.kind === "single") {
    const m = launch.markets[0];
    if (!isReference(m.pairToken, chainId)) {
      throw new Error(`single-market pool quoted in ${m.quoteSymbol} has no ${ref.symbol} zap on this chain; trade it in its quote asset`);
    }
    return {
      to: a.router,
      data: encodeFunctionData({
        abi: routerAbi,
        functionName: "swapExactIn",
        args: [m.poolKey, !m.tokenIsCurrency0, amountIn, minTokensOut, recipient],
      }),
      value: 0n,
    };
  }
  const legs = buildLegs(launch, routes, amountIn, "buy", weights);
  if (legs.length === 0) throw new Error(`no market of this token is reachable from ${ref.symbol}`);
  return {
    to: a.multiRouter,
    data: encodeFunctionData({ abi: multiRouterAbi, functionName: "buyWithReference", args: [launch.token, legs, amountIn, minTokensOut, recipient] }),
    value: 0n,
  };
}

/**
 * Sell for the reference asset: native ETH on Robinhood Chain, the USDC
 * ERC-20 on Arc (see `buildSellToReference`). The router must be approved
 * for `tokensIn` first (see `buildApprove`).
 */
export function buildSellToEth(launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, minEthOut: bigint, recipient: Address, weights?: bigint[], chainId: number = ROBINHOOD_CHAIN_ID): TxRequest {
  const ref = getReference(chainId);
  if (!ref.isNative) return buildSellToReference(launch, routes, tokensIn, minEthOut, recipient, weights, chainId);
  const a = getAddresses(chainId);
  if (launch.kind === "single") {
    const m = launch.markets[0];
    const route = routes[0];
    if (!route) throw new Error(`no ETH route from ${m.quoteSymbol}; trade this pool in its quote asset`);
    if (m.pairToken === ref.address) {
      return {
        to: a.router,
        data: encodeFunctionData({
          abi: routerAbi,
          functionName: "swapExactIn",
          args: [m.poolKey, m.tokenIsCurrency0, tokensIn, minEthOut, recipient],
        }),
        value: 0n,
      };
    }
    return {
      to: a.router,
      data: encodeFunctionData({
        abi: routerAbi,
        functionName: "sellToEth",
        args: [m.poolKey, m.tokenIsCurrency0, tokensIn, route.sellHops, minEthOut, recipient],
      }),
      value: 0n,
    };
  }
  const legs = buildLegs(launch, routes, tokensIn, "sell", weights);
  if (legs.length === 0) throw new Error("no market of this token is reachable from ETH");
  return {
    to: a.multiRouter,
    data: encodeFunctionData({ abi: multiRouterAbi, functionName: "sellToEth", args: [launch.token, legs, minEthOut, recipient] }),
    value: 0n,
  };
}

/**
 * Sell for the chain's reference asset delivered as an ERC-20 (USDC on
 * Arc). The router must be approved for `tokensIn` first. On a chain whose
 * reference is native this is `buildSellToEth`; the single-market limit of
 * `buildBuyWithReference` applies.
 */
export function buildSellToReference(launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, minOut: bigint, recipient: Address, weights?: bigint[], chainId: number = ROBINHOOD_CHAIN_ID): TxRequest {
  const ref = getReference(chainId);
  if (ref.isNative) return buildSellToEth(launch, routes, tokensIn, minOut, recipient, weights, chainId);
  const a = getAddresses(chainId);
  if (launch.kind === "single") {
    const m = launch.markets[0];
    if (!isReference(m.pairToken, chainId)) {
      throw new Error(`single-market pool quoted in ${m.quoteSymbol} has no ${ref.symbol} zap on this chain; trade it in its quote asset`);
    }
    return {
      to: a.router,
      data: encodeFunctionData({
        abi: routerAbi,
        functionName: "swapExactIn",
        args: [m.poolKey, m.tokenIsCurrency0, tokensIn, minOut, recipient],
      }),
      value: 0n,
    };
  }
  const legs = buildLegs(launch, routes, tokensIn, "sell", weights);
  if (legs.length === 0) throw new Error(`no market of this token is reachable from ${ref.symbol}`);
  return {
    to: a.multiRouter,
    data: encodeFunctionData({ abi: multiRouterAbi, functionName: "sellToReference", args: [launch.token, legs, minOut, recipient] }),
    value: 0n,
  };
}

/** Swap in one market's own quote asset (no zap). For ERC-20 quotes approve the router for `amountIn` first. */
export function buildSwapInQuote(launch: ParLaunch, market: ParMarket, side: "buy" | "sell", amountIn: bigint, minAmountOut: bigint, recipient: Address, chainId: number = ROBINHOOD_CHAIN_ID): TxRequest {
  const a = getAddresses(chainId);
  // `value` carries the input only when the quote is literally native (address zero), whatever the chain.
  if (launch.kind === "multi") {
    if (side === "sell") {
      const legs: Leg[] = [{ market: market.index, hops: NO_HOPS, amountIn }];
      return {
        to: a.multiRouter,
        data: encodeFunctionData({ abi: multiRouterAbi, functionName: "sellToQuotes", args: [launch.token, legs, [minAmountOut], recipient] }),
        value: 0n,
      };
    }
    return {
      to: a.multiRouter,
      data: encodeFunctionData({ abi: multiRouterAbi, functionName: "buyWithQuote", args: [launch.token, market.index, amountIn, minAmountOut, recipient] }),
      value: market.pairToken === zeroAddress ? amountIn : 0n,
    };
  }
  const zeroForOne = side === "buy" ? !market.tokenIsCurrency0 : market.tokenIsCurrency0;
  return {
    to: a.router,
    data: encodeFunctionData({ abi: routerAbi, functionName: "swapExactIn", args: [market.poolKey, zeroForOne, amountIn, minAmountOut, recipient] }),
    value: side === "buy" && market.pairToken === zeroAddress ? amountIn : 0n,
  };
}

/** The `TokenParams` a launch is created with, as the factories and routers take it. */
export type TokenParams = {
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: { twitter: string; telegram: string; discord: string; website: string; farcaster: string };
  creatorFeeRecipient: Address;
  creatorTaxBps: number;
  /** The factory's `previewLaunchEconomics(launchConfigId, pairTokens)` for the same inputs. */
  expectedEconomics: Hex;
  salt: Hex;
};

/**
 * Launch a multi-market token and land the opening buy in the same
 * transaction, through the multi router. `launchFee` is the factory's
 * `launchFee()`, always paid as `value`; `amountIn` is the opening buy in
 * the reference asset, sent along as `value` where the reference is native
 * and taken from an allowance on the router otherwise (`buildApprove` with
 * `getReference(chainId).address`). With no legs and a zero amount only the
 * launch happens.
 */
export function buildLaunchAndBuy(params: TokenParams, launchConfigId: bigint, pairTokens: Address[], legs: Leg[], amountIn: bigint, minTokensOut: bigint, launchFee: bigint, chainId: number = ROBINHOOD_CHAIN_ID): TxRequest {
  const ref = getReference(chainId);
  const a = getAddresses(chainId);
  if (ref.isNative) {
    return {
      to: a.multiRouter,
      data: encodeFunctionData({
        abi: multiRouterAbi,
        functionName: "launchAndBuyWithEth",
        args: [params, launchConfigId, pairTokens, legs, minTokensOut],
      }),
      value: launchFee + amountIn,
    };
  }
  return {
    to: a.multiRouter,
    data: encodeFunctionData({
      abi: multiRouterAbi,
      functionName: "launchAndBuyWithReference",
      args: [params, launchConfigId, pairTokens, legs, amountIn, minTokensOut],
    }),
    value: launchFee,
  };
}

/** ERC-20 approval of `spender` (the router of this launch, by default) for `amount`. */
export function buildApprove(token: Address, spender: Address, amount: bigint = maxUint256): TxRequest {
  return { to: token, data: encodeFunctionData({ abi: erc20Abi, functionName: "approve", args: [spender, amount] }), value: 0n };
}

/** Apply a slippage tolerance in bps to a quoted output (e.g. 100 = 1%). */
export function withSlippage(amountOut: bigint, bps: number): bigint {
  return (amountOut * BigInt(10_000 - bps)) / 10_000n;
}

// A throwaway account for simulations; its balance/allowance is overridden per call.
const SIM_ACCOUNT: Address = "0x000000000000000000000000000000000000dEaD";

/*
 * Storage slots of the launcher token (OpenZeppelin ERC20 layout: _balances
 * at slot 0, _allowances at slot 1). Overridden in simulations so a sell can
 * be quoted for any wallet without a real approval or balance.
 */
function balanceSlot(owner: Address): Hex {
  return keccak256(encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, 0n]));
}
function allowanceSlot(owner: Address, spender: Address): Hex {
  const inner = keccak256(encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [owner, 1n]));
  return keccak256(encodeAbiParameters([{ type: "address" }, { type: "bytes32" }], [spender, inner]));
}

/**
 * Tokens a buy of `ethIn` (in raw units of the reference asset) would return
 * right now, price impact and LP fee included. Where the reference is native
 * the buyer's balance is overridden and any account will do. Where it is an
 * ERC-20 (Arc) the router pulls the input from an allowance that cannot be
 * overridden (the USDC contract's storage layout is not ours to know), so
 * pass an `owner` that has approved the router; the balance itself is still
 * overridden, since on Arc the native and ERC-20 balances are one figure
 * seen at 18 and 6 decimals.
 */
export async function quoteBuyWithEth(client: PublicClient, launch: ParLaunch, routes: (EthRoute | null)[], ethIn: bigint, weights?: bigint[], chainId: number = ROBINHOOD_CHAIN_ID, owner: Address = SIM_ACCOUNT): Promise<bigint> {
  const ref = getReference(chainId);
  const tx = buildBuyWithEth(launch, routes, ethIn, 0n, owner, weights, chainId);
  const nativeIn = ref.isNative ? ethIn : ethIn * 10n ** BigInt(18 - ref.decimals);
  const { data } = await client.call({
    account: owner,
    to: tx.to,
    data: tx.data,
    value: tx.value,
    stateOverride: [{ address: owner, balance: nativeIn * 2n }],
  });
  return BigInt(data ?? "0x0");
}

/**
 * Reference asset (raw units) a sell of `tokensIn` would pay out right now,
 * price impact and LP fee included. The seller's balance and approval are
 * overridden in the simulation, so this quotes for any wallet, tokens held
 * or not.
 */
export async function quoteSellToEth(client: PublicClient, launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, owner: Address = SIM_ACCOUNT, weights?: bigint[], chainId: number = ROBINHOOD_CHAIN_ID): Promise<bigint> {
  const tx = buildSellToEth(launch, routes, tokensIn, 0n, owner, weights, chainId);
  const { data } = await client.call({
    account: owner,
    to: tx.to,
    data: tx.data,
    stateOverride: [
      {
        address: launch.token,
        stateDiff: [
          { slot: balanceSlot(owner), value: toHex(tokensIn, { size: 32 }) },
          { slot: allowanceSlot(owner, tx.to), value: toHex(maxUint256, { size: 32 }) },
        ],
      },
    ],
  });
  return BigInt(data ?? "0x0");
}
