import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      // 配置代理
      '/api': {
        target: 'http://localhost:8081', // 后端服务器地址
        changeOrigin: true,
      }
    }
  }
})
