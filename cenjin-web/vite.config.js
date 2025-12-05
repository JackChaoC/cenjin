import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 5173,
    watch: {
      usePolling: true,  // Docker 环境需要轮询模式
    },
    hmr: {
      host: 'localhost',  // 热更新主机
    },
  },
})
