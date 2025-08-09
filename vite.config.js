import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force reload on file changes
    hmr: {
      overlay: true
    },
    // Clear cache on restart
    force: true
  },
  build: {
    // Generate unique hashes for assets
    rollupOptions: {
      output: {
        // Add timestamp to chunk names in development
        chunkFileNames: (chunkInfo) => {
          return `assets/[name]-[hash].js`
        },
        entryFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
})
