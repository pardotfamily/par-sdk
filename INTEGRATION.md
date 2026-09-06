# par integration

Chain: Robinhood Chain, chain id 4663, Arbitrum Orbit L2.
RPC: https://rpc.mainnet.chain.robinhood.com (public, rate limited, eth_getLogs max 10000 blocks per call, no JSON-RPC batching)
Explorer: https://robinhoodchain.blockscout.com
Indexer: https://api.par.family (public, no key)
Contracts source: https://github.com/pardotfamily/par
Contact: X @pardotfamily, CET

## 0. Model

Every par token is a plain ERC20 with fixed supply 1e27 (1,000,000,000 * 1e18), 18 decimals, no mint, no owner, no transfer hooks.
The full supply is in one Uniswap v4 pool on the canonical PoolManager, hooks = 0x0, in one locked liquidity position. No bonding curve, no graduation, no migration. Tradable on v4 from the launch block.
Quote asset is native ETH (currency address(0)) or any ERC20.
Two stacks:
- single: one token, one pool
- multi: one token, 1 to 5 pools, each in a different quote asset, same token address

## 1. Addresses

```
PoolManager (Uniswap v4)      0x8366a39CC670B4001A1121B8F6A443A643e40951

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

## 2. Discover launches

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

Alternative: GET https://api.par.family/launches (section 8) or https://par.family/tokenlist.json (Uniswap token list, multi tokens have extensions.markets[]).

## 3. Token metadata

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

## 4. Pool key, poolId

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

## 5. Price

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

Liquidity: one locked position per pool from opening price to max tick. Cannot be removed. Inventory: tokensOnCurve and quoteRaised on the indexer row.

## 6. Trades (read)

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
price       = from sqrtPriceX96, section 5
trader      = tx.from                   // event.sender is the router, not the trader
fee         = LP fee charged, equals poolFee. Buys pay it in quote, sells pay it in token.
```

## 7. Trades (execute)

### 7a. Own v4 routing

The pool is a standard v4 pool. Swap through PoolManager with the PoolKey from section 4, zeroForOne by direction, your own unlock callback or Universal Router. Native ETH pools settle in native ETH (currency address(0)). Nothing par specific.

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

## 7c. SDK (TypeScript, viem)

Does sections 2 to 7b and 8. Node 18+ and browsers. Nothing is signed inside; build* return { to, data, value } for any wallet lib.

```sh
npm i viem github:pardotfamily/par-sdk
```

```ts
import { createPar, buildApprove, ADDRESSES, FACTORY_DEPLOY_BLOCK } from "par-sdk";

const par = createPar({ rpcUrl: RPC_URL });   // omit rpcUrl for the public node

// discover
const launches = await par.getLaunches(fromBlock, toBlock);   // both factories, max 10000 blocks per call on public RPC
// [{ token, kind: "single" | "multi", deployer, pairTokens, poolIds, blockNumber, transactionHash }]
const stop = par.watchLaunches((l) => { /* new token */ });

// resolve a token
const t = await par.getTradable(token);   // null if not par
// t = launch record plus routes[]: { token, kind, router, markets: [{ index, pairToken, poolKey, poolId, tokenIsCurrency0, ... }], routes }
const launch = await par.getLaunch(token);   // same without routes

// metadata
const meta = await par.getTokenMetadata(token);   // { name, symbol, logo, logoUrl, description, socials, deployer }

// price
const prices = await par.getSpotPrices(t);   // bigint[] per market, raw quote units per 1e18 token

// trades read
const trades = await par.getTrades(launch, fromBlock, toBlock);   // every market
// [{ poolId, side: "buy" | "sell", tokenAmount, quoteAmount, priceX18, sender, blockNumber, transactionHash, logIndex }]
const stopTrades = par.watchTrades(launch, (tr) => { /* ... */ });

// quotes (eth_call simulation, no balance or approval needed)
const tokensOut = await par.quoteBuy(t, ethIn);              // bigint
const ethOut    = await par.quoteSell(t, tokensIn, owner);   // bigint

// buy with ETH: single or multi, all markets ETH can reach, slippage floor on the total
const buy = await par.buildBuy(t, ethIn, recipient, slippageBps);   // { to, data, value, expectedOut }
await walletClient.sendTransaction(buy);

// sell to ETH: approve the launch router once, then build. owner = the wallet that holds and receives.
const approve = buildApprove(t.token, t.router);   // { to, data, value: 0n }
const sell = await par.buildSell(t, tokensIn, owner, slippageBps);   // { to, data, value, expectedOut }

// indexer client, same endpoints as section 8, typed
const ix = par.indexer;
await ix.launches({ orderBy: "recentVolume", limit: 50 });
await ix.launch(token);
await ix.trades(token, { limit: 500, wallet });
await ix.candles(token, "5m", { limit: 300, before });
await ix.holders(token, 100);
await ix.positions(wallet);
await ix.allLaunches();
await ix.stats();
```

Lower level exports: ADDRESSES, robinhoodChain, createParClient, all ABIs (factoryAbi, multiFactoryAbi, routerAbi, multiRouterAbi, lockerAbi, multiLockerAbi, feeEscrowAbi, quotePricerAbi, poolManagerAbi, launcherTokenAbi), poolKeyFor, poolIdOf, tokenIsCurrency0, readSqrtPriceX96, priceX18FromSqrt, getEthRoute, buildBuyWithEth, buildSellToEth, buildSwapInQuote, quoteBuyWithEth, quoteSellToEth, splitAmount, withSlippage, parseLaunchLogs, parseTradeLogs, ParIndexer.

Version 0.2.1. Repo and README: https://github.com/pardotfamily/par-sdk

## 8. Indexer API

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

## 9. Fees

Trade fee = poolFee, LP fee of the pool. Nothing else is charged. par takes no integrator fee. Add your own in your router if you want.
baseFeeBps 100 split 50/50 creator/protocol. creatorTaxBps 100% to creator. Collected from the locked position by a keeper (FeesCollected on the locker), creator claims from PairPadFeeEscrow.
Protocol share in token is burned (ProtocolShareBurned). Protocol share in quote goes 80% to buy and burn $par for launches with protocolFeeRecipient = PairPadFeeSplitter.
feesToHolders = true when creatorFeeRecipient = PairPadHolderVault. Creator share is bought back into the token and sent to holders pro rata (Dispersed on PairPadDisperse).

## 10. Notes

- About half of the launches are not ETH quoted. pairToken == address(0) filters ETH pairs. Others: route via section 7b or price in quote.
- Multi tokens: one address, several poolIds. Sum volume and trades across pools. Chart in ETH.
- creatorTaxBps up to 1000 is inside poolFee. Show it.
- burnedToken = tokens sent to address(0), reduces circulating supply.
- No hook, no admin on pools. Nothing can pause, blacklist or change a pool fee after launch.
- Public RPC: 10000 block eth_getLogs, no batching, retries needed. Use own node or provider in production.

## 11. Order of work

1. Watch TokenLaunched on both factories (or poll /launches).
2. Per launch: read metadata from the token, build PoolKey(s), compute poolId(s).
3. Charts and trades: Swap on PoolManager filtered by poolId, or /trades and /candles.
4. Trading: own v4 routing with the PoolKey, or PairPadRouter / PairPadMultiRouter.
5. Show poolFee as the trade fee.
6. Test with $par 0x507B6F349a80114097A67B8b4677367acC15b220 and any row with marketCount > 1.
