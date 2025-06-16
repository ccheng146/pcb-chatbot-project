import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    // Add CORS configuration
    cors: true,
    // Add security headers
  define: {
    // Ensure environment variables are properly defined
    'import.meta.env.VITE_WEBSOCKET_URL': JSON.stringify(process.env.VITE_WEBSOCKET_URL)
  }
})
