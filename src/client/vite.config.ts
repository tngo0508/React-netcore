import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// When run under Aspire, the API's address is injected via service discovery
// environment variables. Fall back to the API's default port otherwise.
const apiTarget =
  process.env.API_HTTPS ??
  process.env.API_HTTP ??
  process.env.services__api__https__0 ??
  process.env.services__api__http__0 ??
  'http://localhost:5131'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the .NET backend during development
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
