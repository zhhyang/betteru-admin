<template>
  <div class="survey-record-container">
    <avue-crud
      :data="tableData"
      :option="tableOption"
      @row-del="handleDelete"
      @refresh-change="handleRefresh"
      @search-change="handleSearch"
      @current-change="
        (val) => {
          page.current = val;
          fetchSurveyRecordList();
        }
      "
      @size-change="
        (val) => {
          page.size = val;
          page.current = 1;
          fetchSurveyRecordList();
        }
      "
      @selection-change="handleSelectionChange"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === 'COMPLETED' ? 'success' : 'warning'">
          {{ row.status === "COMPLETED" ? "已完成" : "进行中" }}
        </el-tag>
      </template>

      <template #totalScore="{ row }">
        <el-tag v-if="row.totalScore !== null" type="primary">
          {{ row.totalScore }} 分
        </el-tag>
        <span v-else class="text-gray-400">未评分</span>
      </template>

      <!-- 自定义操作按钮 -->
      <template #menu="{ size, disabled, row }">
        <el-button
          type="text"
          :size="size"
          :disabled="disabled"
          @click="viewAnswerDetail(row)"
        >
          查看答案
        </el-button>
      </template>

      <!-- 顶部工具栏 -->
      <template #menuLeft>
        <el-button
          type="danger"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button type="success" @click="handleExport"> 导出数据 </el-button>
      </template>
    </avue-crud>

    <!-- 答案详情对话框 -->
    <el-dialog v-model="answerDetailVisible" title="答案详情" width="60%">
      <div class="answer-detail">
        <div class="record-info">
          <h3>记录信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{
              currentRecord.userId
            }}</el-descriptions-item>
            <el-descriptions-item label="问卷ID">{{
              currentRecord.surveyId
            }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                :type="
                  currentRecord.status === 'COMPLETED' ? 'success' : 'warning'
                "
              >
                {{ currentRecord.status === "COMPLETED" ? "已完成" : "进行中" }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总分">
              <el-tag v-if="currentRecord.totalScore !== null" type="primary">
                {{ currentRecord.totalScore }} 分
              </el-tag>
              <span v-else>未评分</span>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{
              currentRecord.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{
              currentRecord.updatedAt
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="answer-list" v-if="currentRecord.answerList">
          <h3>答案详情</h3>
          <div class="answer-content">
            <pre>{{ formatAnswerList(currentRecord.answerList) }}</pre>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="answerDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSurveyRecordList,
  deleteSurveyRecord,
  batchDeleteSurveyRecord,
  exportSurveyRecord,
} from "@/api/survey-record";

// 表格数据
const tableData = ref([]);

// 选中的行
const selectedRows = ref([]);

// 当前记录
const currentRecord = ref({});

// 答案详情对话框
const answerDetailVisible = ref(false);

// 分页参数
const page = reactive({
  current: 1,
  size: 10,
  total: 0,
});

// 表格配置
const tableOption = reactive({
  border: true,
  index: true,
  indexLabel: "序号",
  stripe: true,
  menuAlign: "center",
  searchMenuSpan: 6,
  editBtn: true,
  delBtn: true,
  addBtn: false,
  menuWidth: 250,
  // 分页配置
  page: true,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50],
  column: [
    {
      label: "记录ID",
      prop: "id",
    },
    {
      label: "用户ID",
      prop: "userId",
      search: true,
    },
    {
      label: "问卷ID",
      prop: "surveyId",
      search: true,
    },
    {
      label: "状态",
      prop: "status",
      type: "select",
      dicData: [
        { label: "已完成", value: "COMPLETED" },
        { label: "进行中", value: "IN_PROGRESS" },
      ],
      search: true,
    },
    {
      label: "总分",
      prop: "totalScore",
    },
    {
      label: "评分规则ID",
      prop: "scoringRuleId",
    },
    {
      label: "创建时间",
      prop: "createdAt",
      type: "datetime",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
      search: true,
      searchRange: true,
    },
    {
      label: "更新时间",
      prop: "updatedAt",
      type: "datetime",
      format: "YYYY-MM-DD HH:mm:ss",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
  ],
});

// 获取问卷记录列表
const fetchSurveyRecordList = async (searchParams = {}) => {
  try {
    const params = {
      current: page.current,
      size: page.size,
      ...searchParams,
    };

    const data = await getSurveyRecordList(params);

    tableData.value = data.records || [];
    page.total = data.total || 0;
  } catch (error) {
    console.error("获取问卷记录列表失败:", error);
    ElMessage.error("获取问卷记录列表失败");
  }
};

// 删除记录
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const response = await deleteSurveyRecord(row.id);

    if (response.code === 200) {
      ElMessage.success("删除记录成功");
      fetchSurveyRecordList();
    } else {
      ElMessage.error(response.message || "删除记录失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除记录失败:", error);
      ElMessage.error("删除记录失败");
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const ids = selectedRows.value.map((row) => row.id);
    const response = await batchDeleteSurveyRecord(ids);

    if (response.code === 200) {
      ElMessage.success("批量删除成功");
      selectedRows.value = [];
      fetchSurveyRecordList();
    } else {
      ElMessage.error(response.message || "批量删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("批量删除失败:", error);
      ElMessage.error("批量删除失败");
    }
  }
};

// 导出数据
const handleExport = async () => {
  try {
    const response = await exportSurveyRecord();

    // 创建下载链接
    const blob = new Blob([response], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `问卷记录_${new Date().getTime()}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败");
  }
};

// 查看答案详情
const viewAnswerDetail = (row) => {
  currentRecord.value = { ...row };
  answerDetailVisible.value = true;
};

// 格式化答案列表
const formatAnswerList = (answerList) => {
  try {
    if (typeof answerList === "string") {
      return JSON.stringify(JSON.parse(answerList), null, 2);
    }
    return JSON.stringify(answerList, null, 2);
  } catch (error) {
    return answerList;
  }
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 刷新表格
const handleRefresh = () => {
  fetchSurveyRecordList();
};

// 搜索
const handleSearch = (params) => {
  page.current = 1;
  fetchSurveyRecordList(params);
};

// 页面加载时获取数据
onMounted(() => {
  fetchSurveyRecordList();
});
</script>

<style scoped>
.survey-record-container {
  padding: 20px;
}

.answer-detail {
  max-height: 600px;
  overflow-y: auto;
}

.record-info {
  margin-bottom: 20px;
}

.answer-list h3 {
  margin-bottom: 10px;
  color: #409eff;
}

.answer-content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.answer-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.5;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>
