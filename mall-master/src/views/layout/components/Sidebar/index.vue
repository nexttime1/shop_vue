<template>
  <scroll-bar>
    <el-menu
      mode="vertical"
      :default-active="route.path"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <sidebar-item :routes="routes"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './SidebarItem.vue'
import ScrollBar from '@/components/ScrollBar'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const routes = computed(() => permissionStore.routers)
const isCollapse = computed(() => !appStore.sidebar.opened)
</script>
