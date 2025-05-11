<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-title">用户总数</div>
            <el-icon class="stat-card-icon"><User /></el-icon>
          </div>
          <div class="stat-card-value">1,234</div>
          <div class="stat-card-footer">
            <span class="trend-up">↑ 12%</span>
            <span class="trend-text">较上周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-title">问卷总数</div>
            <el-icon class="stat-card-icon"><Document /></el-icon>
          </div>
          <div class="stat-card-value">56</div>
          <div class="stat-card-footer">
            <span class="trend-up">↑ 5%</span>
            <span class="trend-text">较上周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-title">回复总数</div>
            <el-icon class="stat-card-icon"><ChatDotRound /></el-icon>
          </div>
          <div class="stat-card-value">8,562</div>
          <div class="stat-card-footer">
            <span class="trend-up">↑ 18%</span>
            <span class="trend-text">较上周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-title">活跃度</div>
            <el-icon class="stat-card-icon"><TrendCharts /></el-icon>
          </div>
          <div class="stat-card-value">89%</div>
          <div class="stat-card-footer">
            <span class="trend-down">↓ 2%</span>
            <span class="trend-text">较上周</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="userChartPeriod" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            <!-- 这里应该放置实际的图表组件 -->
            <div class="placeholder-text">用户增长趋势图表</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>问卷完成情况</span>
              <el-select v-model="surveyChartType" size="small" style="width: 120px">
                <el-option label="完成率" value="completion" />
                <el-option label="参与人数" value="participants" />
              </el-select>
            </div>
          </template>
          <div class="chart-placeholder">
            <!-- 这里应该放置实际的图表组件 -->
            <div class="placeholder-text">问卷完成情况图表</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近活动 -->
    <el-card class="recent-activity">
      <template #header>
        <div class="activity-header">
          <span>最近活动</span>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentActivities" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="user" label="用户" width="180" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { User, Document, ChatDotRound, TrendCharts } from '@element-plus/icons-vue'

// 图表周期选择
const userChartPeriod = ref('month')
const surveyChartType = ref('completion')

// 模拟最近活动数据
const recentActivities = [
  { time: '2023-06-15 14:32', user: '张三', action: '完成了问卷「健康生活习惯调查」', status: '成功' },
  { time: '2023-06-15 13:45', user: '李四', action: '提交了问卷「工作满意度调查」', status: '成功' },
  { time: '2023-06-15 11:20', user: '王五', action: '注册了新账号', status: '成功' },
  { time: '2023-06-15 10:15', user: '赵六', action: '尝试登录', status: '失败' },
  { time: '2023-06-14 16:42', user: '管理员', action: '创建了新问卷「饮食习惯调查」', status: '成功' },
]
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 统计卡片样式 */
.stat-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stat-card-title {
  font-size: 16px;
  color: #606266;
}

.stat-card-icon {
  font-size: 24px;
  color: #409EFF;
}

.stat-card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-card-footer {
  font-size: 12px;
  color: #909399;
}

.trend-up {
  color: #67C23A;
  margin-right: 5px;
}

.trend-down {
  color: #F56C6C;
  margin-right: 5px;
}

/* 图表区域样式 */
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.placeholder-text {
  color: #909399;
  font-size: 14px;
}

/* 最近活动样式 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-activity {
  margin-bottom: 20px;
  border-radius: 8px;
}
</style>