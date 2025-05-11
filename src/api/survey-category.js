import request from '@/utils/request'

// 获取问卷分类列表
export function getCategoryList(params) {
  return request({
    url: '/surveys/categories',
    method: 'get',
    params
  })
}

// 获取问卷分类详情
export function getCategoryDetail(id) {
  return request({
    url: `/surveys/categories/${id}`,
    method: 'get'
  })
}

// 新增问卷分类
export function addCategory(data) {
  return request({
    url: '/surveys/categories',
    method: 'post',
    data
  })
}

// 更新问卷分类
export function updateCategory(id, data) {
  return request({
    url: `/surveys/categories/${id}`,
    method: 'put',
    data
  })
}

// 删除问卷分类
export function deleteCategory(id) {
  return request({
    url: `/surveys/categories/${id}`,
    method: 'delete'
  })
}