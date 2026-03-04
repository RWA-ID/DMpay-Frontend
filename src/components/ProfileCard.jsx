import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, REGISTRY_ABI } from '../lib/contracts'

export default function ProfileCard({ profile, address, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    bio: profile?.bio || '',
    pfpUrl: profile?.pfpUrl || '',
    priceUSDC: profile?.priceUSDC ? formatUnits(profile.priceUSDC, 6) : '',
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  if (isSuccess && editing) {
    setEditing(false)
    onUpdate()
  }

  const handleSave = () => {
    writeContract({
      address: CONTRACTS.DMPayRegistry,
      abi: REGISTRY_ABI,
      functionName: 'updateProfile',
      args: [form.bio, form.pfpUrl, parseUnits(form.priceUSDC, 6)],
    })
  }

  const handle = profile?.xHandle || ''
  const ensHandle = handle.toLowerCase().replace(/_/g, '-')
  const price = profile?.priceUSDC ? formatUnits(profile.priceUSDC, 6) : '0'
  const netPrice = (parseFloat(price) * 0.975).toFixed(2)
  const ensLink = 'https://app.dmpay.me?dm=' + ensHandle

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 overflow-hidden mb-3 border-2 border-sky-500/30">
          {profile?.pfpUrl
            ? <img src={profile.pfpUrl} alt="pfp" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">{handle[0]?.toUpperCase()}</div>
          }
        </div>
        <h3 className="font-['Syne'] text-xl font-700 text-white">@{handle}</h3>
        <span className="text-sky-400 text-sm mt-1 cursor-pointer hover:text-sky-300" onClick={() => window.open(ensLink, '_blank')}>
          {ensHandle}.dmpay.eth
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-lg font-['Syne'] font-700 text-white">${price}</div>
          <div className="text-white/40 text-xs">per DM</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-lg font-['Syne'] font-700 text-sky-400">${netPrice}</div>
          <div className="text-white/40 text-xs">you receive</div>
        </div>
      </div>

      {!editing && (
        <p className="text-white/60 text-sm leading-relaxed mb-6 min-h-[40px]">
          {profile?.bio || 'No bio set.'}
        </p>
      )}

      {editing && (
        <div className="space-y-3 mb-4">
          <textarea
            value={form.bio}
            onChange={e => setForm({...form, bio: e.target.value})}
            placeholder="Bio..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-sky-500/50 transition-all resize-none placeholder:text-white/20"
          />
          <input
            type="text"
            value={form.pfpUrl}
            onChange={e => setForm({...form, pfpUrl: e.target.value})}
            placeholder="PFP URL..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-sky-500/50 transition-all placeholder:text-white/20"
          />
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <input
              type="number"
              value={form.priceUSDC}
              onChange={e => setForm({...form, priceUSDC: e.target.value})}
              placeholder="Price..."
              className="flex-1 bg-transparent py-2 pl-3 text-white text-sm outline-none placeholder:text-white/20"
            />
            <span className="px-3 text-white/30 text-sm">USDC</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isPending || isConfirming}
              className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {isPending ? 'Confirm...' : isConfirming ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold rounded-xl transition-all border border-white/10"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
        <p className="text-xs text-white/40 mb-1">Your public link</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sky-400 text-xs font-mono truncate">app.dmpay.me?dm={profile.wallet}</span>
          <button
            onClick={() => navigator.clipboard.writeText(ensLink)}
            className="text-xs text-white/40 hover:text-white/70 transition-colors shrink-0"
          >
            Copy
          </button>
        </div>
      </div>

    </div>
  )
}
