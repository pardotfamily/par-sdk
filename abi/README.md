# par ABIs

JSON ABIs of the deployed par contracts, exported from the Foundry build.

`abi/*.json`: Robinhood Chain (chain id 4663) mainnet contracts. Addresses in `INTEGRATION.md` (A1) and `src/addresses.ts`.

`abi/arc/*.json`: the Arc build of the multi-market factory, router and pricer (Arc testnet 5042002 now, Arc mainnet 5042 after deploy). Same interface as Robinhood Chain plus the ERC-20 reference entry points (`buyWithReference`, `sellToReference`, `launchAndBuyWithReference`) and `nativeIsReference()`, because gas on Arc is USDC and the reference asset is the USDC ERC-20 (`0x3600000000000000000000000000000000000000`), not the native coin. Addresses in `src/addresses.ts` (`ADDRESSES_ARC_TESTNET`, `ADDRESSES_ARC`).

Every trade is a `Swap` event on the Uniswap v4 PoolManager; launches are `TokenLaunched` on the factories. Token metadata (name, symbol, image, socials) is on the token contract (`PairPadLauncherToken`).
