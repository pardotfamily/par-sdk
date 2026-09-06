import { type Address, type Hex, type PublicClient } from "viem";
/** A Uniswap v4 pool key. par pools never have a hook. */
export type PoolKey = {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
};
/** One hop of an ETH route: a v4 pool (key) or a v3 pool (pair + fee tier, tickSpacing and hooks zero). */
export type Hop = {
    key: PoolKey;
    v3: boolean;
};
/**
 * The pool key of a par market. Uniswap sorts currencies numerically, so
 * native ETH (address zero) is always currency0. `poolFee` is the pool's LP
 * fee in hundredths of a bip: (baseFeeBps + creatorTaxBps) * 100.
 */
export declare function poolKeyFor(token: Address, pairToken: Address, poolFee: number, tickSpacing: number): PoolKey;
/** keccak256(abi.encode(PoolKey)): the id the PoolManager keys everything by, and the `id` of every Swap event. */
export declare function poolIdOf(key: PoolKey): Hex;
/** Whether the launched token is currency0 of its pool (only when its address sorts below the quote's). */
export declare function tokenIsCurrency0(token: Address, key: PoolKey): boolean;
/** The pool's current sqrtPriceX96, straight from PoolManager storage. */
export declare function readSqrtPriceX96(client: PublicClient, poolId: Hex): Promise<bigint>;
/**
 * Spot price as raw quote units per 1e18 (one whole) token. Divide by
 * 10**quoteDecimals for a human number.
 */
export declare function priceX18FromSqrt(sqrtPriceX96: bigint, tokenIsCurrency0: boolean): bigint;
/** Spot price of a market in raw quote units per whole token. */
export declare function readSpotPriceX18(client: PublicClient, token: Address, key: PoolKey): Promise<bigint>;
