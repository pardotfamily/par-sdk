import { createPublicClient, defineChain, http } from "viem";
/** Robinhood Chain mainnet, the only network par is deployed on. */
export const robinhoodChain = defineChain({
    id: 4663,
    name: "Robinhood Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
    blockExplorers: { default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" } },
    contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } },
});
export const EXPLORER_URL = "https://robinhoodchain.blockscout.com";
/**
 * A viem public client for Robinhood Chain. Pass your own RPC URL for
 * anything beyond light use; the public node rate-limits.
 */
export function createParClient(rpcUrl) {
    return createPublicClient({
        chain: robinhoodChain,
        // No JSON-RPC batching: the public node answers batches inconsistently
        // under load. Reads issued in the same tick still fold into Multicall3.
        transport: http(rpcUrl ?? robinhoodChain.rpcUrls.default.http[0], { retryCount: 3, retryDelay: 400 }),
    });
}
