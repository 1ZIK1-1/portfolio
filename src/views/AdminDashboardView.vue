<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_ALL_USERS } from '@/services/authStore'
import { useAchievementStore } from '@/services/achievementStore'

const achievementStore = useAchievementStore()
const stats = ref({ totalUsers: 0, activeUsers: 0, totalAchievements: 0, pendingVerification: 0, approvedToday: 0, newUsersThisMonth: 0 })
const recentActivity = ref([])
const isLoading = ref(true)

const usersByRole = computed(() => ({
  students: MOCK_ALL_USERS.filter(u => u.role === 'student').length,
  teachers: MOCK_ALL_USERS.filter(u => u.role === 'teacher').length,
  admins: MOCK_ALL_USERS.filter(u => u.role === 'admin').length
}))

const achievementsByStatus = computed(() => {
  const all = achievementStore.getAll()
  return { pending: all.filter(a => a.status === 'pending').length, approved: all.filter(a => a.status === 'approved').length, rejected: all.filter(a => a.status === 'rejected').length }
})

onMounted(() => {
  setTimeout(() => {
    const allAchievements = achievementStore.getAll()
    stats.value = { totalUsers: MOCK_ALL_USERS.length, activeUsers: MOCK_ALL_USERS.filter(u => u.status === 'active').length, totalAchievements: allAchievements.length, pendingVerification: allAchievements.filter(a => a.status === 'pending').length, approvedToday: 3, newUsersThisMonth: 2 }
    recentActivity.value = [
      { type: 'user', text: 'Новый пользователь: Кузнецова Анна Сергеевна', time: '2 часа назад' },
      { type: 'achievement', text: 'Загружено достижение "Диплом олимпиады"', time: '3 часа назад' },
      { type: 'verify', text: 'Преподаватель Петрова Е.В. подтвердила 2 достижения', time: '5 часов назад' },
      { type: 'user', text: 'Заблокирован пользователь Михайлов П.А.', time: '1 день назад' },
      { type: 'sync', text: 'Выполнена синхронизация с Moodle', time: '1 день назад' }
    ]
    isLoading.value = false
  }, 400)
})
</script>
<template>
  <div class="admin-dashboard">
    <div class="page-header"><div><h1>Дашборд системы</h1><p class="subtitle">Общая статистика электронного портфолио СахГУ</p></div><div class="header-actions"><div class="last-sync"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg><span>Синхронизация: сегодня в 14:30</span></div></div></div>
    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка данных...</p></div>
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon users"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-info"><div class="stat-value">{{ stats.totalUsers }}</div><div class="stat-label">Всего пользователей</div></div><div class="stat-change positive">+{{ stats.newUsersThisMonth }} за месяц</div></div>
        <div class="stat-card"><div class="stat-icon active"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="stat-info"><div class="stat-value">{{ stats.activeUsers }}</div><div class="stat-label">Активных пользователей</div></div><div class="stat-change positive">{{ Math.round(stats.activeUsers / stats.totalUsers * 100) }}% от всех</div></div>
        <div class="stat-card"><div class="stat-icon achievements"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg></div><div class="stat-info"><div class="stat-value">{{ stats.totalAchievements }}</div><div class="stat-label">Всего достижений</div></div><div class="stat-change positive">{{ achievementsByStatus.approved }} подтверждено</div></div>
        <div class="stat-card"><div class="stat-icon pending"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="stat-info"><div class="stat-value">{{ stats.pendingVerification }}</div><div class="stat-label">Ожидают проверки</div></div><div class="stat-change warning">Требуется внимание</div></div>
      </div>
      <div class="info-grid">
        <div class="info-card"><h3>Распределение по ролям</h3><div class="role-chart"><div class="role-bar"><div class="bar-students" :style="{ width: usersByRole.students / stats.totalUsers * 100 + '%' }"></div><div class="bar-teachers" :style="{ width: usersByRole.teachers / stats.totalUsers * 100 + '%' }"></div><div class="bar-admins" :style="{ width: usersByRole.admins / stats.totalUsers * 100 + '%' }"></div></div><div class="role-legend"><div class="legend-item"><span class="dot students"></span>Студенты: {{ usersByRole.students }}</div><div class="legend-item"><span class="dot teachers"></span>Преподаватели: {{ usersByRole.teachers }}</div><div class="legend-item"><span class="dot admins"></span>Администраторы: {{ usersByRole.admins }}</div></div></div></div>
        <div class="info-card"><h3>Статусы достижений</h3><div class="status-chart"><div class="status-row"><span class="status-label">На проверке</span><div class="status-bar-bg"><div class="status-bar-fill pending" :style="{ width: achievementsByStatus.pending/ Math.max(stats.totalAchievements,1)*100 + '%' }"></div></div><span class="status-count">{{ achievementsByStatus.pending }}</span></div><div class="status-row"><span class="status-label">Подтверждено</span><div class="status-bar-bg"><div class="status-bar-fill approved" :style="{ width: achievementsByStatus.approved/ Math.max(stats.totalAchievements,1)*100 + '%' }"></div></div><span class="status-count">{{ achievementsByStatus.approved }}</span></div><div class="status-row"><span class="status-label">Отклонено</span><div class="status-bar-bg"><div class="status-bar-fill rejected" :style="{ width: achievementsByStatus.rejected/ Math.max(stats.totalAchievements,1)*100 + '%' }"></div></div><span class="status-count">{{ achievementsByStatus.rejected }}</span></div></div></div>
        <div class="info-card activity-card"><h3>Последние события</h3><div class="activity-feed"><div v-for="(event, i) in recentActivity" :key="i" class="activity-item"><div class="activity-dot" :class="event.type"></div><div class="activity-content"><p>{{ event.text }}</p><span class="activity-time">{{ event.time }}</span></div></div></div></div>
      </div>
      <div class="quick-actions"><h3>Быстрые действия</h3><div class="actions-grid"><router-link to="/admin/users" class="action-card"><span class="action-icon">👥</span><span class="action-title">Управление пользователями</span><span class="action-desc">Добавление, блокировка, изменение ролей</span></router-link><router-link to="/admin/moderation" class="action-card"><span class="action-icon">🛡️</span><span class="action-title">Модерация контента</span><span class="action-desc">Проверка загруженных материалов</span></router-link><router-link to="/admin/settings" class="action-card"><span class="action-icon">⚙️</span><span class="action-title">Настройки системы</span><span class="action-desc">Интеграции, шаблоны, параметры</span></router-link><router-link to="/admin/analytics" class="action-card"><span class="action-icon">📈</span><span class="action-title">Аналитические отчёты</span><span class="action-desc">Сводная статистика по системе</span></router-link></div></div>
    </template>
  </div>
</template>
<style scoped>
.admin-dashboard { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }
.last-sync { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 8px 14px; border-radius: 8px; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.stat-icon.users { background: #eef2ff; color: #4361ee; }
.stat-icon.active { background: #f0fdf4; color: #16a34a; }
.stat-icon.achievements { background: #fef3c7; color: #d97706; }
.stat-icon.pending { background: #fef2f2; color: #dc2626; }
.stat-info { margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 800; color: #1a1a2e; line-height: 1; }
.stat-label { font-size: 13px; color: #6b7280; margin-top: 4px; }
.stat-change { font-size: 12px; font-weight: 500; }
.stat-change.positive { color: #16a34a; }
.stat-change.warning { color: #d97706; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .stats-grid { grid-template-columns: 1fr; } }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
@media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }
.info-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.info-card h3 { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 16px; }
.activity-card { grid-column: span 2; }
@media (max-width: 768px) { .activity-card { grid-column: span 1; } }
.role-bar { display: flex; height: 24px; border-radius: 12px; overflow: hidden; margin-bottom: 12px; background: #e5e7eb; }
.bar-students { background: #4361ee; transition: width 0.6s ease; }
.bar-teachers { background: #16a34a; transition: width 0.6s ease; }
.bar-admins { background: #d97706; transition: width 0.6s ease; }
.role-legend { display: flex; gap: 16px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.students { background: #4361ee; }
.dot.teachers { background: #16a34a; }
.dot.admins { background: #d97706; }
.status-chart { display: flex; flex-direction: column; gap: 12px; }
.status-row { display: flex; align-items: center; gap: 12px; }
.status-label { font-size: 13px; color: #6b7280; min-width: 120px; }
.status-bar-bg { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.status-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.status-bar-fill.pending { background: #d97706; }
.status-bar-fill.approved { background: #16a34a; }
.status-bar-fill.rejected { background: #dc2626; }
.status-count { font-size: 14px; font-weight: 700; color: #1a1a2e; min-width: 30px; text-align: right; }
.activity-feed { display: flex; flex-direction: column; }
.activity-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.activity-item:last-child { border-bottom: none; }
.activity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.activity-dot.user { background: #4361ee; }
.activity-dot.achievement { background: #d97706; }
.activity-dot.verify { background: #16a34a; }
.activity-dot.sync { background: #8b5cf6; }
.activity-content p { margin: 0; font-size: 13px; color: #374151; }
.activity-time { font-size: 11px; color: #9ca3af; }
.quick-actions h3 { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 16px; }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 768px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .actions-grid { grid-template-columns: 1fr; } }
.action-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); text-decoration: none; transition: all 0.2s; display: block; }
.action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.action-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.action-title { display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.action-desc { font-size: 12px; color: #6b7280; }
</style>