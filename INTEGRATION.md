# par integration

## Model

Every par token is a plain ERC20 with fixed supply 1e27 (1,000,000,000 * 1e18), 18 decimals, no mint, no owner, no transfer hooks.
The full supply is in one Uniswap v4 pool on the canonical PoolManager, hooks = 0x0, in one locked liquidity position. No bonding curve, no graduation, no migration. Tradable on v4 from the launch block.
Quote asset is native ETH (currency address(0)) or any ERC20.
Two stacks:
- single: one token, one pool
- multi: one token, 1 to 5 pools, each in a different quote asset, same token address

## Integration with the SDK

TypeScript, built on viem. Covers discovery, metadata, prices, trade history, quotes, buy and sell transactions and the indexer. Node 18+ and browsers. Nothing is signed inside the SDK; buildBuy and buildSell return { to, data, value } for any wallet library. If you route Uniswap v4 with your own contracts, take the PoolKey from the SDK and skip step 7; the appendix has the raw ABI.

Repo: https://github.com/pardotfamily/par-sdk (README, source, dist). Version 0.2.1.

### 1. Install

```sh
npm i viem github:pardotfamily/par-sdk
```

```ts
import { createPar, buildApprove, ADDRESSES, FACTORY_DEPLOY_BLOCK, MULTI_FACTORY_DEPLOY_BLOCK } from "par-sdk";

const par = createPar({ rpcUrl: process.env.RPC_URL });
// or: createPar({ client: yourViemPublicClient })
// or: createPar() for the public node (rate limited, 10000 block eth_getLogs, no batching)
```

### 2. Discover launches

Backfill, both factories, one call per block range (max 10000 blocks on the public RPC):
```ts
for (let from = FACTORY_DEPLOY_BLOCK; from <= head; from += 10_000n) {
  const launches = await par.getLaunches(from, from + 9_999n);
  // LaunchEvent: { token, kind: "single" | "multi", deployer, launchConfigId, poolFee, pairTokens[], poolIds[], blockNumber, transactionHash }
}
```

Live:
```ts
const stop = par.watchLaunches((l) => onNewToken(l.token));   // polls every 2 s; call stop() to unsubscribe
```

Or from the indexer, no RPC needed:
```ts
const rows = await par.indexer.launches({ orderBy: "createdAt", orderDirection: "desc", limit: 100 });
const all  = await par.indexer.allLaunches();   // paged, every launch
```

### 3. Resolve a token

```ts
const t = await par.getTradable(token);   // null when not a par token
```
t is the on-chain launch record plus the ETH route of every market:
```
t.token, t.kind ("single" | "multi"), t.factory, t.router, t.locker
t.deployer, t.creatorFeeRecipient
t.poolFee          uint24, 10000 = 1%. Same for every market.
t.tickSpacing, t.baseFeeBps, t.creatorTaxBps, t.protocolFeeShareBps, t.launchedAt
t.markets[]        { index, pairToken (address(0) = ETH), quoteSymbol, quoteDecimals, poolKey, poolId, tokenIsCurrency0, positionId, liquidity, tickLower, tickUpper, phantomQuote }
t.routes[]         per market: { buyHops, sellHops, qualifies } or null when ETH cannot reach that quote
```
Cache t per token; it never changes after launch. par.getLaunch(token) is the same without routes.

### 4. Metadata

```ts
const m = await par.getTokenMetadata(token);
// { token, name, symbol, decimals, totalSupply, deployer, logo (ipfs://), logoUrl (https), description, socials { twitter, telegram, discord, website, farcaster } }
```
All of it lives on the token contract, set at launch, immutable. totalSupply starts at 1e27 and falls as fees are burned.

### 5. Price

```ts
const prices = await par.getSpotPrices(t);   // bigint[] per market, raw quote units per 1e18 token
const human = Number(prices[0]) / 10 ** t.markets[0].quoteDecimals;
```
Market cap = price * 1e9 (every token has the same supply). For a multi token weight the markets by tokens left in each pool, or take lastPriceEth from the indexer row.

### 6. Trades (history and live)

```ts
const trades = await par.getTrades(t, fromBlock, toBlock);   // all markets, sorted by block and log index
// TradeEvent: { poolId, side: "buy" | "sell", tokenAmount, quoteAmount, priceX18, sender, blockNumber, transactionHash, logIndex }
const stop = par.watchTrades(t, (tr) => onTrade(tr));
```
sender is the router that hit the pool, not the trader. Trader = tx.from; the indexer already resolves it (step 8). Multi token: match tr.poolId to t.markets[i].poolId to know which quote the trade was in.

### 7. Buy and sell

Quotes are eth_call simulations. No balance or approval needed.
```ts
const tokensOut = await par.quoteBuy(t, ethIn);              // bigint
const ethOut    = await par.quoteSell(t, tokensIn, owner);   // bigint
```

Buy with native ETH. Works for every quote asset ETH can reach, single or multi (split over all markets, slippage floor on the total):
```ts
const buy = await par.buildBuy(t, ethIn, recipient, 100);   // slippage in bps, default 100 = 1%
// { to, data, value, expectedOut }
const hash = await walletClient.sendTransaction({ to: buy.to, data: buy.data, value: buy.value });
```

Sell to native ETH. Approve the launch router once per token, then build:
```ts
const approve = buildApprove(t.token, t.router);   // { to, data, value: 0n }, max allowance
await walletClient.sendTransaction(approve);
const sell = await par.buildSell(t, tokensIn, owner, 100);   // owner = wallet that holds the tokens and receives ETH
await walletClient.sendTransaction({ to: sell.to, data: sell.data, value: sell.value });
```

Reverts to handle: SlippageExceeded(amountOut, minAmountOut), RouteBroken(index), RouteEndMismatch(expected, actual). Refresh the quote and retry.

Trade in the pool's own quote instead of ETH:
```ts
import { buildSwapInQuote } from "par-sdk";
const tx = buildSwapInQuote(t, t.markets[0], "buy", quoteIn, minTokensOut, recipient);   // ERC20 quote: approve t.router first
```

Own v4 routing: use t.markets[i].poolKey and t.markets[i].tokenIsCurrency0 with your contracts. The pools are standard v4 pools with no hook. Appendix A7 has the router ABI if you need to call it from another language.

### 8. Indexer

Same data as the public API, typed. Public, no key, no RPC needed.
```ts
const ix = par.indexer;   // or new ParIndexer("https://api.par.family")

await ix.health();
await ix.launches({ orderBy, orderDirection, limit, offset, deployer, q, tokenIn, window });
//   orderBy: createdAt | lastTradeAt | tradeCount | totalVolumeQuote | marketCap | recentVolume
await ix.allLaunches();
await ix.launchCount();
await ix.launch(token);                                   // IndexedLaunch or null
await ix.trades(token, { limit, wallet });                // newest first, trader resolved, priceEth
await ix.candles(token, "5m", { limit, before });         // 1m 5m 15m 1h 4h 1d; quote and ETH OHLC
await ix.holders(token, limit);
await ix.positions(wallet);                               // every par token a wallet holds, with cost basis
await ix.fees(token);
await ix.distributions(token);  await ix.rewards(owner, token);  await ix.buybacks();
await ix.stats();                                         // platform totals
ix.eventsUrl();                                           // SSE endpoint, one "batch" event per indexed block range
```
Row shapes: appendix A8. Amounts are decimal strings in raw units, timestamps unix seconds, addresses lowercase.

### 9. Display

Trade fee to show = t.poolFee / 10000 percent (1% base plus creator tax, 0 to 10%). No protocol fee on top for integrators.
Badge feesToHolders when creatorFeeRecipient equals ADDRESSES.holderVault (indexer rows carry the flag).
Multi tokens: one address, several pools. Sum volume and trades across markets. Chart in ETH (candles' *Eth fields).

### 10. Order of work

1. watchLaunches or indexer.launches for discovery.
2. getTradable + getTokenMetadata per token, cache both.
3. getSpotPrices or indexer for price; watchTrades or indexer.trades and candles for charts.
4. quoteBuy/quoteSell, buildBuy/buildSell (or own routing with t.markets[i].poolKey).
5. Test on $par 0x507B6F349a80114097A67B8b4677367acC15b220 (ETH quoted, single) and any indexer row with marketCount > 1 (multi).

## Appendix: raw contracts and API

For own v4 routing, other languages, or checking what the SDK does.

## A1. Chain and addresses

```
Chain id 4663, Robinhood Chain (Arbitrum Orbit L2)
RPC https://rpc.mainnet.chain.robinhood.com   public, rate limited, eth_getLogs max 10000 blocks, no JSON-RPC batching
Explorer https://robinhoodchain.blockscout.com
Indexer https://api.par.family

PoolManager (Uniswap v4)      0x8366a39CC670B4001A1121B8F6A443A643e40951
PositionManager (Uniswap v4)  0x58daec3116aae6D93017bAAea7749052E8a04fA7

PairPadLaunchFactory          0x9d33Ba78389c8772bC114Cba47Dc1985E933e76F   deployed at block 53890474
PairPadRouter                 0x73d84bdbB1983Fa7eD8FCBcE40bc308997cEd120
PairPadLocker                 0x8a6d37B2E6a2AC7970eF69d2932757F04be0A231

PairPadMultiLaunchFactory     0x3ea29975a79900179F3e1aEF93347Ba4210c29C1   deployed at block 55587224
PairPadMultiRouter            0x458D2a59c2F3dd32775a64eE72004561440d64Df
PairPadMultiLocker            0x5826FBB6201DaAcD924A3d292841DA9142952D59

PairPadFeeEscrow              0x1C27e8F0c2a754DB23ab1608fA09c068D54d4386
PairPadQuotePricer            0x9EfC6EFA4c5F31e2BEC6CC174Ba7bB8f0b57d563
PairPadFeeSplitter            0x913A93cc2676F49454173323B85762b3e5906c43
PairPadHolderVault            0x4B79B8298cd890A82dC9De1dE5dBb745Cf04353C
PairPadDisperse               0xF09E4997Ca8aC5869de8B1C63acc4a3180c087EC

WETH                          0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73
USDG                          0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168
$par                          0x507B6F349a80114097A67B8b4677367acC15b220   ETH quoted, single, use for testing
```

## A2. Discover launches

Subscribe to both factories.

PairPadLaunchFactory:
```solidity
event TokenLaunched(address indexed token, bytes32 indexed poolId, address indexed deployer, address pairToken, uint256 launchConfigId, uint24 poolFee);
```

PairPadMultiLaunchFactory (one TokenLaunched plus one MarketOpened per pool, same tx):
```solidity
event TokenLaunched(address indexed token, address indexed deployer, uint256 launchConfigId, uint24 poolFee, address[] pairTokens);
event MarketOpened(address indexed token, bytes32 indexed poolId, uint256 marketIndex, address pairToken, uint256 positionId, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 tokenAmount, uint256 phantomQuote);
```

Backfill from block 53890474 (single) and 55587224 (multi), 10000 blocks per eth_getLogs on the public RPC.

Read back:
```solidity
// PairPadLaunchFactory
function getLaunchedToken(address token) view returns (address token, address deployer, address creatorFeeRecipient, address pairToken, uint256 phantomQuote, uint24 poolFee, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 positionId, uint16 baseFeeBps, uint16 creatorTaxBps, uint16 protocolFeeShareBps, address protocolFeeRecipient, uint64 launchedAt, bool exists);
function poolKeyFor(address token) view returns (PoolKey);
function poolIdFor(address token) view returns (bytes32);

// PairPadMultiLaunchFactory
function getLaunchedToken(address token) view returns (address token, address deployer, address creatorFeeRecipient, uint24 poolFee, int24 tickSpacing, uint16 baseFeeBps, uint16 creatorTaxBps, uint16 protocolFeeShareBps, address protocolFeeRecipient, uint64 launchedAt, uint8 marketCount, bool exists);
function getMarkets(address token) view returns (Market[]);   // { address pairToken; uint256 phantomQuote; int24 tickLower; int24 tickUpper; uint128 liquidity; uint256 positionId; }
function poolKeysFor(address token) view returns (PoolKey[]);
function poolIdFor(address token, uint256 index) view returns (bytes32);
```

Is X a par token: getLaunchedToken(X).exists on either factory.

Alternative: GET https://api.par.family/launches (A8) or https://par.family/tokenlist.json (Uniswap token list, multi tokens have extensions.markets[]).

## A3. Token metadata

On the token contract, set at launch, immutable:
```solidity
function name() view returns (string);
function symbol() view returns (string);
function decimals() view returns (uint8);        // 18
function totalSupply() view returns (uint256);   // 1e27
function logo() view returns (string);           // ipfs://<cid>, resolve with any gateway
function description() view returns (string);
function socials() view returns (string twitter, string telegram, string discord, string website, string farcaster);
function getTokenInfo() view returns (address deployer, string logo, string description, Socials socials);
function contractURI() view returns (string);
```
Images: square, max 512 px, PNG/JPEG/GIF/WebP.

## A4. Pool key, poolId

```
currency0   = min(token, pairToken)     // numeric compare; address(0) = native ETH is always currency0
currency1   = max(token, pairToken)
fee         = poolFee                   // uint24, 10000 = 1.00%
tickSpacing = tickSpacing from getLaunchedToken (10 for launch config 0)
hooks       = 0x0000000000000000000000000000000000000000
poolId      = keccak256(abi.encode(currency0, currency1, fee, tickSpacing, hooks))
```

poolFee = (baseFeeBps + creatorTaxBps) * 100. baseFeeBps = 100. creatorTaxBps 0 to 1000, fixed at launch. Range 10000 to 110000.

tokenIsCurrency0 = (currency0 == token).

## A5. Price

Read slot0 from PoolManager storage:
```
slot         = keccak256(abi.encode(poolId, uint256(6)))
word         = PoolManager.extsload(slot)
sqrtPriceX96 = uint160(word)          // low 160 bits
```
Or take sqrtPriceX96 from the latest Swap event.

Raw quote units per 1e18 token:
```
tokenIsCurrency0 ? sqrtPriceX96^2 * 1e18 / 2^192 : 2^192 * 1e18 / sqrtPriceX96^2
```
Divide by 10^quoteDecimals for a human price. Market cap = price * 1e9 (same supply on every token).

Multi: price each pool, weight by tokens remaining in each pool, or take lastPriceEth from the indexer.

Liquidity: one position per pool from opening price to max tick, minted through PositionManager and held as an NFT by PairPadLocker (single) or PairPadMultiLocker (multi). The locker has no withdraw or arbitrary call function; the only position action it encodes is a zero liquidity decrease to collect fees. Cannot be removed by anyone. Inventory: tokensOnCurve and quoteRaised on the indexer row.

## A6. Trades (read)

Filter PoolManager logs by id = poolId:
```solidity
event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee);
```

Decode:
```
tokenDelta = tokenIsCurrency0 ? amount0 : amount1
quoteDelta = tokenIsCurrency0 ? amount1 : amount0
isBuy       = tokenDelta > 0            // positive = swapper received, negative = swapper paid
tokenAmount = abs(tokenDelta)
quoteAmount = abs(quoteDelta)
price       = from sqrtPriceX96, A5
trader      = tx.from                   // event.sender is the router, not the trader
fee         = LP fee charged, equals poolFee. Buys pay it in quote, sells pay it in token.
```

## A7. Trades (execute)

### 7a. Own v4 routing

The pool is a standard v4 pool. Swap through PoolManager with the PoolKey from A4, zeroForOne by direction, your own unlock callback or Universal Router. Native ETH pools settle in native ETH (currency address(0)). Nothing par specific.

Multi token: each pool is independent. Trade the pool whose quote you hold or split across pools.

### 7b. par routers

No fee taken. They add native ETH in/out for pools quoted in other assets and one-tx split over multi pools.

```solidity
struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }
struct Hop { PoolKey key; bool v3; }          // one step of the ETH<->quote route; v3 = Uniswap v3 pool, key.fee is the tier, tickSpacing and hooks 0
```

PairPadRouter 0x73d84bdbB1983Fa7eD8FCBcE40bc308997cEd120:
```solidity
function swapExactIn(PoolKey key, bool zeroForOne, uint256 amountIn, uint256 minAmountOut, address recipient) payable returns (uint256 amountOut);
    // swap in the pool's own quote. ETH quote buy: send msg.value = amountIn. ERC20 in: approve router first.
function buyWithEth(PoolKey key, Hop[] leg, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut);
    // msg.value = ETH in. leg = route ETH -> quote. Empty leg for ETH quoted pool.
function sellToEth(PoolKey key, bool tokenIsCurrency0, uint256 tokensIn, Hop[] leg, uint256 minEthOut, address recipient) returns (uint256 ethOut);
    // approve router for token first. leg = route quote -> ETH. Empty leg for ETH quoted pool.
```

PairPadMultiRouter 0x458D2a59c2F3dd32775a64eE72004561440d64Df:
```solidity
struct Leg { uint8 market; Hop[] hops; uint256 amountIn; }   // market = index from getMarkets

function buyWithEth(address token, Leg[] legs, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut);
    // msg.value = sum of legs[].amountIn. hops = ETH -> quote of that market.
function sellToEth(address token, Leg[] legs, uint256 minEthOut, address recipient) returns (uint256 ethOut);
    // approve router for token. amountIn in tokens per leg. hops = quote -> ETH.
function buyWithQuote(address token, uint8 market, uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut);
function sellToQuotes(address token, Leg[] legs, uint256[] minOuts, address recipient);
```

Route for a quote asset, from PairPadQuotePricer 0x9EfC6EFA4c5F31e2BEC6CC174Ba7bB8f0b57d563:
```solidity
function route(address quoteToken) view returns (Hop[] hops, bool qualifies);   // hops are quote -> ETH. Reverse the array for a buy. Empty for address(0). Empty and !qualifies = no ETH path, trade in quote only.
function priceEthAmountInQuote(address quoteToken, uint256 ethAmount) view returns (uint256);
function isPriceable(address quoteToken) view returns (bool);
```

Quoting: eth_call the same function, apply slippage to the returned amount, send with that as min.

Reverts:
```
SlippageExceeded(uint256 amountOut, uint256 minAmountOut)
RouteBroken(uint256 index)
RouteEndMismatch(address expected, address actual)
```

Approvals: token -> router for sells. ERC20 quote -> router for buyWithQuote / swapExactIn with ERC20 in. None for ETH in.

## A8. Indexer API

Base https://api.par.family. GET only. CORS open. gzip. Send a User-Agent. Tell us if you need high sustained rates. Trades are queryable about 1 s after the block.

```
/health                                   { ok, head, indexed, lagBlocks, ... }
/launches?orderBy=createdAt&orderDirection=desc&limit=100&offset=0
    orderBy         createdAt | lastTradeAt | tradeCount | totalVolumeQuote | marketCap | recentVolume
    orderDirection  asc | desc
    limit           1..500
    offset          0..10000
    deployer=0x..   token_in=0x..,0x..   feesToHolders=1   q=<name|symbol|address>
/launches/count                           { launched }
/launches/:token                          one row, 404 if not par
/trades?token=0x..&limit=200[&wallet=0x..]
/candles?token=0x..&interval=5m&limit=300[&before=<unix>]
    interval 1m | 5m | 15m | 1h | 4h | 1d
    { candles: [{ time, open, high, low, close, openEth, highEth, lowEth, closeEth, volumeQuote, trades }] }
    open..close = quote units per 1e18 token. *Eth = same in ETH. Use *Eth for multi tokens.
/holders?token=0x..&limit=100
/positions?owner=0x..
/fees?token=0x..
/distributions?token=0x..
/rewards?owner=0x..[&token=0x..]
/buybacks
/stats
/events                                   text/event-stream, one "batch" event per indexed block range
https://par.family/tokenlist.json
```

Types: uint256 as decimal string in raw units. Timestamps unix seconds. Addresses lowercase. lastPriceEth, priceEth, totalVolumeEth as floats.

Launch row:
```
launchpad, factory, locker
token, poolId, poolFee, tickSpacing, marketCount
deployer, creatorFeeRecipient, feesToHolders
name, symbol, decimals, logo (ipfs://), logoUrl (https), description
socials { twitter, telegram, discord, website, farcaster }
pairToken, quoteSymbol, quoteDecimals, quoteRisk (native | verified | wild)
supply, baseFeeBps, creatorTaxBps, protocolFeeShareBps
quoteRaised, tokensOnCurve
totalVolumeQuote, totalVolumeEth, tradeCount
lastPriceQuoteX18 (quote units per 1e18 token), lastPriceEth (ETH per token)
creatorFeesQuote, creatorFeesToken, creatorCollectedQuote, creatorCollectedToken, burnedToken
createdAt, createdBlock, lastTradeAt, launchTx, positionId
markets[]   only when marketCount > 1: { index, poolId, pairToken, quoteSymbol, quoteDecimals, quoteRisk, phantomQuote, positionId, quoteRaised, tokensOnCurve, totalVolumeQuote, tradeCount, creatorFeesQuote, creatorFeesToken, lastPriceQuoteX18, lastPriceEth, lastTradeAt }
```
Multi rows: top level quote fields mirror markets[0]. lastPriceEth, totalVolumeEth, tradeCount are across all markets.

Trade row:
```
txHash, token, trader (tx.from), sender (router), isBuy
quoteAmount, tokenAmount, fee, priceQuoteX18, priceEth
timestamp, blockNumber, logIndex
market   index for multi tokens, null for single. Multi rows also carry pairToken, quoteSymbol, quoteDecimals of that market.
```

## A9. Fees

Trade fee = poolFee, LP fee of the pool. Nothing else is charged. No protocol fee on top for integrators.
baseFeeBps 100 split 50/50 creator/protocol. creatorTaxBps 100% to creator. Collected from the locked position by a keeper (FeesCollected on the locker), creator claims from PairPadFeeEscrow.
Protocol share in token is burned (ProtocolShareBurned). Protocol share in quote goes 80% to buy and burn $par for launches with protocolFeeRecipient = PairPadFeeSplitter.
feesToHolders = true when creatorFeeRecipient = PairPadHolderVault. Creator share is bought back into the token and sent to holders pro rata (Dispersed on PairPadDisperse).

## A10. Notes

- About half of the launches are not ETH quoted. pairToken == address(0) filters ETH pairs. Others: route via A7b or price in quote.
- Multi tokens: one address, several poolIds. Sum volume and trades across pools. Chart in ETH.
- creatorTaxBps up to 1000 is inside poolFee. Show it.
- burnedToken = tokens sent to address(0), reduces circulating supply.
- No hook, no admin on pools. Nothing can pause, blacklist or change a pool fee after launch.
- LP lock: the position NFT is not burned and not in a third party locker, it is owned by our own locker contract. Generic checks (LP burned, Team Finance, Unicrypt, etc) will show it as unlocked. Treat PositionManager.ownerOf(positionId) == PairPadLocker or PairPadMultiLocker as locked forever. positionId is in getLaunchedToken / getMarkets and on the indexer row (positionId, markets[].positionId). Locker source: contracts/src/v2/PairPadLaunchLocker.sol, contracts/src/v3/PairPadMultiLaunchLocker.sol.
- Public RPC: 10000 block eth_getLogs, no batching, retries needed. Use own node or provider in production.
