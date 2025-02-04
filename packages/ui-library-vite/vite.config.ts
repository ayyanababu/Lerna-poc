// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck 
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),    
    dts({ 
      entryRoot: resolve(__dirname, 'src'),
      outputDir: resolve(__dirname, 'dist/types'),
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'MyLib',
      fileName: 'my-lib',
    },
    rollupOptions: {
      external: ['react', 'react-dom/server', 'react-dom/client'],
      output: {
        globals: {
          'react-dom/server': 'ReactDOMServer',
          'react-dom/client': 'ReactDOM',
          react: 'React'
        }
      }
    }
  }
});


