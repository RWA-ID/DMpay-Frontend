const CLIENT_ID = import.meta.env.VITE_X_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_X_CLIENT_SECRET
const CALLBACK_URL = import.meta.env.VITE_X_CALLBACK_URL
const WORKER_URL = 'https://dmpay-oauth.dmpay.workers.dev'

function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function initiateXOAuth() {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateCodeVerifier()

  localStorage.setItem('x_code_verifier', verifier)
  localStorage.setItem('x_oauth_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    scope: 'users.read tweet.read',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `https://twitter.com/i/oauth2/authorize?${params}`
}

export async function handleXCallback(code, state) {
  const savedState = localStorage.getItem('x_oauth_state')
  const verifier = localStorage.getItem('x_code_verifier')

  if (state !== savedState) throw new Error('State mismatch - please try again')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      code_verifier: verifier,
      redirect_uri: CALLBACK_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  const data = await res.json()
  console.log('Worker response:', data)

  if (!data || data.error) {
    const err = new Error(data?.error || 'Failed to get user data')
    err.details = data?.details || data
    throw err
  }

  localStorage.removeItem('x_code_verifier')
  localStorage.removeItem('x_oauth_state')

  return {
    handle: data.username,
    bio: data.description || '',
    pfpUrl: data.profile_image_url?.replace('_normal', '_400x400') || '',
    name: data.name,
  }
}
