/** PairPadLaunchFactory: single-market launches. */
export declare const factoryAbi: readonly [{
    readonly name: "launchToken";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "string";
            readonly name: "name";
        }, {
            readonly type: "string";
            readonly name: "symbol";
        }, {
            readonly type: "string";
            readonly name: "logo";
        }, {
            readonly type: "string";
            readonly name: "description";
        }, {
            readonly name: "socials";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "string";
                readonly name: "twitter";
            }, {
                readonly type: "string";
                readonly name: "telegram";
            }, {
                readonly type: "string";
                readonly name: "discord";
            }, {
                readonly type: "string";
                readonly name: "website";
            }, {
                readonly type: "string";
                readonly name: "farcaster";
            }];
        }, {
            readonly type: "address";
            readonly name: "creatorFeeRecipient";
        }, {
            readonly type: "uint16";
            readonly name: "creatorTaxBps";
        }, {
            readonly type: "bytes32";
            readonly name: "expectedEconomics";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }];
        readonly name: "params";
    }, {
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }];
    readonly outputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "bytes32";
        readonly name: "poolId";
    }];
}, {
    readonly name: "previewQuoteEconomics";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "phantomQuote";
    }];
}, {
    readonly name: "previewLaunchEconomics";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }];
    readonly outputs: readonly [{
        readonly type: "bytes32";
    }];
}, {
    readonly name: "launchFee";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "baseFeeBps";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "maxCreatorTaxBps";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "protocolFeeShareBps";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "poolFeeFor";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint16";
        readonly name: "creatorTaxBps";
    }];
    readonly outputs: readonly [{
        readonly type: "uint24";
    }];
}, {
    readonly name: "getLaunchedToken";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "deployer";
        }, {
            readonly type: "address";
            readonly name: "creatorFeeRecipient";
        }, {
            readonly type: "address";
            readonly name: "pairToken";
        }, {
            readonly type: "uint256";
            readonly name: "phantomQuote";
        }, {
            readonly type: "uint24";
            readonly name: "poolFee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "int24";
            readonly name: "tickLower";
        }, {
            readonly type: "int24";
            readonly name: "tickUpper";
        }, {
            readonly type: "uint128";
            readonly name: "liquidity";
        }, {
            readonly type: "uint256";
            readonly name: "positionId";
        }, {
            readonly type: "uint16";
            readonly name: "baseFeeBps";
        }, {
            readonly type: "uint16";
            readonly name: "creatorTaxBps";
        }, {
            readonly type: "uint16";
            readonly name: "protocolFeeShareBps";
        }, {
            readonly type: "address";
            readonly name: "protocolFeeRecipient";
        }, {
            readonly type: "uint64";
            readonly name: "launchedAt";
        }, {
            readonly type: "bool";
            readonly name: "exists";
        }];
    }];
}, {
    readonly name: "poolKeyFor";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "currency0";
        }, {
            readonly type: "address";
            readonly name: "currency1";
        }, {
            readonly type: "uint24";
            readonly name: "fee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "address";
            readonly name: "hooks";
        }];
    }];
}, {
    readonly name: "poolIdFor";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "bytes32";
    }];
}, {
    readonly name: "getLaunchConfig";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "id";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "uint256";
            readonly name: "supply";
        }, {
            readonly type: "uint256";
            readonly name: "phantomQuote";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "bool";
            readonly name: "enabled";
        }];
    }];
}, {
    readonly name: "TokenLaunched";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "bytes32";
        readonly name: "poolId";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "deployer";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }, {
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "uint24";
        readonly name: "poolFee";
    }];
}, {
    readonly name: "CreatorFeeRecipientUpdated";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "previousRecipient";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "newRecipient";
        readonly indexed: true;
    }];
}];
/** PairPadMultiLaunchFactory: one token, 1..5 pools. */
export declare const multiFactoryAbi: readonly [{
    readonly name: "launchToken";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "string";
            readonly name: "name";
        }, {
            readonly type: "string";
            readonly name: "symbol";
        }, {
            readonly type: "string";
            readonly name: "logo";
        }, {
            readonly type: "string";
            readonly name: "description";
        }, {
            readonly name: "socials";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "string";
                readonly name: "twitter";
            }, {
                readonly type: "string";
                readonly name: "telegram";
            }, {
                readonly type: "string";
                readonly name: "discord";
            }, {
                readonly type: "string";
                readonly name: "website";
            }, {
                readonly type: "string";
                readonly name: "farcaster";
            }];
        }, {
            readonly type: "address";
            readonly name: "creatorFeeRecipient";
        }, {
            readonly type: "uint16";
            readonly name: "creatorTaxBps";
        }, {
            readonly type: "bytes32";
            readonly name: "expectedEconomics";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }];
        readonly name: "params";
    }, {
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "address[]";
        readonly name: "pairTokens";
    }];
    readonly outputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
}, {
    readonly name: "previewQuoteEconomics";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "address[]";
        readonly name: "pairTokens";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256[]";
        readonly name: "phantomQuotes";
    }];
}, {
    readonly name: "previewLaunchEconomics";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "address[]";
        readonly name: "pairTokens";
    }];
    readonly outputs: readonly [{
        readonly type: "bytes32";
    }];
}, {
    readonly name: "launchFee";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "canLaunch";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "launcher";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "getLaunchedToken";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "deployer";
        }, {
            readonly type: "address";
            readonly name: "creatorFeeRecipient";
        }, {
            readonly type: "uint24";
            readonly name: "poolFee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "uint16";
            readonly name: "baseFeeBps";
        }, {
            readonly type: "uint16";
            readonly name: "creatorTaxBps";
        }, {
            readonly type: "uint16";
            readonly name: "protocolFeeShareBps";
        }, {
            readonly type: "address";
            readonly name: "protocolFeeRecipient";
        }, {
            readonly type: "uint64";
            readonly name: "launchedAt";
        }, {
            readonly type: "uint8";
            readonly name: "marketCount";
        }, {
            readonly type: "bool";
            readonly name: "exists";
        }];
    }];
}, {
    readonly name: "getMarkets";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "pairToken";
        }, {
            readonly type: "uint256";
            readonly name: "phantomQuote";
        }, {
            readonly type: "int24";
            readonly name: "tickLower";
        }, {
            readonly type: "int24";
            readonly name: "tickUpper";
        }, {
            readonly type: "uint128";
            readonly name: "liquidity";
        }, {
            readonly type: "uint256";
            readonly name: "positionId";
        }];
    }];
}, {
    readonly name: "poolKeyFor";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "uint256";
        readonly name: "index";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "currency0";
        }, {
            readonly type: "address";
            readonly name: "currency1";
        }, {
            readonly type: "uint24";
            readonly name: "fee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "address";
            readonly name: "hooks";
        }];
    }];
}, {
    readonly name: "poolKeysFor";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "currency0";
        }, {
            readonly type: "address";
            readonly name: "currency1";
        }, {
            readonly type: "uint24";
            readonly name: "fee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "address";
            readonly name: "hooks";
        }];
    }];
}, {
    readonly name: "poolIdFor";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "uint256";
        readonly name: "index";
    }];
    readonly outputs: readonly [{
        readonly type: "bytes32";
    }];
}, {
    readonly name: "TokenLaunched";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "deployer";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "launchConfigId";
    }, {
        readonly type: "uint24";
        readonly name: "poolFee";
    }, {
        readonly type: "address[]";
        readonly name: "pairTokens";
    }];
}, {
    readonly name: "MarketOpened";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "bytes32";
        readonly name: "poolId";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "marketIndex";
    }, {
        readonly type: "address";
        readonly name: "pairToken";
    }, {
        readonly type: "uint256";
        readonly name: "positionId";
    }, {
        readonly type: "int24";
        readonly name: "tickLower";
    }, {
        readonly type: "int24";
        readonly name: "tickUpper";
    }, {
        readonly type: "uint128";
        readonly name: "liquidity";
    }, {
        readonly type: "uint256";
        readonly name: "tokenAmount";
    }, {
        readonly type: "uint256";
        readonly name: "phantomQuote";
    }];
}, {
    readonly name: "CreatorFeeRecipientUpdated";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "previousRecipient";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "newRecipient";
        readonly indexed: true;
    }];
}];
/** PairPadRouter: swaps through one pool, ETH zaps along a route of hops, launch-and-buy. */
export declare const routerAbi: readonly [{
    readonly name: "swapExactIn";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "currency0";
        }, {
            readonly type: "address";
            readonly name: "currency1";
        }, {
            readonly type: "uint24";
            readonly name: "fee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "address";
            readonly name: "hooks";
        }];
        readonly name: "key";
    }, {
        readonly type: "bool";
        readonly name: "zeroForOne";
    }, {
        readonly type: "uint256";
        readonly name: "amountIn";
    }, {
        readonly type: "uint256";
        readonly name: "minAmountOut";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "amountOut";
    }];
}, {
    readonly name: "buyWithEth";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "currency0";
        }, {
            readonly type: "address";
            readonly name: "currency1";
        }, {
            readonly type: "uint24";
            readonly name: "fee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "address";
            readonly name: "hooks";
        }];
        readonly name: "key";
    }, {
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "key";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "currency0";
            }, {
                readonly type: "address";
                readonly name: "currency1";
            }, {
                readonly type: "uint24";
                readonly name: "fee";
            }, {
                readonly type: "int24";
                readonly name: "tickSpacing";
            }, {
                readonly type: "address";
                readonly name: "hooks";
            }];
        }, {
            readonly type: "bool";
            readonly name: "v3";
        }];
        readonly name: "leg";
    }, {
        readonly type: "uint256";
        readonly name: "minTokensOut";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "tokensOut";
    }];
}, {
    readonly name: "sellToEth";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "address";
            readonly name: "currency0";
        }, {
            readonly type: "address";
            readonly name: "currency1";
        }, {
            readonly type: "uint24";
            readonly name: "fee";
        }, {
            readonly type: "int24";
            readonly name: "tickSpacing";
        }, {
            readonly type: "address";
            readonly name: "hooks";
        }];
        readonly name: "key";
    }, {
        readonly type: "bool";
        readonly name: "tokenIsCurrency0";
    }, {
        readonly type: "uint256";
        readonly name: "tokensIn";
    }, {
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "key";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "currency0";
            }, {
                readonly type: "address";
                readonly name: "currency1";
            }, {
                readonly type: "uint24";
                readonly name: "fee";
            }, {
                readonly type: "int24";
                readonly name: "tickSpacing";
            }, {
                readonly type: "address";
                readonly name: "hooks";
            }];
        }, {
            readonly type: "bool";
            readonly name: "v3";
        }];
        readonly name: "leg";
    }, {
        readonly type: "uint256";
        readonly name: "minEthOut";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "ethOut";
    }];
}, {
    readonly name: "SlippageExceeded";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "amountOut";
    }, {
        readonly type: "uint256";
        readonly name: "minAmountOut";
    }];
}, {
    readonly name: "RouteBroken";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "index";
    }];
}, {
    readonly name: "RouteEndMismatch";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "expected";
    }, {
        readonly type: "address";
        readonly name: "actual";
    }];
}];
/** PairPadMultiRouter: one trade split over the markets of a multi-market token. */
export declare const multiRouterAbi: readonly [{
    readonly name: "buyWithEth";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly type: "uint8";
            readonly name: "market";
        }, {
            readonly name: "hops";
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly name: "key";
                readonly type: "tuple";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "currency0";
                }, {
                    readonly type: "address";
                    readonly name: "currency1";
                }, {
                    readonly type: "uint24";
                    readonly name: "fee";
                }, {
                    readonly type: "int24";
                    readonly name: "tickSpacing";
                }, {
                    readonly type: "address";
                    readonly name: "hooks";
                }];
            }, {
                readonly type: "bool";
                readonly name: "v3";
            }];
        }, {
            readonly type: "uint256";
            readonly name: "amountIn";
        }];
        readonly name: "legs";
    }, {
        readonly type: "uint256";
        readonly name: "minTokensOut";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "tokensOut";
    }];
}, {
    readonly name: "sellToEth";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly type: "uint8";
            readonly name: "market";
        }, {
            readonly name: "hops";
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly name: "key";
                readonly type: "tuple";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "currency0";
                }, {
                    readonly type: "address";
                    readonly name: "currency1";
                }, {
                    readonly type: "uint24";
                    readonly name: "fee";
                }, {
                    readonly type: "int24";
                    readonly name: "tickSpacing";
                }, {
                    readonly type: "address";
                    readonly name: "hooks";
                }];
            }, {
                readonly type: "bool";
                readonly name: "v3";
            }];
        }, {
            readonly type: "uint256";
            readonly name: "amountIn";
        }];
        readonly name: "legs";
    }, {
        readonly type: "uint256";
        readonly name: "minEthOut";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "ethOut";
    }];
}, {
    readonly name: "sellToQuotes";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly type: "uint8";
            readonly name: "market";
        }, {
            readonly name: "hops";
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly name: "key";
                readonly type: "tuple";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "currency0";
                }, {
                    readonly type: "address";
                    readonly name: "currency1";
                }, {
                    readonly type: "uint24";
                    readonly name: "fee";
                }, {
                    readonly type: "int24";
                    readonly name: "tickSpacing";
                }, {
                    readonly type: "address";
                    readonly name: "hooks";
                }];
            }, {
                readonly type: "bool";
                readonly name: "v3";
            }];
        }, {
            readonly type: "uint256";
            readonly name: "amountIn";
        }];
        readonly name: "legs";
    }, {
        readonly type: "uint256[]";
        readonly name: "minOuts";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "buyWithQuote";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "uint8";
        readonly name: "market";
    }, {
        readonly type: "uint256";
        readonly name: "quoteIn";
    }, {
        readonly type: "uint256";
        readonly name: "minTokensOut";
    }, {
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "tokensOut";
    }];
}, {
    readonly name: "SlippageExceeded";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "amountOut";
    }, {
        readonly type: "uint256";
        readonly name: "minAmountOut";
    }];
}, {
    readonly name: "RouteBroken";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "index";
    }];
}, {
    readonly name: "RouteEndMismatch";
    readonly type: "error";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "expected";
    }, {
        readonly type: "address";
        readonly name: "actual";
    }];
}];
export declare const lockerAbi: readonly [{
    readonly name: "pendingFees";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "amount0";
    }, {
        readonly type: "uint256";
        readonly name: "amount1";
    }];
}, {
    readonly name: "collectFees";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "amount0";
    }, {
        readonly type: "uint256";
        readonly name: "amount1";
    }];
}, {
    readonly name: "lockedPositions";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "FeesCollected";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "currency0";
    }, {
        readonly type: "address";
        readonly name: "currency1";
    }, {
        readonly type: "uint256";
        readonly name: "protocolAmount0";
    }, {
        readonly type: "uint256";
        readonly name: "protocolAmount1";
    }, {
        readonly type: "uint256";
        readonly name: "creatorAmount0";
    }, {
        readonly type: "uint256";
        readonly name: "creatorAmount1";
    }];
}, {
    readonly name: "ProtocolShareBurned";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
}];
export declare const multiLockerAbi: readonly [{
    readonly name: "pendingFees";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "uint256";
        readonly name: "index";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "amount0";
    }, {
        readonly type: "uint256";
        readonly name: "amount1";
    }];
}, {
    readonly name: "pendingFeesAll";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256[]";
        readonly name: "amount0";
    }, {
        readonly type: "uint256[]";
        readonly name: "amount1";
    }];
}, {
    readonly name: "collectFees";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256[]";
        readonly name: "collected";
    }];
}, {
    readonly name: "collectMarketFees";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }, {
        readonly type: "uint256";
        readonly name: "index";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "amount0";
    }, {
        readonly type: "uint256";
        readonly name: "amount1";
    }];
}, {
    readonly name: "lockedPositions";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256[]";
    }];
}, {
    readonly name: "FeesCollected";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "marketIndex";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "currency0";
    }, {
        readonly type: "address";
        readonly name: "currency1";
    }, {
        readonly type: "uint256";
        readonly name: "protocolAmount0";
    }, {
        readonly type: "uint256";
        readonly name: "protocolAmount1";
    }, {
        readonly type: "uint256";
        readonly name: "creatorAmount0";
    }, {
        readonly type: "uint256";
        readonly name: "creatorAmount1";
    }];
}, {
    readonly name: "ProtocolShareBurned";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
}];
export declare const feeEscrowAbi: readonly [{
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "recipient";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOfToken";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "recipient";
    }, {
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "claim";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "claimToken";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "token";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}];
/** PairPadQuotePricer: how a quote asset is priced in ETH, and the route the routers trade along. */
export declare const quotePricerAbi: readonly [{
    readonly name: "isPriceable";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "quoteToken";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "priceEthAmountInQuote";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "quoteToken";
    }, {
        readonly type: "uint256";
        readonly name: "ethAmount";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "route";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "quoteToken";
    }];
    readonly outputs: readonly [{
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "key";
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "currency0";
            }, {
                readonly type: "address";
                readonly name: "currency1";
            }, {
                readonly type: "uint24";
                readonly name: "fee";
            }, {
                readonly type: "int24";
                readonly name: "tickSpacing";
            }, {
                readonly type: "address";
                readonly name: "hooks";
            }];
        }, {
            readonly type: "bool";
            readonly name: "v3";
        }];
        readonly name: "hops";
    }, {
        readonly type: "bool";
        readonly name: "qualifies";
    }];
}];
/** Uniswap v4 PoolManager: the Swap event every par trade emits, and the raw slot reader. */
export declare const poolManagerAbi: readonly [{
    readonly name: "Swap";
    readonly type: "event";
    readonly inputs: readonly [{
        readonly type: "bytes32";
        readonly name: "id";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "sender";
        readonly indexed: true;
    }, {
        readonly type: "int128";
        readonly name: "amount0";
    }, {
        readonly type: "int128";
        readonly name: "amount1";
    }, {
        readonly type: "uint160";
        readonly name: "sqrtPriceX96";
    }, {
        readonly type: "uint128";
        readonly name: "liquidity";
    }, {
        readonly type: "int24";
        readonly name: "tick";
    }, {
        readonly type: "uint24";
        readonly name: "fee";
    }];
}, {
    readonly name: "extsload";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "bytes32";
        readonly name: "slot";
    }];
    readonly outputs: readonly [{
        readonly type: "bytes32";
    }];
}];
/** PairPadLauncherToken: a plain ERC-20 (burnable, no owner) carrying its launch metadata. */
export declare const launcherTokenAbi: readonly [{
    readonly name: "name";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "symbol";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "decimals";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "allowance";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "approve";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "logo";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "description";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "socials";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
        readonly name: "twitter";
    }, {
        readonly type: "string";
        readonly name: "telegram";
    }, {
        readonly type: "string";
        readonly name: "discord";
    }, {
        readonly type: "string";
        readonly name: "website";
    }, {
        readonly type: "string";
        readonly name: "farcaster";
    }];
}, {
    readonly name: "getTokenInfo";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "address";
        readonly name: "tokenDeployer";
    }, {
        readonly type: "string";
        readonly name: "tokenLogo";
    }, {
        readonly type: "string";
        readonly name: "tokenDescription";
    }, {
        readonly type: "tuple";
        readonly components: readonly [{
            readonly type: "string";
            readonly name: "twitter";
        }, {
            readonly type: "string";
            readonly name: "telegram";
        }, {
            readonly type: "string";
            readonly name: "discord";
        }, {
            readonly type: "string";
            readonly name: "website";
        }, {
            readonly type: "string";
            readonly name: "farcaster";
        }];
        readonly name: "tokenSocials";
    }];
}, {
    readonly name: "contractURI";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}];
export declare const erc20Abi: readonly [{
    readonly name: "name";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "symbol";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "decimals";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "allowance";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "approve";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}];
