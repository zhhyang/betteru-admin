<template>
  <div class="survey-category-container">
    <avue-crud
      :data="tableData"
      :option="tableOption"
      @row-save="handleSave"
      @row-update="handleUpdate"
      @row-del="handleDelete"
      @refresh-change="handleRefresh"
      @search-change="handleSearch"
    >
    </avue-crud>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {getCategoryList,addCategory,updateCategory,deleteCategory} from '@/api/survey-category'

// 表格数据
const tableData = ref([])

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
  menuWidth: 200,
  column: [
    {
      label: '分类ID',
      prop: 'id',
      hide: true,
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '分类名称',
      prop: 'name',
      search: true,
      rules: [{
        required: true,
        message: '请输入分类名称',
        trigger: 'blur'
      }]
    },
    {
      label: '分类描述',
      prop: 'description',
      type: 'textarea',
      span: 24,
      minRows: 2
    },
    {
      label: '排序',
      prop: 'displayOrder',
      type: 'number',
      rules: [{
        required: true,
        message: '请输入排序值',
        trigger: 'blur'
      }]
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

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    // 这里应该调用实际的API
    const  data  = await getCategoryList()
    tableData.value = data
    
    // 模拟数据
    
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 新增分类
const handleAdd = () => {
  // 使用avue自带的新增功能
}

// 保存新增的分类
const handleSave = async (row, done, loading) => {
  try {
    // 这里应该调用实际的API
     await addCategory( row)
    
    // 模拟保存成功
    setTimeout(() => {
      ElMessage.success('新增分类成功')
      fetchCategoryList()
      done() // 关闭表单
    }, 500)
  } catch (error) {
    console.error('新增分类失败:', error)
    ElMessage.error('新增分类失败')
    loading(false) // 关闭loading
  }
}

// 更新分类
const handleUpdate = async (row, index, done, loading) => {
  try {
    // 这里应该调用实际的API
    await updateCategory(row.id, row)
    
    // 模拟更新成功
    setTimeout(() => {
      ElMessage.success('更新分类成功')
      fetchCategoryList()
      done() // 关闭表单
    }, 500)
  } catch (error) {
    console.error('更新分类失败:', error)
    ElMessage.error('更新分类失败')
    loading(false) // 关闭loading
  }
}

// 删除分类
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里应该调用实际的API
    await deleteCategory(row.id)
    
    // 模拟删除成功
    setTimeout(() => {
      ElMessage.success('删除分类成功')
      fetchCategoryList()
    }, 500)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
  }
}

// 刷新表格
const handleRefresh = () => {
  fetchCategoryList()
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
  fetchCategoryList() // 实际应用中应该将搜索参数传递给API
}

// 页面加载时获取数据
onMounted(() => {
  fetchCategoryList()
})
</script>

<style scoped>
.survey-category-container {
  padding: 20px;
}
</style>