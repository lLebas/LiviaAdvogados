import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa bibliotecas grandes em chunks individuais
          'react-vendor': ['react', 'react-dom'],
          'docx-vendor': ['docx', 'file-saver', 'mammoth'],
          'ui-vendor': ['lucide-react', 'dompurify'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumenta o limite para 1000kb
    minify: 'terser', // Usa terser para melhor compressão
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'dompurify'], // Pre-otimiza deps comuns
  },
});
