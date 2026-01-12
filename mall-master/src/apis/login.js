import request from '@/utils/request'

/**
 * 登錄相關接口 (封裝為相對路徑)
 */

export function login(params) {
  return request({
    url: '/u/v1/user/login',
    method: 'post',
    data: params
  })
}

export function getCaptcha() {
  return request({
    url: '/u/v1/base/captcha',
    method: 'get'
  })
}

// 以下接口在 shop.md 中有定義，但原本在此文件的路徑不正確，已修正
export function createBrand(data) {
  return request({
    url: '/g/v1/brands',
    method: 'post',
    data: data
  })
}

export function updateBrand(id, data) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'put',
    data: data
  })
}

export function deleteBrand(id) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'delete'
  })
}

export function getBrand(id) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'get'
  })
}
