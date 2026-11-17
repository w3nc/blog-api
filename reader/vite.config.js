// Vite settings for the reader (public) site.
// Port 5173 is the one the API allows in CORS_ALLOWED_ORIGINS.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
