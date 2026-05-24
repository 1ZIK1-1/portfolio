<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_TEACHER_ACHIEVEMENTS, MOCK_USER_TEACHER } from '@/services/authStore'
import { useAchievementStore } from '@/services/achievementStore'

const achievementStore = useAchievementStore()

const achievements = ref([])
const studentPending = ref([])
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    achievements.value = MOCK_TEACHER_ACHIEVEMENTS
    // Берём достижения студентов из общего store
    studentPending.value = achievementStore.getPending()
    isLoading.value = false
  }, 300)
})

const stats = computed(() => ({
  total: achievements.value.length,
  approved: achievements.value.filter(a => a.status === 'approved').length,
  pending: achievements.value.filter(a => a.status === 'pending').length,
  moodle: achievements.value.filter(a => a.source === 'moodle').length,
  cdo: achievements.value.filter(a => a.source === 'cdo').length,
  studentsToVerify: studentPending.value.length
}))

const categoryStats = computed(() => {
  const cats = {}
  achievements.value.forEach(a => {
    cats[a.category] = (cats[a.category] || 0) + 1
  })
  return Object.entries(cats).map(([name, count]) => ({ name, count }))
})

function getTypeIcon(type) {
  const icons = { science: '🔬', education: '📚', social: '🤝', sport: '⚽', creative: '🎨' }
  return icons[type] || '📌'
}

function getStatusLabel(status) {
  return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[status] || status
}
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>Личный кабинет преподавателя</h1>
        <p class="subtitle">{{ MOCK_USER_TEACHER.name }} • {{ MOCK_USER_TEACHER.department }} • {{ MOCK_USER_TEACHER.position }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/teacher/verification" class="btn btn-warning" v-if="stats.studentsToVerify > 0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          </svg>
          На проверке: {{ stats.studentsToVerify }}
        </router-link>
        <router-link to="/teacher/attestation" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Аттестационный отчёт
        </router-link>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <template v-else>
      <!-- Stats Widgets -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7v.5" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7v.5" />
              <path d="M12 22v-8" />
              <path d="M10 14h4v4h-4Z" />
              <path d="M8 9h8l-1 7H9Z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Мои достижения</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon approved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.approved }}</span>
            <span class="stat-label">Подтверждено</span>
          </div>
        </div>

        <div class="stat-card highlight" @click="$router.push('/teacher/verification')">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.studentsToVerify }}</span>
            <span class="stat-label">Студентов на проверке</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon moodle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 6v7" />
              <path d="M9 9l3-3 3 3" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.moodle + stats.cdo }}</span>
            <span class="stat-label">Из Moodle/ЦДО</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Categories -->
        <div class="card">
          <div class="card-header">
            <h2>Достижения по категориям</h2>
          </div>
          <div class="card-body">
            <div class="category-bars">
              <div v-for="cat in categoryStats" :key="cat.name" class="category-bar-item">
                <div class="category-bar-label">
                  <span>{{ cat.name }}</span>
                  <span class="category-bar-count">{{ cat.count }}</span>
                </div>
                <div class="category-bar-track">
                  <div class="category-bar-fill" :style="{ width: (cat.count / Math.max(...categoryStats.map(c => c.count)) * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Queue -->
        <div class="card">
          <div class="card-header">
            <h2>Очередь на модерацию</h2>
            <router-link to="/teacher/verification" class="card-link">Все →</router-link>
          </div>
          <div class="card-body">
            <div v-if="studentPending.length === 0" class="empty-state">
              <p>Нет достижений на проверке</p>
            </div>
            <div v-else class="verification-list">
              <div v-for="item in studentPending.slice(0, 4)" :key="item.id" class="verification-item">
                <div class="verification-user">
                  <div class="user-avatar-small">{{ item.user_name.charAt(0) }}</div>
                  <div class="verification-info">
                    <span class="verification-title">{{ item.title }}</span>
                    <span class="verification-student">{{ item.user_name }} • {{ item.user_group }}</span>
                  </div>
                </div>
                <router-link to="/teacher/verification" class="btn btn-ghost-sm">Проверить</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h2>Последние достижения</h2>
          <router-link to="/teacher/achievements" class="card-link">Все достижения</router-link>
        </div>
        <div class="card-body">
          <div class="activity-list">
            <div v-for="item in achievements.slice(0, 5)" :key="item.id" class="activity-item">
              <div class="activity-icon">{{ getTypeIcon(item.type) }}</div>
              <div class="activity-content">
                <div class="activity-title">{{ item.title }}</div>
                <div class="activity-meta">
                  <span class="activity-category">{{ item.category }}</span>
                  <span v-if="item.source === 'moodle'" class="activity-source">Moodle</span>
                  <span v-if="item.source === 'cdo'" class="activity-source cdo">ЦДО</span>
                  <span :class="'status-' + item.status">{{ getStatusLabel(item.status) }}</span>
                </div>
              </div>
              <div class="activity-date">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;
}
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 8px; }

.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
  text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
}
.btn-primary { background: #4361ee; color: white; }
.btn-primary:hover { background: #3651d4; }
.btn-warning { background: #d97706; color: white; }
.btn-warning:hover { background: #b45309; }

.btn-ghost-sm {
  background: transparent; color: #4361ee; border: none; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; padding: 6px 12px; border-radius: 6px; font-weight: 500;
  text-decoration: none;
}
.btn-ghost-sm:hover { background: #eef0ff; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee;
  border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: white; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  cursor: default;
}
.stat-card.highlight { cursor: pointer; }
.stat-card.highlight:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon.total { background: #eef0ff; color: #4361ee; }
.stat-icon.approved { background: #f0fdf4; color: #16a34a; }
.stat-icon.pending { background: #fffbeb; color: #d97706; }
.stat-icon.moodle { background: #f0f4ff; color: #2563eb; }
.stat-content { display: flex; flex-direction: column; }
.stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; line-height: 1; }
.stat-label { font-size: 13px; color: #6b7280; margin-top: 4px; }

.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.card { background: white; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
.card-header {
  padding: 18px 24px; border-bottom: 1px solid #f0f0f0;
  display: flex; align-items: center; justify-content: space-between;
}
.card-header h2 { font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0; }
.card-link { font-size: 13px; color: #4361ee; text-decoration: none; font-weight: 500; }
.card-body { padding: 20px 24px; }

.category-bars { display: flex; flex-direction: column; gap: 14px; }
.category-bar-item { display: flex; flex-direction: column; gap: 6px; }
.category-bar-label { display: flex; justify-content: space-between; font-size: 13px; color: #374151; }
.category-bar-count { font-weight: 600; color: #4361ee; }
.category-bar-track { height: 8px; background: #f0f0f5; border-radius: 4px; overflow: hidden; }
.category-bar-fill {
  height: 100%; background: linear-gradient(90deg, #4361ee, #667eea);
  border-radius: 4px; transition: width 0.8s ease;
}

.verification-list { display: flex; flex-direction: column; gap: 12px; }
.verification-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px; background: #f9fafb; border-radius: 10px;
}
.verification-user { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar-small {
  width: 32px; height: 32px; border-radius: 8px;
  background: #f0e68c; color: #8b6914;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px; flex-shrink: 0;
}
.verification-info { display: flex; flex-direction: column; min-width: 0; }
.verification-title { font-size: 13px; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.verification-student { font-size: 11px; color: #6b7280; }

.empty-state { text-align: center; color: #9ca3af; padding: 20px; }

.activity-list { display: flex; flex-direction: column; }
.activity-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
}
.activity-item:last-child { border-bottom: none; }
.activity-icon { font-size: 24px; width: 40px; text-align: center; flex-shrink: 0; }
.activity-content { flex: 1; min-width: 0; }
.activity-title { font-size: 14px; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.activity-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; }
.activity-category { color: #6b7280; }
.activity-source { display: inline-flex; align-items: center; gap: 3px; color: #2563eb; }
.activity-source.cdo { color: #7c3aed; }
.status-approved { color: #16a34a; font-weight: 500; }
.status-pending { color: #d97706; font-weight: 500; }
.status-rejected { color: #dc2626; font-weight: 500; }
.activity-date { font-size: 12px; color: #9ca3af; white-space: nowrap; }
</style>