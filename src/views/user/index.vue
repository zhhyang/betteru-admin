<template>
  <div class="user-container">
    <avue-crud
      :data="tableData"
      :option="tableOption"
      @row-save="handleSave"
      @row-update="handleUpdate"
      @row-del="handleDelete"
      @refresh-change="handleRefresh"
      @search-change="handleSearch"
    >
      <template #menu-left>
        <el-button type="primary" icon="Plus" @click="handleAdd">新增用户</el-button>
      </template>
      
      <template #status="{ row }">
        <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
          {{ row.status }}
        </el-tag>
      </template>
    </avue-crud>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios'

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
  menuWidth: 280,
  column: [
    {
      label: '用户ID',
      prop: 'userId',
      hide: true,
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '用户名',
      prop: 'username',
      search: true,
      rules: [{
        required: true,
        message: '请输入用户名',
        trigger: 'blur'
      }]
    },
    {
      label: '姓名',
      prop: 'name',
      search: true,
      rules: [{
        required: true,
        message: '请输入姓名',
        trigger: 'blur'
      }]
    },
    {
      label: '手机号',
      prop: 'phone',
      rules: [{
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号',
        trigger: 'blur'
      }]
    },
    {
      label: '邮箱',
      prop: 'email',
      rules: [{
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: 'blur'
      }]
    },
    {
      label: '角色',
      prop: 'role',
      type: 'select',
      dicData: [
        { label: '管理员', value: 'admin' },
        { label: '普通用户', value: 'user' }
      ],
      rules: [{
        required: true,
        message: '请选择角色',
        trigger: 'change'
      }]
    },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      dicData: [
        { label: '正常', value: '正常' },
        { label: '禁用', value: '禁用' }
      ],
      search: true
    },
    {
      label: '注册时间',
      prop: 'createTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      editDisplay: false,
      addDisplay: false
    },
    {
      label: '最后登录',
      prop: 'lastLoginTime',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      editDisplay: false,
      addDisplay: false
    }
  ]
})

// 获取用户列表
const fetchUserList = async () => {
  try {
    // 这里应该调用实际的API
    // const { data } = await axios.get('/api/users')
    // tableData.value = data
    
    // 模拟数据
    tableData.value = [
      {
        userId: 1,
        username: 'admin',
        name: '管理员',
        phone: '13800138000',
        email: 'admin@example.com',
        role: 'admin',
        status: '正常',
        createTime: '2023-01-01 00:00:00',
        lastLoginTime: '2023-06-15 08:30:00'
      },
      {
        userId: 2,
        username: 'zhangsan',
        name: '张三',
        phone: '13900139000',
        email: 'zhangsan@example.com',
        role: 'user',
        status: '正常',
        createTime: '2023-03-15 10:20:00',
        lastLoginTime: '2023-06-14 15:45:00'
      },
      {
        userId: 3,
        username: 'lisi',
        name: '李四',
        phone: '13700137000',
        email: 'lisi@example.com',
        role: 'user',
        status: '禁用',
        createTime: '2023-04-20 14:30:00',
        lastLoginTime: '2023-05-30 09:15:00'
      }
    ]
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 新增用户
const handleAdd = () => {
  // 使用avue自带的新增功能
}

// 保存新增的用户
const handleSave = async (row, done, loading) => {
  try {
    // 这里应该调用实际的API
    // await axios.post('/api/users', row)
    
    // 模拟保存成功
    setTimeout(() => {
      ElMessage.success('新增用户成功')
      fetchUserList()
      done() // 关闭表单
    }, 1000)
  } catch (error) {
    console.error('新增用户失败:', error)
    ElMessage.error('新增用户失败')
    loading(false) // 关闭loading
  }
}

// 更新用户
const handleUpdate = async (row, index, done, loading) => {
  try {
    // 这里应该调用实际的API
    // await axios.put(`/api/users/${row.userId}`, row)
    
    // 模拟更新成功
    setTimeout(() => {
      ElMessage.success('更新用户成功')
      fetchUserList()
      done() // 关闭表单
    }, 1000)
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error('更新用户失败')
    loading(false) // 关闭loading
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里应该调用实际的API
    // await axios.delete(`/api/users/${row.userId}`)
    
    // 模拟删除成功
    setTimeout(() => {
      ElMessage.success('删除用户成功')
      fetchUserList()
    }, 1000)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  }
}

// 刷新表格
const handleRefresh = () => {
  fetchUserList()
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
  // 实际应用中应该根据搜索参数调用API
  fetchUserList()
}

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-container {
  padding: 20px;
}
</style>