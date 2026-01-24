/// <reference types="node" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

const here = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      // 直接指向源码，确保 .vue 能被 Vite 处理并支持 HMR
      '@fcurd/core': path.resolve(here, '../core/src'),
      '@fcurd/vue': path.resolve(here, '../vue/src'),
      '@fcurd/naive-ui': path.resolve(here, '../naive-ui/src'),
    },
  },
  server: {
    fs: {
      // 允许读取 sibling 包源码
      allow: [path.resolve(here, '..'), path.resolve(here, '../..')],
    },
  },
})
