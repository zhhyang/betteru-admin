import request from '@/utils/request'

// 获取问卷列表（分页）
export function getSurveyList(params) {
  return request({
    url: '/surveys/page',
    method: 'get',
    params
  })
}

// 获取问卷详情
export function getSurveyDetail(id) {
  return request({
    url: `/surveys/${id}`,
    method: 'get'
  })
}

// 新增问卷
export function addSurvey(data) {
  return request({
    url: '/surveys',
    method: 'post',
    data
  })
}

// 更新问卷
export function updateSurvey(id, data) {
  return request({
    url: `/surveys/${id}`,
    method: 'put',
    data
  })
}

// 删除问卷
export function deleteSurvey(id) {
  return request({
    url: `/surveys/${id}`,
    method: 'delete'
  })
}

// 发布问卷
export function publishSurvey(id) {
  return request({
    url: `/surveys/${id}/publish`,
    method: 'post'
  })
}

// 取消发布问卷
export function unpublishSurvey(id) {
  return request({
    url: `/surveys/${id}/unpublish`,
    method: 'post'
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