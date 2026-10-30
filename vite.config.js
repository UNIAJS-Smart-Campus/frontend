import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Solo se separan las librerías que usa toda la app. El resto (socket.io-client,
// por ejemplo) queda en el chunk de la página que lo importa, en vez de viajar
// siempre en el bundle inicial.
function separarVendor(id) {
  if (!id.includes('node_modules')) return

  if (id.includes('react-router')) return 'router-vendor'

  if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
    return 'react-vendor'
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      // Socket.IO: mismo destino que la API, pero conservando el upgrade.
      '/socket.io': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    },
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: separarVendor,
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
