import { createPublicClient, defineChain, http, zeroAddress, type Address, type Chain, type PublicClient } from "viem";
import { base, bsc } from "viem/chains";

/** Robinhood Chain mainnet, the first network par was deployed on. */
export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
});

/**
 * Circle's Arc mainnet. USDC is the gas token; its native view has 18
 * decimals while the same balance is an ERC-20 with 6 decimals at
 * 0x3600…0000, which is what par pairs and prices against (see
 * `getReference`). The public RPC is not published yet; the URL here is a
 * placeholder, pass your own to `createParClient`.
 */
export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.arc.io"] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://arcscan.app" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
});

/** Arc testnet. */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.io"] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
  contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
});

export const ROBINHOOD_CHAIN_ID = robinhoodChain.id;
export const ARC_CHAIN_ID = arc.id;
export const ARC_TESTNET_CHAIN_ID = arcTestnet.id;
export const BASE_CHAIN_ID = base.id;
export const BNB_CHAIN_ID = bsc.id;

export const CHAINS: Record<number, Chain> = {
  [robinhoodChain.id]: robinhoodChain,
  [arc.id]: arc,
  [arcTestnet.id]: arcTestnet,
  [base.id]: base,
  [bsc.id]: bsc,
};

/** The viem chain for a par chain id; throws for a chain par is not on. */
export function getChain(chainId: number): Chain {
  const chain = CHAINS[chainId];
  if (!chain) throw new Error(`par is not deployed on chain ${chainId}`);
  return chain;
}

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

const ARC_USDC: Address = "0x3600000000000000000000000000000000000000";

const REFERENCES: Record<number, ReferenceAsset> = {
  [robinhoodChain.id]: {
    symbol: "ETH", decimals: 18, isNative: true, address: zeroAddress,
    wrapped: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", usdIsOne: false,
  },
  [arc.id]: { symbol: "USDC", decimals: 6, isNative: false, address: ARC_USDC, wrapped: ARC_USDC, usdIsOne: true },
  [arcTestnet.id]: { symbol: "USDC", decimals: 6, isNative: false, address: ARC_USDC, wrapped: ARC_USDC, usdIsOne: true },
  [base.id]: {
    symbol: "ETH", decimals: 18, isNative: true, address: zeroAddress,
    wrapped: "0x4200000000000000000000000000000000000006", usdIsOne: false,
  },
  [bsc.id]: {
    symbol: "BNB", decimals: 18, isNative: true, address: zeroAddress,
    wrapped: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", usdIsOne: false,
  },
};

/** The reference asset of a par chain (Robinhood Chain by default); throws for a chain par is not on. */
export function getReference(chainId: number = ROBINHOOD_CHAIN_ID): ReferenceAsset {
  const ref = REFERENCES[chainId];
  if (!ref) throw new Error(`par is not deployed on chain ${chainId}`);
  return ref;
}

/** Whether `asset` is the chain's reference asset in either of its forms. */
export function isReference(asset: Address, chainId: number = ROBINHOOD_CHAIN_ID): boolean {
  const ref = getReference(chainId);
  const a = asset.toLowerCase();
  return a === ref.address.toLowerCase() || a === ref.wrapped.toLowerCase();
}

/** Robinhood Chain's explorer; see `getChain(chainId).blockExplorers` for the others. */
export const EXPLORER_URL = "https://robinhoodchain.blockscout.com";

/**
 * A viem public client for a par chain (Robinhood Chain by default). Pass
 * your own RPC URL for anything beyond light use; the public nodes
 * rate-limit, and Arc mainnet has no published public RPC yet.
 */
export function createParClient(rpcUrl?: string, chainId: number = ROBINHOOD_CHAIN_ID): PublicClient {
  const chain = getChain(chainId);
  return createPublicClient({
    chain,
    // No JSON-RPC batching: the public node answers batches inconsistently
    // under load. Reads issued in the same tick still fold into Multicall3.
    transport: http(rpcUrl ?? chain.rpcUrls.default.http[0], { retryCount: 3, retryDelay: 400 }),
  }) as PublicClient;
}
