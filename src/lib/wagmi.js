import { createAppKit } from '@reown/appkit'
import { mainnet } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const metadata = {
  name: 'DMPay',
  description: 'Get paid to receive DMs',
  url: 'https://app.dmpay.me',
  icons: ['https://app.dmpay.me/favicon.ico'],
}

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId,
})

export const config = wagmiAdapter.wagmiConfig

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  }
})
