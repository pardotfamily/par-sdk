import { zeroAddress, type Address, type Hex, type PublicClient } from "viem";
import { ADDRESSES } from "./addresses.js";
import { erc20Abi, factoryAbi, multiFactoryAbi } from "./abi.js";
import { poolIdOf, poolKeyFor, tokenIsCurrency0, type PoolKey } from "./pool.js";

/** One pool of a par token. Single-market tokens have exactly one, at index 0. */
export type ParMarket = {
  index: number;
  /** Quote asset; address zero is native ETH. */
  pairToken: Address;
  quoteSymbol: string;
  quoteDecimals: number;
  poolKey: PoolKey;
  poolId: Hex;
  /** Whether the launched token is currency0 of this pool. */
  tokenIsCurrency0: boolean;
  /** The locked Uniswap v4 position (PositionManager token id). */
  positionId: bigint;
  liquidity: bigint;
  tickLower: number;
  tickUpper: number;
  /** Virtual quote reserve the opening price was computed from, in raw quote units. */
  phantomQuote: bigint;
};

/** A par token as read from its factory. */
export type ParLaunch = {
  token: Address;
  kind: "single" | "multi";
  factory: Address;
  router: Address;
  locker: Address;
  deployer: Address;
  creatorFeeRecipient: Address;
  /** Pool LP fee in hundredths of a bip (10_000 = 1%). Same for every market of the token. */
  poolFee: number;
  tickSpacing: number;
  baseFeeBps: number;
  creatorTaxBps: number;
  protocolFeeShareBps: number;
  launchedAt: number;
  markets: ParMarket[];
};

async function quoteMeta(client: PublicClient, pairToken: Address): Promise<{ symbol: string; decimals: number }> {
  if (pairToken === zeroAddress) return { symbol: "ETH", decimals: 18 };
  const [symbol, decimals] = await Promise.all([
    client.readContract({ address: pairToken, abi: erc20Abi, functionName: "symbol" }).catch(() => "?"),
    client.readContract({ address: pairToken, abi: erc20Abi, functionName: "decimals" }).catch(() => 18),
  ]);
  return { symbol, decimals: Number(decimals) };
}

/**
 * Look a token up on both factories. Returns null if the address was not
 * launched through par. One round trip per factory plus one per quote asset.
 */
export async function getLaunch(client: PublicClient, token: Address): Promise<ParLaunch | null> {
  const single = await client.readContract({
    address: ADDRESSES.factory,
    abi: factoryAbi,
    functionName: "getLaunchedToken",
    args: [token],
  });
  if (single.exists) {
    const poolKey = poolKeyFor(token, single.pairToken, single.poolFee, single.tickSpacing);
    const q = await quoteMeta(client, single.pairToken);
    return {
      token,
      kind: "single",
      factory: ADDRESSES.factory,
      router: ADDRESSES.router,
      locker: ADDRESSES.locker,
      deployer: single.deployer,
      creatorFeeRecipient: single.creatorFeeRecipient,
      poolFee: single.poolFee,
      tickSpacing: single.tickSpacing,
      baseFeeBps: single.baseFeeBps,
      creatorTaxBps: single.creatorTaxBps,
      protocolFeeShareBps: single.protocolFeeShareBps,
      launchedAt: Number(single.launchedAt),
      markets: [
        {
          index: 0,
          pairToken: single.pairToken,
          quoteSymbol: q.symbol,
          quoteDecimals: q.decimals,
          poolKey,
          poolId: poolIdOf(poolKey),
          tokenIsCurrency0: tokenIsCurrency0(token, poolKey),
          positionId: single.positionId,
          liquidity: single.liquidity,
          tickLower: single.tickLower,
          tickUpper: single.tickUpper,
          phantomQuote: single.phantomQuote,
        },
      ],
    };
  }

  const multi = await client.readContract({
    address: ADDRESSES.multiFactory,
    abi: multiFactoryAbi,
    functionName: "getLaunchedToken",
    args: [token],
  });
  if (!multi.exists) return null;
  const markets = await client.readContract({
    address: ADDRESSES.multiFactory,
    abi: multiFactoryAbi,
    functionName: "getMarkets",
    args: [token],
  });
  const metas = await Promise.all(markets.map((m) => quoteMeta(client, m.pairToken)));
  return {
    token,
    kind: "multi",
    factory: ADDRESSES.multiFactory,
    router: ADDRESSES.multiRouter,
    locker: ADDRESSES.multiLocker,
    deployer: multi.deployer,
    creatorFeeRecipient: multi.creatorFeeRecipient,
    poolFee: multi.poolFee,
    tickSpacing: multi.tickSpacing,
    baseFeeBps: multi.baseFeeBps,
    creatorTaxBps: multi.creatorTaxBps,
    protocolFeeShareBps: multi.protocolFeeShareBps,
    launchedAt: Number(multi.launchedAt),
    markets: markets.map((m, i) => {
      const poolKey = poolKeyFor(token, m.pairToken, multi.poolFee, multi.tickSpacing);
      return {
        index: i,
        pairToken: m.pairToken,
        quoteSymbol: metas[i].symbol,
        quoteDecimals: metas[i].decimals,
        poolKey,
        poolId: poolIdOf(poolKey),
        tokenIsCurrency0: tokenIsCurrency0(token, poolKey),
        positionId: m.positionId,
        liquidity: m.liquidity,
        tickLower: m.tickLower,
        tickUpper: m.tickUpper,
        phantomQuote: m.phantomQuote,
      };
    }),
  };
}

/** Whether an address is a par token (either factory). */
export async function isParToken(client: PublicClient, token: Address): Promise<boolean> {
  return (await getLaunch(client, token)) !== null;
}
