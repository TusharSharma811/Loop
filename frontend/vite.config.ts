import { defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const baseURL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react() ,
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: baseURL ,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
