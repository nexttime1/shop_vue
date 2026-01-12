import request from '@/utils/request'

const normalizeList = (res) => ({
  data: res?.list || [],
  total: res?.count || 0
})

/**
 * 用户收货地址接口
 */

// 获取所有收货地址
export function fetchAddressList() {
  return request({
    url: '/up/v1/address',
    method: 'get'
  }).then(normalizeList)
}

// 添加收货地址
export function createAddress(data) {
  return request({
    url: '/up/v1/address',
    method: 'post',
    data: data
  })
}

// 修改收货地址
export function updateAddress(id, data) {
  return request({
    url: '/up/v1/address/' + id,
    method: 'put',
    data: data
  })
}

// 删除收货地址
export function deleteAddress(id) {
  return request({
    url: '/up/v1/address/' + id,
    method: 'delete'
  })
}
