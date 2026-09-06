import { parseAbi } from "viem";
/** PairPadLaunchFactory: single-market launches. */
export const factoryAbi = parseAbi([
    "struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }",
    "struct TokenParams { string name; string symbol; string logo; string description; Socials socials; address creatorFeeRecipient; uint16 creatorTaxBps; bytes32 expectedEconomics; bytes32 salt; }",
    "struct LaunchedToken { address token; address deployer; address creatorFeeRecipient; address pairToken; uint256 phantomQuote; uint24 poolFee; int24 tickSpacing; int24 tickLower; int24 tickUpper; uint128 liquidity; uint256 positionId; uint16 baseFeeBps; uint16 creatorTaxBps; uint16 protocolFeeShareBps; address protocolFeeRecipient; uint64 launchedAt; bool exists; }",
    "struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }",
    "struct LaunchConfig { uint256 supply; uint256 phantomQuote; int24 tickSpacing; bool enabled; }",
    "function launchToken(TokenParams params, uint256 launchConfigId, address pairToken) payable returns (address token, bytes32 poolId)",
    "function previewQuoteEconomics(uint256 launchConfigId, address pairToken) view returns (uint256 phantomQuote)",
    "function previewLaunchEconomics(uint256 launchConfigId, address pairToken) view returns (bytes32)",
    "function launchFee() view returns (uint256)",
    "function baseFeeBps() view returns (uint256)",
    "function maxCreatorTaxBps() view returns (uint256)",
    "function protocolFeeShareBps() view returns (uint256)",
    "function poolFeeFor(uint16 creatorTaxBps) view returns (uint24)",
    "function getLaunchedToken(address token) view returns (LaunchedToken memory)",
    "function poolKeyFor(address token) view returns (PoolKey memory)",
    "function poolIdFor(address token) view returns (bytes32)",
    "function getLaunchConfig(uint256 id) view returns (LaunchConfig memory)",
    "event TokenLaunched(address indexed token, bytes32 indexed poolId, address indexed deployer, address pairToken, uint256 launchConfigId, uint24 poolFee)",
    "event CreatorFeeRecipientUpdated(address indexed token, address indexed previousRecipient, address indexed newRecipient)",
]);
/** PairPadMultiLaunchFactory: one token, 1..5 pools. */
export const multiFactoryAbi = parseAbi([
    "struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }",
    "struct TokenParams { string name; string symbol; string logo; string description; Socials socials; address creatorFeeRecipient; uint16 creatorTaxBps; bytes32 expectedEconomics; bytes32 salt; }",
    "struct LaunchedToken { address token; address deployer; address creatorFeeRecipient; uint24 poolFee; int24 tickSpacing; uint16 baseFeeBps; uint16 creatorTaxBps; uint16 protocolFeeShareBps; address protocolFeeRecipient; uint64 launchedAt; uint8 marketCount; bool exists; }",
    "struct Market { address pairToken; uint256 phantomQuote; int24 tickLower; int24 tickUpper; uint128 liquidity; uint256 positionId; }",
    "struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }",
    "function launchToken(TokenParams params, uint256 launchConfigId, address[] pairTokens) payable returns (address token)",
    "function previewQuoteEconomics(uint256 launchConfigId, address[] pairTokens) view returns (uint256[] phantomQuotes)",
    "function previewLaunchEconomics(uint256 launchConfigId, address[] pairTokens) view returns (bytes32)",
    "function launchFee() view returns (uint256)",
    "function canLaunch(address launcher) view returns (bool)",
    "function getLaunchedToken(address token) view returns (LaunchedToken memory)",
    "function getMarkets(address token) view returns (Market[] memory)",
    "function poolKeyFor(address token, uint256 index) view returns (PoolKey memory)",
    "function poolKeysFor(address token) view returns (PoolKey[] memory)",
    "function poolIdFor(address token, uint256 index) view returns (bytes32)",
    "event TokenLaunched(address indexed token, address indexed deployer, uint256 launchConfigId, uint24 poolFee, address[] pairTokens)",
    "event MarketOpened(address indexed token, bytes32 indexed poolId, uint256 marketIndex, address pairToken, uint256 positionId, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 tokenAmount, uint256 phantomQuote)",
    "event CreatorFeeRecipientUpdated(address indexed token, address indexed previousRecipient, address indexed newRecipient)",
]);
/** PairPadRouter: swaps through one pool, ETH zaps along a route of hops, launch-and-buy. */
export const routerAbi = parseAbi([
    "struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }",
    "struct Hop { PoolKey key; bool v3; }",
    "function swapExactIn(PoolKey key, bool zeroForOne, uint256 amountIn, uint256 minAmountOut, address recipient) payable returns (uint256 amountOut)",
    "function buyWithEth(PoolKey key, Hop[] leg, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)",
    "function sellToEth(PoolKey key, bool tokenIsCurrency0, uint256 tokensIn, Hop[] leg, uint256 minEthOut, address recipient) returns (uint256 ethOut)",
    "error SlippageExceeded(uint256 amountOut, uint256 minAmountOut)",
    "error RouteBroken(uint256 index)",
    "error RouteEndMismatch(address expected, address actual)",
]);
/** PairPadMultiRouter: one trade split over the markets of a multi-market token. */
export const multiRouterAbi = parseAbi([
    "struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }",
    "struct Hop { PoolKey key; bool v3; }",
    "struct Leg { uint8 market; Hop[] hops; uint256 amountIn; }",
    "function buyWithEth(address token, Leg[] legs, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)",
    "function sellToEth(address token, Leg[] legs, uint256 minEthOut, address recipient) returns (uint256 ethOut)",
    "function sellToQuotes(address token, Leg[] legs, uint256[] minOuts, address recipient)",
    "function buyWithQuote(address token, uint8 market, uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)",
    "error SlippageExceeded(uint256 amountOut, uint256 minAmountOut)",
    "error RouteBroken(uint256 index)",
    "error RouteEndMismatch(address expected, address actual)",
]);
export const lockerAbi = parseAbi([
    "function pendingFees(address token) view returns (uint256 amount0, uint256 amount1)",
    "function collectFees(address token) returns (uint256 amount0, uint256 amount1)",
    "function lockedPositions(address token) view returns (uint256)",
    "event FeesCollected(address indexed token, address currency0, address currency1, uint256 protocolAmount0, uint256 protocolAmount1, uint256 creatorAmount0, uint256 creatorAmount1)",
    "event ProtocolShareBurned(address indexed token, uint256 amount)",
]);
export const multiLockerAbi = parseAbi([
    "function pendingFees(address token, uint256 index) view returns (uint256 amount0, uint256 amount1)",
    "function pendingFeesAll(address token) view returns (uint256[] amount0, uint256[] amount1)",
    "function collectFees(address token) returns (uint256[] collected)",
    "function collectMarketFees(address token, uint256 index) returns (uint256 amount0, uint256 amount1)",
    "function lockedPositions(address token) view returns (uint256[])",
    "event FeesCollected(address indexed token, uint256 indexed marketIndex, address currency0, address currency1, uint256 protocolAmount0, uint256 protocolAmount1, uint256 creatorAmount0, uint256 creatorAmount1)",
    "event ProtocolShareBurned(address indexed token, uint256 amount)",
]);
export const feeEscrowAbi = parseAbi([
    "function balanceOf(address recipient) view returns (uint256)",
    "function balanceOfToken(address recipient, address token) view returns (uint256)",
    "function claim() returns (uint256)",
    "function claimToken(address token) returns (uint256)",
]);
/** PairPadQuotePricer: how a quote asset is priced in ETH, and the route the routers trade along. */
export const quotePricerAbi = parseAbi([
    "struct PoolKey { address currency0; address currency1; uint24 fee; int24 tickSpacing; address hooks; }",
    "struct Hop { PoolKey key; bool v3; }",
    "function isPriceable(address quoteToken) view returns (bool)",
    "function priceEthAmountInQuote(address quoteToken, uint256 ethAmount) view returns (uint256)",
    "function route(address quoteToken) view returns (Hop[] hops, bool qualifies)",
]);
/** Uniswap v4 PoolManager: the Swap event every par trade emits, and the raw slot reader. */
export const poolManagerAbi = parseAbi([
    "event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
    "function extsload(bytes32 slot) view returns (bytes32)",
]);
/** PairPadLauncherToken: a plain ERC-20 (burnable, no owner) carrying its launch metadata. */
export const launcherTokenAbi = parseAbi([
    "struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function logo() view returns (string)",
    "function description() view returns (string)",
    "function socials() view returns (string twitter, string telegram, string discord, string website, string farcaster)",
    "function getTokenInfo() view returns (address tokenDeployer, string tokenLogo, string tokenDescription, Socials tokenSocials)",
    "function contractURI() view returns (string)",
]);
export const erc20Abi = parseAbi([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
]);
