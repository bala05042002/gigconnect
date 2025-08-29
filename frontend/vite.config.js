import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss'; // Correctly import the PostCSS plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.VITE_PORT) || 5173
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss, // Use the new plugin package
      ],
    },
  },
});