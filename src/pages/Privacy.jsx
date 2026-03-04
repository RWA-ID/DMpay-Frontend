export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-white/80">
      <h1 className="font-['Syne'] text-4xl font-800 text-white mb-2">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-12">Last updated: March 2026</p>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">1. Overview</h2>
          <p>DMpay.eth ("DMpay", "we", "us") is a decentralised messaging protocol built on Ethereum. This Privacy Policy explains what information we collect, how we use it, and your rights in relation to it. By using the DMpay application at <span className="text-sky-400">app.dmpay.me</span> you agree to the practices described below.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">2. Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-white/90 font-semibold mb-1">2.1 Blockchain Data</h3>
              <p>When you register a profile, your Ethereum wallet address, X (Twitter) handle, bio, profile picture URL, and USDC price are written to the DMPayRegistry smart contract on the Ethereum mainnet. This data is public and permanent on the blockchain.</p>
            </div>
            <div>
              <h3 className="text-white/90 font-semibold mb-1">2.2 X (Twitter) Account Data</h3>
              <p>During registration you optionally authenticate with X via OAuth 2.0. We import your public handle, bio, and profile picture URL. We do not store your X access tokens on our servers — they are used once to fetch your public profile and are then discarded. Your X data is stored only in your browser's localStorage and on-chain as described above.</p>
            </div>
            <div>
              <h3 className="text-white/90 font-semibold mb-1">2.3 IPFS Profile Pages</h3>
              <p>A personalised HTML profile page containing your handle, bio, profile picture, and price is pinned to IPFS via Pinata. This page is publicly accessible via any IPFS gateway and its content hash is stored in the ENS registry against your subdomain (e.g. <span className="text-sky-400">yourhandle.dmpay.eth</span>).</p>
            </div>
            <div>
              <h3 className="text-white/90 font-semibold mb-1">2.4 Encrypted Messages</h3>
              <p>Messages are transmitted and stored end-to-end encrypted by the XMTP protocol. DMpay has no ability to read message content. Message data is managed entirely by the XMTP network. Please refer to the <a href="https://xmtp.org/privacy" className="text-sky-400 hover:text-sky-300" target="_blank" rel="noopener noreferrer">XMTP Privacy Policy</a> for details.</p>
            </div>
            <div>
              <h3 className="text-white/90 font-semibold mb-1">2.5 Usage Data</h3>
              <p>We do not run analytics, tracking pixels, or advertising SDKs. Cloudflare may collect standard server access logs (IP address, browser type, pages visited) as part of hosting infrastructure. Refer to the <a href="https://www.cloudflare.com/privacypolicy/" className="text-sky-400 hover:text-sky-300" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a> for details.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To register and display your public DMpay profile</li>
            <li>To create and manage your ENS subdomain under dmpay.eth</li>
            <li>To facilitate paid messaging between users via USDC payments</li>
            <li>To generate your public IPFS landing page</li>
            <li>We do not sell, rent, or share your information with third parties for marketing purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">4. Data Retention & Deletion</h2>
          <p>On-chain data (wallet address, handle, price, etc.) is permanent and cannot be deleted due to the immutable nature of the Ethereum blockchain. Your IPFS profile page persists as long as it is pinned. LocalStorage data (X session) can be cleared by disconnecting your wallet or clearing your browser data.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">5. Cookies</h2>
          <p>DMpay does not use cookies. We use browser localStorage to temporarily store your X authentication session and wallet connection state. This data never leaves your device except as described in Section 2.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">6. Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="text-white/90 font-semibold">XMTP</span> — end-to-end encrypted messaging network</li>
            <li><span className="text-white/90 font-semibold">Pinata</span> — IPFS pinning service for profile pages</li>
            <li><span className="text-white/90 font-semibold">Alchemy</span> — Ethereum RPC provider</li>
            <li><span className="text-white/90 font-semibold">WalletConnect / Reown</span> — wallet connection infrastructure</li>
            <li><span className="text-white/90 font-semibold">ENS (Ethereum Name Service)</span> — subdomain registry</li>
            <li><span className="text-white/90 font-semibold">Cloudflare Pages</span> — web hosting</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">7. Children's Privacy</h2>
          <p>DMpay is not directed at children under 18. We do not knowingly collect information from minors. If you believe a minor has registered, please contact us.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be reflected by the "Last updated" date at the top of this page. Continued use of the application after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">9. Contact</h2>
          <p>For privacy-related questions contact us at <span className="text-sky-400">privacy@dmpay.me</span> or open an issue at our GitHub repository.</p>
        </section>

      </div>
    </div>
  )
}
