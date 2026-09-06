import { getAbiItem, parseEventLogs, type Address, type Hex, type Log, type PublicClient } from "viem";
import { ADDRESSES, FACTORY_DEPLOY_BLOCK } from "./addresses.js";
import { factoryAbi, multiFactoryAbi, poolManagerAbi } from "./abi.js";
import type { ParMarket } from "./launches.js";
import { priceX18FromSqrt } from "./pool.js";

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

export const tokenLaunchedEvent = getAbiItem({ abi: factoryAbi, name: "TokenLaunched" });
export const multiTokenLaunchedEvent = getAbiItem({ abi: multiFactoryAbi, name: "TokenLaunched" });
export const marketOpenedEvent = getAbiItem({ abi: multiFactoryAbi, name: "MarketOpened" });
export const swapEvent = getAbiItem({ abi: poolManagerAbi, name: "Swap" });

/** Turn the raw logs of both factories into launch events (logs from other contracts are ignored). */
export function parseLaunchLogs(logs: Log[]): LaunchEvent[] {
  const out: LaunchEvent[] = [];
  const single = parseEventLogs({ abi: factoryAbi, eventName: "TokenLaunched", logs: logs.filter(fromFactory) });
  for (const l of single) {
    out.push({
      token: l.args.token,
      kind: "single",
      deployer: l.args.deployer,
      launchConfigId: l.args.launchConfigId,
      poolFee: l.args.poolFee,
      pairTokens: [l.args.pairToken],
      poolIds: [l.args.poolId],
      blockNumber: l.blockNumber!,
      transactionHash: l.transactionHash!,
    });
  }
  const multiLogs = logs.filter(fromMultiFactory);
  const opened = parseEventLogs({ abi: multiFactoryAbi, eventName: "MarketOpened", logs: multiLogs });
  const multi = parseEventLogs({ abi: multiFactoryAbi, eventName: "TokenLaunched", logs: multiLogs });
  for (const l of multi) {
    const mine = opened
      .filter((o) => o.args.token.toLowerCase() === l.args.token.toLowerCase())
      .sort((a, b) => Number(a.args.marketIndex - b.args.marketIndex));
    out.push({
      token: l.args.token,
      kind: "multi",
      deployer: l.args.deployer,
      launchConfigId: l.args.launchConfigId,
      poolFee: l.args.poolFee,
      pairTokens: [...l.args.pairTokens],
      poolIds: mine.map((o) => o.args.poolId),
      blockNumber: l.blockNumber!,
      transactionHash: l.transactionHash!,
    });
  }
  return out.sort((a, b) => (a.blockNumber === b.blockNumber ? 0 : a.blockNumber < b.blockNumber ? -1 : 1));
}

function fromFactory(l: Log) {
  return l.address.toLowerCase() === ADDRESSES.factory.toLowerCase();
}
function fromMultiFactory(l: Log) {
  return l.address.toLowerCase() === ADDRESSES.multiFactory.toLowerCase();
}

/**
 * Every launch in a block range, both factories. Public RPCs cap the range
 * of one eth_getLogs call (commonly 10k blocks); page if you need more.
 */
export async function getLaunches(client: PublicClient, fromBlock: bigint, toBlock: bigint | "latest" = "latest"): Promise<LaunchEvent[]> {
  const logs = await client.getLogs({
    address: [ADDRESSES.factory, ADDRESSES.multiFactory],
    events: [tokenLaunchedEvent, multiTokenLaunchedEvent, marketOpenedEvent],
    fromBlock: fromBlock < FACTORY_DEPLOY_BLOCK ? FACTORY_DEPLOY_BLOCK : fromBlock,
    toBlock,
  });
  return parseLaunchLogs(logs as Log[]);
}

/** Subscribe to new launches. Returns the unsubscribe function. */
export function watchLaunches(client: PublicClient, onLaunch: (launch: LaunchEvent) => void, pollingInterval = 2_000): () => void {
  return client.watchEvent({
    address: [ADDRESSES.factory, ADDRESSES.multiFactory],
    events: [tokenLaunchedEvent, multiTokenLaunchedEvent, marketOpenedEvent],
    pollingInterval,
    onLogs: (logs) => {
      for (const l of parseLaunchLogs(logs as Log[])) onLaunch(l);
    },
  });
}

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
 * Decode Swap logs for one market. Amounts in the event are the swapper's
 * deltas (positive = received from the pool, negative = paid into it), so a
 * positive token side is a buy.
 */
export function parseTradeLogs(market: Pick<ParMarket, "poolId" | "tokenIsCurrency0">, logs: Log[]): TradeEvent[] {
  const swaps = parseEventLogs({
    abi: poolManagerAbi,
    eventName: "Swap",
    logs: logs.filter((l) => l.address.toLowerCase() === ADDRESSES.poolManager.toLowerCase()),
  });
  const out: TradeEvent[] = [];
  for (const s of swaps) {
    if (s.args.id.toLowerCase() !== market.poolId.toLowerCase()) continue;
    const tokenDelta = market.tokenIsCurrency0 ? s.args.amount0 : s.args.amount1;
    const quoteDelta = market.tokenIsCurrency0 ? s.args.amount1 : s.args.amount0;
    out.push({
      poolId: s.args.id,
      side: tokenDelta > 0n ? "buy" : "sell",
      tokenAmount: tokenDelta < 0n ? -tokenDelta : tokenDelta,
      quoteAmount: quoteDelta < 0n ? -quoteDelta : quoteDelta,
      priceX18: priceX18FromSqrt(s.args.sqrtPriceX96, market.tokenIsCurrency0),
      sender: s.args.sender,
      blockNumber: s.blockNumber!,
      transactionHash: s.transactionHash!,
      logIndex: s.logIndex!,
    });
  }
  return out;
}

/** Trades of one market in a block range. */
export async function getTrades(
  client: PublicClient,
  market: Pick<ParMarket, "poolId" | "tokenIsCurrency0">,
  fromBlock: bigint,
  toBlock: bigint | "latest" = "latest"
): Promise<TradeEvent[]> {
  const logs = await client.getLogs({
    address: ADDRESSES.poolManager,
    event: swapEvent,
    args: { id: market.poolId },
    fromBlock,
    toBlock,
  });
  return parseTradeLogs(market, logs as Log[]);
}

/** Subscribe to trades of one or more markets. Returns the unsubscribe function. */
export function watchTrades(
  client: PublicClient,
  markets: Pick<ParMarket, "poolId" | "tokenIsCurrency0">[],
  onTrade: (trade: TradeEvent) => void,
  pollingInterval = 2_000
): () => void {
  return client.watchEvent({
    address: ADDRESSES.poolManager,
    event: swapEvent,
    args: { id: markets.map((m) => m.poolId) },
    pollingInterval,
    onLogs: (logs) => {
      for (const m of markets) for (const t of parseTradeLogs(m, logs as Log[])) onTrade(t);
    },
  });
}
