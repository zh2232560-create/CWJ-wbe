import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 根据环境决定API基础URL（优先使用 .env.* 的 VITE_API_BASE_URL）
  const apiBaseUrl = env.VITE_API_BASE_URL || (mode === 'development' ? 'http://127.0.0.1:5000/' : 'https://www.pkahealth.com/')
  const apiTarget = apiBaseUrl.replace(/\/+$/, '')

  return {
    base: '/meeting/',
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          // 不需要 rewrite，直接转发即可，后端已經在 /api/v2 路徑处理
          // rewrite: (path) => path.replace(/^\/api/, '/api/v2'),
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
