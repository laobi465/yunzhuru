import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/config',
        },
        {
          path: 'config',
          name: 'Config',
          component: () => import('../views/Config.vue'),
        },
        {
          path: 'login',
          name: 'Login',
          component: () => import('../views/Login.vue'),
        },
        {
          path: 'cloud-vars',
          name: 'CloudVars',
          component: () => import('../views/CloudVars.vue'),
        },
        {
          path: 'heartbeat',
          name: 'Heartbeat',
          component: () => import('../views/Heartbeat.vue'),
        },
        {
          path: 'notice',
          name: 'Notice',
          component: () => import('../views/Notice.vue'),
        },
        {
          path: 'logs',
          name: 'Logs',
          component: () => import('../views/Logs.vue'),
        },
      ],
    },
  ],
});

export default router;