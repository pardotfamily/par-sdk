import type { Address, Hex } from "viem";
import type { Socials } from "./metadata.js";
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
    /** The creator gave the creator share back to the token: bought back and burned (recipient is the burn vault). Permanent. */
    feesBurned?: boolean;
    /** The creator gave the creator share to a price floor (recipient is the floor vault): token share burned, quote share stood as a bid wall in the pool. Permanent. */
    feesFloor?: boolean;
    /** Where the creator share goes: "creator" (a wallet), "holders", "burn" or "floor". */
    feeMode?: "creator" | "holders" | "burn" | "floor";
    /** Floor launches: the standing wall per quote; null for every other launch. */
    floor?: FloorWall[] | null;
    /** Of burnedToken, what the burn vault burned (creator fees of a "burn" launch). */
    feeBurnedToken?: string;
    /** Of burnedToken, what the creator fee recipient burned itself (the Burn button by the fee claim). */
    creatorBurnedToken?: string;
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
    open: number;
    high: number;
    low: number;
    close: number;
    openEth: number | null;
    highEth: number | null;
    lowEth: number | null;
    closeEth: number | null;
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
export type Holder = {
    owner: Address;
    balance: string;
};
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
/** An asset holders were paid in: the zero address for ETH, a quote token, or the launch token. */
export type PayoutAsset = {
    asset: Address;
    symbol: string;
    decimals: number;
};
/** One Dispersed log: one asset of one round (or a batch of it). */
export type Distribution = PayoutAsset & {
    id: string;
    round: number;
    total: string;
    recipients: number;
    txHash: Hex;
    timestamp: number;
};
export type Distributions = {
    token: Address;
    vault: Address | null;
    wallet: Address | null;
    rounds: number;
    lastAt: number | null;
    /** Sum paid in the launch token alone (older readers); `totals` has every asset. */
    total: string;
    totals: (PayoutAsset & {
        total: string;
    })[];
    items: Distribution[];
};
export type FeeBurn = {
    id: string;
    amount: string;
    txHash: string;
    timestamp: number;
};
export type FeeBurns = {
    token: Address;
    vault: Address | null;
    burns: number;
    lastAt: number | null;
    /** Everything the burn vault has burned for this token, raw units. */
    total: string;
    items: FeeBurn[];
};
/**
 * One wall of a "floor" launch as last placed by the floor vault: a
 * single-tick, quote-only Uniswap V4 position in the launch pool. The floor
 * price is the wall's edge nearest the market, in raw quote units per whole
 * token like every other price here.
 */
export type FloorWall = {
    quote: Address;
    /** False when the vault had nothing to stand yet (no quote, or no token in circulation). */
    standing: boolean;
    tickLower: number;
    tickUpper: number;
    liquidity: string;
    /** Quote in the wall, raw units. */
    quoteInWall: string;
    /** Tokens outside the launch position when the wall was placed, raw units. */
    circulating: string;
    floorPriceQuote: string | null;
    floorPriceEth: number | null;
    floorMarketCapEth: number | null;
    txHash: Hex;
    timestamp: number;
};
export type Floor = {
    token: Address;
    vault: Address | null;
    feeMode: "creator" | "holders" | "burn" | "floor";
    walls: FloorWall[];
    /** Burned by the floor vault: token-side fees plus what the wall absorbed, raw units. */
    feeBurnedToken: string;
    /** With `quote`: every placement of that wall, oldest first. */
    history: FloorWall[] | null;
};
export type Reward = {
    id: string;
    token: Address;
    asset: Address;
    amount: string;
    txHash: Hex;
    timestamp: number;
};
export type Rewards = {
    owner: Address;
    /** Launch-token total alone, when `token` was given; `totals` has every asset. */
    total: string | null;
    totals: (PayoutAsset & {
        total: string;
    })[] | null;
    items: Reward[];
};
export type Buyback = {
    id: string;
    amount: string;
    txHash: Hex;
    timestamp: number;
};
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
export declare class ParIndexer {
    private readonly baseUrl;
    private readonly fetchImpl;
    constructor(baseUrl?: string, fetchImpl?: typeof fetch);
    private get;
    /** Indexer status: last indexed block and the addresses it follows. */
    health(): Promise<{
        [k: string]: unknown;
        ok: boolean;
        lastBlock: number;
        factory: Address;
        multiFactory: Address | null;
    }>;
    /** List launches. */
    launches(query?: LaunchesQuery): Promise<IndexedLaunch[]>;
    /** Every launch, paged through in slices of 500. */
    allLaunches(maxPages?: number): Promise<IndexedLaunch[]>;
    /** Total launches so far. */
    launchCount(): Promise<number>;
    /** One launch, or null. */
    launch(token: Address): Promise<IndexedLaunch | null>;
    /** Trades of a token, newest first (limit 1..2000, default 200). `wallet` filters by trader. */
    trades(token: Address, opts?: {
        limit?: number;
        wallet?: Address;
    }): Promise<IndexedTrade[]>;
    /** OHLC candles in the quote asset (`open..close`) and ETH (`openEth..closeEth`), oldest first. `before` (unix seconds) pages back. */
    candles(token: Address, interval?: CandleInterval, opts?: {
        limit?: number;
        before?: number;
    }): Promise<CandlesResponse>;
    /** Largest holders (limit 1..200, default 20). */
    holders(token: Address, limit?: number): Promise<Holder[]>;
    /** Every par token a wallet holds, with its cost basis. */
    positions(owner: Address, limit?: number): Promise<Position[]>;
    /** Fee collections the locker made for a token, newest first. */
    fees(token: Address, limit?: number): Promise<FeeCollection[]>;
    /** Holder-rewards payouts of a "fees to holders" launch (one row per asset per round), newest first, with totals per asset. */
    distributions(token: Address, limit?: number): Promise<Distributions>;
    /** Buyback & burn rounds of a "burn" launch (the burn vault's burns), newest first, with totals. */
    burns(token: Address, limit?: number): Promise<FeeBurns>;
    /** A "floor" launch's standing wall per quote; with `quote`, that wall's history too (the floor line). */
    floor(token: Address, quote?: Address, limit?: number): Promise<Floor>;
    /** What a wallet received from holder rewards; `token` narrows it (and fills `total`). */
    rewards(owner: Address, token?: Address, limit?: number): Promise<Rewards>;
    /** $par bought with protocol fees and burned, newest first, with totals. */
    buybacks(limit?: number): Promise<Buybacks>;
    /** Platform-wide totals: launches, holders, trades, volume, creator earnings, $par burned and bought back. */
    stats(): Promise<PlatformStats>;
    /**
     * Live feed of indexer events (server-sent events). Browser and Node 20+
     * expose EventSource; the URL is returned for other runtimes.
     */
    eventsUrl(): string;
}
/** The token list every par token appears in (Uniswap token-list schema, with `extensions.markets` for multi-market tokens). */
export declare const TOKENLIST_URL = "https://par.family/tokenlist.json";
