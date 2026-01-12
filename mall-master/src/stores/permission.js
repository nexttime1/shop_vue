import { defineStore } from 'pinia'
import { asyncRouterMap, constantRouterMap } from '@/router/index'

// 判斷是否有權限訪問該菜單
function hasPermission(menus, route) {
  if (route.name) {
    let currMenu = getMenu(route.name, menus)
    if (currMenu != null) {
      // 設置菜單的標題、圖標和可見性
      if (currMenu.title != null && currMenu.title !== '') {
        route.meta.title = currMenu.title
      }
      if (currMenu.icon != null && currMenu.title !== '') {
        route.meta.icon = currMenu.icon
      }
      if (currMenu.hidden != null) {
        route.hidden = currMenu.hidden !== 0
      }
      if (currMenu.sort != null && currMenu.sort !== '') {
        route.sort = currMenu.sort
      }
      return true
    } else {
      route.sort = 0
      if (route.hidden !== undefined && route.hidden === true) {
        return true
      } else {
        return false
      }
    }
  } else {
    return true
  }
}

// 根據路由名稱獲取菜單
function getMenu(name, menus) {
  for (let i = 0; i < menus.length; i++) {
    let menu = menus[i]
    if (name === menu.name) {
      return menu
    }
  }
  return null
}

// 對菜單進行排序
function sortRouters(accessedRouters) {
  for (let i = 0; i < accessedRouters.length; i++) {
    let router = accessedRouters[i]
    if (router.children && router.children.length > 0) {
      router.children.sort(compare('sort'))
    }
  }
  accessedRouters.sort(compare('sort'))
}

// 降序比較函數
function compare(p) {
  return function (m, n) {
    let a = m[p]
    let b = n[p]
    return b - a
  }
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routers: constantRouterMap,
    addRouters: []
  }),
  actions: {
    generateRoutes(data) {
      return new Promise((resolve) => {
        const { menus } = data
        const username = 'admin'
        const accessedRouters = asyncRouterMap.filter((v) => {
          // admin帳號直接返回所有菜單
          if (username === 'admin') return true
          if (hasPermission(menus, v)) {
            if (v.children && v.children.length > 0) {
              v.children = v.children.filter((child) => {
                if (hasPermission(menus, child)) {
                  return child
                }
                return false
              })
              return v
            } else {
              return v
            }
          }
          return false
        })
        // 對菜單進行排序
        sortRouters(accessedRouters)
        this.addRouters = accessedRouters
        this.routers = constantRouterMap.concat(accessedRouters)
        resolve()
      })
    }
  }
})
