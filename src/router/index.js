import {createRouter, createWebHashHistory} from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'survey',
        name: 'Survey',
        component: () => import('../views/survey/index.vue'),
        meta: { title: '问卷管理', icon: 'Document' }
      },
      {
        path: 'survey-category',
        name: 'SurveyCategory',
        component: () => import('../views/survey-category/index.vue'),
        meta: { title: '问卷分类', icon: 'Folder' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../views/error/404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫 - 简化版，仅做基本登录验证
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'BetterU管理系统'

  // 判断是否需要登录
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
