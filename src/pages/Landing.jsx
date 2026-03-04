import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { CONTRACTS, REGISTRY_ABI } from '../lib/contracts'

export default function Landing({ onConnect, dmTarget }) {
  const isAddress = !!dmTarget && dmTarget.startsWith('0x') && dmTarget.length === 42

  // Resolve by wallet address (old-style links)
  const { data: profileByWallet } = useReadContract({
    address: CONTRACTS.DMPayRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getProfileByWallet',
    args: [dmTarget],
    query: { enabled: isAddress },
  })

  // Resolve by handle (new-style links like ?dm=hector)
  const cleanHandle = dmTarget ? dmTarget.replace('@', '').replace('.dmpay.eth', '').toLowerCase().replace(/_/g, '-') : ''
  const { data: profileByHandle } = useReadContract({
    address: CONTRACTS.DMPayRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getProfile',
    args: [cleanHandle],
    query: { enabled: !!dmTarget && !isAddress },
  })

  const profile = isAddress ? profileByWallet : profileByHandle
  const priceFormatted = profile?.priceUSDC ? formatUnits(profile.priceUSDC, 6) : '0'

  if (dmTarget && profile?.registered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="w-full max-w-sm">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-4">
            {profile.pfpUrl
              ? <img src={profile.pfpUrl} alt="pfp" className="w-20 h-20 rounded-full object-cover border-2 border-sky-500/30 mx-auto mb-4" />
              : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">{profile.xHandle?.[0]?.toUpperCase()}</div>
            }
            <h2 className="font-['Syne'] text-2xl font-700 text-white mb-1">@{profile.xHandle}</h2>
            <p className="text-sky-400 text-sm mb-4">{profile.xHandle}.dmpay.eth</p>
            <p className="text-white/60 text-sm leading-relaxed mb-6">{profile.bio}</p>
            <div className="flex items-center justify-center gap-2 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl mb-6">
              <span className="text-white/60 text-sm">Price per DM</span>
              <span className="text-sky-400 font-bold text-lg">${priceFormatted} USDC</span>
            </div>
            <button
              onClick={onConnect}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-lg rounded-xl transition-all shadow-lg shadow-sky-500/25"
            >
              Connect Wallet to Send DM
            </button>
            <p className="text-white/30 text-xs mt-3">Powered by ENS + XMTP · dmpay.eth</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="max-w-2xl mx-auto">

        {dmTarget && (
          <div className="mb-8 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
            <p className="text-sky-400 font-semibold mb-1">You have a DM to send!</p>
            <p className="text-white/60 text-sm">Connect your wallet to pay and send your message.</p>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          Live on Ethereum Mainnet
        </div>

        <h1 className="font-['Syne'] text-5xl md:text-7xl font-800 text-white leading-tight mb-6">
          Get paid to<br/>
          <span className="text-sky-400">receive DMs</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl mb-8 leading-relaxed">
          Set your price. Share your link. Anyone who wants to message you pays in USDC.
          Your inbox. Your terms. Powered by ENS + XMTP.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🔗', title: 'Connect Wallet', desc: 'Sign in with your Ethereum wallet' },
            { icon: '𝕏', title: 'Verify with X', desc: 'Link your X account for identity & trust' },
            { icon: '💰', title: 'Earn USDC', desc: 'Get paid every time someone DMs you' },
          ].map(s => (
            <div key={s.title} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-white text-sm font-semibold mb-1">{s.title}</p>
              <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onConnect}
          className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-lg rounded-xl transition-all shadow-lg shadow-sky-500/25 mb-4"
        >
          {dmTarget ? 'Connect Wallet to Send DM' : 'Connect Wallet & Get Started'}
        </button>

        <p className="text-white/30 text-sm mb-12">
          You'll connect your X account after to verify your identity
        </p>

        <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
          {[
            { label: 'Platform fee', value: '2.5%' },
            { label: 'Payment token', value: 'USDC' },
            { label: 'Your subdomain', value: 'you.dmpay.eth' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-['Syne'] font-700 text-white">{s.value}</div>
              <div className="text-white/40 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
