import { useState, useRef, useEffect, useCallback } from 'react'
import { Client, IdentifierKind } from '@xmtp/browser-sdk'

// Generate a deterministic encryption key from wallet address
async function getEncryptionKey(address) {
  const encoder = new TextEncoder()
  const data = encoder.encode('dmpay-xmtp-key-' + address.toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hashBuffer)
}

export function useXMTP() {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initXMTP = async (walletClient) => {
    if (!walletClient) return
    setLoading(true)
    setError(null)
    try {
      const address = walletClient.account.address
      const dbEncryptionKey = await getEncryptionKey(address)

      const signer = {
        type: 'EOA',
        getIdentifier: () => ({
          identifier: address.toLowerCase(),
          identifierKind: IdentifierKind.Ethereum,
        }),
        signMessage: async (message) => {
          const sig = await walletClient.signMessage({
            account: walletClient.account,
            message: typeof message === 'string'
              ? message
              : { raw: message instanceof Uint8Array ? message : new Uint8Array(message) },
          })
          const hex = sig.startsWith('0x') ? sig.slice(2) : sig
          return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
        },
      }

      const xmtp = await Client.create(signer, {
        env: 'production',
        dbEncryptionKey,
      })

      // Sync all conversations so recipient sees inbound DMs
      await xmtp.conversations.sync()

      setClient(xmtp)
    } catch (err) {
      console.error('XMTP init error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { client, loading, error, initXMTP }
}

export function useConversationList(xmtpClient) {
  const [dms, setDms] = useState([])
  const [loading, setLoading] = useState(false)
  const streamRef = useRef(null)

  const loadDms = useCallback(async () => {
    if (!xmtpClient) return
    setLoading(true)
    try {
      await xmtpClient.conversations.sync()
      const list = await xmtpClient.conversations.listDms()
      const myInboxId = xmtpClient.inboxId

      const enriched = await Promise.all(list.map(async (dm) => {
        try {
          const members = await dm.members()
          const peer = members.find(m => m.inboxId !== myInboxId)
          const peerAddress = peer?.accountIdentifiers?.[0]?.identifier || null
          const lastMsg = await dm.lastMessage()
          return { dm, peerAddress, lastMsg }
        } catch (e) {
          return null
        }
      }))

      setDms(enriched.filter(Boolean).filter(d => d.peerAddress))
    } catch (err) {
      console.error('List DMs error:', err)
    } finally {
      setLoading(false)
    }
  }, [xmtpClient])

  // Stream all new messages so inbox updates in real-time without manual refresh
  useEffect(() => {
    if (!xmtpClient || streamRef.current) return

    streamRef.current = xmtpClient.conversations.streamAllMessages(
      (error, _msg) => {
        if (!error) loadDms()
      }
    )

    return () => {
      if (streamRef.current) {
        streamRef.current.end?.()
        streamRef.current = null
      }
    }
  }, [xmtpClient, loadDms])

  return { dms, loading, loadDms }
}

export function useConversation(xmtpClient, peerAddress) {
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [convError, setConvError] = useState(null)
  const streamRef = useRef(null)

  const loadConversation = async () => {
    if (!xmtpClient || !peerAddress) return

    // Close any existing stream before opening a new one
    if (streamRef.current) {
      streamRef.current.end()
      streamRef.current = null
    }

    setConvError(null)
    setLoading(true)
    try {
      // Sync all first to discover inbound conversations
      await xmtpClient.conversations.sync()

      // Try to find existing DM first
      let conv
      try {
        conv = await xmtpClient.conversations.fetchDmByIdentifier({
          identifier: peerAddress.toLowerCase(),
          identifierKind: IdentifierKind.Ethereum,
        })
      } catch(e) {}

      // If not found create it
      if (!conv) {
        conv = await xmtpClient.conversations.createDmWithIdentifier({
          identifier: peerAddress.toLowerCase(),
          identifierKind: IdentifierKind.Ethereum,
        })
      }

      setConversation(conv)

      // Sync the specific conversation to get latest messages
      await conv.sync()

      const msgs = await conv.messages()
      setMessages(msgs)
      streamMessages(conv)
    } catch (err) {
      console.error('Conversation error:', err)
      setConvError(err?.message || 'Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }

  // stream() uses a callback API — NOT an async generator
  // StreamCallback<Message> = (error: Error | null, value: Message | undefined) => void
  const streamMessages = (conv) => {
    const closer = conv.stream(
      (_error, _rawMsg) => {
        if (_error) return
        // Refetch decoded messages on each new message event
        conv.sync()
          .then(() => conv.messages())
          .then(msgs => setMessages(msgs))
          .catch(() => {})
      },
      () => { console.error('Message stream closed unexpectedly') }
    )
    streamRef.current = closer
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.end()
      streamRef.current = null
    }
  }

  const syncMessages = async () => {
    if (!conversation) return
    try {
      await conversation.sync()
      const msgs = await conversation.messages()
      setMessages(msgs)
    } catch {}
  }

  const sendMessage = async (content) => {
    if (!conversation) return
    await conversation.sendText(content)
    // Refetch after sending so our own message appears immediately
    await conversation.sync()
    const msgs = await conversation.messages()
    setMessages(msgs)
  }

  return { conversation, messages, loading, convError, sendMessage, loadConversation, stopStream, syncMessages }
}
