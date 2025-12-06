import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <--- MUST BE PRESENT

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  resolve: { // <--- MUST BE PRESENT
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
