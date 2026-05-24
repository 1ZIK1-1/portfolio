<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/services/authStore'
import { useAchievementStore, getFileContent } from '@/services/achievementStore'
import { openFilePreview } from '@/services/fileViewer'

const { state } = useAuth()
const achievementStore = useAchievementStore()

const allAchievements = ref([])
const isLoading = ref(true)
const selectedAchievement = ref(null)
const activeTab = ref('pending')
const commentText = ref('')

onMounted(() => {
  setTimeout(() => {
    // Загружаем все достижения студентов из общего хранилища (не преподавательские)
    allAchievements.value = achievementStore.getAll()
    isLoading.value = false
  }, 300)
})

const pendingItems = computed(() => allAchievements.value.filter(a => a.status === 'pending'))
const processedItems = computed(() => allAchievements.value.filter(a => a.status !== 'pending'))

const displayedItems = computed(() => {
  return activeTab.value === 'pending' ? pendingItems.value : processedItems.value
})

function approve(item) {
  achievementStore.approve(item.id, commentText.value, state.user?.id)
  item.status = 'approved'
  item.reviewer_comment = commentText.value || 'Подтверждено.'
  commentText.value = ''
  selectedAchievement.value = null
}

function reject(item) {
  achievementStore.reject(item.id, commentText.value, state.user?.id)
  item.status = 'rejected'
  item.reviewer_comment = commentText.value || 'Отклонено. Требуются исправления.'
  commentText.value = ''
  selectedAchievement.value = null
}

function getStatusLabel(s) {
  return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[s] || s
}

function getTypeIcon(t) {
  return { science: '🔬', education: '📚', social: '🤝', sport: '⚽', creative: '🎨' }[t] || '📌'
}

function openFile(fileName) {
  if (!selectedAchievement.value) return
  const content = getFileContent(selectedAchievement.value.id, fileName)
  openFilePreview(fileName, content)
}
</script>

<template>
  <div class="verification-page">
    <div class="page-header">
      <div>
        <h1>Верификация достижений студентов</h1>
        <p class="subtitle">{{ pendingItems.length }} достижений ожидают проверки</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка...</p></div>

    <template v-else>
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
          На проверке
          <span class="tab-badge">{{ pendingItems.length }}</span>
        </button>
        <button class="tab" :class="{ active: activeTab === 'processed' }" @click="activeTab = 'processed'">
          Проверенные
          <span class="tab-badge secondary">{{ processedItems.length }}</span>
        </button>
      </div>

      <!-- List -->
      <div class="verification-list">
        <div v-for="item in displayedItems" :key="item.id" class="verification-card" @click="selectedAchievement = item">
          <div class="vc-icon">{{ getTypeIcon(item.type) }}</div>
          <div class="vc-content">
            <div class="vc-title">{{ item.title }}</div>
            <div class="vc-meta">
              <span class="vc-student">{{ item.user_name }} • {{ item.user_group }}</span>
              <span class="vc-category">{{ item.category }}</span>
              <span v-if="item.level" class="vc-level">{{ { вузовский: 'Вуз', региональный: 'Регион', всероссийский: 'РФ' }[item.level] || item.level }}</span>
            </div>
          </div>
          <div class="vc-status">
            <span v-if="item.status === 'pending'" class="status-badge pending">На проверке</span>
            <span v-else :class="'status-badge status-' + item.status">{{ getStatusLabel(item.status) }}</span>
            <span class="vc-date">{{ item.date }}</span>
          </div>
        </div>
        <div v-if="displayedItems.length === 0" class="empty-state">
          <p>{{ activeTab === 'pending' ? 'Нет достижений на проверке' : 'Нет проверенных достижений' }}</p>
        </div>
      </div>
    </template>

    <!-- Verification Modal -->
    <div v-if="selectedAchievement" class="modal-overlay" @click.self="selectedAchievement = null">
      <div class="modal">
        <div class="modal-header">
          <h2>Проверка достижения</h2>
          <button class="modal-close" @click="selectedAchievement = null">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-row"><span class="dl">Студент</span><span class="dv">{{ selectedAchievement.user_name }} ({{ selectedAchievement.user_group }})</span></div>
            <div class="detail-row"><span class="dl">Название</span><span class="dv">{{ selectedAchievement.title }}</span></div>
            <div class="detail-row"><span class="dl">Категория</span><span class="dv">{{ selectedAchievement.category }}</span></div>
            <div class="detail-row"><span class="dl">Уровень</span><span class="dv">{{ selectedAchievement.level }}</span></div>
            <div class="detail-row"><span class="dl">Дата</span><span class="dv">{{ selectedAchievement.date }}</span></div>
            <div class="detail-row" v-if="selectedAchievement.description"><span class="dl">Описание</span><span class="dv">{{ selectedAchievement.description }}</span></div>
            <div class="detail-row" v-if="selectedAchievement.files?.length">
              <span class="dl">Файлы</span>
              <div class="file-list">
                <span v-for="f in selectedAchievement.files" :key="f" class="file-chip clickable" @click="openFile(f)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  <span class="file-link">{{ f }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </span>
              </div>
            </div>
            <div class="detail-row" v-if="selectedAchievement.skills?.length"><span class="dl">Навыки</span><div class="detail-skills"><span v-for="s in selectedAchievement.skills" :key="s" class="skill-chip">{{ s }}</span></div></div>
            <div class="detail-row" v-if="selectedAchievement.reviewer_comment">
              <span class="dl">Комментарий</span>
              <span class="dv comment-text">{{ selectedAchievement.reviewer_comment }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="selectedAchievement.status === 'pending'" class="review-actions">
            <div class="form-group">
              <label>Комментарий рецензента</label>
              <textarea v-model="commentText" rows="2" placeholder="Оставьте комментарий (необязательно)"></textarea>
            </div>
            <div class="action-buttons">
              <button class="btn btn-soft" @click="selectedAchievement = null">Отложить</button>
              <button class="btn btn-danger" @click="reject(selectedAchievement)">Отклонить</button>
              <button class="btn btn-success" @click="approve(selectedAchievement)">Подтвердить</button>
            </div>
          </div>
          <div v-else class="review-status">
            <span :class="'status-badge status-' + selectedAchievement.status">{{ getStatusLabel(selectedAchievement.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verification-page { max-width: 1000px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #e5e7eb; padding: 4px; border-radius: 10px; width: fit-content; }
.tab { padding: 8px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; background: transparent; color: #6b7280; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.tab.active { background: white; color: #1a1a2e; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tab-badge { background: #ef4444; color: white; font-size: 11px; padding: 1px 7px; border-radius: 10px; font-weight: 700; }
.tab-badge.secondary { background: #9ca3af; }

.verification-list { display: flex; flex-direction: column; gap: 8px; }
.verification-card { background: white; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.2s; }
.verification-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.vc-icon { font-size: 24px; width: 40px; text-align: center; flex-shrink: 0; }
.vc-content { flex: 1; min-width: 0; }
.vc-title { font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.vc-meta { display: flex; gap: 8px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }
.vc-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.vc-date { font-size: 11px; color: #9ca3af; }
.status-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.status-badge.pending { background: #fffbeb; color: #d97706; }
.status-badge.status-approved { background: #f0fdf4; color: #16a34a; }
.status-badge.status-rejected { background: #fef2f2; color: #dc2626; }
.empty-state { text-align: center; padding: 40px; color: #9ca3af; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: white; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h2 { margin: 0; font-size: 18px; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px 24px; }

.detail-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.detail-row { display: flex; gap: 12px; }
.dl { font-size: 13px; color: #6b7280; min-width: 100px; flex-shrink: 0; font-weight: 500; }
.dv { font-size: 14px; color: #1a1a2e; font-weight: 500; }
.comment-text { font-style: italic; color: #6b7280; font-weight: 400; }

.file-list { display: flex; flex-wrap: wrap; gap: 4px; }
.file-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 10px; background: #f0f4ff; color: #4361ee; border-radius: 6px; }
.detail-skills { display: flex; flex-wrap: wrap; gap: 4px; }
.skill-chip { font-size: 11px; padding: 2px 8px; background: #f0f0f5; color: #6b7280; border-radius: 4px; font-weight: 500; }

.review-actions { border-top: 1px solid #f0f0f0; padding-top: 16px; }
.review-status { border-top: 1px solid #f0f0f0; padding-top: 16px; text-align: center; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; }
.form-group textarea:focus { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }

.action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.btn-success { background: #16a34a; color: white; } .btn-success:hover { background: #15803d; }
.btn-danger { background: #dc2626; color: white; } .btn-danger:hover { background: #b91c1c; }
.btn-soft { background: #e5e7eb; color: #374151; } .btn-soft:hover { background: #d1d5db; }
</style>