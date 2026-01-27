import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (comme API_KEY sur Vercel)
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      target: 'esnext', // Nécessaire pour supporter 'await' de haut niveau dans certaines libs
    },
    define: {
      // Remplace 'process.env.API_KEY' dans le code par la vraie valeur lors du build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  };
});