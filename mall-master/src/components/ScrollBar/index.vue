<template>
  <div class="scroll-container" ref="scrollContainer" @wheel.prevent="handleScroll" >
    <div class="scroll-wrapper" ref="scrollWrapper" :style="{top: top + 'px'}">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const delta = 15
const top = ref(0)
const scrollContainer = ref(null)
const scrollWrapper = ref(null)

const handleScroll = (e) => {
  const eventDelta = e.wheelDelta || -e.deltaY * 3
  const $container = scrollContainer.value
  const $containerHeight = $container.offsetHeight
  const $wrapper = scrollWrapper.value
  const $wrapperHeight = $wrapper.offsetHeight
  
  if (eventDelta > 0) {
    top.value = Math.min(0, top.value + eventDelta)
  } else {
    if ($containerHeight - delta < $wrapperHeight) {
      if (top.value < -($wrapperHeight - $containerHeight + delta)) {
        top.value = top.value
      } else {
        top.value = Math.max(top.value + eventDelta, $containerHeight - $wrapperHeight - delta)
      }
    } else {
      top.value = 0
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../../styles/variables.scss';

.scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: $menuBg;
  .scroll-wrapper {
    position: absolute;
     width: 100%!important;
  }
}
</style>
