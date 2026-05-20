import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['prosemirror-model', 'prosemirror-view', 'prosemirror-state', 'prosemirror-transform', '@tiptap/core', '@tiptap/pm'],
  },
  optimizeDeps: {
    include: ['fast-deep-equal/es6/react'],
  },
  server: {
    port: 3000,
  },
})
