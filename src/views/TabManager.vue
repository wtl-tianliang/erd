<template>
  <div class="views">
    <template v-for="viewInfo in views" :key="viewInfo.viewId">
      <div
        class="view-item"
        :class="{ active: acitvedView === viewInfo.viewId }"
        @click="active(viewInfo.viewId)"
      >
        <img :src="viewInfo.icon || defaultIcon" class="icon" />
        <div class="name">
          {{ viewInfo.title || "未启动应用" }}
        </div>
      </div>
    </template>
    <div class="view-item create" @click="createTab">
      <el-icon><DocumentAdd /></el-icon>
      <span>新建</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Task } from "../../types";
import { ref } from "vue";
import defaultIcon from "@/assets/app.png";
import { ElIcon } from "element-plus";
import { DocumentAdd } from "@element-plus/icons-vue";

const views = ref<Task[]>([]);
const acitvedView = ref<string>("");

window.EApi.updateTask((tasks) => {
  views.value = tasks;
  if (tasks.length < 1) {
    createTab();
  }
});

const active = (viewId: string) => {
  acitvedView.value = viewId;
  window.EApi.activeView(viewId);
};

const createTab = async () => {
  const info = await window.EApi.openNewView();
  views.value.push(info);
  active(info.viewId);
};

createTab();
</script>

<style lang="scss" scoped>
.views {
  display: flex;
  box-sizing: border-box;
  border-bottom: 1px solid var(--main-color);
  .view-item {
    height: 39px;
    width: 130px;
    text-align: center;
    border-right: 1px solid var(--main-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &.active {
      color: var(--main-color);
      font-weight: bold;
      position: relative;
      &::after {
        content: " ";
        position: absolute;
        bottom: -1px;
        height: 1px;
        background-color: #fff;
        left: 0;
        right: 0;
        display: block;
      }
    }
    .icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 6px;
    }
  }
  .create {
    span {
      margin-left: 10px;
    }
  }
}
</style>
