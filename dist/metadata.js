import { launcherTokenAbi } from "./abi.js";
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
/** `ipfs://<cid>/...` to a gateway URL; other URLs pass through. */
export function toHttpUrl(uri, gateway = IPFS_GATEWAY) {
    if (!uri)
        return null;
    if (uri.startsWith("ipfs://"))
        return gateway + uri.slice("ipfs://".length).replace(/^ipfs\//, "");
    return uri;
}
const orNull = (s) => (s && s.length > 0 ? s : null);
/**
 * Everything a token page shows, read from the token itself. par tokens also
 * expose the same fields as an ERC-7572 `contractURI()` JSON data URI.
 */
export async function getTokenMetadata(client, token, gateway = IPFS_GATEWAY) {
    const [name, symbol, decimals, totalSupply, info] = await Promise.all([
        client.readContract({ address: token, abi: launcherTokenAbi, functionName: "name" }),
        client.readContract({ address: token, abi: launcherTokenAbi, functionName: "symbol" }),
        client.readContract({ address: token, abi: launcherTokenAbi, functionName: "decimals" }),
        client.readContract({ address: token, abi: launcherTokenAbi, functionName: "totalSupply" }),
        client.readContract({ address: token, abi: launcherTokenAbi, functionName: "getTokenInfo" }),
    ]);
    const [deployer, logo, description, socials] = info;
    return {
        token,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply,
        deployer,
        logo: orNull(logo),
        logoUrl: toHttpUrl(orNull(logo), gateway),
        description: orNull(description),
        socials: {
            twitter: orNull(socials.twitter),
            telegram: orNull(socials.telegram),
            discord: orNull(socials.discord),
            website: orNull(socials.website),
            farcaster: orNull(socials.farcaster),
        },
    };
}
