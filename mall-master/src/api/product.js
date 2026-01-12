import request from '@/utils/request'

const normalizeList = (res) => ({
  data: res?.list || [],
  total: res?.count || 0
})

const mapGoodsQuery = (params = {}) => ({
  limit: params.pnum ?? params.limit ?? params.pageSize ?? 10,
  page: params.pn ?? params.page ?? params.pageNum ?? 1,
  key: params.keyword ?? params.key ?? params.q,
  sort: params.sort,
  is_hot: params.is_hot,
  is_new: params.is_new,
  price_max: params.price_max,
  price_min: params.price_min,
  brand_id: params.brandId ?? params.brand_id,
  top_category_id: params.productCategoryId ?? params.top_category_id
})

/**
 * 商品服务接口
 */

// 获取商品列表
export function fetchList(params) {
  return request({
    url: '/g/v1/good/list',
    method: 'get',
    params: mapGoodsQuery(params)
  }).then(normalizeList)
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/g/v1/good',
    method: 'post',
    data: data
  })
}

// 获取商品详情
export function getProduct(id) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'get'
  })
}

// 更新商品 (全量更新)
export function updateProduct(id, data) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'put',
    data: data
  })
}

// 更新商品状态 (部分更新: is_new, is_hot, on_sale)
export function patchUpdateProduct(id, data) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'patch',
    data: data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'delete'
  })
}

// --- 兼容舊代碼的封裝 ---

export function updatePublishStatus(params) {
  const { ids, publishStatus } = params
  const id = Array.isArray(ids) ? ids[0] : ids
  return patchUpdateProduct(id, { on_sale: publishStatus === 1 })
}

export function updateNewStatus(params) {
  const { ids, newStatus } = params
  const id = Array.isArray(ids) ? ids[0] : ids
  return patchUpdateProduct(id, { is_new: newStatus === 1 })
}

export function updateRecommendStatus(params) {
  const { ids, recommendStatus } = params
  const id = Array.isArray(ids) ? ids[0] : ids
  return patchUpdateProduct(id, { is_hot: recommendStatus === 1 })
}

export function updateDeleteStatus(params) {
  const { ids, deleteStatus } = params
  const id = Array.isArray(ids) ? ids[0] : ids
  if (deleteStatus === 1) {
    return deleteProduct(id)
  }
  return Promise.resolve()
}