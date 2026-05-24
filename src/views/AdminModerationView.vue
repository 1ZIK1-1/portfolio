<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore, getFileContent } from '@/services/achievementStore'
import { MOCK_ALL_USERS } from '@/services/authStore'
import { openFilePreview } from '@/services/fileViewer'

const achievementStore = useAchievementStore()
const achievements = ref([])
const isLoading = ref(true)
const statusFilter = ref('')
const searchQuery = ref('')
const selectedAchievement = ref(null)
const commentText = ref('')

const filteredAchievements = computed(() => {
  return achievements.value.filter(a => {
    if (statusFilter.value && a.status !== statusFilter.value) return false
    if (searchQuery.value && !a.title.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    return true
  })
})

const stats = computed(() => ({
  total: achievements.value.length,
  pending: achievements.value.filter(a => a.status === 'pending').length,
  approved: achievements.value.filter(a => a.status === 'approved').length,
  rejected: achievements.value.filter(a => a.status === 'rejected').length
}))

onMounted(() => {
  setTimeout(() => {
    achievements.value = achievementStore.getAll()
    isLoading.value = false
  }, 300)
})

function getUserName(userId) { const user = MOCK_ALL_USERS.find(u => u.id === userId); return user ? user.name : 'Неизвестно' }
function approve(item) { item.status = 'approved'; item.reviewer_comment = commentText.value || 'Одобрено администратором.'; commentText.value = ''; selectedAchievement.value = null }
function reject(item) { item.status = 'rejected'; item.reviewer_comment = commentText.value || 'Отклонено. Требуются исправления.'; commentText.value = ''; selectedAchievement.value = null }
function resetStatus(item) { item.status = 'pending'; item.reviewer_comment = '' }
function openFile(fileName) { if (!selectedAchievement.value) return; const content = getFileContent(selectedAchievement.value.id, fileName); openFilePreview(fileName, content) }
function getStatusLabel(s) { return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[s] || s }
function getTypeIcon(t) { return { science: '🔬', education: '📚', social: '🤝', sport: '⚽', creative: '🎨' }[t] || '📌' }
</script>
<template>
  <div class="admin-moderation">
    <div class="page-header"><div><h1>Модерация материалов</h1><p class="subtitle">Контроль качества контента в системе</p></div></div>
    <div class="mod-stats"><div class="mod-stat"><span class="ms-value">{{ stats.total }}</span><span class="ms-label">Всего</span></div><div class="mod-stat"><span class="ms-value pending">{{ stats.pending }}</span><span class="ms-label">На проверке</span></div><div class="mod-stat"><span class="ms-value approved">{{ stats.approved }}</span><span class="ms-label">Подтверждено</span></div><div class="mod-stat"><span class="ms-value rejected">{{ stats.rejected }}</span><span class="ms-label">Отклонено</span></div></div>
    <div class="filter-bar"><div class="search-box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input v-model="searchQuery" type="text" placeholder="Поиск по названию..." /></div><select v-model="statusFilter" class="filter-select"><option value="">Все статусы</option><option value="pending">На проверке</option><option value="approved">Подтверждено</option><option value="rejected">Отклонено</option></select></div>
    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка...</p></div>
    <template v-else>
      <div class="mod-list">
        <div v-for="item in filteredAchievements" :key="item.id" class="mod-card" @click="selectedAchievement = item"><div class="mc-icon">{{ getTypeIcon(item.type) }}</div><div class="mc-content"><div class="mc-title">{{ item.title }}</div><div class="mc-meta"><span>{{ getUserName(item.user_id) }}</span><span>{{ item.category }}</span><span>{{ item.date }}</span></div></div><span :class="'status-badge status-' + item.status">{{ getStatusLabel(item.status) }}</span></div>
        <div v-if="filteredAchievements.length === 0" class="empty-state"><p>Материалы не найдены</p></div>
      </div>
    </template>
    <div v-if="selectedAchievement" class="modal-overlay" @click.self="selectedAchievement = null">
      <div class="modal"><div class="modal-header"><h2>Детали материала</h2><button class="modal-close" @click="selectedAchievement = null">&times;</button></div><div class="modal-body"><div class="detail-grid"><div class="detail-row"><span class="dl">Пользователь</span><span class="dv">{{ getUserName(selectedAchievement.user_id) }}</span></div><div class="detail-row"><span class="dl">Название</span><span class="dv">{{ selectedAchievement.title }}</span></div><div class="detail-row"><span class="dl">Категория</span><span class="dv">{{ selectedAchievement.category }}</span></div><div class="detail-row"><span class="dl">Уровень</span><span class="dv">{{ selectedAchievement.level }}</span></div><div class="detail-row"><span class="dl">Дата</span><span class="dv">{{ selectedAchievement.date }}</span></div><div class="detail-row" v-if="selectedAchievement.description"><span class="dl">Описание</span><span class="dv">{{ selectedAchievement.description }}</span></div><div class="detail-row" v-if="selectedAchievement.files?.length"><span class="dl">Файлы</span><div class="file-list"><span v-for="f in selectedAchievement.files" :key="f" class="file-chip clickable" @click="openFile(f)">📄 {{ f }}</span></div></div><div class="detail-row" v-if="selectedAchievement.status !== 'pending'"><span class="dl">Комментарий</span><span class="dv comment-text">{{ selectedAchievement.reviewer_comment || '—' }}</span></div></div><div class="review-actions"><div class="form-group"><label>Комментарий модератора</label><textarea v-model="commentText" rows="2" placeholder="Оставьте комментарий (необязательно)"></textarea></div><div class="action-buttons"><button v-if="selectedAchievement.status !== 'pending'" class="btn btn-soft" @click="resetStatus(selectedAchievement)">Вернуть на проверку</button><button class="btn btn-danger" @click="reject(selectedAchievement)">Отклонить</button><button class="btn btn-success" @click="approve(selectedAchievement)">Подтвердить</button></div></div></div></div>
    </div>
  </div>
</template>
<style scoped>.admin-moderation { max-width: 1000px; }.page-header { margin-bottom: 20px; }.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }.subtitle { font-size: 14px; color: #6b7280; margin: 0; }.mod-stats { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }.mod-stat { background: white; border-radius: 12px; padding: 14px 20px; display: flex; flex-direction: column; align-items: center; min-width: 100px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }.ms-value { font-size: 24px; font-weight: 800; color: #1a1a2e; }.ms-value.pending { color: #d97706; }.ms-value.approved { color: #16a34a; }.ms-value.rejected { color: #dc2626; }.ms-label { font-size: 12px; color: #6b7280; }.filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }.search-box { display: flex; align-items: center; gap: 8px; background: white; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 8px 14px; flex: 1; min-width: 200px; }.search-box input { border: none; outline: none; font-size: 14px; width: 100%; }.filter-select { padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; background: white; }.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }@keyframes spin { to { transform: rotate(360deg); } }.mod-list { display: flex; flex-direction: column; gap: 8px; }.mod-card { background: white; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.2s; }.mod-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }.mc-icon { font-size: 22px; }.mc-content { flex: 1; min-width: 0; }.mc-title { font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px; }.mc-meta { display: flex; gap: 10px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }.status-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; flex-shrink: 0; }.status-pending { background: #fffbeb; color: #d97706; }.status-approved { background: #f0fdf4; color: #16a34a; }.status-rejected { background: #fef2f2; color: #dc2626; }.empty-state { text-align: center; padding: 40px; color: #9ca3af; }.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }.modal { background: white; border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }.modal-header h2 { margin: 0; font-size: 18px; }.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }.modal-body { padding: 20px 24px; }.detail-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }.detail-row { display: flex; gap: 12px; }.dl { font-size: 13px; color: #6b7280; min-width: 120px; flex-shrink: 0; font-weight: 500; }.dv { font-size: 14px; color: #1a1a2e; font-weight: 500; }.comment-text { font-style: italic; color: #6b7280; font-weight: 400; }.file-list { display: flex; flex-wrap: wrap; gap: 4px; }.file-chip { font-size: 12px; padding: 4px 10px; background: #f0f4ff; color: #4361ee; border-radius: 6px; cursor: pointer; }.file-chip:hover { background: #4361ee; color: white; }.review-actions { border-top: 1px solid #f0f0f0; padding-top: 16px; }.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }.form-group label { font-size: 13px; font-weight: 600; color: #374151; }.form-group textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; }.action-buttons { display: flex; justify-content: flex-end; gap: 8px; }.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }.btn-success { background: #16a34a; color: white; }.btn-danger { background: #dc2626; color: white; }.btn-soft { background: #e5e7eb; color: #374151; }</style>