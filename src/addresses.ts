import type { Address } from "viem";

/** Mainnet deployment on Robinhood Chain (chain id 4663). All verified on Blockscout. */
export const ADDRESSES = {
  // Single-market stack (one pool per token).
  factory: "0x9d33Ba78389c8772bC114Cba47Dc1985E933e76F" as Address,
  router: "0x73d84bdbB1983Fa7eD8FCBcE40bc308997cEd120" as Address,
  locker: "0x8a6d37B2E6a2AC7970eF69d2932757F04be0A231" as Address,
  // Multi-market stack (one token, up to five pools).
  multiFactory: "0x3ea29975a79900179F3e1aEF93347Ba4210c29C1" as Address,
  multiRouter: "0x458D2a59c2F3dd32775a64eE72004561440d64Df" as Address,
  multiLocker: "0x5826FBB6201DaAcD924A3d292841DA9142952D59" as Address,
  // Shared.
  feeEscrow: "0x1C27e8F0c2a754DB23ab1608fA09c068D54d4386" as Address,
  quotePricer: "0x9EfC6EFA4c5F31e2BEC6CC174Ba7bB8f0b57d563" as Address,
  // Fee routing. The splitter is the protocol fee recipient of launches since
  // it was set (its buybackBps, 60%, of protocol quote fees buy and burn $par;
  // the first splitter, 80%, still receives from the launches made under it);
  // the holder vault is the creator fee recipient of "fees to holders"
  // launches; Disperse emits the holder-rewards rounds.
  feeSplitter: "0x85a1CbbE2933F15f2599B9E0e03e6F89655fa4C1" as Address,
  feeSplitterV1: "0x913A93cc2676F49454173323B85762b3e5906c43" as Address,
  holderVault: "0x4B79B8298cd890A82dC9De1dE5dBb745Cf04353C" as Address,
  // The burn vault is the creator fee recipient of "buyback & burn" launches:
  // it buys the token in its own pool with the creator's quote share and burns
  // that plus the token share. No owner; it can only buy in par pools or burn.
  burnVault: "0x16c83D36539b6C92E6FC998D2a039fD7Ff31958E" as Address,
  disperse: "0xF09E4997Ca8aC5869de8B1C63acc4a3180c087EC" as Address,
  buybackWallet: "0x5bA4a4A197111CE8B6a2C2776D7836A9E1868033" as Address,
  holdersWallet: "0xB1a7a3A37F41e4dC9507F9B0F946B7F786c4AFb4" as Address,
  par: "0x507B6F349a80114097A67B8b4677367acC15b220" as Address,
  // Uniswap v4 PoolManager: every par pool lives here and every trade is a Swap event on it.
  poolManager: "0x8366a39CC670B4001A1121B8F6A443A643e40951" as Address,
  weth: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as Address,
  usdg: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168" as Address,
} as const;

/** Block the single-market factory was deployed at; nothing par-related exists before it. */
export const FACTORY_DEPLOY_BLOCK = 53890474n;
/** Block the multi-market factory was deployed at. */
export const MULTI_FACTORY_DEPLOY_BLOCK = 55587224n;

/** Public indexer (no key). */
export const INDEXER_URL = "https://api.par.family";
/** The interface; token pages are `${APP_URL}/token/<address>`. */
export const APP_URL = "https://par.family";
