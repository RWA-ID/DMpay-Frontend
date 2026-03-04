import { useState, useEffect } from 'react'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { modal } from './lib/wagmi'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import AuthCallback from './pages/AuthCallback'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function PageFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 mt-12">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/50">
        <span className="text-white/40">© 2026 DMpay.eth</span>
        <a href="https://x.com/DMpayeth" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          @DMpayeth
        </a>
        <a href="https://github.com/RWA-ID/DMpay-Frontend" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
        <a href="https://etherscan.io/address/0x58d02e17bdCf0fdae2e134Da280e6084552F76f5" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
          Registry Contract
        </a>
        <a href="https://etherscan.io/address/0x588C943Bd4f59888B2F6ECA0b2BfB123B57b0a10" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
          Messaging Contract
        </a>
        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
      </div>
    </footer>
  )
}

function EthLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16.001 5v8.284l7.001 3.129L16.001 5z" fill="white" fillOpacity="0.6"/>
      <path d="M16.001 5L9 16.413l7.001-3.129V5z" fill="white"/>
      <path d="M16.001 21.968v5.027l7.004-9.688-7.004 4.661z" fill="white" fillOpacity="0.6"/>
      <path d="M16.001 26.995v-5.028L9 17.307l7.001 9.688z" fill="white"/>
      <path d="M16.001 20.573l7.001-4.16-7.001-3.127v7.287z" fill="white" fillOpacity="0.2"/>
      <path d="M9 16.413l7.001 4.16v-7.287L9 16.413z" fill="white" fillOpacity="0.6"/>
    </svg>
  )
}

export default function App() {
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [dmTarget, setDmTarget] = useState(null)
  const [xUser, setXUser] = useState(() => {
    const stored = localStorage.getItem('x_user')
    return stored ? JSON.parse(stored) : null
  })

  const pathname = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const isCallback = params.has('code') && params.has('state')
  const isWrongNetwork = isConnected && chainId !== mainnet.id

  useEffect(() => {
    const dm = params.get('dm')
    if (dm) setDmTarget(dm)
    const xConnected = params.get('x_connected')
    if (xConnected) {
      const stored = localStorage.getItem('x_user')
      if (stored) setXUser(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (isConnected) localStorage.setItem('dmpay_wallet_connected', 'true')
  }, [isConnected])

  useEffect(() => {
    if (isWrongNetwork) switchChain({ chainId: mainnet.id })
  }, [isWrongNetwork])

  const handleDisconnect = async () => {
    try { await modal.disconnect() } catch {}
    disconnect()
    localStorage.removeItem('dmpay_wallet_connected')
    localStorage.removeItem('x_user')
    localStorage.removeItem('dmpay_price')
    setXUser(null)
  }

  if (isCallback) return <AuthCallback />
  if (pathname === '/privacy') return (
    <div className="min-h-screen bg-[#0c1a2e]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3"><EthLogo /><span className="font-['Syne'] font-700 text-xl text-white tracking-tight">dmpay<span className="text-sky-400">.eth</span></span></a>
      </header>
      <Privacy />
      <PageFooter />
    </div>
  )
  if (pathname === '/terms') return (
    <div className="min-h-screen bg-[#0c1a2e]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3"><EthLogo /><span className="font-['Syne'] font-700 text-xl text-white tracking-tight">dmpay<span className="text-sky-400">.eth</span></span></a>
      </header>
      <Terms />
      <PageFooter />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0c1a2e]">
      {isWrongNetwork && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-2 text-center">
          <span className="text-amber-400 text-sm">Wrong network. </span>
          <button
            onClick={() => switchChain({ chainId: mainnet.id })}
            className="text-amber-300 text-sm font-semibold underline"
          >
            Switch to Ethereum Mainnet
          </button>
        </div>
      )}

      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
          <EthLogo />
          <span className="font-['Syne'] font-700 text-xl text-white tracking-tight">
            dmpay<span className="text-sky-400">.eth</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {xUser && isConnected && (
            <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
              {xUser.pfpUrl && <img src={xUser.pfpUrl} alt="pfp" className="w-5 h-5 rounded-full" />}
              <span className="text-sky-400 text-sm">@{xUser.handle}</span>
            </div>
          )}
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/60 font-mono">
                {address?.slice(0,6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm border border-white/20 rounded-lg text-white/70 hover:border-white/40 hover:text-white transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => modal.open()}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main>
        {isConnected
          ? <Dashboard address={address} dmTarget={dmTarget} xUser={xUser} />
          : <Landing onConnect={() => modal.open()} dmTarget={dmTarget} />
        }
      </main>
      <PageFooter />
    </div>
  )
}
