import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // SVG 圖標插件
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/icons/svg')],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  server: {
    host: 'localhost',
    port: 8090,
    open: false,
    proxy: {
      // 如果需要代理 API，可以在這裡配置
      // '/api': {
      //   target: 'http://192.168.0.103:8000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 移除 additionalData，因為我們使用 @import 語法
      },
    },
    // PostCSS 配置
    postcss: {
      plugins: [
        autoprefixer(), // 自動添加瀏覽器前綴
      ],
    },
  },
})
