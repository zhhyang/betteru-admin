import request from '@/utils/request'

// 获取问卷列表（分页）
export function getSurveyQuestionList(params) {
  return request({
    url: '/questions/page',
    method: 'get',
    params
  })
}

// 获取问卷详情
export function getQuestionDetail(id) {
  return request({
    url: `/questions/${id}`,
    method: 'get'
  })
}

// 新增问卷
export function addQuestion(data) {
  return request({
    url: '/questions',
    method: 'post',
    data
  })
}

// 更新问卷
export function updateQuestion(id, data) {
  return request({
    url: `/questions/${id}`,
    method: 'put',
    data
  })
}

// 删除问卷
export function deleteQuestion(id) {
  return request({
    url: `/questions/${id}`,
    method: 'delete'
  })
}