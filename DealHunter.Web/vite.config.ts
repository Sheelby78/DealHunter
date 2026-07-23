import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.VITE_API_URL || 'https://localhost:7001';
  const target = rawTarget.startsWith('http://') || rawTarget.startsWith('https://')
    ? rawTarget
    : `https://${rawTarget}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
