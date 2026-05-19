import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
