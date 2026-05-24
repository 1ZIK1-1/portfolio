<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_ACHIEVEMENTS, MOCK_USER_STUDENT as MOCK_USER } from '@/services/authStore'

const achievements = ref([])
const isLoading = ref(true)

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    achievements.value = MOCK_ACHIEVEMENTS
    isLoading.value = false
  }, 300)
})

const stats = computed(() => ({
  total: achievements.value.length,
  approved: achievements.value.filter(a => a.status === 'approved').length,
  pending: achievements.value.filter(a => a.status === 'pending').length,
  moodle: achievements.value.filter(a => a.source === 'moodle').length
}))

const categoryStats = computed(() => {
  const cats = {}
  achievements.value.forEach(a => {
    cats[a.category] = (cats[a.category] || 0) + 1
  })
  return Object.entries(cats).map(([name, count]) => ({ name, count }))
})

const allSkills = computed(() => {
  const skillMap = {}
  achievements.value.forEach(a => {
    a.skills.forEach(s => {
      skillMap[s] = (skillMap[s] || 0) + 1
    })
  })
  return Object.entries(skillMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const recentAchievements = computed(() => {
  return [...achievements.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4)
})

function getStatusLabel(status) {
  const labels = { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }
  return labels[status] || status
}

function getStatusClass(status) {
  return `status-${status}`
}

function getTypeIcon(type) {
  const icons = {
    science: '🔬',
    education: '📚',
    social: '🤝',
    sport: '⚽',
    creative: '🎨'
  }
  return icons[type] || '📌'
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Личный кабинет студента</h1>
        <p class="subtitle">{{ MOCK_USER.name }} • {{ MOCK_USER.group }} • {{ MOCK_USER.institute }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/achievements" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Добавить достижение
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <template v-else>
      <!-- Stats Widget -->
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
            <span class="stat-label">Всего достижений</span>
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

        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">На проверке</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon moodle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
              <path d="M8 7h8M8 11h6M8 15h4" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.moodle }}</span>
            <span class="stat-label">Из Moodle</span>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">
        <!-- Category Chart -->
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
                  <div
                    class="category-bar-fill"
                    :style="{ width: (cat.count / Math.max(...categoryStats.map(c => c.count)) * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills Cloud -->
        <div class="card">
          <div class="card-header">
            <h2>Облако навыков</h2>
          </div>
          <div class="card-body">
            <div class="skills-cloud">
              <span
                v-for="skill in allSkills"
                :key="skill.name"
                class="skill-tag"
                :style="{
                  fontSize: Math.max(12, Math.min(24, 12 + skill.count * 4)) + 'px',
                  opacity: Math.max(0.5, Math.min(1, 0.4 + skill.count * 0.2))
                }"
              >
                {{ skill.name }}
              </span>
              <p v-if="allSkills.length === 0" class="empty-text">Навыки пока не добавлены</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h2>Последние действия</h2>
          <router-link to="/achievements" class="card-link">Все достижения</router-link>
        </div>
        <div class="card-body">
          <div class="activity-list">
            <div v-for="item in recentAchievements" :key="item.id" class="activity-item">
              <div class="activity-icon">{{ getTypeIcon(item.type) }}</div>
              <div class="activity-content">
                <div class="activity-title">{{ item.title }}</div>
                <div class="activity-meta">
                  <span class="activity-category">{{ item.category }}</span>
                  <span class="activity-source" v-if="item.source === 'moodle'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                    </svg>
                    Moodle
                  </span>
                  <span :class="getStatusClass(item.status)">{{ getStatusLabel(item.status) }}</span>
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
.dashboard {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover {
  background: #3651d4;
  transform: translateY(-1px);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #4361ee;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.total { background: #eef0ff; color: #4361ee; }
.stat-icon.approved { background: #f0fdf4; color: #16a34a; }
.stat-icon.pending { background: #fffbeb; color: #d97706; }
.stat-icon.moodle { background: #f0f4ff; color: #2563eb; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.card-link {
  font-size: 13px;
  color: #4361ee;
  text-decoration: none;
  font-weight: 500;
}

.card-body {
  padding: 20px 24px;
}

/* Category Bars */
.category-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.category-bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #374151;
}

.category-bar-count {
  font-weight: 600;
  color: #4361ee;
}

.category-bar-track {
  height: 8px;
  background: #f0f0f5;
  border-radius: 4px;
  overflow: hidden;
}

.category-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #667eea);
  border-radius: 4px;
  transition: width 0.8s ease;
}

/* Skills Cloud */
.skills-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 100px;
}

.skill-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #eef0ff;
  color: #4361ee;
  border-radius: 20px;
  font-weight: 500;
  transition: transform 0.2s;
  cursor: default;
}

.skill-tag:hover {
  transform: scale(1.05);
}

.empty-text {
  color: #9ca3af;
  font-size: 14px;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
}

.activity-category {
  color: #6b7280;
}

.activity-source {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #2563eb;
}

.status-approved { color: #16a34a; font-weight: 500; }
.status-pending { color: #d97706; font-weight: 500; }
.status-rejected { color: #dc2626; font-weight: 500; }

.activity-date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}
</style>