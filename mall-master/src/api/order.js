import request from '@/utils/request'

const normalizeList = (res) => ({
  data: res?.list || [],
  total: res?.count || 0
})

const mapPageParams = (params = {}) => ({
  limit: params.pnum ?? params.limit ?? params.pageSize ?? 10,
  page: params.pn ?? params.page ?? params.pageNum ?? 1,
  key: params.key ?? params.q ?? params.keyword,
  sort: params.sort
})

/**
 * 订单服务接口
 */

// 获取订单列表
export function fetchList(params) {
  return request({
    url: '/o/v1/orders',
    method: 'get',
    params: mapPageParams(params)
  }).then(normalizeList)
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/o/v1/orders',
    method: 'post',
    data: data
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: '/o/v1/orders/' + id,
    method: 'get'
  })
}

// --- 兼容舊代碼或缺失接口的處理 ---

export function closeOrder() {
  console.warn('後端暫未提供 closeOrder 接口')
  return Promise.resolve()
}

export function deleteOrder() {
  console.warn('後端暫未提供 deleteOrder 接口')
  return Promise.resolve()
}

export function deliveryOrder() {
  console.warn('後端暫未提供 deliveryOrder 接口')
  return Promise.resolve()
}

export function updateReceiverInfo() {
  console.warn('後端暫未提供 updateReceiverInfo 接口')
  return Promise.resolve()
}

export function updateMoneyInfo() {
  console.warn('後端暫未提供 updateMoneyInfo 接口')
  return Promise.resolve()
}

export function updateOrderNote() {
  console.warn('後端暫未提供 updateOrderNote 接口')
  return Promise.resolve()
}
