import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // **Make sure to import the React plugin if you haven't already**
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), // **Add the React plugin here**
    tailwindcss(),
  ],
  server: {
    port: 5173, // Your frontend port (or keep default if you don't need to specify)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites and required for CORS
        // No rewrite needed based on your backend setup (app.use('/api', router))
      }
    }
  }
})