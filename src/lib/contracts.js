export const CONTRACTS = {
  DMPayRegistry: "0x58d02e17bdCf0fdae2e134Da280e6084552F76f5",
  DMPayMessaging: "0x588C943Bd4f59888B2F6ECA0b2BfB123B57b0a10",
};

export const MAINNET_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const SEPOLIA_USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const USDC_ADDRESS = MAINNET_USDC;

export const REGISTRY_ABI = [
  {
    name: "registerProfile",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "xHandle", type: "string" },
      { name: "bio", type: "string" },
      { name: "pfpUrl", type: "string" },
      { name: "priceUSDC", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "updateProfile",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bio", type: "string" },
      { name: "pfpUrl", type: "string" },
      { name: "priceUSDC", type: "uint256" }
    ],
    outputs: []
  },
  {
    name: "updateIPFSHash",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "ipfsHash", type: "string" }],
    outputs: []
  },
  {
    name: "getProfile",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "xHandle", type: "string" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "xHandle", type: "string" },
          { name: "bio", type: "string" },
          { name: "pfpUrl", type: "string" },
          { name: "priceUSDC", type: "uint256" },
          { name: "ipfsHash", type: "string" },
          { name: "registered", type: "bool" },
          { name: "active", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "getProfileByWallet",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "xHandle", type: "string" },
          { name: "bio", type: "string" },
          { name: "pfpUrl", type: "string" },
          { name: "priceUSDC", type: "uint256" },
          { name: "ipfsHash", type: "string" },
          { name: "registered", type: "bool" },
          { name: "active", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "walletToHandle",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "string" }]
  }
];

export const MESSAGING_ABI = [
  {
    name: "openConversation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: []
  },
  {
    name: "payForMessage",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: []
  },
  {
    name: "closeConversation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "sender", type: "address" }],
    outputs: []
  },
  {
    name: "isConversationOpen",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "getConversation",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "sender", type: "address" },
          { name: "recipient", type: "address" },
          { name: "totalPaid", type: "uint256" },
          { name: "lastPayment", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "openedAt", type: "uint256" },
          { name: "closedAt", type: "uint256" },
          { name: "messageCount", type: "uint256" }
        ]
      }
    ]
  },
  {
    name: "calculateFee",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [
      { name: "fee", type: "uint256" },
      { name: "net", type: "uint256" }
    ]
  },
  {
    name: "accumulatedFees",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  }
];

export const USDC_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  }
];
