# par — integration guide

par (https://par.family) is a token launchpad on **Robinhood Chain**. This document is everything needed to list, price, chart and trade par tokens end to end. Where this document and the chain disagree, the chain is right; tell us and we will fix the document.

Contacts: X @pardotfamily · team is in CET (UTC+2). Source: https://github.com/pardotfamily/par (contracts) · https://github.com/pardotfamily/par-sdk (TypeScript SDK) · docs: https://par.family/docs

---

## 1. What a par token is

- A plain ERC-20 (`PairPadLauncherToken`): fixed supply **1,000,000,000 × 1e18**, 18 decimals, no mint, no owner, no transfer hooks, no tax logic in the token. It is `ERC20Burnable`, so `burn()` exists.
- Its whole supply sits in a **Uniswap v4 pool** on the canonical PoolManager, **no hook** (`hooks = 0x0`), in a single liquidity position that is **locked forever** in a locker contract.
- There is **no bonding curve, no graduation, no migration**. The pool is live and tradable on v4 from the launch block. Anything that already routes Uniswap v4 swaps trades par tokens with zero custom code.
- Two launch stacks:
  - **Single-market**: one token, one pool, one quote asset.
  - **Multi-market**: one token, **1–5 pools**, each quoted in a different asset (e.g. one token trading against AAPL, MSFT, NVDA, GOOGL, TSLA at once). Same token address in every pool; the supply is split equally across the pools.
- Quote asset can be **native ETH** (`address(0)` as currency, the v4 convention) or **any ERC-20** on the chain (USDG, WETH, tokenised stocks, other par tokens…).

## 2. Chain

| | |
|---|---|
| Network | Robinhood Chain (Arbitrum Orbit L2) |
| Chain id | **4663** |
| Public RPC | `https://rpc.mainnet.chain.robinhood.com` (rate-limited; `eth_getLogs` ranges ≤ 10,000 blocks; JSON-RPC batching is unreliable, send single requests) |
| Explorer | `https://robinhoodchain.blockscout.com` |
| Native currency | ETH |
| Block time | ~0.25–1 s |

## 3. Addresses (mainnet, all verified on Blockscout)

```
Uniswap v4 PoolManager        0x8366a39CC670B4001A1121B8F6A443A643e40951

Single-market stack
  PairPadLaunchFactory        0x9d33Ba78389c8772bC114Cba47Dc1985E933e76F   (deployed at block 53890474)
  PairPadRouter               0x73d84bdbB1983Fa7eD8FCBcE40bc308997cEd120
  PairPadLocker               0x8a6d37B2E6a2AC7970eF69d2932757F04be0A231

Multi-market stack
  PairPadMultiLaunchFactory   0x3ea29975a79900179F3e1aEF93347Ba4210c29C1   (deployed at block 55587224)
  PairPadMultiRouter          0x458D2a59c2F3dd32775a64eE72004561440d64Df
  PairPadMultiLocker          0x5826FBB6201DaAcD924A3d292841DA9142952D59

Shared
  PairPadFeeEscrow            0x1C27e8F0c2a754DB23ab1608fA09c068D54d4386
  PairPadQuotePricer          0x9EfC6EFA4c5F31e2BEC6CC174Ba7bB8f0b57d563
  PairPadFeeSplitter          0x913A93cc2676F49454173323B85762b3e5906c43   (protocol fee recipient of new launches)
  PairPadHolderVault          0x4B79B8298cd890A82dC9De1dE5dBb745Cf04353C   (creator fee recipient of "fees to holders" launches)
  PairPadDisperse             0xF09E4997Ca8aC5869de8B1C63acc4a3180c087EC

Assets
  WETH                        0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73
  USDG                        0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168
  $par (the protocol token)   0x507B6F349a80114097A67B8b4677367acC15b220
```

Nothing par-related exists before block 53,890,474.

## 4. Discovering launches

### 4.1 On-chain

Single-market factory:

```solidity
event TokenLaunched(address indexed token, bytes32 indexed poolId, address indexed deployer,
                    address pairToken, uint256 launchConfigId, uint24 poolFee);
```

Multi-market factory (one `TokenLaunched`, then one `MarketOpened` per pool, all in the launch tx):

```solidity
event TokenLaunched(address indexed token, address indexed deployer, uint256 launchConfigId,
                    uint24 poolFee, address[] pairTokens);
event MarketOpened(address indexed token, bytes32 indexed poolId, uint256 marketIndex, address pairToken,
                   uint256 positionId, int24 tickLower, int24 tickUpper, uint128 liquidity,
                   uint256 tokenAmount, uint256 phantomQuote);
```

Watch both factories. Everything you need to trade is in these events: `token`, `pairToken`, `poolFee`, `poolId`.

Read-back at any time:

```solidity
// single
factory.getLaunchedToken(token)  -> (token, deployer, creatorFeeRecipient, pairToken, phantomQuote, poolFee, tickSpacing,
                                     tickLower, tickUpper, liquidity, positionId, baseFeeBps, creatorTaxBps,
                                     protocolFeeShareBps, protocolFeeRecipient, launchedAt, exists)
factory.poolKeyFor(token)        -> PoolKey
factory.poolIdFor(token)         -> bytes32
// multi
multiFactory.getLaunchedToken(token) -> (token, deployer, creatorFeeRecipient, poolFee, tickSpacing, baseFeeBps, creatorTaxBps,
                                         protocolFeeShareBps, protocolFeeRecipient, launchedAt, marketCount, exists)
multiFactory.getMarkets(token)       -> Market[] { pairToken, phantomQuote, tickLower, tickUpper, liquidity, positionId }
multiFactory.poolKeysFor(token)      -> PoolKey[]
```

"Is `X` a par token?" = `getLaunchedToken(X).exists` on either factory.

### 4.2 Off-chain (faster to bootstrap)

- `GET https://api.par.family/launches?orderBy=createdAt&orderDirection=desc&limit=100` — paged, see §9.
- `GET https://par.family/tokenlist.json` — Uniswap Token List of every launch; multi-market tokens carry `extensions.markets[]`.
- `GET https://api.par.family/events` — server-sent events, one `batch` event per indexed block range; poll `/launches` on each.

## 5. Token metadata

Stored **on the token contract itself** at launch (immutable):

```solidity
name(), symbol(), decimals() = 18, totalSupply() = 1e27
logo()        -> string   // usually "ipfs://<cid>"; resolve through any gateway, e.g. https://ipfs.io/ipfs/<cid>
description() -> string
socials()     -> (string twitter, string telegram, string discord, string website, string farcaster)
getTokenInfo()-> (address deployer, string logo, string description, Socials socials)
contractURI() -> string   // JSON metadata
```

Images are uploaded by the launch UI as square PNG/JPEG/GIF/WebP ≤ 512 px. `website` defaults to the token's page on par (`https://par.family/t/<16 hex>`) when the creator gave none. The indexer returns all of this resolved (`logoUrl` is an https URL).

## 6. Pools and prices

### 6.1 Pool key

```
currency0 = min(token, pairToken)   // numeric sort; native ETH is address(0) so it is always currency0
currency1 = max(token, pairToken)
fee       = poolFee                 // uint24, hundredths of a bip: 10000 = 1.00%
tickSpacing = 10                    // launch config 0; read it from getLaunchedToken to be safe
hooks     = 0x0000000000000000000000000000000000000000
poolId    = keccak256(abi.encode(currency0, currency1, fee, tickSpacing, hooks))
```

`poolFee = (baseFeeBps + creatorTaxBps) × 100`. Base is 100 bps (1%); creator tax is 0–1000 bps, fixed at launch. So `10000` = plain 1% pool, `20000` = 1% + 1% creator tax, up to `110000`.

### 6.2 Spot price

From the PoolManager's storage (`extsload`; pool state is mapping slot 6, `slot0` is the first word, `sqrtPriceX96` its low 160 bits):

```
slot = keccak256(abi.encode(poolId, uint256(6)))
sqrtPriceX96 = uint160(PoolManager.extsload(slot))
```

or from the latest `Swap` event's `sqrtPriceX96`. Then, as raw quote units per one whole token (1e18):

```
tokenIsCurrency0 ? sqrtP² × 1e18 / 2^192  :  2^192 × 1e18 / sqrtP²
```

Divide by `10^quoteDecimals` for a human number. **Market cap = price × 1e9** (every token has the same supply). For a multi-market token, price the token in each pool and weight by the tokens each pool still holds (or just use the indexer's `lastPriceEth`).

### 6.3 Liquidity

Every pool's liquidity is one locked position ranged from the opening price to the top of the range. There is no LP token to track, nothing can be removed. `tokensOnCurve` / `quoteRaised` on the indexer row give the pool's current inventory.

## 7. Trades

### 7.1 Reading

Every trade is a standard v4 `Swap` on the PoolManager; filter by `id = poolId`:

```solidity
event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1,
           uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee);
```

- Amounts are the **swapper's deltas**: **positive = received from the pool, negative = paid into the pool**.
- Take the token side (`amount0` if `tokenIsCurrency0`, else `amount1`): **positive → buy**, **negative → sell**. The other side is the quote amount.
- `sender` is the router that called the PoolManager (ours, yours, anyone's), **not** the trader. The trader is the transaction's `from`.
- `fee` is the LP fee actually charged (= `poolFee`). Buys pay it in the quote, sells pay it in the token.
- `sqrtPriceX96` is the post-trade price (§6.2).

For history with traders, ETH-denominated prices and candles use the indexer (§9); it stores `trader` = tx `from`.

### 7.2 Executing — option A: your own v4 routing (recommended if you already have it)

The pool is a normal v4 pool. Swap through the PoolManager with the pool key above, `zeroForOne` set by direction, any settlement pattern you already use (Universal Router, your own unlock callback). Nothing par-specific. Settle native ETH pools with native ETH (currency `address(0)`), as usual on v4.

For a multi-market token, each pool is independent; trade the one whose quote you hold, or split across several.

### 7.3 Executing — option B: par routers (ETH in / ETH out for any quote, multi-market split)

The routers add two things: paying in / receiving **native ETH** for pools quoted in another asset (they walk a route ETH → quote → token inside one PoolManager unlock), and, for multi-market tokens, one transaction split over all pools with the slippage floor on the total. They take **no fee**.

Single-market (`PairPadRouter`):

```solidity
struct Hop { PoolKey key; bool v3; }   // one step of the ETH<->quote route; v3 = a Uniswap v3 pool (key.fee is the tier)

// swap in the pool's own quote (send msg.value for an ETH-quoted buy; approve the router for ERC-20 in)
function swapExactIn(PoolKey key, bool zeroForOne, uint256 amountIn, uint256 minAmountOut, address recipient)
    payable returns (uint256 amountOut);

// pay ETH for a token quoted in anything; leg = route ETH -> quote (empty for ETH-quoted pools)
function buyWithEth(PoolKey key, Hop[] leg, uint256 minTokensOut, address recipient)
    payable returns (uint256 tokensOut);

// sell for ETH; approve the router for the token first; leg = route quote -> ETH
function sellToEth(PoolKey key, bool tokenIsCurrency0, uint256 tokensIn, Hop[] leg, uint256 minEthOut, address recipient)
    returns (uint256 ethOut);
```

Multi-market (`PairPadMultiRouter`):

```solidity
struct Leg { uint8 market; Hop[] hops; uint256 amountIn; }   // one pool of the token and how much goes through it

function buyWithEth(address token, Leg[] legs, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut);
function sellToEth(address token, Leg[] legs, uint256 minEthOut, address recipient) returns (uint256 ethOut);
function buyWithQuote(address token, uint8 market, uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256);
function sellToQuotes(address token, Leg[] legs, uint256[] minOuts, address recipient);
```

The route for a quote asset comes from the pricer:

```solidity
PairPadQuotePricer.route(address quoteToken) -> (Hop[] hops, bool qualifies)   // hops are quote -> ETH; reverse them for a buy
PairPadQuotePricer.priceEthAmountInQuote(address quoteToken, uint256 ethAmount) -> uint256
PairPadQuotePricer.isPriceable(address quoteToken) -> bool
```

Empty `hops` for an ETH-quoted pool. If `route()` returns no hops the quote has no ETH path; trade that pool in its quote directly.

Quotes: simulate the call (`eth_call` / viem `simulateContract`) and apply your slippage to the result; the routers revert with `SlippageExceeded(amountOut, minAmountOut)`, `RouteBroken(index)`, `RouteEndMismatch(expected, actual)`.

Approvals: sells through a router need `token.approve(router, amount)`; buys with ETH need none; buys with an ERC-20 quote need approval for that quote.

### 7.4 SDK (does all of the above)

```sh
npm i viem github:pardotfamily/par-sdk
```

```ts
import { createPar, buildApprove } from "par-sdk";
const par = createPar({ rpcUrl });                          // any Robinhood Chain RPC

const t = await par.getTradable(token);                     // null if not a par token; { kind: "single"|"multi", markets[], router }
const meta = await par.getTokenMetadata(token);
const buy  = await par.buildBuy(t, ethIn, recipient, 100);  // { to, data, value, expectedOut }, 1% slippage, all markets
const sell = await par.buildSell(t, tokensIn, recipient, 100);
const out  = await par.quoteBuy(t, ethIn);                  // simulation only
const launches = await par.getLaunches(fromBlock, toBlock); // both factories
par.watchLaunches(cb); par.watchTrades(launch, cb);
```

Everything lower-level is exported (`poolKeyFor`, `poolIdOf`, `readSpotPriceX18`, `parseTradeLogs`, all ABIs, `ParIndexer`). Current version 0.2.1.

## 8. Fees (for display)

- Pool LP fee = `poolFee` (1% base + creator tax). That is the only fee on a trade; the protocol takes nothing from integrators, and you can add your own fee in your router.
- Of the 1% base: half to the creator, half to the protocol. Creator tax goes entirely to the creator. Fees accrue in the locked position and are collected by a keeper (`FeesCollected` on the lockers); the creator claims from `PairPadFeeEscrow`.
- The protocol's share paid **in the launch token is burned** on every collection (`ProtocolShareBurned`). The protocol's share paid **in the quote** (for launches since the splitter went live) goes 80% to buying back and burning $par.
- A launch may opt in to **fees to holders** at creation: its `creatorFeeRecipient` is the `PairPadHolderVault`, and the creator share is bought back into the token and sent to holders pro rata every hour (`Dispersed` events on `PairPadDisperse`). The indexer exposes this as `feesToHolders: true`.

## 9. Indexer API

Base URL `https://api.par.family`. Public, no key, CORS open, gzip. Please send an identifying `User-Agent`; if you need sustained high request rates tell us and we will provision for it. A trade is queryable about a second after it is mined.

```
GET /health                       -> { ok, head, indexed, lagBlocks, ... }
GET /launches?orderBy=createdAt&orderDirection=desc&limit=100
    orderBy   createdAt | lastTradeAt | tradeCount | totalVolumeQuote | marketCap | recentVolume
    filters   deployer=0x.. | token_in=0x..,0x.. | feesToHolders=1 | q=<name, symbol or address search>
    paging    limit ≤ 500, offset=N (≤ 10000); for a full sync walk orderBy=createdAt&orderDirection=asc
GET /launches/count               -> { launched }
GET /launches/:token              -> one row (404 if not a par token)
GET /trades?token=0x..&limit=200[&wallet=0x..]
GET /candles?token=0x..&interval=5m&limit=300[&before=<unix>]
    interval 1m | 5m | 15m | 1h | 4h | 1d
    -> { candles: [{ time, open, high, low, close, openEth, highEth, lowEth, closeEth, volumeQuote, trades }] }
GET /holders?token=0x..&limit=100
GET /positions?owner=0x..         -> every par token a wallet holds, with cost basis
GET /fees?token=0x..              -> fee collections
GET /distributions?token=0x..     -> holder-reward rounds
GET /rewards?owner=0x..[&token=]  -> what a wallet received from holder rewards
GET /buybacks                     -> $par bought back and burned
GET /stats                        -> platform totals (launches, holders, trades, volumeEth, ...)
GET /events                       -> text/event-stream
GET https://par.family/tokenlist.json
```

Conventions: `uint256` values are **decimal strings in raw units**, timestamps are unix seconds, addresses are lowercase, ETH prices are floats (`lastPriceEth` = ETH per whole token).

Launch row (single-market):

```json
{
  "launchpad": "par", "factory": "0x9d33…", "locker": "0x8a6d…",
  "token": "0x…", "poolId": "0x…", "poolFee": 10000, "tickSpacing": 10, "marketCount": 1,
  "deployer": "0x…", "creatorFeeRecipient": "0x…", "feesToHolders": false,
  "name": "…", "symbol": "…", "decimals": 18,
  "logo": "ipfs://bafk…", "logoUrl": "https://ipfs.io/ipfs/bafk…", "description": "…",
  "socials": { "twitter": null, "telegram": null, "discord": null, "website": "https://par.family/t/…", "farcaster": null },
  "pairToken": "0x0000000000000000000000000000000000000000", "quoteSymbol": "ETH", "quoteDecimals": 18,
  "quoteRisk": "native",                       // native | verified | wild  (how well-known the quote asset is)
  "supply": "1000000000000000000000000000",
  "baseFeeBps": 100, "creatorTaxBps": 0, "protocolFeeShareBps": 5000,
  "quoteRaised": "…", "tokensOnCurve": "…",   // pool inventory
  "totalVolumeQuote": "…", "totalVolumeEth": 0.31, "tradeCount": 14,
  "lastPriceQuoteX18": "1610000000", "lastPriceEth": 1.61e-9,   // quote units per 1e18 token; ETH per token
  "creatorFeesQuote": "…", "creatorFeesToken": "…", "burnedToken": "…",
  "createdAt": 1788308427, "createdBlock": 53116667, "lastTradeAt": 1788309901,
  "launchTx": "0x…", "positionId": "1590997"
}
```

Multi-market rows add `"marketCount": n` and `"markets": [{ index, poolId, pairToken, quoteSymbol, quoteDecimals, quoteRisk, quoteRaised, tokensOnCurve, totalVolumeQuote, tradeCount, lastPriceQuoteX18, lastPriceEth, lastTradeAt, … }]`; the top-level quote fields mirror `markets[0]`, and `lastPriceEth` / `totalVolumeEth` / `tradeCount` are across all markets. Use the `*Eth` candle fields for multi-market charts (their trades happen in several quotes).

Trade row:

```json
{ "txHash": "0x…", "token": "0x…", "trader": "0x…", "sender": "0x…(router)", "isBuy": true,
  "quoteAmount": "…", "tokenAmount": "…", "fee": "…", "priceQuoteX18": "…", "priceEth": 5.04e-8,
  "timestamp": 1788727309, "blockNumber": 56271195, "logIndex": 9, "market": null }
```

## 10. Edge cases worth knowing

- **Quote assets other than ETH.** ~half of the launches are quoted in USDG, WETH, tokenised stocks or other tokens. If you only support ETH pairs, `pairToken == 0x0` filters them; otherwise route through the quote (§7.3) or show the price in the quote.
- **Multi-market tokens** have one address and several `poolId`s. Aggregate volume/trades across pools; charts should use ETH-denominated prices.
- **Creator tax up to 10%** is part of `poolFee`; display it, since it changes the effective spread.
- **Same supply everywhere**: market cap is `price × 1e9`, and `burnedToken` (tokens sent to `address(0)`) reduces circulating supply.
- **Public RPC limits**: ≤10k-block `eth_getLogs`, no batching. For production use your own node or a provider; the indexer is the fastest bootstrap.
- **No hook, no admin keys on pools**: there is nothing that can pause, blacklist, or change a pool's fee after launch.

## 11. Checklist

1. Subscribe to `TokenLaunched` on both factories (or poll `/launches`).
2. On each launch: read metadata from the token, derive pool key(s) and `poolId`(s).
3. Charts/trades: `Swap` on the PoolManager filtered by `poolId` (or `/trades`, `/candles`).
4. Trading: your v4 routing with the pool key, or par routers for ETH in/out and multi-market.
5. Show `poolFee` as the trade fee; no integrator fee is taken by par.
6. Test tokens: `$par` `0x507B6F349a80114097A67B8b4677367acC15b220` (ETH-quoted, single); any row with `marketCount > 1` from `/launches` for multi-market.
