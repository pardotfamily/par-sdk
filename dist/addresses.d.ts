import { type Address } from "viem";
/** Mainnet deployment on Robinhood Chain (chain id 4663). All verified on Blockscout. */
export declare const ADDRESSES: {
    readonly factory: Address;
    readonly router: Address;
    readonly locker: Address;
    readonly multiFactory: Address;
    readonly multiRouter: Address;
    readonly multiLocker: Address;
    readonly feeEscrow: Address;
    readonly quotePricer: Address;
    readonly feeSplitter: Address;
    readonly feeSplitterV1: Address;
    readonly holderVault: Address;
    readonly burnVault: Address;
    readonly floorVault: Address;
    readonly disperse: Address;
    readonly disperseV1: Address;
    readonly buybackWallet: Address;
    readonly holdersWallet: Address;
    readonly par: Address;
    readonly poolManager: Address;
    readonly weth: Address;
    readonly usdg: Address;
};
/** The par contract set of one chain, same keys on every chain. */
export type ParAddresses = {
    readonly [K in keyof typeof ADDRESSES]: Address;
};
/**
 * Arc mainnet (chain id 5042), deployed 2026-09-16 from DeployArc.s.sol at
 * block 21074807. Same deployer and nonce order as the testnet, so the par
 * contracts share their addresses with the testnet; only the Uniswap infra
 * and the second anchor differ. The single-market factory exists but has
 * launches disabled; only the multi-market stack is live. No $par and no V1
 * contracts here. `weth` is the ERC-20 face of USDC, the reference asset
 * (see `getReference`); `usdg` is the pricer's second anchor, EURC.
 */
export declare const ADDRESSES_ARC: ParAddresses;
/**
 * Arc testnet (chain id 5042002), deployed 2026-09-14 from DeployArc.s.sol.
 * The single-market factory exists but has launches disabled; only the
 * multi-market stack is live. No $par and no V1 contracts here. `usdg` is
 * the pricer's second anchor, EURC on Arc.
 */
export declare const ADDRESSES_ARC_TESTNET: ParAddresses;
export declare const ADDRESSES_BASE: ParAddresses;
/**
 * BNB Chain was redeployed on 2026-09-20 with PancakeSwap V3 as the V3 side
 * (factory 0x0BFbCF9f…1865, SmartRouter 0x13f4EA83…8Dd4, fee tiers
 * 100/500/2500/10000), where BNB Chain's liquidity actually is. Hence its
 * own addresses. The first stack (same addresses as Base) is retired.
 */
export declare const ADDRESSES_BNB: ParAddresses;
export declare const ADDRESSES_BY_CHAIN: Record<number, ParAddresses>;
/** The par contracts of a chain (Robinhood Chain by default); throws for a chain par is not on. */
export declare function getAddresses(chainId?: number): ParAddresses;
/** Uniswap infrastructure par builds on, per chain. Permit2 is the canonical deployment everywhere. */
export type UniswapAddresses = {
    poolManager: Address;
    positionManager: Address;
    v3Factory: Address;
    swapRouter02: Address;
    permit2: Address;
};
export declare const UNISWAP_BY_CHAIN: Record<number, UniswapAddresses>;
/** Block the single-market factory was deployed at on Robinhood Chain; nothing par-related exists before it. */
export declare const FACTORY_DEPLOY_BLOCK = 53890474n;
/** Block the multi-market factory was deployed at on Robinhood Chain. */
export declare const MULTI_FACTORY_DEPLOY_BLOCK = 55587224n;
/** First block with par contracts, per chain: the lower bound for launch scans. */
export declare const DEPLOY_BLOCK_BY_CHAIN: Record<number, bigint>;
/** Where par's contracts start on a chain (0 when unknown, so a scan simply begins at the caller's block). */
export declare function deployBlockOf(chainId?: number): bigint;
/** Public indexer (no key), Robinhood Chain. */
export declare const INDEXER_URL = "https://api.par.family";
/** The interface; token pages are `${APP_URL}/token/<address>`. */
export declare const APP_URL = "https://par.family";
/**
 * Public hosts per chain: `<chain>.par.family` for the app and
 * `api-<chain>.par.family` for the indexer, `-testnet` for testnets.
 */
export declare const HOSTS_BY_CHAIN: Record<number, {
    app: string;
    indexer: string;
}>;
/** The public indexer of a chain; Robinhood Chain's by default. */
export declare function indexerUrlOf(chainId?: number): string;
