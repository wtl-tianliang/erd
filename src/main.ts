import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { createPinia } from "pinia";
import i18n from "./i18n/index";
import "./style.scss";
import App from "./App.vue";

const pinia = createPinia();
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: () => import("./views/Home.vue") },
    {
      path: "/debug",
      component: () => import("./views/Debug.vue"),
      props: (route) => {
        return {
          path: route.query.path,
          viewId: route.query.viewId,
        };
      },
    },
    { path: "/views", component: () => import("./views/TabManager.vue") },
  ],
});

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);

app
  .mount("#app")
  .$nextTick(() => postMessage({ payload: "removeLoading" }, "*"));
