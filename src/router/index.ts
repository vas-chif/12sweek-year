import { defineRouter } from "#q-app";
import routes from "./routes";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";

import { useAuthStore } from "@/stores/authStore";

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  });

  Router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthReady) {
      await authStore.initAuth();
    }

    const isAuthRoute = to.path === "/auth";

    // Se l'utente non è autenticato oppure la postazione è bloccata
    if (!authStore.isAuthenticated || authStore.isLocked) {
      if (!isAuthRoute) {
        next({ path: "/auth" });
        return;
      }
    } else if (isAuthRoute) {
      // Se già loggato e sbloccato, reindirizza alla dashboard
      next({ path: "/" });
      return;
    }

    next();
  });

  return Router;
});
