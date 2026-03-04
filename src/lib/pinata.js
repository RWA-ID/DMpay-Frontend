import { generateProfileHTML } from './generateProfilePage'

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT
const IPFS_GATEWAY = 'https://ipfs.onchain-id.id/ipfs'

export async function pinProfilePage(profile) {
  try {
    const html = generateProfileHTML(profile)
    const blob = new Blob([html], { type: 'text/html' })
    const file = new File([blob], 'index.html', { type: 'text/html' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', `dmpay-${profile.xHandle}-profile`)
    formData.append('network', 'public')

    const res = await fetch('https://uploads.pinata.cloud/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    })

    const data = await res.json()
    const cid = data?.data?.cid
    if (!cid) throw new Error('No CID returned: ' + JSON.stringify(data))

    console.log('Pinned to IPFS:', cid)

    // Encode contenthash as proper IPFS multihash bytes
    const contenthash = await encodeContenthash(cid)

    return { cid, contenthash }
  } catch (err) {
    console.error('Pinata error:', err)
    return null
  }
}

export async function encodeContenthash(cid) {
  try {
    // Decode base32 CID to bytes using browser-native approach
    const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567'
    const cidStr = cid.toLowerCase().replace(/^bafy/, 'bafy')

    // Use TextEncoder to get the CID bytes via fetch to a data URL trick
    // Actually encode using the multibase/multihash spec directly
    // CIDv1 base32: strip the 'b' multibase prefix, decode base32
    const withoutMultibase = cid.startsWith('b') ? cid.slice(1) : cid

    // Base32 decode
    let bits = 0
    let value = 0
    const output = []
    const str = withoutMultibase.toLowerCase()
    for (let i = 0; i < str.length; i++) {
      value = (value << 5) | base32Chars.indexOf(str[i])
      bits += 5
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255)
        bits -= 8
      }
    }

    // IPFS contenthash prefix: 0xe301
    const prefix = new Uint8Array([0xe3, 0x01])
    const cidBytes = new Uint8Array(output)
    const result = new Uint8Array(prefix.length + cidBytes.length)
    result.set(prefix, 0)
    result.set(cidBytes, prefix.length)

    // Convert to hex string for contract
    return '0x' + Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (err) {
    console.error('Contenthash encoding error:', err)
    return '0x'
  }
}

export function getIPFSUrl(cid) {
  return `${IPFS_GATEWAY}/${cid}`
}
