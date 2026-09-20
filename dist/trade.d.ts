import { type Address, type Hex, type PublicClient } from "viem";
import type { ParLaunch, ParMarket } from "./launches.js";
import type { Hop } from "./pool.js";
/** A transaction ready for `sendTransaction`. */
export type TxRequest = {
    to: Address;
    data: Hex;
    value: bigint;
};
/** How the reference asset reaches a market's quote asset. Empty hops for a market quoted in the reference. */
export type EthRoute = {
    /** reference -> quote, the order buys use. */
    buyHops: Hop[];
    /** quote -> reference, the order sells use. */
    sellHops: Hop[];
    /** Whether the pricer currently accepts the route (a stale one still trades). */
    qualifies: boolean;
};
/**
 * The route between the reference asset and a quote asset, as the pricer
 * stores it. Null when the quote has no route at all (then the market
 * trades in its quote only).
 */
export declare function getEthRoute(client: PublicClient, pairToken: Address, chainId?: number): Promise<EthRoute | null>;
/** Routes for every market of a launch, null entries for markets the reference cannot reach. */
export declare function getEthRoutes(client: PublicClient, launch: ParLaunch, chainId?: number): Promise<(EthRoute | null)[]>;
/** Split `amount` over markets proportionally to `weights` (e.g. tokens left on each curve); equal split if no weights. */
export declare function splitAmount(amount: bigint, count: number, weights?: bigint[]): bigint[];
/** One market's slice of a multi-market trade: the pool index, the route to its quote and the input amount. */
export type Leg = {
    market: number;
    hops: Hop[];
    amountIn: bigint;
};
/**
 * Legs for a multi-market trade: one slice per market that ETH can reach.
 * Markets without a route are skipped; the caller decides whether that is
 * acceptable. `weights` defaults to equal slices.
 */
export declare function buildLegs(launch: ParLaunch, routes: (EthRoute | null)[], amountIn: bigint, side: "buy" | "sell", weights?: bigint[]): Leg[];
/**
 * Buy with the reference asset: native ETH on Robinhood Chain (sent as
 * `value`), the USDC ERC-20 on Arc (taken from an allowance, see
 * `buildBuyWithReference`). `minTokensOut` is the slippage floor on the
 * total received.
 */
export declare function buildBuyWithEth(launch: ParLaunch, routes: (EthRoute | null)[], ethIn: bigint, minTokensOut: bigint, recipient: Address, weights?: bigint[], chainId?: number): TxRequest;
/**
 * Buy with the chain's reference asset paid as an ERC-20 (USDC on Arc):
 * the router must be approved for `amountIn` first (`buildApprove` with
 * `getReference(chainId).address`). On a chain whose reference is native
 * this is `buildBuyWithEth`. Single-market launches only have a reference
 * entry point for a pool quoted in the reference itself; the ERC-20 zap
 * through another quote exists on the multi router alone.
 */
export declare function buildBuyWithReference(launch: ParLaunch, routes: (EthRoute | null)[], amountIn: bigint, minTokensOut: bigint, recipient: Address, weights?: bigint[], chainId?: number): TxRequest;
/**
 * Sell for the reference asset: native ETH on Robinhood Chain, the USDC
 * ERC-20 on Arc (see `buildSellToReference`). The router must be approved
 * for `tokensIn` first (see `buildApprove`).
 */
export declare function buildSellToEth(launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, minEthOut: bigint, recipient: Address, weights?: bigint[], chainId?: number): TxRequest;
/**
 * Sell for the chain's reference asset delivered as an ERC-20 (USDC on
 * Arc). The router must be approved for `tokensIn` first. On a chain whose
 * reference is native this is `buildSellToEth`; the single-market limit of
 * `buildBuyWithReference` applies.
 */
export declare function buildSellToReference(launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, minOut: bigint, recipient: Address, weights?: bigint[], chainId?: number): TxRequest;
/** Swap in one market's own quote asset (no zap). For ERC-20 quotes approve the router for `amountIn` first. */
export declare function buildSwapInQuote(launch: ParLaunch, market: ParMarket, side: "buy" | "sell", amountIn: bigint, minAmountOut: bigint, recipient: Address, chainId?: number): TxRequest;
/** The `TokenParams` a launch is created with, as the factories and routers take it. */
export type TokenParams = {
    name: string;
    symbol: string;
    logo: string;
    description: string;
    socials: {
        twitter: string;
        telegram: string;
        discord: string;
        website: string;
        farcaster: string;
    };
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
export declare function buildLaunchAndBuy(params: TokenParams, launchConfigId: bigint, pairTokens: Address[], legs: Leg[], amountIn: bigint, minTokensOut: bigint, launchFee: bigint, chainId?: number): TxRequest;
/** ERC-20 approval of `spender` (the router of this launch, by default) for `amount`. */
export declare function buildApprove(token: Address, spender: Address, amount?: bigint): TxRequest;
/** Apply a slippage tolerance in bps to a quoted output (e.g. 100 = 1%). */
export declare function withSlippage(amountOut: bigint, bps: number): bigint;
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
export declare function quoteBuyWithEth(client: PublicClient, launch: ParLaunch, routes: (EthRoute | null)[], ethIn: bigint, weights?: bigint[], chainId?: number, owner?: Address): Promise<bigint>;
/**
 * Reference asset (raw units) a sell of `tokensIn` would pay out right now,
 * price impact and LP fee included. The seller's balance and approval are
 * overridden in the simulation, so this quotes for any wallet, tokens held
 * or not.
 */
export declare function quoteSellToEth(client: PublicClient, launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, owner?: Address, weights?: bigint[], chainId?: number): Promise<bigint>;
