import request from '@/utils/request'

// 获取问卷记录列表（分页）
export function getSurveyRecordList(params) {
  return request({
    url: '/survey-records/page',
    method: 'get',
    params
  })
}

// 获取问卷记录详情
export function getSurveyRecordDetail(id) {
  return request({
    url: `/survey-records/${id}`,
    method: 'get'
  })
}

// 删除问卷记录
export function deleteSurveyRecord(id) {
  return request({
    url: `/survey-records/${id}`,
    method: 'delete'
  })
}

// 批量删除问卷记录
export function batchDeleteSurveyRecord(ids) {
  return request({
    url: '/survey-records/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导出问卷记录
export function exportSurveyRecord(params) {
  return request({
    url: '/survey-records/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}