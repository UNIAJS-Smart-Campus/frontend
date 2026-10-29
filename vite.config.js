import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
    // El navegador habla siempre con el mismo origen: /api lo resuelve el gateway.
    // Evita CORS y hace que el JWT viaje en la misma conexion que la SPA.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})