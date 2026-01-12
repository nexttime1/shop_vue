import request from '@/utils/request'

/**
 * OSS 上传接口 (七牛云)
 */

// 获取上传 Token
export function policy(filename) {
  return request({
    url: '/oss/v1/token',
    method: 'get',
    params: { filename }
  })
}

// 上传回调 (通常是七牛云服务器调用，但前端有时也需要了解)
export function callback(data) {
  return request({
    url: '/oss/v1/callback',
    method: 'post',
    data: data
  })
}
