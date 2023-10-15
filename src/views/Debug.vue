<template>
  <div class="debug-view">
    <div class="debug-info">
      <el-Tag>Node调试端口:{{ taskInfo?.nodePort }}</el-Tag>
      <el-tag>Web调试端口:{{ taskInfo?.windowPort }}</el-tag>
      <el-tooltip>
        <template #content>
          <p class="path">{{ decodeURIComponent(path) }}</p>
        </template>
        <el-link size="small" @click="handlOpenStarter">打开启动路径</el-link>
      </el-tooltip>
      <el-link @click="progressLogVisible = true">查看主进程日志</el-link>
    </div>
    <div class="main-pannel">
      <el-table class="table-wrap" :data="inspectList" border>
        <el-table-column label="类型" width="100">
          <template #default="{ row }: { row: InspectItem }">
            <el-tag>{{ row.type.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="标题"
          prop="title"
          width="300"
        ></el-table-column>
        <el-table-column
          label="URL"
          prop="url"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }: { row: InspectItem }">
            <el-link type="primary" class="action" @click="handleOpen(row)"
              >调试</el-link
            >
          </template>
        </el-table-column>
        <template #empty>
          <p>暂无数据</p>
        </template>
      </el-table>
      <!-- <pre>{{ log }}</pre> -->
    </div>
  </div>

  <el-dialog
    v-model="progressLogVisible"
    append-to-body
    fullscreen
    title="主进程日志"
  >
    <div class="pre-log">
      <pre>{{ log }}</pre>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { AppInfo, Task, InspectItem } from "../../types";
import { onMounted, onBeforeUnmount, ref } from "vue";
import {
  ElTable,
  ElTableColumn,
  ElTag,
  ElLink,
  ElTooltip,
  ElDialog,
} from "element-plus";
import { requestInspects } from "@/service/index";

interface Props {
  path: string;
  viewId: string;
}
const props = defineProps<Props>();
const taskInfo = ref<Task>();
const inspectList = ref<InspectItem[]>([]);
const progressLogVisible = ref<boolean>(false);

const log = ref("");
window.EApi.updateLog((message) => (log.value += `${message}\n`));

const handleOpen = (inspect: InspectItem) => {
  window.EApi.openUrl(inspect.devtoolsFrontendUrl);
};

const handlOpenStarter = () => {
  const dir = decodeURIComponent(props.path);
  window.EApi.shellOpenPath(dir);
};

const loadInspects = (windowPort: number, nodePort: number): Function => {
  const request = async () => {
    const [list1 = [], list2 = []] = await Promise.all([
      requestInspects(windowPort),
      requestInspects(nodePort),
    ]);
    const data = list1.concat(list2);
    data.forEach((item) => {
      item.devtoolsFrontendUrl = item.devtoolsFrontendUrl
        .replace(/^\/devtools/, "devtools://devtools/bundled")
        .replace(/^chrome-devtools:\/\//, "devtools://");
    });
    inspectList.value = data;
  };
  const timer = setInterval(request, 1000);
  return function stopLoad() {
    timer && clearInterval(timer);
  };
};

onMounted(async () => {
  const filePath = decodeURIComponent(props.path);
  const info: AppInfo = await window.EApi.getAppInfo(filePath);
  const task: Task = await window.EApi.createTask(info, props.viewId);
  taskInfo.value = task;

  const { windowPort, nodePort } = task;
  const clear = loadInspects(windowPort!, nodePort!);
  window.EApi.updateLog((msg) => {
    if (msg === "[ERD] STOP") {
      clear();
    }
  });
  onBeforeUnmount(() => clear());
});
</script>

<style lang="scss" scoped>
.debug-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  .debug-info {
    padding: 10px;
    box-sizing: border-box;
    & > * {
      margin-right: 8px;
    }
  }
  .main-pannel {
    flex: 1;
    height: 0;
  }
}
.pre-log {
  max-height: 80vh;
  overflow: auto;
}
</style>
