import request from '@/utils/request'

// 获取评分规则列表（分页）
export function getScoringRuleList(params) {
  return request({
    url: '/scoring-rules/page',
    method: 'get',
    params
  })
}

// 根据问卷ID获取评分规则列表
export function getScoringRulesBySurveyId(surveyId) {
  return request({
    url: `/scoring-rules/survey/${surveyId}`,
    method: 'get'
  })
}

// 获取评分规则详情
export function getScoringRuleDetail(id) {
  return request({
    url: `/scoring-rules/${id}`,
    method: 'get'
  })
}

// 新增评分规则
export function addScoringRule(data) {
  return request({
    url: '/scoring-rules',
    method: 'post',
    data
  })
}

// 更新评分规则
export function updateScoringRule(id, data) {
  return request({
    url: `/scoring-rules/${id}`,
    method: 'put',
    data
  })
}

// 删除评分规则
export function deleteScoringRule(id) {
  return request({
    url: `/scoring-rules/${id}`,
    method: 'delete'
  })
}

// 批量创建评分规则
export function batchCreateScoringRules(data) {
  return request({
    url: '/scoring-rules/batch',
    method: 'post',
    data
  })
}

// 计算评分等级
export function calculateScoreLevel(surveyId, score) {
  return request({
    url: `/scoring-rules/calculate/${surveyId}/${score}`,
    method: 'get'
  })
}