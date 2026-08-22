import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: {
    // Keep the existing Amplify artifact directory used by Create React App.
    outDir: 'build',
  },
});
