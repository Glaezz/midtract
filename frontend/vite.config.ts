import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      // Tembus ke folder shared/ level monorepo (ABI kontrak, types) --
      // tambahan di luar pola $lib dari project `landing`, supaya import
      // ke luar src/ juga rapi, bukan '../../../../shared/abi/X.json'.
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: { port: 5173, allowedHosts: ['2b8c-103-141-109-206.ngrok-free.app'] },
});
