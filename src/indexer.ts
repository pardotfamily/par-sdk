import type { Address, Hex } from "viem";
import { INDEXER_URL } from "./addresses.js";
import type { Socials } from "./metadata.js";

/*
 * Typed client for the public indexer at https://api.par.family. Every
 * amount is a decimal string of raw units (18 decimals for the launch token,
 * `quoteDecimals` for the quote). `priceEth` fields are floats in ETH.
 */

export type QuoteRisk = "native" | "verified" | "wild";

export type IndexedMarket = {
  index: number;
  poolId: Hex;
  pairToken: Address;
  quoteSymbol: string;
  quoteDecimals: number;
  quoteRisk: QuoteRisk;
  phantomQuote: string;
  positionId: string | null;
  quoteRaised: string;
  tokensOnCurve: string;
  totalVolumeQuote: string;
  creatorFeesQuote: string;
  creatorFeesToken: string;
  creatorCollectedQuote: string;
  creatorCollectedToken: string;
  tradeCount: number;
  /** Raw quote units per whole token; a decimal string that may carry fractional digits. Parse as a float. */
  lastPriceQuoteX18: string | null;
  lastPriceEth: number | null;
  quotePricedAt: number | null;
  lastPriceEthStale: boolean;
  lastTradeAt: number | null;
};

export type IndexedLaunch = {
  token: Address;
  /** Primary pool (the only one for single-market tokens; the ETH market or market 0 for multi). */
  poolId: Hex;
  poolFee: number;
  tickSpacing: number;
  deployer: Address;
  creatorFeeRecipient: Address;
  name: string;
  symbol: string;
  logo: string | null;
  description: string | null;
  socials?: Socials | null;
  pairToken: Address;
  quoteSymbol: string;
  quoteDecimals: number;
  quoteRisk: QuoteRisk;
  phantomQuote: string;
  supply: string;
  baseFeeBps: number;
  creatorTaxBps: number;
  protocolFeeShareBps: number;
  protocolFeeRecipient: Address;
  quoteRaised: string;
  tokensOnCurve: string;
  totalVolumeQuote: string;
  creatorFeesQuote: string;
  creatorFeesToken: string;
  creatorCollectedQuote: string;
  creatorCollectedToken: string;
  burnedToken: string;
  /** The creator gave the creator share of fees to the holders (recipient is the holder vault). Permanent. */
  feesToHolders?: boolean;
  tradeCount: number;
  /** Raw quote units per whole token; a decimal string that may carry fractional digits. Parse as a float. */
  lastPriceQuoteX18: string | null;
  lastPriceEth: number | null;
  lastPriceEthStale?: boolean;
  quotePricedAt?: number | null;
  createdAt: number;
  launchTx: Hex | null;
  lastTradeAt: number | null;
  factory?: Address | null;
  locker?: Address | null;
  /** 1 for single-market tokens. */
  marketCount?: number;
  /** Present for multi-market tokens only. */
  markets?: IndexedMarket[] | null;
  /** ETH-denominated volume across every market (multi-market tokens). */
  totalVolumeEth?: number;
};

export type IndexedTrade = {
  id: string;
  token: Address;
  txHash: Hex;
  /** Transaction sender: the wallet that traded. */
  trader: Address;
  /** The contract that called PoolManager (a router). */
  sender: Address;
  /** Market index for multi-market tokens, null for single-market. */
  market: number | null;
  quoteSymbol: string | null;
  quoteDecimals: number | null;
  pairToken: Address | null;
  isBuy: boolean;
  quoteAmount: string;
  tokenAmount: string;
  /** LP fee on the trade, in the input asset: quote for a buy, token for a sell. */
  fee: string;
  /** Raw quote units per whole token; a decimal string that may carry fractional digits. Parse as a float. */
  priceQuoteX18: string;
  priceEth: number | null;
  timestamp: number;
  blockNumber: number;
};

export type Candle = {
  time: number;
  open: number; high: number; low: number; close: number;
  openEth: number | null; highEth: number | null; lowEth: number | null; closeEth: number | null;
  volumeQuote: number;
  trades: number;
  ethTrades: number;
};

export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type CandlesResponse = {
  token: Address;
  interval: CandleInterval;
  step: number;
  firstTradeAt: number | null;
  lastTradeAt: number | null;
  candles: Candle[];
};

export type Holder = { owner: Address; balance: string };

export type Position = {
  id: string;
  owner: Address;
  token: Address;
  balance: string;
  totalBoughtQuote: string;
  totalSoldQuote: string;
  updatedAt: number;
};

export type FeeCollection = {
  id: string;
  token: Address;
  txHash: Hex;
  protocolQuote: string;
  protocolToken: string;
  creatorQuote: string;
  creatorToken: string;
  timestamp: number;
  market: number | null;
};

export type LaunchOrder = "createdAt" | "lastTradeAt" | "quoteRaised" | "tradeCount" | "totalVolumeQuote" | "marketCap" | "recentVolume";

export type LaunchesQuery = {
  orderBy?: LaunchOrder;
  orderDirection?: "asc" | "desc";
  /** 1..500, default 30. */
  limit?: number;
  offset?: number;
  /** Seconds, only with orderBy=recentVolume (default 24h). */
  window?: number;
  /** Filter by creator wallet. */
  deployer?: Address;
  /** Name / symbol / address search. */
  q?: string;
  /** Only these tokens. */
  tokenIn?: Address[];
};

export type Distribution = { id: string; round: number; total: string; recipients: number; txHash: Hex; timestamp: number };
export type Distributions = {
  token: Address;
  vault: Address | null;
  wallet: Address | null;
  rounds: number;
  lastAt: number | null;
  /** Sum of every round, in token units. */
  total: string;
  items: Distribution[];
};
export type Reward = { id: string; token: Address; amount: string; txHash: Hex; timestamp: number };
export type Rewards = { owner: Address; total: string | null; items: Reward[] };
export type Buyback = { id: string; amount: string; txHash: Hex; timestamp: number };
/** Platform totals from `/stats`. ETH figures as numbers; wei figures as decimal strings. */
export type PlatformStats = {
  at: number;
  launches: number;
  launches24h: number;
  launchesTraded: number;
  /** Wallets holding at least one launch token (pool and lockers excluded). */
  holders: number;
  holderPositions: number;
  trades: number;
  trades24h: number;
  volumeEth: number;
  creatorEarnedEth: number;
  creatorCollectedEth: number;
  par: {
    token: Address;
    priceEth: number | null;
    burned: string;
    buybackBurned: string;
    buybackEth: string;
    buybacks: number;
  } | null;
};

export type Buybacks = {
  wallet: Address | null;
  token: Address | null;
  /** $par burned, in wei units. */
  burned: string;
  /** ETH the buyback wallet paid for it, in wei. */
  ethSpent: string;
  count: number;
  items: Buyback[];
};

export class ParIndexer {
  constructor(private readonly baseUrl: string = INDEXER_URL, private readonly fetchImpl: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
    const res = await this.fetchImpl(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`par indexer ${path}: HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  /** Indexer status: last indexed block and the addresses it follows. */
  health() {
    return this.get<{ ok: boolean; lastBlock: number; factory: Address; multiFactory: Address | null; [k: string]: unknown }>("/health");
  }

  /** List launches. */
  launches(query: LaunchesQuery = {}) {
    return this.get<IndexedLaunch[]>("/launches", {
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
      limit: query.limit,
      offset: query.offset,
      window: query.window,
      deployer: query.deployer,
      q: query.q,
      token_in: query.tokenIn?.join(","),
    });
  }

  /** Every launch, paged through in slices of 500. */
  async allLaunches(maxPages = 40): Promise<IndexedLaunch[]> {
    const out: IndexedLaunch[] = [];
    for (let page = 0; page < maxPages; page++) {
      const batch = await this.launches({ orderBy: "createdAt", orderDirection: "asc", limit: 500, offset: page * 500 });
      out.push(...batch);
      if (batch.length < 500) break;
    }
    return out;
  }

  /** Total launches so far. */
  async launchCount(): Promise<number> {
    return (await this.get<{ launched: number }>("/launches/count")).launched;
  }

  /** One launch, or null. */
  async launch(token: Address): Promise<IndexedLaunch | null> {
    try {
      return await this.get<IndexedLaunch>(`/launches/${token}`);
    } catch (e) {
      if (String(e).includes("HTTP 404")) return null;
      throw e;
    }
  }

  /** Trades of a token, newest first (limit 1..2000, default 200). `wallet` filters by trader. */
  trades(token: Address, opts: { limit?: number; wallet?: Address } = {}) {
    return this.get<IndexedTrade[]>("/trades", { token, limit: opts.limit, wallet: opts.wallet });
  }

  /** OHLC candles in the quote asset (`open..close`) and ETH (`openEth..closeEth`), oldest first. `before` (unix seconds) pages back. */
  candles(token: Address, interval: CandleInterval = "5m", opts: { limit?: number; before?: number } = {}) {
    return this.get<CandlesResponse>("/candles", { token, interval, limit: opts.limit, before: opts.before });
  }

  /** Largest holders (limit 1..200, default 20). */
  holders(token: Address, limit?: number) {
    return this.get<Holder[]>("/holders", { token, limit });
  }

  /** Every par token a wallet holds, with its cost basis. */
  positions(owner: Address, limit?: number) {
    return this.get<Position[]>("/positions", { owner, limit });
  }

  /** Fee collections the locker made for a token, newest first. */
  fees(token: Address, limit?: number) {
    return this.get<FeeCollection[]>("/fees", { token, limit });
  }

  /** Holder-rewards rounds of a "fees to holders" launch, newest first, with totals. */
  distributions(token: Address, limit?: number) {
    return this.get<Distributions>("/distributions", { token, limit });
  }

  /** What a wallet received from holder rewards; `token` narrows it (and fills `total`). */
  rewards(owner: Address, token?: Address, limit?: number) {
    return this.get<Rewards>("/rewards", { owner, token, limit });
  }

  /** $par bought with protocol fees and burned, newest first, with totals. */
  buybacks(limit?: number) {
    return this.get<Buybacks>("/buybacks", { limit });
  }

  /** Platform-wide totals: launches, holders, trades, volume, creator earnings, $par burned and bought back. */
  stats() {
    return this.get<PlatformStats>("/stats");
  }

  /**
   * Live feed of indexer events (server-sent events). Browser and Node 20+
   * expose EventSource; the URL is returned for other runtimes.
   */
  eventsUrl(): string {
    return `${this.baseUrl}/events`;
  }
}

/** The token list every par token appears in (Uniswap token-list schema, with `extensions.markets` for multi-market tokens). */
export const TOKENLIST_URL = "https://par.family/tokenlist.json";
