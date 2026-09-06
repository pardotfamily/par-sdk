import type { Address, PublicClient } from "viem";
import { type ParLaunch } from "./launches.js";
import { getTokenMetadata } from "./metadata.js";
import { ParIndexer } from "./indexer.js";
import { type EthRoute, type TxRequest } from "./trade.js";
import { type LaunchEvent, type TradeEvent } from "./events.js";
export * from "./addresses.js";
export * from "./abi.js";
export * from "./chain.js";
export * from "./pool.js";
export * from "./launches.js";
export * from "./events.js";
export * from "./metadata.js";
export * from "./indexer.js";
export * from "./trade.js";
export type ParOptions = {
    /** Your own viem PublicClient for Robinhood Chain; a public-RPC client is created if omitted. */
    client?: PublicClient;
    /** RPC URL, used only when `client` is not given. */
    rpcUrl?: string;
    /** Indexer base URL; defaults to the public https://api.par.family. */
    indexerUrl?: string;
};
/** A launch together with the ETH routes of its markets, ready to quote and trade. */
export type TradableLaunch = ParLaunch & {
    routes: (EthRoute | null)[];
};
export type Par = {
    client: PublicClient;
    indexer: ParIndexer;
    /** Is this a par token, and how is it set up? Null for anything else. */
    getLaunch(token: Address): Promise<ParLaunch | null>;
    /** Name, symbol, logo, description, socials, supply, from the token itself. */
    getTokenMetadata(token: Address): ReturnType<typeof getTokenMetadata>;
    /** Launch plus the ETH route of each market; the input `quoteBuy`/`quoteSell`/`buildBuy`/`buildSell` take. */
    getTradable(token: Address): Promise<TradableLaunch | null>;
    /** Spot price of every market, raw quote units per whole token. */
    getSpotPrices(launch: ParLaunch): Promise<bigint[]>;
    /** Tokens out for `ethIn`, simulated now. */
    quoteBuy(launch: TradableLaunch, ethIn: bigint): Promise<bigint>;
    /** ETH out for `tokensIn` sold by `owner`, simulated now. */
    quoteSell(launch: TradableLaunch, tokensIn: bigint, owner?: Address): Promise<bigint>;
    /** Buy transaction; `slippageBps` is applied to a fresh quote (default 1%). */
    buildBuy(launch: TradableLaunch, ethIn: bigint, recipient: Address, slippageBps?: number): Promise<TxRequest & {
        expectedOut: bigint;
    }>;
    /** Sell transaction; the launch router must already be approved (see `buildApprove`). */
    buildSell(launch: TradableLaunch, tokensIn: bigint, owner: Address, slippageBps?: number): Promise<TxRequest & {
        expectedOut: bigint;
    }>;
    /** Launch events in a block range. */
    getLaunches(fromBlock: bigint, toBlock?: bigint | "latest"): Promise<LaunchEvent[]>;
    /** New launches as they happen; returns unsubscribe. */
    watchLaunches(cb: (l: LaunchEvent) => void): () => void;
    /** Trades of a token's markets in a block range. */
    getTrades(launch: ParLaunch, fromBlock: bigint, toBlock?: bigint | "latest"): Promise<TradeEvent[]>;
    /** Trades as they happen, across every market of the token; returns unsubscribe. */
    watchTrades(launch: ParLaunch, cb: (t: TradeEvent) => void): () => void;
};
/**
 * One object that does the common things. Everything it wraps is also
 * exported as a plain function for callers that want to hold their own state.
 */
export declare function createPar(opts?: ParOptions): Par;
