import { type Address, type Hex, type PublicClient } from "viem";
import { type PoolKey } from "./pool.js";
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
/**
 * Look a token up on both factories. Returns null if the address was not
 * launched through par. One round trip per factory plus one per quote asset.
 */
export declare function getLaunch(client: PublicClient, token: Address): Promise<ParLaunch | null>;
/** Whether an address is a par token (either factory). */
export declare function isParToken(client: PublicClient, token: Address): Promise<boolean>;
