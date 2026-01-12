import request from '@/utils/request'

const normalizeList = (res) => ({
  data: res?.list || [],
  total: res?.count || 0
})

/**
 * 商品分类接口
 */

// 获取分类列表
export function fetchList(parentId, params) {
  const url = (parentId && parentId > 0) ? '/g/v1/categorys/' + parentId : '/g/v1/categorys'
  return request({
    url: url,
    method: 'get',
    params: params
  }).then(res => (parentId ? res : normalizeList(res)))
}

// 删除分类
export function deleteProductCate(id) {
  return request({
    url: '/g/v1/categorys/' + id,
    method: 'delete'
  })
}

// 创建分类
export function createProductCate(data) {
  return request({
    url: '/g/v1/categorys',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateProductCate(id, data) {
  return request({
    url: '/g/v1/categorys/' + id,
    method: 'put',
    data: data
  })
}

// 获取单个分类详情或子分类
export function getProductCate(id) {
  return request({
    url: '/g/v1/categorys/' + id,
    method: 'get'
  })
}

// 获取级联分类列表 (包含子分类)
export function fetchListWithChildren() {
  return request({
    url: '/g/v1/categorys',
    method: 'get'
  }).then(res => res?.list || res || [])
}

// --- 兼容舊代碼的封裝 ---

export function updateShowStatus(data) {
  const { ids, showStatus } = data
  const id = Array.isArray(ids) ? ids[0] : ids
  return updateProductCate(id, { is_tab: showStatus === 1 })
}

export function updateNavStatus(data) {
  const { ids, navStatus } = data
  const id = Array.isArray(ids) ? ids[0] : ids
  return updateProductCate(id, { is_tab: navStatus === 1 })
}
