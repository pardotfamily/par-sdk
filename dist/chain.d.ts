import { type Address, type Chain, type PublicClient } from "viem";
/** Robinhood Chain mainnet, the first network par was deployed on. */
export declare const robinhoodChain: {
    blockExplorers: {
        readonly default: {
            readonly name: "Blockscout";
            readonly url: "https://robinhoodchain.blockscout.com";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 4663;
    name: "Robinhood Chain";
    nativeCurrency: {
        readonly name: "Ether";
        readonly symbol: "ETH";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.mainnet.chain.robinhood.com"];
        };
    };
    sourceId?: number | undefined | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined | undefined;
    testnet?: boolean | undefined | undefined;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
/**
 * Circle's Arc mainnet. USDC is the gas token; its native view has 18
 * decimals while the same balance is an ERC-20 with 6 decimals at
 * 0x3600…0000, which is what par pairs and prices against (see
 * `getReference`). The public RPC is not published yet; the URL here is a
 * placeholder, pass your own to `createParClient`.
 */
export declare const arc: {
    blockExplorers: {
        readonly default: {
            readonly name: "Arcscan";
            readonly url: "https://arcscan.app";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 5042;
    name: "Arc";
    nativeCurrency: {
        readonly name: "USDC";
        readonly symbol: "USDC";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.arc.io"];
        };
    };
    sourceId?: number | undefined | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined | undefined;
    testnet?: boolean | undefined | undefined;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
/** Arc testnet. */
export declare const arcTestnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Arcscan";
            readonly url: "https://testnet.arcscan.app";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 5042002;
    name: "Arc Testnet";
    nativeCurrency: {
        readonly name: "USDC";
        readonly symbol: "USDC";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.testnet.arc.io"];
        };
    };
    sourceId?: number | undefined | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined | undefined;
    testnet?: boolean | undefined | undefined;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
export declare const ROBINHOOD_CHAIN_ID: 4663;
export declare const ARC_CHAIN_ID: 5042;
export declare const ARC_TESTNET_CHAIN_ID: 5042002;
export declare const BASE_CHAIN_ID: 8453;
export declare const BNB_CHAIN_ID: 56;
export declare const CHAINS: Record<number, Chain>;
/** The viem chain for a par chain id; throws for a chain par is not on. */
export declare function getChain(chainId: number): Chain;
/**
 * The asset a chain's launches are priced in and its routers take payment
 * in: what ETH is on Robinhood Chain. `address` is what a pool key carries
 * for it (address zero where it is native, the ERC-20 otherwise), so a
 * market quoted in the reference is one whose `pairToken` equals it;
 * `wrapped` is its ERC-20 form (WETH; on Arc the same USDC address).
 * `usdIsOne` marks a dollar reference, where no ETH/USD rate is needed to
 * show USD figures.
 */
export type ReferenceAsset = {
    symbol: string;
    decimals: number;
    isNative: boolean;
    address: Address;
    wrapped: Address;
    usdIsOne: boolean;
};
/** The reference asset of a par chain (Robinhood Chain by default); throws for a chain par is not on. */
export declare function getReference(chainId?: number): ReferenceAsset;
/** Whether `asset` is the chain's reference asset in either of its forms. */
export declare function isReference(asset: Address, chainId?: number): boolean;
/** Robinhood Chain's explorer; see `getChain(chainId).blockExplorers` for the others. */
export declare const EXPLORER_URL = "https://robinhoodchain.blockscout.com";
/**
 * A viem public client for a par chain (Robinhood Chain by default). Pass
 * your own RPC URL for anything beyond light use; the public nodes
 * rate-limit, and Arc mainnet has no published public RPC yet.
 */
export declare function createParClient(rpcUrl?: string, chainId?: number): PublicClient;
