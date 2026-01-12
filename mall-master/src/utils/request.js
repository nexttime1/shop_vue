import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  // baseURL: process.env.BASE_API, // api的base_url
  timeout: 30000 // 请求超时时间
})

// 服务基础路径配置
export const SERVICE_URLS = {
  USER: 'http://192.168.163.1:8080',
  GOODS: 'http://192.168.163.1:8081',
  ORDER: 'http://192.168.163.1:8083',
  UPLOAD: 'http://192.168.163.1:8084'
}

// request拦截器
service.interceptors.request.use(config => {
  // 根据请求的 url 前缀自动设置 baseURL
  if (config.url.startsWith('/u/')) {
    config.baseURL = SERVICE_URLS.USER
  } else if (config.url.startsWith('/g/')) {
    config.baseURL = SERVICE_URLS.GOODS
  } else if (config.url.startsWith('/o/')) {
    config.baseURL = SERVICE_URLS.ORDER
  } else if (config.url.startsWith('/up/') || config.url.startsWith('/oss/')) {
    config.baseURL = SERVICE_URLS.UPLOAD
  }

  // 修改：将 x-token 改为 Token，匹配后端 c.GetHeader("Token")
  config.headers['Token'] = getToken()||'' 
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    console.log('--- 後端接口返回數據 ---', res)

    // 根据 shop.md，成功的 code 是 0
    if (res.code !== 0) {
      console.error('請求失敗，code:', res.code, 'msg:', res.msg)
      ElMessage({
        message: res.msg || '請求失敗',
        type: 'error',
        duration: 5 * 1000
      })

      // 1001: 登录错误 / 未登录
      if (res.code === 1001) {
        ElMessageBox.confirm('你已被登出，可以取消繼續留在該頁面，或者重新登錄', '確定登出', {
          confirmButtonText: '重新登錄',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore()
          userStore.fedLogOut().then(() => {
            location.reload()
          })
        }).catch(() => {})
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      console.log('請求成功，返回數據：', res.data)
      return res.data
    }
  },
  error => {
    console.log('err' + error)// for debug
    const message = error.response && error.response.data && error.response.data.msg 
      ? error.response.data.msg 
      : error.message || '請求錯誤'
    ElMessage({
      message: message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
