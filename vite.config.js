import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SPA：静态部署后将 index.html + assets 放到任意静态站即可
export default defineConfig({
  plugins: [react()],
});
