import { zeroAddress } from "viem";
import { ADDRESSES } from "./addresses.js";
import { erc20Abi, factoryAbi, multiFactoryAbi } from "./abi.js";
import { poolIdOf, poolKeyFor, tokenIsCurrency0 } from "./pool.js";
async function quoteMeta(client, pairToken) {
    if (pairToken === zeroAddress)
        return { symbol: "ETH", decimals: 18 };
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
export async function getLaunch(client, token) {
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
    if (!multi.exists)
        return null;
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
export async function isParToken(client, token) {
    return (await getLaunch(client, token)) !== null;
}
