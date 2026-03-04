import { useState, useEffect } from 'react'
import { useReadContract, useWalletClient } from 'wagmi'
import { CONTRACTS, REGISTRY_ABI } from '../lib/contracts'
import RegisterProfile from '../components/RegisterProfile'
import ProfileCard from '../components/ProfileCard'
import MessagingPanel from '../components/MessagingPanel'
import { useXMTP } from '../hooks/useXMTP'

export default function Dashboard({ address, dmTarget, xUser }) {
  const { client: xmtpClient, loading: xmtpLoading, error: xmtpError, initXMTP } = useXMTP()
  const { data: walletClient } = useWalletClient()
  const handleInitXMTP = () => initXMTP(walletClient)
  const [activeTab, setActiveTab] = useState('messages')

  useEffect(() => {
    if (dmTarget) setActiveTab('send')
  }, [dmTarget])

  const { data: profile, isLoading, refetch } = useReadContract({
    address: CONTRACTS.DMPayRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getProfileByWallet',
    args: [address],
  })

  const isRegistered = profile?.registered === true

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isRegistered) {
    return <RegisterProfile address={address} onSuccess={refetch} xUser={xUser} />
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} address={address} onUpdate={refetch} />
        </div>
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-6">
            {['messages', 'send'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab === 'messages' ? '📥 Inbox' : '📤 Send Message'}
              </button>
            ))}
          </div>
          <MessagingPanel tab={activeTab} address={address} profile={profile} dmTarget={dmTarget} xmtpClient={xmtpClient} xmtpLoading={xmtpLoading} xmtpError={xmtpError} onInitXMTP={handleInitXMTP} />
        </div>
      </div>
    </div>
  )
}
