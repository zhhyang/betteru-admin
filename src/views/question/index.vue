<template>
  <div class="question-management">
    <div class="page-header">
      <h2>问题管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索问题标题"
          class="search-input"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="typeFilter"
          placeholder="问题类型"
          clearable
          @change="handleSearch"
          class="type-filter"
        >
          <el-option label="全部类型" value=""></el-option>
          <el-option label="单选题" value="radio"></el-option>
          <el-option label="多选题" value="checkbox"></el-option>
          <el-option label="文本题" value="text"></el-option>
        </el-select>
        <el-button type="primary" @click="addQuestion">添加问题</el-button>
      </div>
    </div>

    <!-- 问题列表 -->
    <el-card class="question-list-card">
      <div v-if="filteredQuestions.length > 0" class="question-list">
        <div
          v-for="(question, index) in paginatedQuestions"
          :key="question.id"
          class="question-item"
        >
          <div class="question-item-header">
            <span class="question-title">{{ question.title }}</span>
            <span class="question-type">
              <el-tag size="small" :type="getQuestionTypeTag(question.type)">
                {{ getQuestionTypeName(question.type) }}
              </el-tag>
            </span>
            <span class="question-required">
              <el-tag
                size="small"
                :type="question.required ? 'danger' : 'info'"
              >
                {{ question.required ? "必填" : "选填" }}
              </el-tag>
            </span>
            <div class="question-actions">
              <el-button
                type="primary"
                link
                @click="editQuestion(question, index)"
              >
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button
                type="success"
                link
                @click="showQuestionPreview(question)"
              >
                <el-icon><View /></el-icon> 预览
              </el-button>
              <el-button
                type="danger"
                link
                @click="removeQuestion(question.id)"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </div>
          <div class="question-item-content" v-if="question.type !== 'text'">
            <div class="options-list">
              <div
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
                class="option-item"
              >
                <span class="option-index">{{ optIndex + 1 }}.</span>
                <span class="option-label">{{ option.label }}</span>
                <span v-if="option.value !== undefined" class="option-value"
                  >({{ option.value }}分)</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无问题，请添加问题"></el-empty>

      <!-- 分页 -->
      <div class="pagination-container" v-if="questions.length > 0">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 问题编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑问题' : '添加问题'"
      width="50%"
    >
      <el-form
        :model="currentQuestion"
        label-width="80px"
        :rules="rules"
        ref="questionForm"
      >
        <el-form-item label="问题标题" prop="title">
          <el-input
            v-model="currentQuestion.title"
            placeholder="请输入问题标题"
          ></el-input>
        </el-form-item>

        <el-form-item label="问题类型" prop="type">
          <el-select
            v-model="currentQuestion.type"
            placeholder="请选择问题类型"
            @change="handleTypeChange"
          >
            <el-option label="单选题" value="radio"></el-option>
            <el-option label="多选题" value="checkbox"></el-option>
            <el-option label="文本题" value="text"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="是否必填" prop="required">
          <el-switch v-model="currentQuestion.required"></el-switch>
        </el-form-item>
        <el-form-item label="配图" prop="img">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            action="/api/admin/upload"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            limit="1"
            :on-success="handleUploadSuccess"
          >
            <img
              v-if="currentQuestion.img"
              :src="currentQuestion.img"
              class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <!-- 选项配置（单选题和多选题） -->
        <template
          v-if="
            currentQuestion.type === 'radio' ||
            currentQuestion.type === 'checkbox'
          "
        >
          <el-divider content-position="left">选项配置</el-divider>

          <draggable
            v-model="currentQuestion.options"
            item-key="hash"
            handle=".drag-handle"
            ghost-class="ghost-option"
            animation="300"
            @start="drag = true"
            @end="drag = false"
          >
            <template #item="{ element: option, index }">
              <div class="option-item">
                <el-row :gutter="10">
                  <el-col :span="1">
                    <el-icon class="drag-handle cursor-move"><Menu /></el-icon>
                  </el-col>
                  <el-col :span="11">
                    <el-form-item
                      :label="`选项${index + 1}`"
                      :prop="`options.${index}.label`"
                      :rules="{
                        required: true,
                        message: '选项内容不能为空',
                        trigger: 'blur',
                      }"
                    >
                      <el-input
                        v-model="option.label"
                        placeholder="请输入选项内容"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="分值" :prop="`options.${index}.value`">
                      <el-input-number
                        v-model="option.value"
                        :min="0"
                        :max="100"
                        :precision="0"
                        :step="1"
                        placeholder="分值"
                      ></el-input-number>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6" class="option-actions">
                    <el-button
                      type="danger"
                      circle
                      @click="removeOption(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </template>
          </draggable>

          <el-button
            type="primary"
            plain
            @click="addOption"
            class="add-option-btn"
          >
            <el-icon><Plus /></el-icon> 添加选项
          </el-button>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveQuestion">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 问题预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="问题预览" width="50%">
      <div class="question-preview">
        <h3 class="preview-title">
          {{ previewQuestion.title }}
          <el-tag size="small" v-if="previewQuestion.required" type="danger"
            >必填</el-tag
          >
        </h3>

        <!-- 单选题预览 -->
        <template v-if="previewQuestion.type === 'radio'">
          <el-radio-group v-model="previewAnswer">
            <div
              v-for="(option, index) in previewQuestion.options"
              :key="index"
              class="preview-option"
            >
              <el-radio :label="option.label" :value="option.value"
                >{{ option.label }}
                <span v-if="option.value !== undefined" class="option-value"
                  >({{ option.value }}分)</span
                ></el-radio
              >
            </div>
          </el-radio-group>
        </template>

        <!-- 多选题预览 -->
        <template v-else-if="previewQuestion.type === 'checkbox'">
          <el-checkbox-group v-model="previewAnswerMulti">
            <div
              v-for="(option, index) in previewQuestion.options"
              :key="index"
              class="preview-option"
            >
              <el-checkbox :label="option.label" :value="option.value"
                >{{ option.label }}
                <span v-if="option.value !== undefined" class="option-value"
                  >({{ option.value }}分)</span
                ></el-checkbox
              >
            </div>
          </el-checkbox-group>
        </template>

        <!-- 文本题预览 -->
        <template v-else-if="previewQuestion.type === 'text'">
          <el-input
            v-model="previewAnswerText"
            type="textarea"
            :rows="4"
            placeholder="请输入您的回答"
          ></el-input>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSurveyQuestionList,
  createQuestion,
  updateQuestion,
  getQuestionDetail,
} from "@/api/question";
import draggable from "vuedraggable";
import { useRoute } from "vue-router";
import { IMG_HOST } from "@/constants";

import { forEach as _forEach } from "lodash-es";

// 拖拽状态
const drag = ref(false);

// 路由参数
const route = useRoute();
const surveyId = route.params.id;

// 问题列表数据
const questions = ref([]);

// 搜索关键字
const searchKeyword = ref("");

// 类型筛选
const typeFilter = ref("");

// 分页信息
const page = reactive({
  current: 1,
  size: 10,
  total: 0,
});

// 对话框显示状态
const dialogVisible = ref(false);
const previewDialogVisible = ref(false);

// 预览问题
const previewQuestion = ref({});
const previewAnswer = ref("");
const previewAnswerMulti = ref([]);
const previewAnswerText = ref("");

// 编辑状态标记
const isEdit = ref(false);
const currentIndex = ref(-1);

// 当前编辑的问题
const currentQuestion = reactive({
  id: "",
  title: "",
  content: "",
  type: "radio",
  required: true,
  price: 0,
  img: [],
  options: [],
});

// 表单校验规则
const rules = {
  title: [{ required: true, message: "请输入问题标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择问题类型", trigger: "change" }],
};

// 表单引用
const questionForm = ref(null);

// 过滤后的问题列表（现在由后端处理）
const filteredQuestions = computed(() => {
  return questions.value;
});

// 分页后的问题列表（直接使用后端返回的数据）
const paginatedQuestions = computed(() => {
  return questions.value;
});

const hashMap = computed(() => {
  const mapData = {};
  _forEach(currentQuestion.options, (item) => {
    if (item.hash) {
      mapData[item.hash] = true;
    }
  });
  return mapData;
});

// 初始化加载数据
onMounted(async () => {
  await fetchQuestions();
});

// 搜索处理
const handleSearch = () => {
  page.current = 1;
  fetchQuestions();
};

// 分页大小变化
const handleSizeChange = (val) => {
  page.size = val;
  page.current = 1;
  fetchQuestions();
};

// 当前页变化
const handleCurrentChange = (val) => {
  page.current = val;
  fetchQuestions();
};

// 获取问题列表
const fetchQuestions = async (params = {}) => {
  try {
    // 合并分页参数
    const queryParams = {
      surveyId: surveyId,
      current: page.current,
      size: page.size,
      title: searchKeyword.value,
      type: typeFilter.value,
      ...params,
    };

    // 调用API获取数据
    const { records, total } = await getSurveyQuestionList(queryParams);

    // 更新表格数据和分页信息
    questions.value = records || [];
    page.total = total || 0;
  } catch (error) {
    console.error("获取问题列表失败:", error);
    ElMessage.error("获取问题列表失败");
  }
};

const getNewHash = () => {
  let random = getRandom();
  while (random in hashMap) {
    random = getRandom();
  }
  return random;
};
const getRandom = () => {
  return Math.random().toString().slice(-6);
};
// 添加问题
const addQuestion = () => {
  isEdit.value = false;
  currentIndex.value = -1;

  // 重置表单
  Object.assign(currentQuestion, {
    id: null,
    title: "",
    content: "", // 新增字段，用于存储问题内容
    type: "radio",
    required: true,
    price: 0,
    img: "",
    options: [
      { label: "选项1", value: 0 },
      { label: "选项2", value: 0 },
    ],
  });

  dialogVisible.value = true;

  // 重置表单验证
  nextTick(() => {
    questionForm.value?.resetFields();
  });
};

// 编辑问题
const editQuestion = async (question) => {
  isEdit.value = true;
  currentIndex.value = -1;

  try {
    // 先根据ID查询最新的问题详情
    const detailData = await getQuestionDetail(question.id);

    // 复制问题数据到当前编辑的问题
    Object.assign(currentQuestion, JSON.parse(JSON.stringify(detailData)));

    // 确保选项数组存在
    if (
      !currentQuestion.options &&
      (currentQuestion.type === "radio" || currentQuestion.type === "checkbox")
    ) {
      currentQuestion.options = [];
    }

    dialogVisible.value = true;

    // 重置表单验证
    nextTick(() => {
      questionForm.value?.clearValidate();
    });
  } catch (error) {
    console.error("获取问题详情失败:", error);
    ElMessage.error("获取问题详情失败");
  }
};

const handleUploadSuccess = (response, file, fileList) => {
  console.log("上传成功", response, file, fileList);
  currentQuestion.img = IMG_HOST + response.data.url;
};

// 预览问题
const showQuestionPreview = async (question) => {
  try {
    // 先根据ID查询最新的问题详情
    const detailData = await getQuestionDetail(question.id);

    previewQuestion.value = JSON.parse(JSON.stringify(detailData));
    previewAnswer.value = "";
    previewAnswerMulti.value = [];
    previewAnswerText.value = "";
    previewDialogVisible.value = true;
  } catch (error) {
    console.error("获取问题详情失败:", error);
    ElMessage.error("获取问题详情失败");
  }
};

// 删除问题
const removeQuestion = (id) => {
  ElMessageBox.confirm("确定要删除该问题吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 这里应该调用删除API
      // await deleteQuestion(id)

      // 删除成功后重新加载数据
      await fetchQuestions();
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

// 保存问题
const saveQuestion = () => {
  questionForm.value?.validate(async (valid) => {
    if (valid) {
      // 检查选项
      if (
        (currentQuestion.type === "radio" ||
          currentQuestion.type === "checkbox") &&
        (!currentQuestion.options || currentQuestion.options.length < 2)
      ) {
        return ElMessage.warning("请至少添加两个选项");
      }

      const questionData = JSON.parse(JSON.stringify(currentQuestion));
      // 处理图片上传
      if (questionData.img && questionData.img.length > 0) {
        questionData.img = questionData.img.map((img) => img.url).join(",");
      }
      questionData.options = questionData.options.map((option, index) => ({
        ...option,
        sortOrder: index + 1,
      }));

      questionData.surveyId = surveyId;
      try {
        if (isEdit.value) {
          // 编辑模式 - 调用更新API
          await updateQuestion(questionData.id, questionData);
        } else {
          // 添加模式 - 调用添加API
          await createQuestion(questionData);
        }

        // 操作成功后重新加载数据
        await fetchQuestions();
        dialogVisible.value = false;
        ElMessage.success(isEdit.value ? "更新成功" : "添加成功");
      } catch (error) {
        console.error(isEdit.value ? "更新问题失败:" : "添加问题失败:", error);
        ElMessage.error(isEdit.value ? "更新失败" : "添加失败");
      }
    }
  });
};

// 问题类型变更处理
const handleTypeChange = (type) => {
  if (type === "radio" || type === "checkbox") {
    // 如果是单选或多选，确保有选项
    if (!currentQuestion.options || currentQuestion.options.length === 0) {
      currentQuestion.options = [
        { label: "选项1", value: 0 },
        { label: "选项2", value: 0 },
      ];
    }
  } else {
    // 如果是文本题，清空选项
    currentQuestion.options = [];
  }
};

// 添加选项
const addOption = () => {
  if (!currentQuestion.options) {
    currentQuestion.options = [];
  }

  currentQuestion.options.push({
    label: `选项${currentQuestion.options.length + 1}`,
    value: 0, // 默认分值为0,
  });
};

// 删除选项
const removeOption = (index) => {
  if (currentQuestion.options.length <= 2) {
    return ElMessage.warning("至少保留两个选项");
  }

  currentQuestion.options.splice(index, 1);
};

// 获取问题类型名称
const getQuestionTypeName = (type) => {
  const typeMap = {
    radio: "单选题",
    checkbox: "多选题",
    text: "文本题",
  };
  return typeMap[type] || type;
};

// 获取问题类型标签样式
const getQuestionTypeTag = (type) => {
  const typeMap = {
    radio: "",
    checkbox: "success",
    text: "info",
  };
  return typeMap[type] || "";
};
</script>

<style scoped>
::v-deep .avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

::v-deep .avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

::v-deep .el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
.question-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.type-filter {
  width: 150px;
}

.question-list-card {
  margin-bottom: 20px;
}

.question-list {
  margin-bottom: 20px;
}

.question-item {
  border-bottom: 1px solid #ebeef5;
  padding: 15px 0;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.question-index {
  font-weight: bold;
  margin-right: 15px;
  min-width: 25px;
  color: #409eff;
}

.question-title {
  flex: 1;
  font-weight: 500;
  margin-right: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-type {
  margin-right: 10px;
}

.question-required {
  margin-right: 15px;
}

.question-actions {
  display: flex;
  gap: 10px;
}

.question-item-content {
  padding-left: 40px;
  color: #606266;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.option-item {
  margin-bottom: 10px;
}

.option-index {
  margin-right: 5px;
  color: #909399;
}

.option-label {
  color: #606266;
}

.option-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-option-btn {
  margin-top: 10px;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.preview-title {
  margin-bottom: 20px;
  font-weight: 500;
}

.preview-option {
  margin-bottom: 15px;
}

.option-value {
  color: #ff9900;
  font-size: 0.9em;
  margin-left: 5px;
}

/* 拖拽相关样式 */
.drag-handle {
  cursor: move;
  color: #909399;
  margin-top: 10px;
}

.cursor-move {
  cursor: move;
}

.ghost-option {
  opacity: 0.5;
  background: #c8ebfb;
  border: 1px dashed #409eff;
}
</style>
