// Vite settings for the author (private) dashboard.
// Port 5174 is the one the API allows in CORS_ALLOWED_ORIGINS.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
});
