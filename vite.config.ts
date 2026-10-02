import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const port = parseInt(process.env.PORT || '5173')

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Fills the <title> slot and description/Open Graph tags in index.html from
// content/site.json, and emits robots.txt. Reads the JSON directly so this
// config stays free of app imports (the zod schema validates it elsewhere).
function siteMeta(): Plugin {
  const sitePath = path.resolve(import.meta.dirname, 'content/site.json')
  const site = JSON.parse(fs.readFileSync(sitePath, 'utf8')) as {
    hero?: { portrait?: string }
    meta?: { title?: string; description?: string }
  }
  const title = escapeHtml(site.meta?.title ?? '')
  const description = escapeHtml(site.meta?.description ?? '')
  const portrait = site.hero?.portrait ?? ''
  let base = '/'

  return {
    name: 'site-meta',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = [
        { tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' },
      ]
      // The portrait is the largest above-the-fold element. Preloading it lets
      // the browser fetch it from the HTML instead of waiting for React to render.
      if (portrait) {
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'image',
            href: base + portrait.replace(/^\//, ''),
            fetchpriority: 'high',
          },
          injectTo: 'head',
        })
      }
      return { html: html.replace('<!-- site:title -->', title), tags }
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: 'User-agent: *\nAllow: /\n' })
    },
  }
}

// Vite config - https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    sourcemap: false,
  },
  plugins: [react(), tailwindcss(), siteMeta()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port,
  },
  preview: {
    port,
  },
})
