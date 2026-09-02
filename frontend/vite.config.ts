import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // 不自动清空 dist：避免删除 .well-known 等需保留的文件
    emptyOutDir: false,
  },
})
