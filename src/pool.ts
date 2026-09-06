import { encodeAbiParameters, keccak256, zeroAddress, type Address, type Hex, type PublicClient } from "viem";
import { ADDRESSES } from "./addresses.js";
import { poolManagerAbi } from "./abi.js";

/** A Uniswap v4 pool key. par pools never have a hook. */
export type PoolKey = {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
};

/** One hop of an ETH route: a v4 pool (key) or a v3 pool (pair + fee tier, tickSpacing and hooks zero). */
export type Hop = { key: PoolKey; v3: boolean };

const WAD = 10n ** 18n;
const Q192 = 2n ** 192n;

/**
 * The pool key of a par market. Uniswap sorts currencies numerically, so
 * native ETH (address zero) is always currency0. `poolFee` is the pool's LP
 * fee in hundredths of a bip: (baseFeeBps + creatorTaxBps) * 100.
 */
export function poolKeyFor(token: Address, pairToken: Address, poolFee: number, tickSpacing: number): PoolKey {
  const [currency0, currency1] = BigInt(pairToken) < BigInt(token) ? [pairToken, token] : [token, pairToken];
  return { currency0, currency1, fee: poolFee, tickSpacing, hooks: zeroAddress };
}

/** keccak256(abi.encode(PoolKey)): the id the PoolManager keys everything by, and the `id` of every Swap event. */
export function poolIdOf(key: PoolKey): Hex {
  return keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "uint24" }, { type: "int24" }, { type: "address" }],
      [key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks]
    )
  );
}

/** Whether the launched token is currency0 of its pool (only when its address sorts below the quote's). */
export function tokenIsCurrency0(token: Address, key: PoolKey): boolean {
  return key.currency0.toLowerCase() === token.toLowerCase();
}

/** Pool state lives in mapping slot 6 of the PoolManager; slot0 is the first word of each pool's struct. */
function slot0Slot(poolId: Hex): Hex {
  return keccak256(encodeAbiParameters([{ type: "bytes32" }, { type: "uint256" }], [poolId, 6n]));
}

/** The pool's current sqrtPriceX96, straight from PoolManager storage. */
export async function readSqrtPriceX96(client: PublicClient, poolId: Hex): Promise<bigint> {
  const word = await client.readContract({
    address: ADDRESSES.poolManager,
    abi: poolManagerAbi,
    functionName: "extsload",
    args: [slot0Slot(poolId)],
  });
  return BigInt(word) & ((1n << 160n) - 1n);
}

/**
 * Spot price as raw quote units per 1e18 (one whole) token. Divide by
 * 10**quoteDecimals for a human number.
 */
export function priceX18FromSqrt(sqrtPriceX96: bigint, tokenIsCurrency0: boolean): bigint {
  if (sqrtPriceX96 === 0n) return 0n;
  return tokenIsCurrency0 ? (sqrtPriceX96 * sqrtPriceX96 * WAD) / Q192 : (Q192 * WAD) / (sqrtPriceX96 * sqrtPriceX96);
}

/** Spot price of a market in raw quote units per whole token. */
export async function readSpotPriceX18(client: PublicClient, token: Address, key: PoolKey): Promise<bigint> {
  const sqrt = await readSqrtPriceX96(client, poolIdOf(key));
  return priceX18FromSqrt(sqrt, tokenIsCurrency0(token, key));
}
