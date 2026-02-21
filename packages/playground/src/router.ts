import { createRouter, createWebHistory } from 'vue-router'

export const routeNames = {
  auto: 'auto',
  manual: 'manual',
  routeSync: 'routeSync',
  config: 'config',
} as const

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: routeNames.auto } },
    {
      path: '/auto',
      name: routeNames.auto,
      component: () => import('./pages/auto-crud-page.vue'),
    },
    {
      path: '/route-sync',
      name: routeNames.routeSync,
      component: () => import('./pages/route-sync-page.vue'),
    },
  ],
})
