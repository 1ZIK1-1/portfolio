<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/services/authStore'
import { useAchievementStore } from '@/services/achievementStore'

const router = useRouter()
const route = useRoute()
const { state, logout } = useAuth()
const achievementStore = useAchievementStore()

const isSidebarCollapsed = ref(false)

const user = computed(() => state.user)

const navItems = [
  { path: '/teacher/dashboard', label: 'Дашборд', icon: 'dashboard' },
  { path: '/teacher/achievements', label: 'Мои достижения', icon: 'achievements' },
  { path: '/teacher/verification', label: 'Верификация', icon: 'verification', badge: 'pendingCount' },
  { path: '/teacher/attestation', label: 'Аттестация', icon: 'attestation' },
  { path: '/teacher/portfolio', label: 'Портфолио', icon: 'portfolio' },
  { path: '/teacher/profile', label: 'Профиль', icon: 'profile' }
]

const pendingCount = computed(() => {
  return achievementStore.getPendingCount()
})

function isActive(path) {
  return route.path === path
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout" :class="{ collapsed: isSidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/logo_min.png" alt="Логотип" width="32" height="32" class="logo-img" />
          <span class="sidebar-title">Портфолио</span>
        </div>
        <button class="collapse-btn" @click="isSidebarCollapsed = !isSidebarCollapsed">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!isSidebarCollapsed" d="m15 18-6-6 6-6" />
            <path v-else d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="sidebar-role-badge">Преподаватель</div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <template v-if="item.icon === 'dashboard'">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </template>
            <template v-else-if="item.icon === 'achievements'">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7v.5" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7v.5" />
              <path d="M12 22v-8" />
              <path d="M10 14h4v4h-4Z" />
              <path d="M8 9h8l-1 7H9Z" />
              <path d="M4 14h6" />
              <path d="M14 14h6" />
            </template>
            <template v-else-if="item.icon === 'verification'">
              <path d="M9 12l2 2 4-4" />
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            </template>
            <template v-else-if="item.icon === 'attestation'">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </template>
            <template v-else-if="item.icon === 'portfolio'">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
              <path d="M8 7h8M8 11h6M8 15h4" />
            </template>
            <template v-else-if="item.icon === 'profile'">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </template>
          </svg>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge === 'pendingCount' && pendingCount > 0" class="nav-badge">{{ pendingCount }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="user?.avatar" :src="user.avatar" :alt="user.name" class="avatar-img-side" />
            <span v-else>{{ user?.name?.charAt(0) || 'П' }}</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ user?.name?.split(' ').slice(0, 2).join(' ') || 'Преподаватель' }}</span>
            <span class="user-role">{{ user?.position || 'Преподаватель' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Выйти">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6f9;
}

.sidebar {
  width: 260px;
  background: #1a1a2e;
  color: #a0aec0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.collapsed .sidebar {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
}

.logo-img {
  border-radius: 6px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-role-badge {
  margin: 8px 16px;
  padding: 4px 10px;
  background: rgba(67, 97, 238, 0.2);
  color: #818cf8;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

.collapsed .sidebar-title,
.collapsed .nav-label,
.collapsed .user-details,
.collapsed .sidebar-role-badge {
  display: none;
}

.collapse-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #e2e8f0;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 10px;
  color: #a0aec0;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.nav-item.active {
  background: #4361ee;
  color: white;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
}

.nav-badge {
  margin-left: auto;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #4361ee;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;
}
.avatar-img-side { width: 100%; height: 100%; object-fit: cover; }

.user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: #a0aec0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 24px 32px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.collapsed .main-content {
  margin-left: 64px;
}
</style>