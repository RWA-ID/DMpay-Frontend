import { appkit } from '../lib/wagmi'

export default function ConnectModal({ onClose }) {
  const handleConnect = (type) => {
    if (type === 'walletconnect') {
      appkit.open()
    } else {
      appkit.open({ view: 'Connect' })
    }
    onClose?.()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#0f2035] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-['Syne'] text-xl font-700 text-white">Connect Wallet</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleConnect('walletconnect')}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 rounded-xl transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🔗</div>
            <div className="text-left flex-1">
              <p className="text-white font-semibold text-sm">WalletConnect</p>
              <p className="text-white/40 text-xs">Trust Wallet, Rainbow & 300+ wallets</p>
            </div>
            <div className="text-white/20">→</div>
          </button>

          <button
            onClick={() => handleConnect('injected')}
            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30 rounded-xl transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🦊</div>
            <div className="text-left flex-1">
              <p className="text-white font-semibold text-sm">Browser Wallet</p>
              <p className="text-white/40 text-xs">MetaMask, Rabby, Coinbase & more</p>
            </div>
            <div className="text-white/20">→</div>
          </button>
        </div>

        <p className="text-white/20 text-xs text-center mt-4">
          By connecting you agree to our terms of service
        </p>
      </div>
    </div>
  )
}
