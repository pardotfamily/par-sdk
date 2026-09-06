# par-sdk

TypeScript SDK for [par](https://par.family), the token launchpad on Robinhood Chain. Built on [viem](https://viem.sh); works in Node 18+ and browsers.

Every par token is a plain Uniswap v4 pool (no hook) from its first block, so you can already trade it with any v4 router. This SDK covers the launchpad-specific parts: finding launches, resolving a token to its pool(s), paying in native ETH for pools quoted in another asset, splitting a trade across the markets of a multi-market token, and the public indexer API.

Full integrator docs: [par.family/docs](https://par.family/docs).

## Install

```sh
npm i viem github:pardotfamily/par-sdk
```

## Quick start

```ts
import { createPar, buildApprove } from "par-sdk";
import { parseEther, formatEther } from "viem";

const par = createPar({ rpcUrl: process.env.RPC_URL }); // any Robinhood Chain RPC; public node if omitted

// Is this a par token, and what does it trade against?
const t = await par.getTradable("0x7841a0a37834EEB13Ad5DBaD692049C84CD6A73C");
if (!t) throw new Error("not a par token");
console.log(t.kind, t.markets.map((m) => m.quoteSymbol)); // "multi" [ "AAPL", "MSFT", "NVDA", "GOOGL", "TSLA" ]

// Metadata (name, symbol, logo, description, socials) from the token itself.
const meta = await par.getTokenMetadata(t.token);

// Quote and build a buy paid in ETH. For a multi-market token this is one
// transaction split across every pool ETH can reach, with the slippage
// floor on the total.
const ethIn = parseEther("0.1");
const buy = await par.buildBuy(t, ethIn, wallet.address, 100); // 1% slippage
// buy = { to, data, value, expectedOut } -> walletClient.sendTransaction(buy)

// Sell for ETH: approve the launch's router once, then build.
const approve = buildApprove(t.token, t.router);
const sell = await par.buildSell(t, tokensIn, wallet.address, 100);

// Quotes only (simulated, no balance or approval needed).
const out = await par.quoteBuy(t, ethIn);
const back = await par.quoteSell(t, out);
console.log(formatEther(back));
```

## Discovering launches

```ts
import { createPar, FACTORY_DEPLOY_BLOCK } from "par-sdk";
const par = createPar();

// Historical: both factories, one call per <=10k blocks on public RPCs.
const launches = await par.getLaunches(head - 9_000n, head);
// -> [{ token, kind: "single" | "multi", deployer, pairTokens, poolIds, blockNumber, transactionHash }]

// Live.
const stop = par.watchLaunches((l) => console.log("new token", l.token, l.pairTokens));
```

Every par token is also in the token list at `https://par.family/tokenlist.json` (Uniswap token-list schema; multi-market tokens carry `extensions.markets[]`).

## Trades

On chain, a trade is a `Swap` event on the Uniswap v4 PoolManager with `id` equal to the market's `poolId`. The SDK decodes them into buy/sell, token amount, quote amount and post-trade price:

```ts
const launch = await par.getLaunch(token);
const trades = await par.getTrades(launch, fromBlock, toBlock); // every market
const stop = par.watchTrades(launch, (t) => console.log(t.side, t.tokenAmount, t.quoteAmount));
```

For history with the trader's wallet, ETH pricing and candles, use the indexer (below); the event `sender` is the router, not the trader.

## Indexer

Typed client for `https://api.par.family` (public, no key). Amounts are decimal strings in raw units.

```ts
const ix = par.indexer; // or new ParIndexer()

await ix.launches({ orderBy: "recentVolume", limit: 50 });   // createdAt | lastTradeAt | tradeCount | totalVolumeQuote | marketCap | recentVolume
await ix.launch(token);                                      // one launch, with markets[] for multi-market tokens
await ix.trades(token, { limit: 500, wallet });              // newest first; trader, isBuy, amounts, fee, priceEth, market
await ix.candles(token, "5m", { limit: 300, before });       // 1m 5m 15m 1h 4h 1d; quote and ETH OHLC
await ix.holders(token, 100);
await ix.positions(wallet);                                  // every par token a wallet holds, with cost basis
await ix.fees(token);                                        // locker fee collections
await ix.allLaunches();                                      // everything, paged
await ix.stats();                                            // platform totals: launches, holders, trades, volumeEth, $par burned
```

## Lower level

Everything the facade uses is exported:

- `ADDRESSES`, `robinhoodChain`, `createParClient` — deployment and chain.
- `factoryAbi`, `multiFactoryAbi`, `routerAbi`, `multiRouterAbi`, `lockerAbi`, `multiLockerAbi`, `feeEscrowAbi`, `quotePricerAbi`, `poolManagerAbi`, `launcherTokenAbi` — ABIs.
- `getLaunch`, `poolKeyFor`, `poolIdOf`, `readSpotPriceX18` — pools.
- `getEthRoute`, `buildBuyWithEth`, `buildSellToEth`, `buildSwapInQuote`, `quoteBuyWithEth`, `quoteSellToEth`, `splitAmount`, `withSlippage` — trading.
- `parseLaunchLogs`, `parseTradeLogs`, `tokenLaunchedEvent`, `multiTokenLaunchedEvent`, `marketOpenedEvent`, `swapEvent` — events.

### Fee model, for display

The pool's LP fee is `poolFee` (hundredths of a bip): base 1% plus the creator tax the launch chose (0–10%). Of the base 1%, half accrues to the creator and half to the protocol; the protocol's share paid in the launch token is burned by the locker on every collection. Fees are claimable from `feeEscrow` by the creator; anyone may trigger a collection on the locker.

Two things sit on top of that:

- **Protocol buyback.** For launches created since `addresses.feeSplitter` became the protocol fee recipient, 80% of the protocol's quote fees buy $par and burn it, every hour. `indexer.buybacks()` has the totals and the burns.
- **Fees to holders.** A launch may name `addresses.holderVault` as its creator fee recipient (`feesToHolders: true` on the indexer row, `?feesToHolders=1` filters). Its creator share is bought back into the token and sent to holders pro rata every hour through `addresses.disperse`. `indexer.distributions(token)` lists the rounds, `indexer.rewards(owner, token)` what a wallet got.

## Trading a pool directly

If you have your own v4 routing, you do not need the router: `getLaunch(token).markets[i].poolKey` is the pool, `tokenIsCurrency0` tells you the direction, and a swap through PoolManager with that key is a par trade like any other.

## License

MIT
