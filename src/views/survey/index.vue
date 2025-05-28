<template>
  <div class="survey-container">
    <avue-crud
      :data="tableData"
      :option="tableOption"
      @row-save="handleSave"
      @row-update="handleUpdate"
      @row-del="handleDelete"
      @refresh-change="handleRefresh"
      @search-change="handleSearch"
      @current-change="(val) => { page.current = val; fetchSurveyList() }"
      @size-change="(val) => { page.size = val; page.current = 1; fetchSurveyList() }"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === '已发布' ? 'success' : 'info'">
          {{ row.status }}
        </el-tag>
      </template>
      
      <!-- 自定义表单按钮 -->
      <template #menu="{ type, size, disabled,row }">
        <el-button
          :type="type"
          :size="size"
          :disabled="disabled"
          @click="openQuestionEditor(row)"
        >
          管理问题
        </el-button>
        <el-button
          type="warning"
          :size="size"
          :disabled="disabled"
          @click="openScoringRuleEditor(row)"
        >
          评分规则
        </el-button>
      </template>
    </avue-crud>
    
    <!-- 预览问卷对话框 -->
    <el-dialog v-model="previewVisible" title="问卷预览" width="60%">
      <div class="survey-preview">
        <h2>{{ currentSurvey.title }}</h2>
        <p class="survey-description">{{ currentSurvey.description }}</p>
        
        <div class="survey-questions">
          <div v-if="currentSurvey.questions && currentSurvey.questions.length > 0">
            <div v-for="(question, index) in currentSurvey.questions" :key="index" class="question-item">
              <div class="question-title">{{ index + 1 }}. {{ question.title }}</div>
              
              <!-- 单选题 -->
              <div v-if="question.type === 'radio'" class="question-options">
                <el-radio-group v-model="question.answer">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                    <el-radio :label="option.value">{{ option.label }}</el-radio>
                  </div>
                </el-radio-group>
              </div>
              
              <!-- 多选题 -->
              <div v-else-if="question.type === 'checkbox'" class="question-options">
                <el-checkbox-group v-model="question.answer">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                    <el-checkbox :label="option.value">{{ option.label }}</el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
              
              <!-- 文本题 -->
              <div v-else-if="question.type === 'text'" class="question-options">
                <el-input v-model="question.answer" type="textarea" :rows="3" placeholder="请输入您的回答"></el-input>
              </div>
            </div>
          </div>
          <div v-else class="empty-questions">
            <el-empty description="暂无问题"></el-empty>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSurveyList, addSurvey, updateSurvey, deleteSurvey } from '@/api/survey'
import { getCategoryList } from '@/api/survey-category'
import { useRouter } from 'vue-router'
const router = useRouter()
// 表格数据
const tableData = ref([])

// 问卷分类选项
const categoryOptions = ref([])

// 分页参数
const page = reactive({
  current: 1,
  size: 10,
  total: 0
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
  viewBtn: true,
  menuWidth: 300,
  dialogWidth: '70%',
  // 分页配置
  page: true,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50],
  column: [
    {
      label: '问卷ID',
      prop: 'surveyId',
      hide: true,
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '问卷标题',
      prop: 'title',
      search: true,
      rules: [{
        required: true,
        message: '请输入问卷标题',
        trigger: 'blur'
      }]
    },
    {
      label: '问卷描述',
      prop: 'description',
      type: 'textarea',
      span: 24,
      minRows: 3,
      overHidden: true
    },
    {
      label: '问卷路径',
      prop: 'surveyPath',
      rules: [{
        required: true,
        message: '请输入问卷路径',
        trigger: 'blur'
      }]
    },
    {
      label: '问卷分类',
      prop: 'categoryId',
      type: 'select',
      dicData: categoryOptions,
      props: {
        label: 'name',
        value: 'id'
      },
      rules: [{
        required: true,
        message: '请选择问卷分类',
        trigger: 'change'
      }],
      search: true
    },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      dicData: [
        { label: '草稿', value: '草稿' },
        { label: '已发布', value: '已发布' },
        { label: '已关闭', value: '已关闭' }
      ],
      search: true
    },
    {
      label: '创建时间',
      prop: 'createTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '更新时间',
      prop: 'updateTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      editDisplay: false,
      addDisplay: false,
      hide: true
    }
  ]
})

// 当前选中的问卷（用于预览）
const currentSurvey = ref({})
const previewVisible = ref(false)

// 获取问卷列表
const fetchSurveyList = async (params = {}) => {
  try {
    // 合并分页参数
    const queryParams = {
      current: page.current,
      size: page.size,
      ...params
    }
    
    // 调用API获取数据
    const  data  = await getSurveyList(queryParams)
    
    // 更新表格数据和分页信息
    if (data) {
      tableData.value = data.records || []
      page.total = data.total || 0
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error)
    ElMessage.error('获取问卷列表失败')
  }
}

// 新增问卷
const handleAdd = () => {
  // 使用avue自带的新增功能
}

// 保存新增的问卷
const handleSave = async (row, done, loading) => {
  try {
    // 调用API保存数据
    await addSurvey(row)
    ElMessage.success('新增问卷成功')
    fetchSurveyList()
    done() // 关闭表单
  } catch (error) {
    console.error('新增问卷失败:', error)
    ElMessage.error('新增问卷失败')
    loading(false) // 关闭loading
  }
}

// 更新问卷
const handleUpdate = async (row, index, done, loading) => {
  try {
    // 调用API更新数据
    await updateSurvey(row.surveyId, row)
    ElMessage.success('更新问卷成功')
    fetchSurveyList()
    done() // 关闭表单
  } catch (error) {
    console.error('更新问卷失败:', error)
    ElMessage.error('更新问卷失败')
    loading(false) // 关闭loading
  }
}

// 删除问卷
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该问卷吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用API删除数据
    await deleteSurvey(row.surveyId)
    ElMessage.success('删除问卷成功')
    fetchSurveyList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问卷失败:', error)
      ElMessage.error('删除问卷失败')
    }
  }
}

// 刷新表格
const handleRefresh = () => {
  fetchSurveyList()
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
  // 重置页码到第一页
  page.current = 1
  // 使用搜索参数调用API
  fetchSurveyList(params)
}

// 查看问卷详情
const handleView = (row) => {
  currentSurvey.value = row
  previewVisible.value = true
}

// 打开问题编辑器
const openQuestionEditor = (row) => {
  router.push('/question/'+row.id)
}

// 打开评分规则编辑器
const openScoringRuleEditor = (row) => {
  router.push('/scoring-rule/' + row.id)
}

// 获取问卷分类列表
const fetchCategoryList = async () => {
  try {
    const  data  = await getCategoryList()
    if (data) {
      categoryOptions.value = data || []
    }
  } catch (error) {
    console.error('获取问卷分类列表失败:', error)
    ElMessage.error('获取问卷分类列表失败')
  }
}

// 页面加载时获取问卷列表和分类列表
onMounted(() => {
  fetchSurveyList()
  fetchCategoryList()
})
</script>

<style scoped>
.survey-container {
  padding: 20px;
}

.survey-preview {
  padding: 20px;
}

.survey-description {
  color: #606266;
  margin-bottom: 20px;
}

.question-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.question-title {
  font-weight: bold;
  margin-bottom: 10px;
}

.question-options {
  padding-left: 20px;
}

.option-item {
  margin-bottom: 8px;
}

.empty-questions {
  padding: 30px 0;
}
</style>