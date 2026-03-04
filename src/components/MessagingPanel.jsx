import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, getAddress } from 'viem'
import { CONTRACTS, MESSAGING_ABI, USDC_ABI, USDC_ADDRESS, REGISTRY_ABI } from '../lib/contracts'
import XMTPChat from './XMTPChat'
import RecipientInput from './RecipientInput'
import { useConversationList } from '../hooks/useXMTP'

function SendMessage({ address, dmTarget, xmtpClient, xmtpLoading, xmtpError, onInitXMTP }) {
  const [recipientWallet, setRecipientWallet] = useState(dmTarget || '')
  const [resolvedProfile, setResolvedProfile] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [error, setError] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { data: profile } = useReadContract({
    address: CONTRACTS.DMPayRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getProfileByWallet',
    args: [recipientWallet],
    query: { enabled: recipientWallet.length === 42 },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address, CONTRACTS.DMPayMessaging],
  })

  const { data: isOpen, refetch: refetchIsOpen } = useReadContract({
    address: CONTRACTS.DMPayMessaging,
    abi: MESSAGING_ABI,
    functionName: 'isConversationOpen',
    args: [address, resolvedProfile?.wallet],
    query: { enabled: !!resolvedProfile?.wallet },
  })

  useEffect(() => {
    if (profile?.registered) {
      setResolvedProfile(profile)
      setError('')
    } else if (recipientWallet.length === 42) {
      setResolvedProfile(null)
      setError('Wallet not registered on dmpay.eth')
    }
  }, [profile, recipientWallet])

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance()
      refetchIsOpen()
      setShowChat(true)
    }
  }, [isSuccess])

  const price = resolvedProfile?.priceUSDC || 0n
  const priceFormatted = price ? formatUnits(price, 6) : '0'
  const needsApproval = price > 0n && (allowance === undefined || allowance < price)

  const handleApprove = () => {
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACTS.DMPayMessaging, price * 100n],
      gas: 65000n,
    })
  }

  const handleOpenConversation = () => {
    writeContract({
      address: CONTRACTS.DMPayMessaging,
      abi: MESSAGING_ABI,
      functionName: 'openConversation',
      args: [resolvedProfile.wallet],
      gas: 120000n,
    })
  }

  const handlePayForMessage = () => {
    writeContract({
      address: CONTRACTS.DMPayMessaging,
      abi: MESSAGING_ABI,
      functionName: 'payForMessage',
      args: [resolvedProfile.wallet],
      gas: 100000n,
    })
  }

  if (showChat && resolvedProfile) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
          <p className="text-green-400 text-sm">Payment confirmed! Chatting with @{resolvedProfile.xHandle}</p>
          <button
            onClick={handlePayForMessage}
            disabled={isPending || isConfirming}
            className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-semibold rounded-lg transition-all"
          >
            {isPending || isConfirming ? 'Processing...' : 'Pay for another message'}
          </button>
        </div>
        <XMTPChat
          peerAddress={resolvedProfile.wallet}
          peerHandle={resolvedProfile.xHandle}
          onClose={() => setShowChat(false)}
          xmtpClient={xmtpClient}
          xmtpLoading={xmtpLoading}
          xmtpError={xmtpError}
          onInitXMTP={onInitXMTP}
        />
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="font-['Syne'] text-lg font-700 text-white mb-4">Send a Paid DM</h3>

      <div className="mb-4">
        <RecipientInput value={recipientWallet} onChange={setRecipientWallet} />
      </div>

      {resolvedProfile && (
        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 overflow-hidden flex items-center justify-center text-white font-bold">
              {resolvedProfile.pfpUrl
                ? <img src={resolvedProfile.pfpUrl} alt="pfp" className="w-full h-full object-cover" />
                : resolvedProfile.xHandle[0]?.toUpperCase()
              }
            </div>
            <div>
              <p className="text-white font-semibold">@{resolvedProfile.xHandle}</p>
              <p className="text-white/40 text-xs truncate max-w-[200px]">{resolvedProfile.bio}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-sky-500/10 rounded-lg border border-sky-500/20 mb-3">
            <span className="text-white/60 text-sm">Price per message</span>
            <span className="text-sky-400 font-semibold">${priceFormatted} USDC</span>
          </div>

          {/* Connect to XMTP prompt before payment steps */}
          {!xmtpClient && (
            <div className="mb-3 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-between gap-3">
              <p className="text-sky-300 text-xs">Connect XMTP to send encrypted messages after payment.</p>
              <button
                onClick={onInitXMTP}
                disabled={xmtpLoading}
                className="shrink-0 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white text-xs font-semibold rounded-lg transition-all"
              >
                {xmtpLoading ? 'Connecting...' : 'Connect to XMTP'}
              </button>
            </div>
          )}

          {isOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span className="text-green-400 text-sm">Conversation open</span>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all mb-2"
              >
                Open Chat
              </button>
              <button
                onClick={handlePayForMessage}
                disabled={isPending || isConfirming}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
              >
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Processing...' : `Pay $${priceFormatted} & Send Message`}
              </button>
            </div>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
            >
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Approving USDC...' : 'Approve USDC First'}
            </button>
          ) : (
            <button
              onClick={handleOpenConversation}
              disabled={isPending || isConfirming}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
            >
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Opening...' : `Open Conversation — $${priceFormatted} USDC`}
            </button>
          )}
        </div>
      )}

      {error && recipientWallet.length === 42 && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}

function ConversationRow({ peerAddress, lastMsg, onOpen }) {
  const checksumAddr = peerAddress ? (() => { try { return getAddress(peerAddress) } catch { return peerAddress } })() : null
  const { data: peerProfile } = useReadContract({
    address: CONTRACTS.DMPayRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getProfileByWallet',
    args: [checksumAddr],
    query: { enabled: !!checksumAddr },
  })

  const handle = peerProfile?.xHandle || (peerAddress ? peerAddress.slice(0, 6) + '...' + peerAddress.slice(-4) : '')
  const pfpUrl = peerProfile?.pfpUrl || null
  const preview = lastMsg
    ? (typeof lastMsg.content === 'string' ? lastMsg.content : lastMsg.content?.text || '')
    : ''
  const shortPreview = preview.length > 60 ? preview.slice(0, 60) + '…' : preview

  return (
    <button
      onClick={() => onOpen({ wallet: checksumAddr || peerAddress, xHandle: handle, pfpUrl })}
      className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 overflow-hidden flex items-center justify-center text-white font-bold shrink-0">
        {pfpUrl
          ? <img src={pfpUrl} alt={handle} className="w-full h-full object-cover" />
          : handle[0]?.toUpperCase()
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">@{handle}</p>
        {shortPreview
          ? <p className="text-white/40 text-xs truncate mt-0.5">{shortPreview}</p>
          : <p className="text-white/20 text-xs mt-0.5">No messages yet</p>
        }
      </div>
      <span className="text-sky-400 text-xs shrink-0">Open →</span>
    </button>
  )
}

function Inbox({ address, profile, xmtpClient, xmtpLoading, xmtpError, onInitXMTP }) {
  const [showChat, setShowChat] = useState(null)
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })
  const { dms, loading: dmsLoading, loadDms } = useConversationList(xmtpClient)

  useEffect(() => {
    if (xmtpClient) loadDms()
  }, [xmtpClient])

  const handleClose = (senderAddress) => {
    writeContract({
      address: CONTRACTS.DMPayMessaging,
      abi: MESSAGING_ABI,
      functionName: 'closeConversation',
      args: [senderAddress],
      gas: 80000n,
    })
  }

  const price = profile?.priceUSDC ? formatUnits(profile.priceUSDC, 6) : '0'

  if (showChat) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowChat(null)}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          ← Back to Inbox
        </button>
        <XMTPChat
          peerAddress={showChat.wallet}
          peerHandle={showChat.xHandle}
          onClose={() => setShowChat(null)}
          xmtpClient={xmtpClient}
          xmtpLoading={xmtpLoading}
          xmtpError={xmtpError}
          onInitXMTP={onInitXMTP}
        />
        <button
          onClick={() => handleClose(showChat.wallet)}
          disabled={isPending}
          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-xl border border-red-500/20 transition-all"
        >
          {isPending ? 'Closing...' : 'Close Conversation'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-['Syne'] text-lg font-700 text-white">Inbox</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
          <span className="text-sky-400 text-sm font-semibold">${price} USDC</span>
          <span className="text-white/40 text-xs">per message</span>
        </div>
      </div>

      {!xmtpClient ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-white font-semibold mb-1">Enable Messaging</p>
          <p className="text-white/40 text-sm mb-6">Connect to XMTP to see who sent you paid DMs.</p>
          {xmtpError && <p className="text-red-400 text-sm mb-4 break-all">{xmtpError}</p>}
          <button
            onClick={onInitXMTP}
            disabled={xmtpLoading}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
          >
            {xmtpLoading ? 'Connecting...' : 'Connect to XMTP'}
          </button>
        </div>
      ) : dmsLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : dms.length === 0 ? (
        <div className="text-center py-8 text-white/30">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">No conversations yet.</p>
          <p className="text-xs mt-1">Share your link to start receiving paid DMs.</p>
          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <p className="text-sky-400 text-xs font-mono">app.dmpay.me?dm={profile?.wallet}</p>
          </div>
          <button
            onClick={loadDms}
            className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors underline"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {dms.map(({ dm, peerAddress, lastMsg }) => (
            <ConversationRow
              key={dm.id}
              peerAddress={peerAddress}
              lastMsg={lastMsg}
              onOpen={setShowChat}
            />
          ))}
          <button
            onClick={loadDms}
            className="w-full py-2 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            Refresh conversations
          </button>
        </div>
      )}
    </div>
  )
}

export default function MessagingPanel({ tab, address, profile, dmTarget, xmtpClient, xmtpLoading, xmtpError, onInitXMTP }) {
  if (tab === 'send') return <SendMessage address={address} dmTarget={dmTarget} xmtpClient={xmtpClient} xmtpLoading={xmtpLoading} xmtpError={xmtpError} onInitXMTP={onInitXMTP} />
  return <Inbox address={address} profile={profile} xmtpClient={xmtpClient} xmtpLoading={xmtpLoading} xmtpError={xmtpError} onInitXMTP={onInitXMTP} />
}
