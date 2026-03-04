import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { resolveHandleToWallet } from '../lib/resolveHandle'

export default function RecipientInput({ value, onChange }) {
  const [input, setInput] = useState(value || '')
  const [resolving, setResolving] = useState(false)
  const [resolved, setResolved] = useState(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!input) { setResolved(null); return }
    if (input.startsWith('0x') && input.length === 42) {
      onChange(input)
      setResolved(null)
      return
    }
    const timer = setTimeout(async () => {
      setResolving(true)
      const wallet = await resolveHandleToWallet(input, publicClient)
      if (wallet) {
        setResolved(wallet)
        onChange(wallet)
      } else {
        setResolved(null)
        onChange('')
      }
      setResolving(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [input])

  return (
    <div>
      <label className="text-sm text-white/60 mb-1 block">Recipient</label>
      <div className="relative">
        <input
          type="text"
          placeholder="hector.dmpay.eth or 0x..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-sky-500/50 transition-all text-sm"
        />
        {resolving && (
          <div className="absolute right-3 top-3">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {resolved && (
        <p className="text-sky-400 text-xs mt-1 font-mono">Resolved: {resolved.slice(0,6)}...{resolved.slice(-4)}</p>
      )}
    </div>
  )
}
