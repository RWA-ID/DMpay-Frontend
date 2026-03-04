export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-white/80">
      <h1 className="font-['Syne'] text-4xl font-800 text-white mb-2">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-12">Last updated: March 2026</p>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using DMpay.eth ("DMpay", "the Service") at <span className="text-sky-400">app.dmpay.me</span>, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. DMpay is a decentralised protocol — we act as an interface provider, not a custodian or intermediary of funds.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">2. Eligibility</h2>
          <p>You must be at least 18 years old and have legal capacity to enter into agreements to use the Service. The Service is not available to users in jurisdictions where such services are prohibited. By using the Service you represent that you meet these requirements.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">3. Description of Service</h2>
          <p>DMpay provides a decentralised interface that allows users to:</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Register a profile backed by an ENS subdomain under dmpay.eth</li>
            <li>Set a price in USDC for others to initiate a direct message conversation</li>
            <li>Send and receive end-to-end encrypted messages via the XMTP protocol</li>
            <li>Make and receive USDC payments via the DMPayMessaging smart contract on Ethereum mainnet</li>
          </ul>
          <p className="mt-3">All payments and profile registrations are executed directly on the Ethereum blockchain. DMpay does not custody, hold, or control any user funds at any time.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">4. Platform Fee</h2>
          <p>DMpay charges a 2.5% protocol fee on each paid conversation opened. This fee is deducted automatically by the DMPayMessaging smart contract at the time of payment. The remaining 97.5% is distributed to the recipient. Fee rates may be updated in future contract versions.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">5. User Responsibilities</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>You are solely responsible for the security of your Ethereum wallet and private keys</li>
            <li>You are responsible for all transactions you initiate on the blockchain</li>
            <li>You must not use the Service to send spam, harass, threaten, or defraud other users</li>
            <li>You must not impersonate any person or entity or misrepresent your affiliation</li>
            <li>You must not use the Service for any illegal activity including money laundering or sanctions evasion</li>
            <li>You must not attempt to exploit, hack, or disrupt the smart contracts or front-end application</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">6. Blockchain Transactions & Finality</h2>
          <p>All transactions submitted to the Ethereum blockchain are irreversible. DMpay has no ability to reverse, cancel, or refund blockchain transactions once confirmed. You are responsible for verifying all transaction details before signing with your wallet. Gas fees are determined by the Ethereum network and are not controlled by DMpay.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">7. ENS Subdomains</h2>
          <p>Upon registering a profile, DMpay will attempt to create an ENS subdomain under dmpay.eth (e.g. <span className="text-sky-400">yourhandle.dmpay.eth</span>) and set the IPFS contenthash pointing to your profile page. Subdomain availability and ENS resolution are subject to the Ethereum Name Service infrastructure, which DMpay does not control. DMpay reserves the right to manage the dmpay.eth parent domain.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">8. X (Twitter) Integration</h2>
          <p>The X OAuth integration is provided as a convenience to verify identity and import public profile data. Your use of X is subject to <a href="https://twitter.com/en/tos" className="text-sky-400 hover:text-sky-300" target="_blank" rel="noopener noreferrer">X's Terms of Service</a>. DMpay is not affiliated with X Corp. We do not guarantee the availability or accuracy of data imported from X.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">9. Disclaimers</h2>
          <p className="mb-3">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, DMPAY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          <p>DMPAY DOES NOT WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE; (B) SMART CONTRACTS WILL OPERATE WITHOUT BUGS OR VULNERABILITIES; (C) ENS RESOLUTION WILL ALWAYS FUNCTION AS EXPECTED.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">10. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, DMPAY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF FUNDS, LOSS OF DATA, OR LOSS OF PROFITS, ARISING FROM YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">11. Intellectual Property</h2>
          <p>The DMpay front-end application and smart contracts are open-source. The DMpay name, logo, and branding remain the property of DMpay. Smart contract code deployed on-chain is immutable and publicly auditable.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">12. Changes to Terms</h2>
          <p>We may modify these Terms at any time. Material changes will be reflected by the "Last updated" date. Continued use of the Service after changes constitutes acceptance. If you disagree with the updated Terms, you must stop using the Service.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">13. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with applicable law. Any disputes shall be resolved through binding arbitration to the extent permitted by law.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-lg mb-3">14. Contact</h2>
          <p>For questions about these Terms contact us at <span className="text-sky-400">legal@dmpay.me</span> or open an issue at our GitHub repository.</p>
        </section>

      </div>
    </div>
  )
}
