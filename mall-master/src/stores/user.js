import { defineStore } from 'pinia'
import { login, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  }),
  actions: {
    // 登錄
    async login(userInfo) {
      try {
        console.log('调用login API，参数：', userInfo)
        const tokenStr = await login(userInfo)
        console.log('login API返回：', tokenStr)
        // 根據 shop.md，如果 token 是直接返回在 data 中
        setToken(tokenStr)
        this.token = tokenStr
        console.log('token已设置：', tokenStr)
        return tokenStr
      } catch (error) {
        console.error('login API调用失败：', error)
        throw error
      }
    },
    // 獲取用戶信息
    async getInfo() {
      try {
        console.log('userStore.getInfo called, current token:', this.token)
        const response = await getInfo()
        console.log('getInfo response:', response)
        const data = response
        if (data.roles && data.roles.length > 0) {
          this.roles = data.roles
        } else {
          this.roles = ['TEST']
        }
        this.name = data.name || 'admin'
        this.avatar = data.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
        console.log('user info set:', { roles: this.roles, name: this.name, avatar: this.avatar })
        return data
      } catch (error) {
        console.error('getInfo failed:', error)
        throw error
      }
    },
    // 登出
    async logOut() {
      try {
        // await logout(this.token)
        this.token = ''
        this.roles = []
        removeToken()
      } catch (error) {
        throw error
      }
    },
    // 前端登出
    fedLogOut() {
      return new Promise((resolve) => {
        this.token = ''
        removeToken()
        resolve()
      })
    }
  }
})
