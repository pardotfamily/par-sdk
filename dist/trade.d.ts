import { type Address, type Hex, type PublicClient } from "viem";
import type { ParLaunch, ParMarket } from "./launches.js";
import type { Hop } from "./pool.js";
/** A transaction ready for `sendTransaction`. */
export type TxRequest = {
    to: Address;
    data: Hex;
    value: bigint;
};
/** How ETH reaches a market's quote asset. Empty hops for a market quoted in ETH. */
export type EthRoute = {
    /** ETH -> quote, the order buys use. */
    buyHops: Hop[];
    /** quote -> ETH, the order sells use. */
    sellHops: Hop[];
    /** Whether the pricer currently accepts the route (a stale one still trades). */
    qualifies: boolean;
};
/**
 * The route between ETH and a quote asset, as the pricer stores it. Null when
 * the quote has no route at all (then the market trades in its quote only).
 */
export declare function getEthRoute(client: PublicClient, pairToken: Address): Promise<EthRoute | null>;
/** Routes for every market of a launch, null entries for markets ETH cannot reach. */
export declare function getEthRoutes(client: PublicClient, launch: ParLaunch): Promise<(EthRoute | null)[]>;
/** Split `amount` over markets proportionally to `weights` (e.g. tokens left on each curve); equal split if no weights. */
export declare function splitAmount(amount: bigint, count: number, weights?: bigint[]): bigint[];
type Leg = {
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
/** Buy with native ETH. `minTokensOut` is the slippage floor on the total received. */
export declare function buildBuyWithEth(launch: ParLaunch, routes: (EthRoute | null)[], ethIn: bigint, minTokensOut: bigint, recipient: Address, weights?: bigint[]): TxRequest;
/** Sell for native ETH. The router must be approved for `tokensIn` first (see `buildApprove`). */
export declare function buildSellToEth(launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, minEthOut: bigint, recipient: Address, weights?: bigint[]): TxRequest;
/** Swap in one market's own quote asset (no ETH zap). For ERC-20 quotes approve the router for `amountIn` first. */
export declare function buildSwapInQuote(launch: ParLaunch, market: ParMarket, side: "buy" | "sell", amountIn: bigint, minAmountOut: bigint, recipient: Address): TxRequest;
/** ERC-20 approval of `spender` (the router of this launch, by default) for `amount`. */
export declare function buildApprove(token: Address, spender: Address, amount?: bigint): TxRequest;
/** Apply a slippage tolerance in bps to a quoted output (e.g. 100 = 1%). */
export declare function withSlippage(amountOut: bigint, bps: number): bigint;
/** Tokens a buy of `ethIn` would return right now, price impact and LP fee included. */
export declare function quoteBuyWithEth(client: PublicClient, launch: ParLaunch, routes: (EthRoute | null)[], ethIn: bigint, weights?: bigint[]): Promise<bigint>;
/**
 * ETH a sell of `tokensIn` would pay out right now, price impact and LP fee
 * included. The seller's balance and approval are overridden in the
 * simulation, so this quotes for any wallet, tokens held or not.
 */
export declare function quoteSellToEth(client: PublicClient, launch: ParLaunch, routes: (EthRoute | null)[], tokensIn: bigint, owner?: Address, weights?: bigint[]): Promise<bigint>;
export {};
