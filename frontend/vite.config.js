import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://student-portal-backend-e8wc.onrender.com', // ఇక్కడ 8080 స్థానంలో 5000 కి మార్చబడింది
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
