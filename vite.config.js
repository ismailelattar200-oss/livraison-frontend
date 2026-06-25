import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      allow: [
        '.',
        'C:/Users/user/.gemini/antigravity-ide/brain/53331b9e-1292-4ff4-a58f-25255b162690'
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        headers: {
            Accept: 'application/json',
        }
      },
    },
  },
})
