<template>
  <div class="scoring-rule-container">
    <avue-crud
      :data="tableData"
      :option="tableOption"
      @row-save="handleSave"
      @row-update="handleUpdate"
      @row-del="handleDelete"
      @refresh-change="handleRefresh"
      @search-change="handleSearch"
      @current-change="(val) => { page.current = val; fetchScoringRuleList() }"
      @size-change="(val) => { page.size = val; page.current = 1; fetchScoringRuleList() }"
    >
      
      <template #menu="{ type, size, disabled, row }">
        <el-button
          :type="type"
          :size="size"
          :disabled="disabled"
          @click="handleBatchCreate(row)"
          v-if="type === 'primary'"
        >
          批量创建
        </el-button>
      </template>
    </avue-crud>
    
    <!-- 批量创建对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量创建评分规则" width="60%">
      <div class="batch-create-form">
        <el-form :model="batchForm" label-width="120px">
          <el-form-item label="评分规则" required>
            <div class="rules-container">
              <div v-for="(rule, index) in batchForm.rules" :key="index" class="rule-item">
                <el-row :gutter="10">
                  <el-col :span="4">
                    <el-input v-model="rule.minScore" placeholder="最低分" type="number" />
                  </el-col>
                  <el-col :span="4">
                    <el-input v-model="rule.maxScore" placeholder="最高分" type="number" />
                  </el-col>
                  <el-col :span="4">
                    <el-input v-model="rule.levelName" placeholder="等级名称" />
                  </el-col>
                  <el-col :span="8">
                    <el-input v-model="rule.description" placeholder="等级描述" />
                  </el-col>
                  <el-col :span="4">
                    <el-button type="danger" @click="removeRule(index)" :disabled="batchForm.rules.length <= 1">
                      删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <el-button type="primary" @click="addRule" class="add-rule-btn">
                添加规则
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getScoringRuleList,
  addScoringRule,
  updateScoringRule,
  deleteScoringRule,
  batchCreateScoringRules
} from '@/api/scoring-rule'

// 获取路由参数
const route = useRoute()
const surveyIdFromRoute = route.params.surveyId || route.query.surveyId || ''

// 表格数据
const tableData = ref([])

// 分页信息
const page = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 批量创建对话框
const batchDialogVisible = ref(false)
const batchForm = reactive({
  surveyId: surveyIdFromRoute,
  rules: [
    {
      minScore: '',
      maxScore: '',
      levelName: '',
      description: ''
    }
  ]
})

// 表格配置
const tableOption = reactive({
  border: true,
  index: true,
  indexLabel: '序号',
  stripe: true,
  menuAlign: 'center',
  searchMenuSpan: 6,
  editBtn: true,
  delBtn: true,
  addBtn: true,
  menuWidth: 250,
  page: true,
  pageSize: page.size,
  currentPage: page.current,
  total: page.total,
  column: [
    {
      label: '规则ID',
      prop: 'id',
      hide: true,
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '最低分',
      prop: 'minScore',
      type: 'number',
      rules: [{
        required: true,
        message: '请输入最低分',
        trigger: 'blur'
      }]
    },
    {
      label: '最高分',
      prop: 'maxScore',
      type: 'number',
      rules: [{
        required: true,
        message: '请输入最高分',
        trigger: 'blur'
      }]
    },
    {
      label: '等级名称',
      prop: 'levelName',
      slot: true,
      rules: [{
        required: true,
        message: '请输入等级名称',
        trigger: 'blur'
      }]
    },
    {
      label: '等级描述',
      prop: 'description',
      type: 'textarea',
      span: 24,
      minRows: 2,
      overHidden: true
    },
    {
      label: '创建时间',
      prop: 'createdAt',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '更新时间',
      prop: 'updatedAt',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      editDisplay: false,
      addDisplay: false,
      hide: true
    }
  ]
})

// 获取评分规则列表
const fetchScoringRuleList = async (params = {}) => {
  try {
    // 合并分页参数
    const queryParams = {
      surveyId: surveyIdFromRoute,
      current: page.current,
      size: page.size,
      ...params
    }
    
    // 调用API获取数据
    const data = await getScoringRuleList(queryParams)
    
    // 更新表格数据和分页信息
    if (data) {
      tableData.value = data.records || []
      page.total = data.total || 0
    }
  } catch (error) {
    console.error('获取评分规则列表失败:', error)
    ElMessage.error('获取评分规则列表失败')
  }
}

// 保存新增的评分规则
const handleSave = async (row, done, loading) => {
  try {
    // 数据验证
    if (row.minScore >= row.maxScore) {
      ElMessage.error('最低分必须小于最高分')
      loading(false)
      return
    }
    
    // 调用API保存数据
    await addScoringRule({...row,surveyId:surveyIdFromRoute})
    ElMessage.success('新增评分规则成功')
    fetchScoringRuleList()
    done() // 关闭表单
  } catch (error) {
    console.error('新增评分规则失败:', error)
    ElMessage.error('新增评分规则失败')
    loading(false) // 关闭loading
  }
}

// 更新评分规则
const handleUpdate = async (row, index, done, loading) => {
  try {
    // 数据验证
    if (row.minScore >= row.maxScore) {
      ElMessage.error('最低分必须小于最高分')
      loading(false)
      return
    }
    
    // 调用API更新数据
    await updateScoringRule(row.id, row)
    ElMessage.success('更新评分规则成功')
    fetchScoringRuleList()
    done() // 关闭表单
  } catch (error) {
    console.error('更新评分规则失败:', error)
    ElMessage.error('更新评分规则失败')
    loading(false) // 关闭loading
  }
}

// 删除评分规则
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该评分规则吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用API删除数据
    await deleteScoringRule(row.id)
    ElMessage.success('删除评分规则成功')
    fetchScoringRuleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评分规则失败:', error)
      ElMessage.error('删除评分规则失败')
    }
  }
}

// 刷新表格
const handleRefresh = () => {
  fetchScoringRuleList()
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
  // 重置页码到第一页
  page.current = 1
  // 使用搜索参数调用API
  fetchScoringRuleList(params)
}

// 批量创建
const handleBatchCreate = () => {
  batchDialogVisible.value = true
  // 重置表单，如果路由中有surveyId则自动填充
  batchForm.surveyId = surveyIdFromRoute
  batchForm.rules = [
    {
      minScore: '',
      maxScore: '',
      levelName: '',
      description: ''
    }
  ]
}

// 添加规则
const addRule = () => {
  batchForm.rules.push({
    minScore: '',
    maxScore: '',
    levelName: '',
    description: ''
  })
}

// 删除规则
const removeRule = (index) => {
  if (batchForm.rules.length > 1) {
    batchForm.rules.splice(index, 1)
  }
}

// 批量提交
const handleBatchSubmit = async () => {
  try {
    // 数据验证
    if (!batchForm.surveyId) {
      ElMessage.error('请输入问卷ID')
      return
    }
    
    // 验证每个规则
    for (let i = 0; i < batchForm.rules.length; i++) {
      const rule = batchForm.rules[i]
      if (!rule.minScore || !rule.maxScore || !rule.levelName) {
        ElMessage.error(`第${i + 1}个规则信息不完整`)
        return
      }
      if (Number(rule.minScore) >= Number(rule.maxScore)) {
        ElMessage.error(`第${i + 1}个规则的最低分必须小于最高分`)
        return
      }
    }
    
    // 检查分数区间是否重叠
    const sortedRules = [...batchForm.rules].sort((a, b) => Number(a.minScore) - Number(b.minScore))
    for (let i = 0; i < sortedRules.length - 1; i++) {
      if (Number(sortedRules[i].maxScore) > Number(sortedRules[i + 1].minScore)) {
        ElMessage.error('分数区间不能重叠')
        return
      }
    }
    
    // 构造请求数据
    const requestData = {
      surveyId: batchForm.surveyId,
      rules: batchForm.rules.map(rule => ({
        surveyId: batchForm.surveyId,
        minScore: Number(rule.minScore),
        maxScore: Number(rule.maxScore),
        levelName: rule.levelName,
        description: rule.description
      }))
    }
    
    // 调用API批量创建
    await batchCreateScoringRules(requestData)
    ElMessage.success('批量创建评分规则成功')
    batchDialogVisible.value = false
    fetchScoringRuleList()
  } catch (error) {
    console.error('批量创建评分规则失败:', error)
    ElMessage.error('批量创建评分规则失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchScoringRuleList({})
})
</script>

<style scoped>
.scoring-rule-container {
  padding: 20px;
}

.batch-create-form {
  padding: 20px;
}

.rules-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.rule-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.add-rule-btn {
  margin-top: 10px;
  width: 100%;
}

.dialog-footer {
  text-align: right;
}
</style>