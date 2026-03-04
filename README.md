# DMpay.eth — Frontend

> Get paid to receive DMs. Set your price, share your link, earn USDC every time someone messages you.

**Live app:** [app.dmpay.me](https://app.dmpay.me)

---

## Overview

DMpay.eth is a decentralised paid messaging protocol built on Ethereum. Users register a profile backed by an ENS subdomain (`yourhandle.dmpay.eth`), set a price in USDC, and anyone who wants to message them pays that price upfront via smart contract. Messages are end-to-end encrypted using the XMTP protocol.

This repository contains the React frontend application.

---

## Features

- **ENS Subdomains** — Each user gets a `handle.dmpay.eth` subdomain automatically on registration
- **IPFS Profile Pages** — Personalised landing pages pinned to IPFS and pointed to by ENS contenthash
- **USDC Payments** — Pay-to-message enforced on-chain via the `DMPayMessaging` smart contract
- **XMTP Messaging** — End-to-end encrypted DMs via the XMTP protocol
- **X (Twitter) Identity** — Optional OAuth login to verify identity and display profile picture
- **Clean Share Links** — `https://app.dmpay.me?dm=yourhandle` for easy sharing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Wallet | Wagmi v3 + ReownAppKit (WalletConnect) |
| Messaging | @xmtp/browser-sdk v6 |
| Styling | Tailwind CSS v4 |
| Fonts | Syne (headings) + Space Grotesk (body) |
| Hosting | Cloudflare Pages |
| IPFS | Pinata v3 |

---

## Smart Contracts

| Contract | Address (Mainnet) |
|---|---|
| DMPayRegistry | `0x58d02e17bdCf0fdae2e134Da280e6084552F76f5` |
| DMPayMessaging | `0x588C943Bd4f59888B2F6ECA0b2BfB123B57b0a10` |

> Contract source code: [DMpay-Protocol](https://github.com/RWA-ID/DMpay-Protocol)

---

## Getting Started

### Prerequisites

- Node.js 20+
- A WalletConnect Project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))
- A Pinata API key ([pinata.cloud](https://pinata.cloud))
- An X Developer App with OAuth 2.0 enabled ([developer.x.com](https://developer.x.com))

### Install

```bash
git clone https://github.com/RWA-ID/DMpay-Frontend.git
cd DMpay-Frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_X_CLIENT_ID=your_x_client_id
VITE_BACKEND_URL=https://your-backend.com
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy to Cloudflare Pages

```bash
wrangler pages deploy dist --project-name=your-project-name
```

---

## Architecture

```
src/
├── components/
│   ├── MessagingPanel.jsx     # Send DM flow (approve USDC → pay → chat)
│   ├── XMTPChat.jsx           # Encrypted chat window
│   ├── ProfileCard.jsx        # User profile display
│   ├── RegisterProfile.jsx    # ENS + IPFS registration flow
│   └── ConversationList.jsx   # Inbox
├── hooks/
│   ├── useXMTP.js             # XMTP client, conversations, streaming
│   └── useEnsResolver.js      # ENS name resolution
├── lib/
│   ├── contracts.js           # ABI + contract addresses
│   ├── wagmi.js               # Wagmi + ReownAppKit config
│   └── generateProfilePage.js # IPFS profile page HTML generator
└── pages/
    ├── Dashboard.jsx          # Authenticated user dashboard
    ├── Landing.jsx            # Public landing / DM target page
    ├── AuthCallback.jsx       # X OAuth callback handler
    ├── Privacy.jsx            # Privacy Policy
    └── Terms.jsx              # Terms of Service
```

---

## How It Works

1. **Connect Wallet** — User connects an Ethereum wallet via WalletConnect or MetaMask
2. **Connect X** — Optional: OAuth login to verify X identity
3. **Register Profile** — Two on-chain transactions:
   - `registerProfile(handle, price)` on `DMPayRegistry` — creates ENS subdomain
   - `updateIPFSHash(cid)` — sets IPFS contenthash on ENS resolver
4. **Share Link** — User shares `https://app.dmpay.me?dm=handle`
5. **Sender Pays** — Sender approves USDC → calls `openConversation` on `DMPayMessaging`
6. **Chat** — Both parties message via XMTP (end-to-end encrypted)

---

## License

MIT
