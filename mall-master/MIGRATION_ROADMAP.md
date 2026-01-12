# Vue 2 to Vue 3 Refactor Roadmap (AI-Ready Guide)

This guide provides a step-by-step technical path to migrate a Vue 2 + Webpack project to Vue 3 + Vite + Pinia + Element Plus. Use this as a prompt/instruction for refactoring similar projects.

---

## 🏗 Phase 1: Infrastructure Setup

### 1. Build System: Webpack ➔ Vite
- **Action**: Delete `build/` and `config/` (Webpack files). Create `vite.config.js` in the root.
- **Config**: Setup path aliases (`@` -> `src`), auto-extension resolution (`.vue`, `.js`), and server proxy.
- **HTML**: Move `index.html` to the root and add `<script type="module" src="/src/main.js"></script>`.

### 2. Dependency Management
- **Upgrade**: `vue` (^3.x), `vue-router` (^4.x), `pinia`, `element-plus`, `axios`, `sass`.
- **Remove**: `vuex`, `element-ui`, `vue-loader`, `webpack-*`.

---

## 🚀 Phase 2: Core Module Migration

### 1. Entry Point (`main.js`)
- **Vue 2**: `new Vue({ router, store, render: h => h(App) }).$mount('#app')`
- **Vue 3**: `const app = createApp(App); app.use(router).use(pinia).use(ElementPlus).mount('#app')`

### 2. Routing (`router/index.js`)
- Use `createRouter` and `createWebHashHistory`.
- Component lazy loading remains `() => import(...)`.
- Update `scrollBehavior` to use `{ top: 0 }` instead of `{ y: 0 }`.

### 3. State Management (Vuex ➔ Pinia)
- Create individual stores using `defineStore`.
- No more `mutations`. Modify `state` directly in `actions`.
- In components, access via `const store = useStore()`.

### 4. API Request (`utils/request.js`)
- Update UI prompts: `Message` ➔ `ElMessage`, `MessageBox` ➔ `ElMessageBox`.
- Keep interceptor logic for Token injection and error handling.

---

## 🎨 Phase 3: Component Refactoring (Composition API)

### 1. Script Setup (`<script setup>`)
- Move logic from `data`, `methods`, `computed`, `lifecycle` to top-level variables and hooks (`ref`, `reactive`, `computed`, `onMounted`).

### 2. Template Syntax Changes
- **Slots**: `slot-scope="scope"` ➔ `#default="scope"`.
- **V-Model**: `:value.sync` ➔ `v-model:value`.
- **Attributes**: Ensure `class` and `style` are handled correctly (Vue 3 merges them automatically).

### 3. UI Library (Element UI ➔ Element Plus)
- **Names**: Most component tags remain the same (e.g., `el-button`).
- **Icons**: Element Plus uses a separate SVG icon library. For legacy SVG icons, use `vite-plugin-svg-icons` and a `<svg-icon>` wrapper.

---

## 🛠 Phase 4: Common Gotchas
- **V-Charts**: Not compatible with Vue 3. Replace with `echarts` directly or `vue-echarts`.
- **Global Properties**: Use `app.config.globalProperties` instead of `Vue.prototype`.
- **Filters**: Removed in Vue 3. Use method calls or computed properties instead.
