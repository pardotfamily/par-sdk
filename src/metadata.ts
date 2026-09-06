import type { Address, PublicClient } from "viem";
import { launcherTokenAbi } from "./abi.js";

export type Socials = {
  twitter: string | null;
  telegram: string | null;
  discord: string | null;
  website: string | null;
  farcaster: string | null;
};

export type TokenMetadata = {
  token: Address;
  name: string;
  symbol: string;
  decimals: number;
  /** Current supply; the launch mints 1B and the protocol's fee share is burned over time. */
  totalSupply: bigint;
  deployer: Address;
  /** As stored on chain, usually an `ipfs://` URI. */
  logo: string | null;
  /** The same logo over HTTPS. */
  logoUrl: string | null;
  description: string | null;
  socials: Socials;
};

export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

/** `ipfs://<cid>/...` to a gateway URL; other URLs pass through. */
export function toHttpUrl(uri: string | null | undefined, gateway = IPFS_GATEWAY): string | null {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) return gateway + uri.slice("ipfs://".length).replace(/^ipfs\//, "");
  return uri;
}

const orNull = (s: string) => (s && s.length > 0 ? s : null);

/**
 * Everything a token page shows, read from the token itself. par tokens also
 * expose the same fields as an ERC-7572 `contractURI()` JSON data URI.
 */
export async function getTokenMetadata(client: PublicClient, token: Address, gateway = IPFS_GATEWAY): Promise<TokenMetadata> {
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
