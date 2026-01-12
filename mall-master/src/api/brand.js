import request from '@/utils/request'
import { ElMessage } from 'element-plus'

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
 * 品牌管理接口
 */

// 获取品牌列表
export function fetchList(params) {
  return request({
    url: '/g/v1/brands',
    method: 'get',
    params: mapPageParams(params)
  }).then(normalizeList)
}

// 创建品牌
export function createBrand(data) {
  return request({
    url: '/g/v1/brands',
    method: 'post',
    data: data
  })
}

// 获取品牌详情
export function getBrand(id) {
  // 待后端补接口：品牌详情
  return request({
    url: '/g/v1/brands/' + id,
    method: 'get'
  }).catch((err) => {
    ElMessage.error('该功能暂未上线，后端待补充接口')
    return Promise.reject(err)
  })
}

// 修改品牌
export function updateBrand(id, data) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'put',
    data: data
  })
}

// 删除品牌
export function deleteBrand(id) {
  return request({
    url: '/g/v1/brands/' + id,
    method: 'delete'
  })
}

// --- 兼容舊代碼的封裝 ---

export function updateShowStatus(data) {
  const { ids, showStatus } = data
  const id = Array.isArray(ids) ? ids[0] : ids
  return updateBrand(id, { show_status: showStatus })
}

export function updateFactoryStatus(data) {
  const { ids, factoryStatus } = data
  const id = Array.isArray(ids) ? ids[0] : ids
  return updateBrand(id, { factory_status: factoryStatus })
}
