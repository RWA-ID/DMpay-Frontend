import { useState, useEffect } from 'react'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { modal } from './lib/wagmi'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const [dmTarget, setDmTarget] = useState(null)
  const [xUser, setXUser] = useState(() => {
    const stored = localStorage.getItem('x_user')
    return stored ? JSON.parse(stored) : null
  })

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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">D</div>
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
    </div>
  )
}
