import fs from 'fs';
import path from 'path';
import { PinataSDK } from 'pinata';

const jwt = fs.readFileSync('.env.local', 'utf8').match(/VITE_PINATA_JWT=(.*)/)[1].trim();
const pinata = new PinataSDK({ pinataJwt: jwt });

async function uploadFolder() {
  const distPath = './dist';
  const files = [];

  function addFiles(dirPath, basePath) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = basePath ? `${basePath}/${item}` : item;
      if (fs.statSync(fullPath).isDirectory()) {
        addFiles(fullPath, relativePath);
      } else {
        const ext = path.extname(item);
        const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const buffer = fs.readFileSync(fullPath);
        const blob = new Blob([buffer], { type: contentType });
        files.push(new File([blob], relativePath, { type: contentType }));
      }
    }
  }

  addFiles(distPath, '');
  console.log(`Uploading ${files.length} files to IPFS...`);

  const result = await pinata.upload.public.fileArray(files);
  console.log('CID:', result.cid);
  console.log('View at: https://ipfs.onchain-id.id/ipfs/' + result.cid);
  console.log('\nNow set this as the contenthash for dmpay.eth!');
}

uploadFolder().catch(console.error);
