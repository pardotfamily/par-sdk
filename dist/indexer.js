import { INDEXER_URL } from "./addresses.js";
export class ParIndexer {
    baseUrl;
    fetchImpl;
    constructor(baseUrl = INDEXER_URL, fetchImpl = fetch) {
        this.baseUrl = baseUrl;
        this.fetchImpl = fetchImpl;
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }
    async get(path, params = {}) {
        const url = new URL(this.baseUrl + path);
        for (const [k, v] of Object.entries(params))
            if (v !== undefined)
                url.searchParams.set(k, String(v));
        const res = await this.fetchImpl(url, { headers: { accept: "application/json" } });
        if (!res.ok)
            throw new Error(`par indexer ${path}: HTTP ${res.status}`);
        return (await res.json());
    }
    /** Indexer status: last indexed block and the addresses it follows. */
    health() {
        return this.get("/health");
    }
    /** List launches. */
    launches(query = {}) {
        return this.get("/launches", {
            orderBy: query.orderBy,
            orderDirection: query.orderDirection,
            limit: query.limit,
            offset: query.offset,
            window: query.window,
            deployer: query.deployer,
            q: query.q,
            token_in: query.tokenIn?.join(","),
        });
    }
    /** Every launch, paged through in slices of 500. */
    async allLaunches(maxPages = 40) {
        const out = [];
        for (let page = 0; page < maxPages; page++) {
            const batch = await this.launches({ orderBy: "createdAt", orderDirection: "asc", limit: 500, offset: page * 500 });
            out.push(...batch);
            if (batch.length < 500)
                break;
        }
        return out;
    }
    /** Total launches so far. */
    async launchCount() {
        return (await this.get("/launches/count")).launched;
    }
    /** One launch, or null. */
    async launch(token) {
        try {
            return await this.get(`/launches/${token}`);
        }
        catch (e) {
            if (String(e).includes("HTTP 404"))
                return null;
            throw e;
        }
    }
    /** Trades of a token, newest first (limit 1..2000, default 200). `wallet` filters by trader. */
    trades(token, opts = {}) {
        return this.get("/trades", { token, limit: opts.limit, wallet: opts.wallet });
    }
    /** OHLC candles in the quote asset (`open..close`) and ETH (`openEth..closeEth`), oldest first. `before` (unix seconds) pages back. */
    candles(token, interval = "5m", opts = {}) {
        return this.get("/candles", { token, interval, limit: opts.limit, before: opts.before });
    }
    /** Largest holders (limit 1..200, default 20). */
    holders(token, limit) {
        return this.get("/holders", { token, limit });
    }
    /** Every par token a wallet holds, with its cost basis. */
    positions(owner, limit) {
        return this.get("/positions", { owner, limit });
    }
    /** Fee collections the locker made for a token, newest first. */
    fees(token, limit) {
        return this.get("/fees", { token, limit });
    }
    /**
     * Live feed of indexer events (server-sent events). Browser and Node 20+
     * expose EventSource; the URL is returned for other runtimes.
     */
    eventsUrl() {
        return `${this.baseUrl}/events`;
    }
}
/** The token list every par token appears in (Uniswap token-list schema, with `extensions.markets` for multi-market tokens). */
export const TOKENLIST_URL = "https://par.family/tokenlist.json";
