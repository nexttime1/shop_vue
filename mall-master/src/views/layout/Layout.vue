<template>
  <div class="app-wrapper" :class="classObj">
    <sidebar class="sidebar-container"></sidebar>
    <div class="main-container">
      <navbar></navbar>
      <app-main></app-main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { Navbar, Sidebar, AppMain } from './components'

const appStore = useAppStore()

const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const WIDTH = 1024
const RATIO = 3

const isMobile = () => {
  const rect = document.body.getBoundingClientRect()
  return rect.width - RATIO < WIDTH
}

const resizeHandler = () => {
  if (!document.hidden) {
    const mobile = isMobile()
    appStore.toggleDevice(mobile ? 'mobile' : 'desktop')
    if (mobile) {
      appStore.closeSideBar(true)
    }
  }
}

onBeforeMount(() => {
  window.addEventListener('resize', resizeHandler)
})

onMounted(() => {
  const mobile = isMobile()
  if (mobile) {
    appStore.toggleDevice('mobile')
    appStore.closeSideBar(true)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "@/styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
