import { zeroAddress } from "viem";
import { ARC_CHAIN_ID, ARC_TESTNET_CHAIN_ID, BASE_CHAIN_ID, BNB_CHAIN_ID, ROBINHOOD_CHAIN_ID } from "./chain.js";
/** Mainnet deployment on Robinhood Chain (chain id 4663). All verified on Blockscout. */
export const ADDRESSES = {
    // Single-market stack (one pool per token).
    factory: "0x9d33Ba78389c8772bC114Cba47Dc1985E933e76F",
    router: "0x73d84bdbB1983Fa7eD8FCBcE40bc308997cEd120",
    locker: "0x8a6d37B2E6a2AC7970eF69d2932757F04be0A231",
    // Multi-market stack (one token, up to five pools).
    multiFactory: "0x3ea29975a79900179F3e1aEF93347Ba4210c29C1",
    multiRouter: "0x458D2a59c2F3dd32775a64eE72004561440d64Df",
    multiLocker: "0x5826FBB6201DaAcD924A3d292841DA9142952D59",
    // Shared.
    feeEscrow: "0x1C27e8F0c2a754DB23ab1608fA09c068D54d4386",
    quotePricer: "0x9EfC6EFA4c5F31e2BEC6CC174Ba7bB8f0b57d563",
    // Fee routing. The splitter is the protocol fee recipient of launches since
    // it was set (its buybackBps, 60%, of protocol quote fees buy and burn $par;
    // the first splitter, 80%, still receives from the launches made under it);
    // the holder vault is the creator fee recipient of "fees to holders"
    // launches; Disperse emits the holder-rewards rounds.
    feeSplitter: "0x85a1CbbE2933F15f2599B9E0e03e6F89655fa4C1",
    feeSplitterV1: "0x913A93cc2676F49454173323B85762b3e5906c43",
    holderVault: "0x4B79B8298cd890A82dC9De1dE5dBb745Cf04353C",
    // The burn vault is the creator fee recipient of "buyback & burn" launches:
    // it buys the token in its own pool with the creator's quote share and burns
    // that plus the token share. No owner; it can only buy in par pools or burn.
    burnVault: "0x16c83D36539b6C92E6FC998D2a039fD7Ff31958E",
    // The floor vault is the creator fee recipient of "price floor" launches:
    // every creator fee (quote side) becomes a single locked buy wall in the
    // launch pool at the highest price the wall can hold against the whole
    // circulating supply; the token side is burned. The floor only rises.
    floorVault: "0xA5e805856e513F01d6aC992aC45FE54E5e601829",
    // Pays holder rewards: one call per asset per launch, tagged with the launch
    // (Dispersed / Paid events). ETH and ERC-20s. Permissionless, no owner.
    disperse: "0x28a5f3F898E99753E322fdce6EFa8b294C215B9b",
    // The first disperser: token-only payouts, before September 2026.
    disperseV1: "0xF09E4997Ca8aC5869de8B1C63acc4a3180c087EC",
    buybackWallet: "0x5bA4a4A197111CE8B6a2C2776D7836A9E1868033",
    holdersWallet: "0xB1a7a3A37F41e4dC9507F9B0F946B7F786c4AFb4",
    par: "0x507B6F349a80114097A67B8b4677367acC15b220",
    // Uniswap v4 PoolManager: every par pool lives here and every trade is a Swap event on it.
    poolManager: "0x8366a39CC670B4001A1121B8F6A443A643e40951",
    weth: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
    usdg: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
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
export const ADDRESSES_ARC = {
    factory: "0x02E9EE8527f4AFF58f7a1E08B1b898637ce718e9",
    router: "0xE721a861b32dEc68230101EA576304a63ebeEacd",
    locker: "0xE5B0B35F4927004fE8c0E437030723Eb80F6C32E",
    multiFactory: "0x920Ca489f8c9573645b8aB00dad60fc81c9487fd",
    multiRouter: "0x7cda46222a6B202f6B18A51b9a558Bc38a655083",
    multiLocker: "0x344A4A773Df4FFa89AE6Dc4f1418123990a34647",
    feeEscrow: "0x96AB924F958da3a8d83fCdF5Ce692653fCEea9fD",
    quotePricer: "0xcebC312381D1F816da478Acc8A37711808909d90",
    feeSplitter: "0x031f3D93A94c5F34EE3e608566245AAC271523A9",
    feeSplitterV1: zeroAddress,
    holderVault: "0x64D085E5269fdAFfc28363f21b208f8A2EfCcD0A",
    burnVault: "0x4067820296a0C717c3e31B05E98505b3215c5544",
    floorVault: "0x5567633b002f935181f0fEAa8953Bd0ad5610b0D",
    disperse: "0x372A36543d29F00053161BCAD1cCCCC595a7cA88",
    disperseV1: zeroAddress,
    buybackWallet: "0x5bA4a4A197111CE8B6a2C2776D7836A9E1868033",
    holdersWallet: "0xB1a7a3A37F41e4dC9507F9B0F946B7F786c4AFb4",
    par: zeroAddress,
    // Canonical Uniswap v4 PoolManager on Arc (same address as on Robinhood Chain).
    poolManager: "0x8366a39CC670B4001A1121B8F6A443A643e40951",
    weth: "0x3600000000000000000000000000000000000000",
    // EURC on Arc mainnet, the pricer's second anchor.
    usdg: "0xbef5f6d51cb62b58e6a8f77868681825c6fe21c1",
};
/**
 * Arc testnet (chain id 5042002), deployed 2026-09-14 from DeployArc.s.sol.
 * The single-market factory exists but has launches disabled; only the
 * multi-market stack is live. No $par and no V1 contracts here. `usdg` is
 * the pricer's second anchor, EURC on Arc.
 */
export const ADDRESSES_ARC_TESTNET = {
    factory: "0x02E9EE8527f4AFF58f7a1E08B1b898637ce718e9",
    router: "0xE721a861b32dEc68230101EA576304a63ebeEacd",
    locker: "0xE5B0B35F4927004fE8c0E437030723Eb80F6C32E",
    multiFactory: "0x920Ca489f8c9573645b8aB00dad60fc81c9487fd",
    multiRouter: "0x7cda46222a6B202f6B18A51b9a558Bc38a655083",
    multiLocker: "0x344A4A773Df4FFa89AE6Dc4f1418123990a34647",
    feeEscrow: "0x96AB924F958da3a8d83fCdF5Ce692653fCEea9fD",
    quotePricer: "0xcebC312381D1F816da478Acc8A37711808909d90",
    feeSplitter: "0x031f3D93A94c5F34EE3e608566245AAC271523A9",
    feeSplitterV1: zeroAddress,
    holderVault: "0x64D085E5269fdAFfc28363f21b208f8A2EfCcD0A",
    burnVault: "0x4067820296a0C717c3e31B05E98505b3215c5544",
    floorVault: "0x5567633b002f935181f0fEAa8953Bd0ad5610b0D",
    disperse: "0x372A36543d29F00053161BCAD1cCCCC595a7cA88",
    disperseV1: zeroAddress,
    buybackWallet: "0x5bA4a4A197111CE8B6a2C2776D7836A9E1868033",
    holdersWallet: "0xB1a7a3A37F41e4dC9507F9B0F946B7F786c4AFb4",
    par: zeroAddress,
    // UnitFlow's PoolManager: the testnet has no canonical Uniswap.
    poolManager: "0x33C02bfb9e39AAAe30F8bE86b850f8ce53d20C0b",
    weth: "0x3600000000000000000000000000000000000000",
    usdg: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};
/**
 * Base (8453), deployed 2026-09-18 from DeployChain.s.sol by the same
 * deployer at the same nonces as Arc, hence the same par addresses as Arc.
 * The gas token is the reference (ETH), like Robinhood Chain. Both
 * factories are live. No $par here: the buyback share bridges to Robinhood
 * Chain. BNB Chain shares the wallets below but has its own contracts.
 */
const EVM_PAR = {
    factory: "0x02E9EE8527f4AFF58f7a1E08B1b898637ce718e9",
    router: "0xE721a861b32dEc68230101EA576304a63ebeEacd",
    locker: "0xE5B0B35F4927004fE8c0E437030723Eb80F6C32E",
    multiFactory: "0x920Ca489f8c9573645b8aB00dad60fc81c9487fd",
    multiRouter: "0x7cda46222a6B202f6B18A51b9a558Bc38a655083",
    multiLocker: "0x344A4A773Df4FFa89AE6Dc4f1418123990a34647",
    feeEscrow: "0x96AB924F958da3a8d83fCdF5Ce692653fCEea9fD",
    quotePricer: "0xcebC312381D1F816da478Acc8A37711808909d90",
    feeSplitter: "0x031f3D93A94c5F34EE3e608566245AAC271523A9",
    feeSplitterV1: zeroAddress,
    holderVault: "0x64D085E5269fdAFfc28363f21b208f8A2EfCcD0A",
    burnVault: "0x4067820296a0C717c3e31B05E98505b3215c5544",
    floorVault: "0x5567633b002f935181f0fEAa8953Bd0ad5610b0D",
    disperse: "0x372A36543d29F00053161BCAD1cCCCC595a7cA88",
    disperseV1: zeroAddress,
    buybackWallet: "0x5bA4a4A197111CE8B6a2C2776D7836A9E1868033",
    holdersWallet: "0xB1a7a3A37F41e4dC9507F9B0F946B7F786c4AFb4",
    par: zeroAddress,
};
export const ADDRESSES_BASE = {
    ...EVM_PAR,
    poolManager: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
    weth: "0x4200000000000000000000000000000000000006",
    // USDC on Base, the pricer's second anchor.
    usdg: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};
/**
 * BNB Chain was redeployed on 2026-09-20 with PancakeSwap V3 as the V3 side
 * (factory 0x0BFbCF9f…1865, SmartRouter 0x13f4EA83…8Dd4, fee tiers
 * 100/500/2500/10000), where BNB Chain's liquidity actually is. Hence its
 * own addresses. The first stack (same addresses as Base) is retired.
 */
export const ADDRESSES_BNB = {
    ...EVM_PAR,
    factory: "0x456645ad38d099358Cb95ff743736663CDB31a25",
    router: "0x9DF1B1687f95Ce8a42fC8c861F767B6D52C346ab",
    locker: "0xBE14efB8d23346730025902813AF1bE4a4955eb3",
    multiFactory: "0x6715d9C03590F0e7b11A7Cd5bab2eAD4F77e666A",
    multiRouter: "0x7b62174524f0c2d4c475ac05ee9a6F893D625a10",
    multiLocker: "0x03136E9FE0be1943191Cf022EFa40B436CDdCBdE",
    feeEscrow: "0x389216d9F1A3BC72415Ddf16cA50Ca5Bf8B5b065",
    quotePricer: "0x335b39437637A09d791848eB675E5F8D290bba71",
    feeSplitter: "0xD713367eD15bC42BF23Ef2D449629053A16a30D9",
    holderVault: "0xb9E88952596F56f090A36D2FE2B37F50A29dd459",
    burnVault: "0x5EAE87d4AaF8196079B009234938C0F5Baa79578",
    floorVault: "0x3b90bef8FA9694B46a01d5E4073937fB913F1799",
    disperse: "0x589576e4f610B85DBd7a06015acEacF732DD9828",
    poolManager: "0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF",
    weth: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    // USDT on BNB Chain (18 decimals), the pricer's second anchor.
    usdg: "0x55d398326f99059fF775485246999027B3197955",
};
export const ADDRESSES_BY_CHAIN = {
    [ROBINHOOD_CHAIN_ID]: ADDRESSES,
    [BASE_CHAIN_ID]: ADDRESSES_BASE,
    [BNB_CHAIN_ID]: ADDRESSES_BNB,
    [ARC_CHAIN_ID]: ADDRESSES_ARC,
    [ARC_TESTNET_CHAIN_ID]: ADDRESSES_ARC_TESTNET,
};
/** The par contracts of a chain (Robinhood Chain by default); throws for a chain par is not on. */
export function getAddresses(chainId = ROBINHOOD_CHAIN_ID) {
    const a = ADDRESSES_BY_CHAIN[chainId];
    if (!a)
        throw new Error(`par is not deployed on chain ${chainId}`);
    return a;
}
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const UNISWAP_BY_CHAIN = {
    [ROBINHOOD_CHAIN_ID]: {
        poolManager: "0x8366a39CC670B4001A1121B8F6A443A643e40951",
        positionManager: "0x58daec3116aae6D93017bAAea7749052E8a04fA7",
        v3Factory: "0x1f7d7550B1b028f7571E69A784071F0205FD2EfA",
        swapRouter02: "0xCaf681a66D020601342297493863E78C959E5cb2",
        permit2: PERMIT2,
    },
    [ARC_CHAIN_ID]: {
        poolManager: "0x8366a39CC670B4001A1121B8F6A443A643e40951",
        positionManager: "0x6049c9a0e26405C0985f9E3685C87d0aE917f82B",
        v3Factory: "0xf0db7b58379503491d857dB50AC9ece64c653918",
        swapRouter02: "0x53bf6b0684ec7ef91e1387da3d1a1769bc5a6f77",
        permit2: PERMIT2,
    },
    [BASE_CHAIN_ID]: {
        poolManager: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
        positionManager: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
        v3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
        swapRouter02: "0x2626664c2603336E57B271c5C0b26F421741e481",
        permit2: PERMIT2,
    },
    // The V3 side on BNB Chain is PancakeSwap's (pools, factory, SmartRouter); the V4 side is Uniswap's.
    [BNB_CHAIN_ID]: {
        poolManager: "0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF",
        positionManager: "0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b",
        v3Factory: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
        swapRouter02: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
        permit2: PERMIT2,
    },
    // The testnet has no canonical Uniswap; this is UnitFlow's fork, which the
    // par testnet stack is deployed against. Its router is a v1 SwapRouter
    // (exactInputSingle with a deadline), not SwapRouter02, so V3 hops through
    // the par routers do not work there; reference-quoted markets do.
    [ARC_TESTNET_CHAIN_ID]: {
        poolManager: "0x33C02bfb9e39AAAe30F8bE86b850f8ce53d20C0b",
        positionManager: "0xA464d4e7614546a127773CedBDDd64FB81421723",
        v3Factory: "0xAb6A8AAb7d490007634ef59d424b5d89688a1971",
        swapRouter02: "0x23970b3a5AD7211eC4A858a29258F1e288eE2420",
        permit2: "0x4ce562F687d0Ced27b79Ba51d79B63BD978F7F48",
    },
};
/** Block the single-market factory was deployed at on Robinhood Chain; nothing par-related exists before it. */
export const FACTORY_DEPLOY_BLOCK = 53890474n;
/** Block the multi-market factory was deployed at on Robinhood Chain. */
export const MULTI_FACTORY_DEPLOY_BLOCK = 55587224n;
/** First block with par contracts, per chain: the lower bound for launch scans. */
export const DEPLOY_BLOCK_BY_CHAIN = {
    [ROBINHOOD_CHAIN_ID]: FACTORY_DEPLOY_BLOCK,
    [ARC_CHAIN_ID]: 21074807n,
    [ARC_TESTNET_CHAIN_ID]: 62122417n,
    [BASE_CHAIN_ID]: 51489805n,
    [BNB_CHAIN_ID]: 122881639n,
};
/** Where par's contracts start on a chain (0 when unknown, so a scan simply begins at the caller's block). */
export function deployBlockOf(chainId = ROBINHOOD_CHAIN_ID) {
    return DEPLOY_BLOCK_BY_CHAIN[chainId] ?? 0n;
}
/** Public indexer (no key), Robinhood Chain. */
export const INDEXER_URL = "https://api.par.family";
/** The interface; token pages are `${APP_URL}/token/<address>`. */
export const APP_URL = "https://par.family";
/**
 * Public hosts per chain: `<chain>.par.family` for the app and
 * `api-<chain>.par.family` for the indexer, `-testnet` for testnets.
 */
export const HOSTS_BY_CHAIN = {
    [ROBINHOOD_CHAIN_ID]: { app: APP_URL, indexer: INDEXER_URL },
    [ARC_CHAIN_ID]: { app: "https://arc.par.family", indexer: "https://api-arc.par.family" },
    [ARC_TESTNET_CHAIN_ID]: { app: "https://arc-testnet.par.family", indexer: "https://api-arc-testnet.par.family" },
    [BASE_CHAIN_ID]: { app: APP_URL, indexer: "https://api-base.par.family" },
    [BNB_CHAIN_ID]: { app: APP_URL, indexer: "https://api-bnb.par.family" },
};
/** The public indexer of a chain; Robinhood Chain's by default. */
export function indexerUrlOf(chainId = ROBINHOOD_CHAIN_ID) {
    return (HOSTS_BY_CHAIN[chainId] ?? HOSTS_BY_CHAIN[ROBINHOOD_CHAIN_ID]).indexer;
}
