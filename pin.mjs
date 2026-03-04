import fs from 'fs';

const jwt = fs.readFileSync('.env.local', 'utf8').match(/VITE_PINATA_JWT=(.*)/)[1].trim();

const handle = 'hector';
const bio = 'Building cool stuff on Ethereum and ENS';
const price = '1.00';
const wallet = '0x5f11a48230f7CdaB91A2361576239091E4b1165b';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@${handle} - DM for $${price} USDC</title>
  <meta name="description" content="${bio}" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Syne:wght@700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0c1a2e; color: #f0f9ff; font-family: 'Space Grotesk', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; }
    .pfp { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, #38bdf8, #2563eb); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; color: white; }
    .handle { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .ens { font-size: 14px; color: #38bdf8; margin-bottom: 16px; }
    .bio { font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 32px; }
    .price-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2); border-radius: 100px; padding: 8px 20px; margin-bottom: 24px; }
    .price-amount { font-size: 20px; font-weight: 700; font-family: 'Syne', sans-serif; color: #38bdf8; }
    .price-label { font-size: 13px; color: rgba(255,255,255,0.4); }
    .dm-btn { display: block; width: 100%; padding: 16px; background: #0ea5e9; color: white; font-size: 16px; font-weight: 600; border: none; border-radius: 14px; cursor: pointer; text-decoration: none; }
    .dm-btn:hover { background: #38bdf8; }
    .footer { margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.2); }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="pfp">H</div>
    <div class="handle">@${handle}</div>
    <div class="ens">${handle}.dmpay.eth</div>
    <p class="bio">${bio}</p>
    <div class="price-badge">
      <span class="price-amount">$${price} USDC</span>
      <span class="price-label">per DM</span>
    </div>
    <a href="https://dmpay.eth.link?dm=${wallet}" class="dm-btn">Send DM for $${price} USDC</a>
    <div class="footer">Powered by <a href="https://dmpay.eth.link">dmpay.eth</a> · ENS + XMTP</div>
  </div>
</body>
</html>`;

const blob = new Blob([html], { type: 'text/html' });
const file = new File([blob], 'index.html', { type: 'text/html' });
const formData = new FormData();
formData.append('file', file);
formData.append('name', `dmpay-${handle}-profile`);
formData.append('network', 'public');

const res = await fetch('https://uploads.pinata.cloud/v3/files', {
  method: 'POST',
  headers: { Authorization: `Bearer ${jwt}` },
  body: formData
});

const data = await res.json();
const cid = data?.data?.cid;
console.log('CID:', cid);
console.log('View at: https://gateway.pinata.cloud/ipfs/' + cid);
