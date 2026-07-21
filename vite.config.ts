import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署需要使用仓库名作为 base
  // 部署到自定义域名时改为 '/'
  base: './',
  build: {
    sourcemap: false,
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
