import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  // Student routes
  {
    path: '/',
    component: () => import('@/views/StudentLayout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/views/AchievementsView.vue')
      },
      {
        path: 'portfolio',
        name: 'PortfolioBuilder',
        component: () => import('@/views/PortfolioBuilderView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue')
      }
    ]
  },
  // Teacher routes
  {
    path: '/teacher',
    component: () => import('@/views/TeacherLayout.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    redirect: '/teacher/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('@/views/TeacherDashboardView.vue')
      },
      {
        path: 'achievements',
        name: 'TeacherAchievements',
        component: () => import('@/views/TeacherAchievementsView.vue')
      },
      {
        path: 'verification',
        name: 'Verification',
        component: () => import('@/views/VerificationView.vue')
      },
      {
        path: 'attestation',
        name: 'AttestationWizard',
        component: () => import('@/views/AttestationWizardView.vue')
      },
      {
        path: 'portfolio',
        name: 'TeacherPortfolioBuilder',
        component: () => import('@/views/TeacherPortfolioView.vue')
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('@/views/TeacherProfileView.vue')
      }
    ]
  },
  // Admin routes
  {
    path: '/admin',
    component: () => import('@/views/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/AdminDashboardView.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/AdminUsersView.vue')
      },
      {
        path: 'moderation',
        name: 'AdminModeration',
        component: () => import('@/views/AdminModerationView.vue')
      },
      {
        path: 'templates',
        name: 'AdminTemplates',
        component: () => import('@/views/AdminTemplatesView.vue')
      },
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: () => import('@/views/AdminAnalyticsView.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/AdminSettingsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('portfolio_user') || 'null')
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    if (user.role === 'teacher') {
      next('/teacher/dashboard')
    } else if (user.role === 'admin') {
      next('/admin/dashboard')
    } else {
      next('/dashboard')
    }
  } else if (to.meta.role && user && user.role !== to.meta.role) {
    // Redirect to correct role's dashboard
    if (user.role === 'teacher') {
      next('/teacher/dashboard')
    } else if (user.role === 'admin') {
      next('/admin/dashboard')
    } else {
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router