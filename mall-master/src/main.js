import { createApp } from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 注意：v-charts 是 Vue 2 的庫，Vue 3 不兼容，如果需要的話需要使用 echarts 或其他 Vue 3 兼容的圖表庫
// import VCharts from 'v-charts'

import '@/styles/index.scss' // global css

import App from './App.vue'
import router from './router/index.js'
import pinia from './stores/index.js'

// SVG 圖標組件全局註冊
import SvgIcon from '@/components/SvgIcon/index.vue'
// SVG 圖標處理（vite-plugin-svg-icons 插件會自動處理）
import 'virtual:svg-icons-register' // 導入 SVG 圖標註冊（如果使用 vite-plugin-svg-icons）
import '@/permission' // permission control

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
})
// app.use(VCharts) // Vue 3 不兼容，已註釋

// 全局註冊 SVG 圖標組件
app.component('svg-icon', SvgIcon)

app.use(pinia)
app.use(router)

app.mount('#app')
