import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '.env');

let targetUrl = 'https://dealhunter-app.azurewebsites.net';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/VITE_API_URL\s*=\s*(.+)/);
  if (match && match[1]) {
    targetUrl = match[1].trim();
  }
}

export default {
  "/api": {
    target: targetUrl,
    secure: false,
    changeOrigin: true
  }
};
