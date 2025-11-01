import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import svgr from 'vite-plugin-svgr'
import { imagetools } from 'vite-imagetools'
import remarkSlug from 'remark-slug'
import remarkAutolinkHeadings from 'remark-autolink-headings'
import { remarkDirectives } from './src/mdx/remark-directives'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/dead-internet-theory-article-1/',
  plugins: [
    react(),
    mdx({
      remarkPlugins: [remarkSlug as any, remarkAutolinkHeadings as any, remarkDirectives as any],
    }),
    svgr(),
    imagetools(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
