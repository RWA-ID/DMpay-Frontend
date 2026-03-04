import { useEffect, useState } from 'react'
import { handleXCallback } from '../lib/xauth'

export default function AuthCallback() {
  const [status, setStatus] = useState('Connecting your X account...')
  const [error, setError] = useState(null)
  const [details, setDetails] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    console.log('Callback params:', { code: code?.slice(0,20), state: state?.slice(0,20) })
    console.log('Saved state:', localStorage.getItem('x_oauth_state')?.slice(0,20))
    console.log('Saved verifier:', localStorage.getItem('x_code_verifier')?.slice(0,20))

    if (!code) {
      setError('No authorization code received from X')
      return
    }

    handleXCallback(code, state)
      .then(userData => {
        setStatus('X account connected!')
        localStorage.setItem('x_user', JSON.stringify(userData))
        window.location.replace('/?x_connected=true')
      })
      .catch(err => {
        console.error('Full OAuth error:', err)
        setError(err.message)
        setDetails(err.details || null)
      })
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0c1a2e]">
      <div className="text-center max-w-sm mx-auto px-6">
        {error ? (
          <div>
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-400 mb-2 font-semibold">Connection Failed</p>
            <p className="text-white/50 text-sm mb-4">{error}</p>
            {details && (
              <pre className="text-white/30 text-xs bg-white/5 p-3 rounded-xl mb-4 text-left overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-semibold mb-2">{status}</p>
            <p className="text-white/40 text-sm">Please wait...</p>
          </div>
        )}
      </div>
    </div>
  )
}
