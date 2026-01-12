import request from '@/utils/request'

const normalizeList = (res) => ({
  data: res?.list || [],
  total: res?.count || 0
})

/**
 * 购物车接口
 */

// 获取购物车列表
export function fetchCartList() {
  return request({
    url: '/o/v1/shopcarts',
    method: 'get'
  }).then(normalizeList)
}

// 加入购物车
export function addToCart(data) {
  return request({
    url: '/o/v1/shopcarts',
    method: 'post',
    data: data
  })
}

// 更新购物车条目 (数量或勾选状态)
export function updateCartEntry(id, data) {
  return request({
    url: '/o/v1/shopcarts/' + id,
    method: 'patch',
    data: data
  })
}

// 删除购物车条目
export function deleteCartEntry(id) {
  return request({
    url: '/o/v1/shopcarts/' + id,
    method: 'delete'
  })
}
