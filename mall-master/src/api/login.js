import request from '@/utils/request'

/**
 * 用户服务接口
 */

// 发送验证码
export function sendSms(data) {
  return request({
    url: '/u/v1/base/send_sms',
    method: 'post',
    data
  })
}

// 获取图形验证码
export function getCaptcha() {
  return request({
    url: '/u/v1/base/captcha',
    method: 'get'
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/u/v1/user/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/u/v1/user/register',
    method: 'post',
    data
  })
}

// 用户修改
export function updateAdmin(data) {
  return request({
    url: '/u/v1/user/update',
    method: 'put',
    data
  })
}

// 用户列表 (admin)
export function fetchList(params) {
  return request({
    url: '/u/v1/user/list',
    method: 'get',
    params
  })
}

// 以下為輔助功能，可能在組件中用到
export function logout() {
  // 後端暫無此接口，前端清理 token 即可
  return Promise.resolve()
}

export function getInfo() {
  // 後端暫無單個用戶詳情接口，此處返回 Mock 數據或根據業務需求調整
  console.log('getInfo called')
  return Promise.resolve({
    roles: ['admin'],
    name: 'admin',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
  })
}
