import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const normalizeList = (res) => ({
  data: res?.list || [],
  total: res?.count || 0
})

const mapPageParams = (params = {}) => ({
  limit: params.pnum ?? params.limit ?? params.pageSize ?? 10,
  page: params.pn ?? params.page ?? params.pageNum ?? 1,
  key: params.q ?? params.key ?? params.keyword,
  sort: params.sort
})

const mapGoodsQuery = (params = {}) => ({
  ...mapPageParams(params),
  is_hot: params.is_hot,
  is_new: params.is_new,
  price_max: params.price_max,
  price_min: params.price_min,
  brand_id: params.b ?? params.brand_id ?? params.brandId,
  top_category_id: params.c ?? params.top_category_id ?? params.productCategoryId
})

// 分类
export function getCategorys(params) {
  return request({
    url: '/g/v1/categorys',
    method: 'get',
    params
  }).then(res => res?.list || [])
}

export function getCategoryDetail(id) {
  return request({
    url: '/g/v1/categorys/' + id,
    method: 'get'
  })
}

export function postCategorys(params) {
  return request({
    url: '/g/v1/categorys',
    method: 'post',
    data: params
  })
}

export function putCategorys(id, params) {
  return request({
    url: '/g/v1/categorys/' + id,
    method: 'put',
    data: params
  })
}

export function deleteCategorys(id) {
  return request({
    url: '/g/v1/categorys/' + id,
    method: 'delete'
  })
}

// 品牌
export function getBrands(params) {
  return request({
    url: '/g/v1/brands',
    method: 'get',
    params: mapPageParams(params)
  }).then(res => res?.list || [])
}

export function getBrandsByCate(id) {
  return request({
    url: '/g/v1/categorybrands',
    method: 'get',
    params: mapPageParams({ key: id })
  }).then(res => (res?.list || res || []).map(item => item.brand || item))
}

export function createBrand(data) {
  return request({
    url: '/g/v1/brands',
    method: 'post',
    data: data
  })
}

export function putBrands(id, params) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'put',
    data: params
  })
}

export function deleteBrands(id) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'delete'
  })
}

// 品牌+分类关系
export function getBrandToCate(params) {
  return request({
    url: '/g/v1/categorybrands',
    method: 'get',
    params: mapPageParams(params)
  }).then(normalizeList)
}

export function getBrandToCateDetail(id, params) {
  return request({
    url: '/g/v1/categorybrands/' + id,
    method: 'get',
    params: params
  }).catch((err) => {
    // 待后端补接口：品牌分类详情
    // 适配降级提示，避免影响其他功能
    ElMessage.error('该功能暂未上线，后端待补充接口')
    return Promise.reject(err)
  })
}

export function createBrandToCate(data) {
  return request({
    url: '/g/v1/categorybrands',
    method: 'post',
    data: data
  })
}

export function putBrandToCate(id, params) {
  return request({
    url: '/g/v1/categorybrands/' + id,
    method: 'put',
    data: params
  })
}

export function deleteBrandToCate(id) {
  return request({
    url: '/g/v1/categorybrands/' + id,
    method: 'delete'
  })
}

// 商品管理
export function getGoods(params) {
  return request({
    url: '/g/v1/good/list',
    method: 'get',
    params: mapGoodsQuery(params)
  }).then(normalizeList)
}

export function getGoodsEach(id) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'get'
  })
}

export function createGoods(data) {
  return request({
    url: '/g/v1/good',
    method: 'post',
    data: data
  })
}

export function putGoods(id, params) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'put',
    data: params
  })
}

export function deleteGoods(id) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'delete'
  })
}

export function putGoodsStatus(id, params) {
  return request({
    url: '/g/v1/good/' + id,
    method: 'patch',
    data: params
  })
}

// 订单
export function getOrder(params) {
  return request({
    url: '/o/v1/orders',
    method: 'get',
    params: mapPageParams(params)
  }).then(normalizeList)
}

export function getOrderEach(id) {
  return request({
    url: '/o/v1/orders/' + id,
    method: 'get'
  })
}

// 留言
export function getMessage(params) {
  return request({
    url: '/up/v1/message',
    method: 'get',
    params: mapPageParams(params)
  }).then(normalizeList)
}

export function createMessage(data) {
  return request({
    url: '/up/v1/message',
    method: 'post',
    data: data
  })
}

// 收藏
export function getuserfav(params) {
  return request({
    url: '/up/v1/userfavs',
    method: 'get',
    params: mapPageParams(params)
  }).then(normalizeList)
}

export function createuserfav(data) {
  return request({
    url: '/up/v1/userfavs',
    method: 'post',
    data: data
  })
}

export function deleteuserfav(goodId) {
  return request({
    url: '/up/v1/userfavs/' + goodId,
    method: 'delete'
  })
}

//用户地址
export function getaddress(params) {
  return request({
    url: '/up/v1/address',
    method: 'get',
    params: params
  }).then(normalizeList)
}

// 用户列表
export function getUserList(params) {
  return request({
    url: '/u/v1/user/list',
    method: 'get',
    params: params
  }).then(normalizeList)
}

// 轮播图
export function getBanners(params) {
  return request({
    url: '/g/v1/banners',
    method: 'get',
    params: params
  }).then(res => res?.list || [])
}

export function createBanner(data) {
  return request({
    url: '/g/v1/banners',
    method: 'post',
    data: data
  })
}

export function putBanner(id, params) {
  return request({
    url: '/g/v1/banners/' + id,
    method: 'put',
    data: params
  })
}

export function deleteBanners(id) {
  return request({
    url: '/g/v1/banners/' + id,
    method: 'delete'
  })
}

// 登錄與驗證碼 (部分視圖可能會用)
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
