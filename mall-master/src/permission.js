import router from './router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import NProgress from 'nprogress' // Progress 進度條
import 'nprogress/nprogress.css' // Progress 進度條樣式
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth' // 驗權

const whiteList = ['/login'] // 不重定向白名單

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  if (getToken()) {
    console.log('已登錄', { path: to.path, roles: userStore.roles.length })
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger afterEach hook, so manually handle it
    } else {
      if (userStore.roles.length === 0) {
        console.log('用戶角色為空，嘗試獲取用戶信息')
        try {
          // 拉取用戶信息
          await userStore.getInfo()
          console.log('用戶信息獲取成功，生成路由')
          // 生成可訪問的路由表
          await permissionStore.generateRoutes({})
          // 動態添加可訪問路由表（Vue Router 4 使用 addRoute，需要循環添加）
          permissionStore.addRouters.forEach(route => {
            router.addRoute(route) // Vue Router 4 使用 addRoute（單數）
          })
          console.log('路由添加完成，跳轉到:', to.path)
          next({ ...to, replace: true })
        } catch (err) {
          console.error('獲取用戶信息失敗:', err)
          await userStore.fedLogOut()
          ElMessage.error(err || '驗證失敗，請重新登錄')
          next({ path: '/login' })
        }
      } else {
        console.log('用戶角色已存在，直接跳轉')
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 結束Progress
})
