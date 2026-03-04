import { CONTRACTS, REGISTRY_ABI } from './contracts'

export async function resolveHandleToWallet(handle, publicClient) {
  try {
    const clean = handle
      .replace('.dmpay.eth', '')
      .replace('@', '')
      .toLowerCase()
      .replace(/_/g, '-')
      .trim()

    const profile = await publicClient.readContract({
      address: CONTRACTS.DMPayRegistry,
      abi: REGISTRY_ABI,
      functionName: 'getProfile',
      args: [clean],
    })

    if (profile?.registered && profile?.wallet) {
      return profile.wallet
    }
    return null
  } catch (err) {
    console.error('Resolve error:', err)
    return null
  }
}
