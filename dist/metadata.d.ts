import type { Address, PublicClient } from "viem";
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
export declare const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
/** `ipfs://<cid>/...` to a gateway URL; other URLs pass through. */
export declare function toHttpUrl(uri: string | null | undefined, gateway?: string): string | null;
/**
 * Everything a token page shows, read from the token itself. par tokens also
 * expose the same fields as an ERC-7572 `contractURI()` JSON data URI.
 */
export declare function getTokenMetadata(client: PublicClient, token: Address, gateway?: string): Promise<TokenMetadata>;
