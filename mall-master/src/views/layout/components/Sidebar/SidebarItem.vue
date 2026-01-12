<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" :key="item.path">
      <template v-if="!item.hidden && item.children">
        <!-- 只有一个子节点的情况 -->
        <router-link 
          v-if="hasOneShowingChildren(item.children) && !item.children[0].children && !item.alwaysShow" 
          :to="resolvePath(item.path, item.children[0].path)"
        >
          <el-menu-item :index="resolvePath(item.path, item.children[0].path)" :class="{'submenu-title-noDropdown': !isNest}">
            <svg-icon v-if="item.children[0].meta && item.children[0].meta.icon" :icon-class="item.children[0].meta.icon"></svg-icon>
            <template #title>
              <span v-if="item.children[0].meta && item.children[0].meta.title">{{item.children[0].meta.title}}</span>
            </template>
          </el-menu-item>
        </router-link>

        <!-- 有多个子节点的情况 -->
        <el-sub-menu v-else :index="item.name || item.path" :key="item.name">
          <template #title>
            <svg-icon v-if="item.meta && item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
            <span v-if="item.meta && item.meta.title">{{item.meta.title}}</span>
          </template>

          <template v-for="child in item.children" :key="child.path">
            <template v-if="!child.hidden">
              <sidebar-item 
                v-if="child.children && child.children.length > 0"
                :is-nest="true" 
                class="nest-menu" 
                :routes="[child]" 
              />

              <router-link v-else :to="resolvePath(item.path, child.path)">
                <el-menu-item :index="resolvePath(item.path, child.path)">
                  <svg-icon v-if="child.meta && child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
                  <template #title>
                    <span v-if="child.meta && child.meta.title">{{child.meta.title}}</span>
                  </template>
                </el-menu-item>
              </router-link>
            </template>
          </template>
        </el-sub-menu>
      </template>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  routes: {
    type: Array
  },
  isNest: {
    type: Boolean,
    default: false
  }
})

const hasOneShowingChildren = (children) => {
  const showingChildren = children.filter(item => !item.hidden)
  return showingChildren.length === 1
}

const resolvePath = (basePath, routePath) => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  if (basePath.endsWith('/')) {
    return basePath + routePath
  }
  return basePath + '/' + routePath
}
</script>
