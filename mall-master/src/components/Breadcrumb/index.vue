<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span v-if="item.redirect === 'noredirect' || index == levelList.length - 1" class="no-redirect">
          {{ item.meta.title }}
        </span>
        <router-link v-else :to="item.redirect || item.path">{{ item.meta.title }}</router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const levelList = ref([])

const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.name)
  const first = matched[0]
  if (first && first.name !== 'home') {
    matched = [{ path: '/', meta: { title: '首页' } }].concat(matched)
  }
  levelList.value = matched.filter(item => item.meta && item.meta.title)
}

watch(() => route.path, () => {
  getBreadcrumb()
})

onMounted(() => {
  getBreadcrumb()
})
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 10px;
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
