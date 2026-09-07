import type { Address } from "viem";
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
    readonly disperse: Address;
    readonly buybackWallet: Address;
    readonly holdersWallet: Address;
    readonly par: Address;
    readonly poolManager: Address;
    readonly weth: Address;
    readonly usdg: Address;
};
/** Block the single-market factory was deployed at; nothing par-related exists before it. */
export declare const FACTORY_DEPLOY_BLOCK = 53890474n;
/** Block the multi-market factory was deployed at. */
export declare const MULTI_FACTORY_DEPLOY_BLOCK = 55587224n;
/** Public indexer (no key). */
export declare const INDEXER_URL = "https://api.par.family";
/** The interface; token pages are `${APP_URL}/token/<address>`. */
export declare const APP_URL = "https://par.family";
