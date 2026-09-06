import { type Address, type Hex, type Log, type PublicClient } from "viem";
import type { ParMarket } from "./launches.js";
/** A new par token, from either factory. */
export type LaunchEvent = {
    token: Address;
    kind: "single" | "multi";
    deployer: Address;
    launchConfigId: bigint;
    poolFee: number;
    /** Quote assets, one per pool; address zero is native ETH. */
    pairTokens: Address[];
    /** Pool ids, same order as `pairTokens`. For multi launches these come from the MarketOpened events of the same tx. */
    poolIds: Hex[];
    blockNumber: bigint;
    transactionHash: Hex;
};
export declare const tokenLaunchedEvent: {
    readonly name: "TokenLaunched";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "bytes32";
        readonly name: "poolId";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "deployer";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }, {
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "uint24";
        readonly name: "poolFee";
    }];
};
export declare const multiTokenLaunchedEvent: {
    readonly name: "TokenLaunched";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "deployer";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "uint24";
        readonly name: "poolFee";
    }, {
        readonly type: "address[]";
        readonly name: "pairTokens";
    }];
};
export declare const marketOpenedEvent: {
    readonly name: "MarketOpened";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "bytes32";
        readonly name: "poolId";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "marketIndex";
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }, {
        readonly type: "uint256";
        readonly name: "positionId";
    }, {
        readonly type: "int24";
        readonly name: "tickLower";
    }, {
        readonly type: "int24";
        readonly name: "tickUpper";
    }, {
        readonly type: "uint128";
        readonly name: "liquidity";
    }, {
        readonly type: "uint256";
        readonly name: "tokenAmount";
    }, {
        readonly type: "uint256";
        readonly name: "phantomQuote";
    }];
};
export declare const swapEvent: {
    readonly name: "Swap";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "bytes32";
        readonly name: "id";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "sender";
        readonly indexed: true;
    }, {
        readonly type: "int128";
        readonly name: "amount0";
    }, {
        readonly type: "int128";
        readonly name: "amount1";
    }, {
        readonly type: "uint160";
        readonly name: "sqrtPriceX96";
    }, {
        readonly type: "uint128";
        readonly name: "liquidity";
    }, {
        readonly type: "int24";
        readonly name: "tick";
    }, {
        readonly type: "uint24";
        readonly name: "fee";
    }];
};
/** Turn the raw logs of both factories into launch events (logs from other contracts are ignored). */
export declare function parseLaunchLogs(logs: Log[]): LaunchEvent[];
/**
 * Every launch in a block range, both factories. Public RPCs cap the range
 * of one eth_getLogs call (commonly 10k blocks); page if you need more.
 */
export declare function getLaunches(client: PublicClient, fromBlock: bigint, toBlock?: bigint | "latest"): Promise<LaunchEvent[]>;
/** Subscribe to new launches. Returns the unsubscribe function. */
export declare function watchLaunches(client: PublicClient, onLaunch: (launch: LaunchEvent) => void, pollingInterval?: number): () => void;
/** One trade in a par pool, decoded from the PoolManager's Swap event. */
export type TradeEvent = {
    poolId: Hex;
    side: "buy" | "sell";
    /** Tokens received (buy) or paid (sell), raw 18-decimal units. */
    tokenAmount: bigint;
    /** Quote paid (buy) or received (sell), raw quote units. */
    quoteAmount: bigint;
    /** Spot price after the trade, raw quote units per whole token. */
    priceX18: bigint;
    /** The address that called PoolManager: a router, not the trader. Read the tx `from` for the trader. */
    sender: Address;
    blockNumber: bigint;
    transactionHash: Hex;
    logIndex: number;
};
/**
 * Decode Swap logs for one market. Amounts in the event are the pool's deltas
 * (negative = paid out of the pool), so the sign of the token side says whether
 * the trade was a buy.
 */
export declare function parseTradeLogs(market: Pick<ParMarket, "poolId" | "tokenIsCurrency0">, logs: Log[]): TradeEvent[];
/** Trades of one market in a block range. */
export declare function getTrades(client: PublicClient, market: Pick<ParMarket, "poolId" | "tokenIsCurrency0">, fromBlock: bigint, toBlock?: bigint | "latest"): Promise<TradeEvent[]>;
/** Subscribe to trades of one or more markets. Returns the unsubscribe function. */
export declare function watchTrades(client: PublicClient, markets: Pick<ParMarket, "poolId" | "tokenIsCurrency0">[], onTrade: (trade: TradeEvent) => void, pollingInterval?: number): () => void;
