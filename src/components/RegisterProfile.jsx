import { useState, useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS, REGISTRY_ABI } from '../lib/contracts'
import { pinProfilePage } from '../lib/pinata'
import { initiateXOAuth } from '../lib/xauth'

// ENS labels don't allow underscores — replace with hyphens
function sanitizeHandle(handle) {
  return handle.toLowerCase().replace(/_/g, '-')
}

export default function RegisterProfile({ address, onSuccess, xUser }) {
  const savedPrice = localStorage.getItem('dmpay_price') || ''
  const [step, setStep] = useState(() => {
    if (xUser) return 3
    if (localStorage.getItem('dmpay_price')) return 2
    return 1
  })
  const [priceUSDC, setPriceUSDC] = useState(savedPrice)
  const [pinning, setPinning] = useState(false)
  const [ipfsHash, setIpfsHash] = useState(null)
  const [ipfsUpdateHash, setIpfsUpdateHash] = useState(undefined)

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { writeContractAsync: writeIPFSAsync } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const { isSuccess: ipfsSuccess, isError: ipfsError } = useWaitForTransactionReceipt({ hash: ipfsUpdateHash })

  // Guard against isSuccess firing multiple times on re-renders
  const postRegisterFired = useRef(false)

  useEffect(() => {
    if (xUser && step < 3) setStep(3)
  }, [xUser])

  useEffect(() => {
    if (isSuccess && !postRegisterFired.current) {
      postRegisterFired.current = true
      handlePostRegister()
    }
  }, [isSuccess])

  // Call onSuccess after the IPFS update tx confirms
  useEffect(() => {
    if (ipfsSuccess) {
      localStorage.removeItem('dmpay_price')
      onSuccess()
    }
  }, [ipfsSuccess])

  // If the updateIPFSHash tx reverts on-chain, unblock the UI and proceed
  useEffect(() => {
    if (ipfsError) {
      console.error('updateIPFSHash tx failed on-chain')
      setPinning(false)
      localStorage.removeItem('dmpay_price')
      onSuccess()
    }
  }, [ipfsError])

  const handlePostRegister = async () => {
    setPinning(true)
    try {
      const result = await pinProfilePage({
        xHandle: sanitizeHandle(xUser.handle),
        bio: xUser.bio,
        pfpUrl: xUser.pfpUrl,
        priceUSDC: parseUnits(priceUSDC, 6),
        wallet: address,
      })
      if (result?.cid) {
        setIpfsHash(result.cid)
        // Await tx submission — ipfsSuccess/ipfsError effects handle completion
        const txHash = await writeIPFSAsync({
          address: CONTRACTS.DMPayRegistry,
          abi: REGISTRY_ABI,
          functionName: 'updateIPFSHash',
          args: ['ipfs://' + result.cid, result.contenthash || '0x'],
        })
        setIpfsUpdateHash(txHash)
        return // wait for ipfsSuccess or ipfsError effect
      }
    } catch (err) {
      console.error('Post-register error:', err)
      // User rejected the second tx or Pinata failed — still proceed to dashboard
    }
    // Fallback: no CID or second tx rejected — proceed without contenthash
    setPinning(false)
    localStorage.removeItem('dmpay_price')
    onSuccess()
  }

  const handleRegister = () => {
    if (!xUser || !priceUSDC) return
    writeContract({
      address: CONTRACTS.DMPayRegistry,
      abi: REGISTRY_ABI,
      functionName: 'registerProfile',
      args: [sanitizeHandle(xUser.handle), xUser.bio, xUser.pfpUrl, parseUnits(priceUSDC, 6)],
    })
  }

  const handleConnectX = () => {
    localStorage.setItem('dmpay_price', priceUSDC)
    initiateXOAuth()
  }

  const isLoading = isPending || isConfirming || pinning

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="w-full max-w-lg">

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Set Price', 'Connect X', 'Register'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-sky-500 text-white' :
                'bg-white/10 text-white/30'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'text-white' : 'text-white/30'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Set Price */}
        {step === 1 && (
          <div>
            <h2 className="font-['Syne'] text-3xl font-700 text-white mb-2">Set your DM price</h2>
            <p className="text-white/50 mb-8">How much USDC should someone pay to DM you?</p>
            <div className="mb-6">
              <label className="text-sm text-white/60 mb-1 block">Price per DM (USDC)</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-sky-500/50 transition-all">
                <input
                  type="number"
                  placeholder="10"
                  value={priceUSDC}
                  onChange={e => setPriceUSDC(e.target.value)}
                  className="flex-1 bg-transparent py-4 pl-4 text-white text-xl outline-none placeholder:text-white/20"
                />
                <span className="px-4 text-white/30 text-lg">USDC</span>
              </div>
              {priceUSDC && (
                <p className="text-xs text-white/30 mt-2">
                  You receive ${(parseFloat(priceUSDC) * 0.975).toFixed(2)} USDC after 2.5% fee
                </p>
              )}
            </div>
            <button
              onClick={() => { localStorage.setItem('dmpay_price', priceUSDC); setStep(2) }}
              disabled={!priceUSDC || parseFloat(priceUSDC) <= 0}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Connect X */}
        {step === 2 && !xUser && (
          <div>
            <h2 className="font-['Syne'] text-3xl font-700 text-white mb-2">Connect X account</h2>
            <p className="text-white/50 mb-8">
              We'll import your handle, bio and profile picture from X automatically.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">𝕏</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">What we import from X</p>
                  <p className="text-white/40 text-xs">Handle · Bio · Profile picture</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleConnectX}
              className="w-full py-4 bg-black hover:bg-zinc-900 border border-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <span className="text-lg">𝕏</span>
              Connect X Account
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 mt-3 text-white/40 hover:text-white text-sm transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Review & Register */}
        {step === 3 && xUser && (
          <div>
            <h2 className="font-['Syne'] text-3xl font-700 text-white mb-2">Review & Register</h2>
            <p className="text-white/50 mb-6">Confirm your profile and register on-chain.</p>
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl mb-6">
              <div className="flex items-center gap-4 mb-4">
                {xUser?.pfpUrl ? (
                  <img src={xUser.pfpUrl} alt="pfp" className="w-16 h-16 rounded-full object-cover border-2 border-sky-500/30" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                    {sanitizeHandle(xUser?.handle || '')[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-lg">@{sanitizeHandle(xUser?.handle || '')}</p>
                  <p className="text-sky-400 text-sm">{sanitizeHandle(xUser?.handle || '')}.dmpay.eth</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-4">{xUser?.bio || 'No bio'}</p>
              <div className="flex items-center justify-between p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
                <span className="text-white/60 text-sm">Price per DM</span>
                <span className="text-sky-400 font-semibold">${priceUSDC} USDC</span>
              </div>
            </div>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all"
            >
              {isPending ? 'Confirm in wallet...' :
               isConfirming ? 'Registering on-chain...' :
               pinning ? 'Pinning to IPFS...' :
               'Register Profile'}
            </button>
            {ipfsHash && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm">Profile page pinned to IPFS!</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
