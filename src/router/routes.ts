import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "week",
        component: () => import("../pages/TacticsDashboard.vue")
      },
      {
        path: "today",
        name: "today",
        component: () => import("../pages/TodayView.vue")
      },
      {
        path: "calendar",
        name: "calendar",
        component: () => import("../pages/CalendarView.vue")
      },
      {
        path: "clan",
        name: "clan",
        component: () => import("../pages/ClanHealthView.vue")
      }
    ]
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("../pages/AuthView.vue")
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("../pages/ErrorNotFound.vue")
  }
];

export default routes;
