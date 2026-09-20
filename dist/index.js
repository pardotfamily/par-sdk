import { createParClient, ROBINHOOD_CHAIN_ID } from "./chain.js";
import { indexerUrlOf } from "./addresses.js";
import { getLaunch } from "./launches.js";
import { getTokenMetadata } from "./metadata.js";
import { ParIndexer } from "./indexer.js";
import { getEthRoutes, quoteBuyWithEth, quoteSellToEth, buildBuyWithEth, buildSellToEth, withSlippage } from "./trade.js";
import { getLaunches, watchLaunches, getTrades, watchTrades } from "./events.js";
import { readSpotPriceX18 } from "./pool.js";
export * from "./addresses.js";
export * from "./abi.js";
export * from "./chain.js";
export * from "./pool.js";
export * from "./launches.js";
export * from "./events.js";
export * from "./metadata.js";
export * from "./indexer.js";
export * from "./trade.js";
/**
 * One object that does the common things. Everything it wraps is also
 * exported as a plain function for callers that want to hold their own state.
 */
export function createPar(opts = {}) {
    const chainId = opts.chainId ?? ROBINHOOD_CHAIN_ID;
    const client = opts.client ?? createParClient(opts.rpcUrl, chainId);
    const indexer = new ParIndexer(opts.indexerUrl ?? indexerUrlOf(chainId));
    return {
        chainId,
        client,
        indexer,
        /** Is this a par token, and how is it set up? Null for anything else. */
        getLaunch: (token) => getLaunch(client, token, chainId),
        /** Name, symbol, logo, description, socials, supply, from the token itself. */
        getTokenMetadata: (token) => getTokenMetadata(client, token),
        /** Launch plus the ETH route of each market; the input `quoteBuy`/`quoteSell`/`buildBuy`/`buildSell` take. */
        async getTradable(token) {
            const launch = await getLaunch(client, token, chainId);
            if (!launch)
                return null;
            return { ...launch, routes: await getEthRoutes(client, launch, chainId) };
        },
        /** Spot price of every market, raw quote units per whole token. */
        getSpotPrices: (launch) => Promise.all(launch.markets.map((m) => readSpotPriceX18(client, launch.token, m.poolKey, chainId))),
        /** Tokens out for `ethIn`, simulated now. */
        quoteBuy: (launch, ethIn) => quoteBuyWithEth(client, launch, launch.routes, ethIn, undefined, chainId),
        /** ETH out for `tokensIn` sold by `owner`, simulated now. */
        quoteSell: (launch, tokensIn, owner) => quoteSellToEth(client, launch, launch.routes, tokensIn, owner, undefined, chainId),
        /** Buy transaction; `slippageBps` is applied to a fresh quote (default 1%). */
        async buildBuy(launch, ethIn, recipient, slippageBps = 100) {
            const expectedOut = await quoteBuyWithEth(client, launch, launch.routes, ethIn, undefined, chainId);
            return { ...buildBuyWithEth(launch, launch.routes, ethIn, withSlippage(expectedOut, slippageBps), recipient, undefined, chainId), expectedOut };
        },
        /** Sell transaction; the launch router must already be approved (see `buildApprove`). */
        async buildSell(launch, tokensIn, owner, slippageBps = 100) {
            const expectedOut = await quoteSellToEth(client, launch, launch.routes, tokensIn, owner, undefined, chainId);
            return { ...buildSellToEth(launch, launch.routes, tokensIn, withSlippage(expectedOut, slippageBps), owner, undefined, chainId), expectedOut };
        },
        /** Launch events in a block range. */
        getLaunches: (fromBlock, toBlock) => getLaunches(client, fromBlock, toBlock, chainId),
        /** New launches as they happen; returns unsubscribe. */
        watchLaunches: (cb) => watchLaunches(client, cb, undefined, chainId),
        /** Trades of a token's markets in a block range. */
        async getTrades(launch, fromBlock, toBlock) {
            const per = await Promise.all(launch.markets.map((m) => getTrades(client, m, fromBlock, toBlock, chainId)));
            return per.flat().sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1));
        },
        /** Trades as they happen, across every market of the token; returns unsubscribe. */
        watchTrades: (launch, cb) => watchTrades(client, launch.markets, cb, undefined, chainId),
    };
}
