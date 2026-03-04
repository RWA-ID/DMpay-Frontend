import { useState, useEffect, useRef } from 'react'
import { useConversation } from '../hooks/useXMTP'

export default function XMTPChat({ peerAddress, peerHandle, onClose, xmtpClient, xmtpLoading, xmtpError, onInitXMTP }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const messagesEndRef = useRef(null)
  const { messages, loading: convLoading, sendMessage, loadConversation, stopStream, syncMessages, conversation, convError } = useConversation(xmtpClient, peerAddress)
  const client = xmtpClient

  useEffect(() => {
    if (client && peerAddress) loadConversation()
    return () => stopStream()
  }, [client, peerAddress])

  // Poll every 8 seconds as fallback for the stream
  useEffect(() => {
    if (!conversation) return
    const interval = setInterval(() => syncMessages(), 8000)
    return () => clearInterval(interval)
  }, [conversation])

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await syncMessages()
    setRefreshing(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return
    setSending(true)
    try {
      await sendMessage(input.trim())
      setInput('')
    } catch (err) {
      console.error('Send error:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!client) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">💬</div>
        <h3 className="font-['Syne'] text-lg font-700 text-white mb-2">Enable Messaging</h3>
        <p className="text-white/50 text-sm mb-6">
          Connect to XMTP to send encrypted messages to @{peerHandle}.
        </p>
        {xmtpError && (
          <p className="text-red-400 text-sm mb-4 break-all">{xmtpError}</p>
        )}
        <button
          onClick={onInitXMTP}
          disabled={xmtpLoading}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
        >
          {xmtpLoading ? 'Connecting...' : 'Connect to XMTP'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{height: '500px'}}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {peerHandle[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">@{peerHandle}</p>
            <p className="text-white/40 text-xs">End-to-end encrypted via XMTP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || convLoading}
            title="Refresh messages"
            className="text-white/40 hover:text-white disabled:opacity-30 transition-colors text-sm px-2 py-1"
          >
            {refreshing ? '⟳' : '↻'}
          </button>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {convLoading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!convLoading && !conversation && convError && (
          <div className="text-center py-8 px-4">
            <p className="text-red-400 text-sm mb-2">Could not open conversation</p>
            <p className="text-white/40 text-xs leading-relaxed">
              {convError.toLowerCase().includes('not found') || convError.toLowerCase().includes('identity') || convError.toLowerCase().includes('inbox')
                ? `@${peerHandle} hasn't activated their XMTP inbox yet. Ask them to open their Inbox tab and click "Connect to XMTP" first.`
                : convError}
            </p>
            <button
              onClick={loadConversation}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/60 text-xs rounded-lg transition-all"
            >
              Retry
            </button>
          </div>
        )}
        {!convLoading && !convError && messages.length === 0 && (
          <div className="text-center py-8 text-white/30">
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.filter(msg => {
          // Filter out system messages
          const c = msg.content
          if (!c) return false
          if (typeof c === 'object' && (c.initiatedByInboxId || c.addedInboxes)) return false
          return true
        }).map((msg, i) => {
          const isMe = msg.senderInboxId === client?.inboxId
          const content = typeof msg.content === 'string' ? msg.content : msg.content?.text || JSON.stringify(msg.content)
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                isMe
                  ? 'bg-sky-500 text-white rounded-br-sm'
                  : 'bg-white/10 text-white/90 rounded-bl-sm'
              }`}>
                {content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={conversation ? "Type a message..." : "Loading conversation..."}
            disabled={!conversation}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none placeholder:text-white/20 focus:border-sky-500/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !conversation || sending}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-white/20 text-xs mt-2 text-center">End-to-end encrypted · Powered by XMTP</p>
      </div>
    </div>
  )
}
