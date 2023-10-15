<template>
  <div class="home-page">
    <div class="picker">
      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        drag
        :on-change="handleChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将应用启动文件拖放到这里或者点击这里选择应用启动文件
        </div>
      </el-upload>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElUpload, ElIcon, type UploadFile } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

async function handleChange(file: UploadFile) {
  const path = file.raw?.path || "";
  router.push({
    path: "/debug",
    query: {
      ...route.query,
      path: encodeURIComponent(path),
    },
  });
}
</script>

<style lang="scss" scoped>
.home-page {
  height: 100vh;
}
.picker {
  width: 600px;
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
  border: 1px solid var(--main-color);
  border-radius: 5px;
}
</style>
