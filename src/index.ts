import type { Address, PublicClient } from "viem";
import { createParClient, ROBINHOOD_CHAIN_ID } from "./chain.js";
import { indexerUrlOf } from "./addresses.js";
import { getLaunch, type ParLaunch } from "./launches.js";
import { getTokenMetadata } from "./metadata.js";
import { ParIndexer } from "./indexer.js";
import { getEthRoutes, quoteBuyWithEth, quoteSellToEth, buildBuyWithEth, buildSellToEth, withSlippage, type EthRoute, type TxRequest } from "./trade.js";
import { getLaunches, watchLaunches, getTrades, watchTrades, type LaunchEvent, type TradeEvent } from "./events.js";
import { readSpotPriceX18 } from "./pool.js";

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
  /** The chain to work on: 4663 Robinhood Chain (default), 5042 Arc, and every other id in `ADDRESSES_BY_CHAIN`. */
  chainId?: number;
  /** Your own viem PublicClient for that chain; a public-RPC client is created if omitted. */
  client?: PublicClient;
  /** RPC URL, used only when `client` is not given. */
  rpcUrl?: string;
  /** Indexer base URL; defaults to the chain's public indexer (https://api.par.family on Robinhood Chain). */
  indexerUrl?: string;
};

/** A launch together with the ETH routes of its markets, ready to quote and trade. */
export type TradableLaunch = ParLaunch & { routes: (EthRoute | null)[] };

export type Par = {
  chainId: number;
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
  buildBuy(launch: TradableLaunch, ethIn: bigint, recipient: Address, slippageBps?: number): Promise<TxRequest & { expectedOut: bigint }>;
  /** Sell transaction; the launch router must already be approved (see `buildApprove`). */
  buildSell(launch: TradableLaunch, tokensIn: bigint, owner: Address, slippageBps?: number): Promise<TxRequest & { expectedOut: bigint }>;
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
export function createPar(opts: ParOptions = {}): Par {
  const chainId = opts.chainId ?? ROBINHOOD_CHAIN_ID;
  const client = opts.client ?? createParClient(opts.rpcUrl, chainId);
  const indexer = new ParIndexer(opts.indexerUrl ?? indexerUrlOf(chainId));

  return {
    chainId,
    client,
    indexer,

    /** Is this a par token, and how is it set up? Null for anything else. */
    getLaunch: (token: Address) => getLaunch(client, token, chainId),

    /** Name, symbol, logo, description, socials, supply, from the token itself. */
    getTokenMetadata: (token: Address) => getTokenMetadata(client, token),

    /** Launch plus the ETH route of each market; the input `quoteBuy`/`quoteSell`/`buildBuy`/`buildSell` take. */
    async getTradable(token: Address): Promise<TradableLaunch | null> {
      const launch = await getLaunch(client, token, chainId);
      if (!launch) return null;
      return { ...launch, routes: await getEthRoutes(client, launch, chainId) };
    },

    /** Spot price of every market, raw quote units per whole token. */
    getSpotPrices: (launch: ParLaunch) => Promise.all(launch.markets.map((m) => readSpotPriceX18(client, launch.token, m.poolKey, chainId))),

    /** Tokens out for `ethIn`, simulated now. */
    quoteBuy: (launch: TradableLaunch, ethIn: bigint) => quoteBuyWithEth(client, launch, launch.routes, ethIn, undefined, chainId),

    /** ETH out for `tokensIn` sold by `owner`, simulated now. */
    quoteSell: (launch: TradableLaunch, tokensIn: bigint, owner?: Address) => quoteSellToEth(client, launch, launch.routes, tokensIn, owner, undefined, chainId),

    /** Buy transaction; `slippageBps` is applied to a fresh quote (default 1%). */
    async buildBuy(launch: TradableLaunch, ethIn: bigint, recipient: Address, slippageBps = 100): Promise<TxRequest & { expectedOut: bigint }> {
      const expectedOut = await quoteBuyWithEth(client, launch, launch.routes, ethIn, undefined, chainId);
      return { ...buildBuyWithEth(launch, launch.routes, ethIn, withSlippage(expectedOut, slippageBps), recipient, undefined, chainId), expectedOut };
    },

    /** Sell transaction; the launch router must already be approved (see `buildApprove`). */
    async buildSell(launch: TradableLaunch, tokensIn: bigint, owner: Address, slippageBps = 100): Promise<TxRequest & { expectedOut: bigint }> {
      const expectedOut = await quoteSellToEth(client, launch, launch.routes, tokensIn, owner, undefined, chainId);
      return { ...buildSellToEth(launch, launch.routes, tokensIn, withSlippage(expectedOut, slippageBps), owner, undefined, chainId), expectedOut };
    },

    /** Launch events in a block range. */
    getLaunches: (fromBlock: bigint, toBlock?: bigint | "latest") => getLaunches(client, fromBlock, toBlock, chainId),
    /** New launches as they happen; returns unsubscribe. */
    watchLaunches: (cb: (l: LaunchEvent) => void) => watchLaunches(client, cb, undefined, chainId),
    /** Trades of a token's markets in a block range. */
    async getTrades(launch: ParLaunch, fromBlock: bigint, toBlock?: bigint | "latest"): Promise<TradeEvent[]> {
      const per = await Promise.all(launch.markets.map((m) => getTrades(client, m, fromBlock, toBlock, chainId)));
      return per.flat().sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1));
    },
    /** Trades as they happen, across every market of the token; returns unsubscribe. */
    watchTrades: (launch: ParLaunch, cb: (t: TradeEvent) => void) => watchTrades(client, launch.markets, cb, undefined, chainId),
  };
}
