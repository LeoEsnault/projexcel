import { createRouter, createWebHistory } from 'vue-router'
import CsvFiltrePage from '../views/CsvFiltrePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CsvFiltrePage,
    },
  ],
})

export default router
