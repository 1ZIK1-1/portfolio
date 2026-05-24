<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/services/authStore'
import { useAchievementStore, getFileContent, saveFileContent } from '@/services/achievementStore'
import { openFilePreview, readFileAsDataURL } from '@/services/fileViewer'

const { state } = useAuth()
const achievementStore = useAchievementStore()

const achievements = ref([])
const isLoading = ref(true)
const showAddModal = ref(false)
const showFilter = ref(false)
const selectedAchievement = ref(null)

// Filters
const filters = ref({
  category: '',
  status: '',
  source: '',
  search: '',
  dateFrom: '',
  dateTo: ''
})

// New achievement form
const newAchievement = ref({
  title: '',
  type: 'education',
  category: 'Учебная деятельность',
  description: '',
  level: 'вузовский',
  date: new Date().toISOString().split('T')[0],
  skills: '',
  newFiles: [],        // массив объектов { name, data }
  fileUploading: false // флаг загрузки
})

const fileInputRef = ref(null)

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files) return

  newAchievement.value.fileUploading = true

  for (const file of files) {
    try {
      const dataURL = await readFileAsDataURL(file)
      newAchievement.value.newFiles.push({
        name: file.name,
        data: dataURL
      })
    } catch (e) {
      alert(`Ошибка при чтении файла "${file.name}": ${e.message}`)
    }
  }

  newAchievement.value.fileUploading = false
}

function removeFile(index) {
  newAchievement.value.newFiles.splice(index, 1)
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

const categories = ['Учебная деятельность', 'Научная деятельность', 'Внеучебная деятельность', 'Дополнительное образование']
const types = [
  { value: 'science', label: '🔬 Научная' },
  { value: 'education', label: '📚 Учебная' },
  { value: 'social', label: '🤝 Социальная' },
  { value: 'sport', label: '⚽ Спортивная' },
  { value: 'creative', label: '🎨 Творческая' }
]
const levels = ['вузовский', 'региональный', 'всероссийский', 'международный']

onMounted(() => {
  setTimeout(() => {
    const userId = state.user?.id
    achievements.value = achievementStore.getByUserId(userId)
    // Если у пользователя нет своих достижений — показываем пустой список
    isLoading.value = false
  }, 300)
})

const filteredAchievements = computed(() => {
  return achievements.value.filter(a => {
    if (filters.value.category && a.category !== filters.value.category) return false
    if (filters.value.status && a.status !== filters.value.status) return false
    if (filters.value.source && a.source !== filters.value.source) return false
    if (filters.value.search && !a.title.toLowerCase().includes(filters.value.search.toLowerCase())) return false
    return true
  })
})

function clearFilters() {
  filters.value = { category: '', status: '', source: '', search: '', dateFrom: '', dateTo: '' }
}

async function addAchievement() {
  const achievementData = {
    title: newAchievement.value.title,
    type: newAchievement.value.type,
    category: newAchievement.value.category,
    date: newAchievement.value.date,
    description: newAchievement.value.description,
    skills: newAchievement.value.skills.split(',').map(s => s.trim()).filter(Boolean),
    level: newAchievement.value.level
  }
  // Только имена файлов
  achievementData.files = newAchievement.value.newFiles.map(f => f.name)
  const saved = achievementStore.addAchievement(
    achievementData,
    state.user?.id,
    state.user?.name,
    state.user?.group
  )
  // Сохраняем содержимое каждого файла в отдельное хранилище
  for (const file of newAchievement.value.newFiles) {
    saveFileContent(saved.id, file.name, file.data)
  }
  achievements.value.unshift(saved)
  showAddModal.value = false
  newAchievement.value = {
    title: '', type: 'education', category: 'Учебная деятельность',
    description: '', level: 'вузовский',
    date: new Date().toISOString().split('T')[0], skills: '',
    newFiles: []
  }
}

function deleteAchievement(id) {
  achievementStore.deleteAchievement(id, state.user?.id)
  achievements.value = achievements.value.filter(a => a.id !== id)
}

function getStatusLabel(status) {
  return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[status] || status
}

function getLevelLabel(level) {
  const labels = { вузовский: 'Вуз', региональный: 'Регион', всероссийский: 'РФ', международный: 'Мир' }
  return labels[level] || level
}

function openFile(fileName) {
  if (!selectedAchievement.value) return
  const content = getFileContent(selectedAchievement.value.id, fileName)
  openFilePreview(fileName, content)
}

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.category) count++
  if (filters.value.status) count++
  if (filters.value.source) count++
  if (filters.value.search) count++
  return count
})
</script>

<template>
  <div class="achievements-page">
    <div class="page-header">
      <div>
        <h1>Мои достижения</h1>
        <p class="subtitle">{{ achievements.length }} достижений в портфолио</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showFilter = !showFilter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Фильтр
          <span v-if="activeFiltersCount" class="filter-badge">{{ activeFiltersCount }}</span>
        </button>
        <button class="btn btn-primary" @click="showAddModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Добавить достижение
        </button>
        <button class="btn btn-outline" title="Синхронизировать с Moodle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Синхр. с Moodle
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilter" class="filter-panel">
      <div class="filter-row">
        <div class="filter-group">
          <label>Поиск</label>
          <input v-model="filters.search" type="text" placeholder="Поиск по названию..." class="filter-input" />
        </div>
        <div class="filter-group">
          <label>Категория</label>
          <select v-model="filters.category" class="filter-select">
            <option value="">Все категории</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Статус</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Все</option>
            <option value="approved">Подтверждено</option>
            <option value="pending">На проверке</option>
            <option value="rejected">Отклонено</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Источник</label>
          <select v-model="filters.source" class="filter-select">
            <option value="">Все</option>
            <option value="manual">Ручной ввод</option>
            <option value="moodle">Moodle</option>
          </select>
        </div>
        <button class="btn btn-ghost" @click="clearFilters">Сбросить</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка достижений...</p>
    </div>

    <!-- Achievements Grid -->
    <div v-else class="achievements-grid">
      <div v-for="item in filteredAchievements" :key="item.id" class="achievement-card"
           @click="selectedAchievement = item">
        <div class="card-type-icon">{{ { science: '🔬', education: '📚', social: '🤝', sport: '⚽', creative: '🎨' }[item.type] || '📌' }}</div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-meta">
            <span class="card-category">{{ item.category }}</span>
            <span class="card-level">{{ getLevelLabel(item.level) }}</span>
            <span class="card-date">{{ item.date }}</span>
          </div>
          <div class="card-skills">
            <span v-for="skill in item.skills" :key="skill" class="skill-chip">{{ skill }}</span>
          </div>
        </div>
        <div class="card-status">
          <span :class="'status-badge status-' + item.status">{{ getStatusLabel(item.status) }}</span>
          <span v-if="item.source === 'moodle'" class="moodle-badge">Moodle</span>
        </div>
        <button class="delete-btn" @click.stop="deleteAchievement(item.id)" title="Удалить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div v-if="filteredAchievements.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7v.5" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7v.5" />
          <path d="M12 22v-8" />
          <path d="M10 14h4v4h-4Z" />
          <path d="M8 9h8l-1 7H9Z" />
        </svg>
        <p>Достижения не найдены</p>
        <button class="btn btn-primary" @click="showAddModal = true">Добавить первое достижение</button>
      </div>
    </div>

    <!-- Add Achievement Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Новое достижение</h2>
          <button class="modal-close" @click="showAddModal = false">&times;</button>
        </div>
        <form @submit.prevent="addAchievement" class="modal-body">
          <div class="form-group">
            <label>Название достижения *</label>
            <input v-model="newAchievement.title" required placeholder="Введите название" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Тип</label>
              <select v-model="newAchievement.type">
                <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Категория</label>
              <select v-model="newAchievement.category">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Уровень</label>
              <select v-model="newAchievement.level">
                <option v-for="lvl in levels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Дата</label>
              <input v-model="newAchievement.date" type="date" />
            </div>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="newAchievement.description" rows="3" placeholder="Краткое описание..."></textarea>
          </div>
          <div class="form-group">
            <label>Навыки (через запятую)</label>
            <input v-model="newAchievement.skills" placeholder="Например: Python, SQL, Публичные выступления" />
          </div>
          <div class="form-group">
            <label>Прикрепить файлы</label>
            <div class="file-dropzone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileUpload($event)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Нажмите или перетащите файлы сюда</p>
            </div>
            <input ref="fileInputRef" type="file" multiple hidden @change="handleFileUpload" />
            <div v-if="newAchievement.fileUploading" class="file-uploading">
              <div class="spinner-sm"></div>
              <span>Чтение файлов...</span>
            </div>
            <div v-if="newAchievement.newFiles.length" class="file-preview-list">
              <div v-for="(file, idx) in newAchievement.newFiles" :key="idx" class="file-preview-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span class="file-name">{{ file.name }}</span>
                <button type="button" class="file-remove" @click="removeFile(idx)">&times;</button>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="showAddModal = false">Отмена</button>
            <button type="submit" class="btn btn-primary">Добавить</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Achievement Modal -->
    <div v-if="selectedAchievement" class="modal-overlay" @click.self="selectedAchievement = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Детали достижения</h2>
          <button class="modal-close" @click="selectedAchievement = null">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Название</span>
            <span class="detail-value">{{ selectedAchievement.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Категория</span>
            <span class="detail-value">{{ selectedAchievement.category }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Уровень</span>
            <span class="detail-value">{{ selectedAchievement.level }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Дата</span>
            <span class="detail-value">{{ selectedAchievement.date }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Статус</span>
            <span :class="'status-badge status-' + selectedAchievement.status">{{ getStatusLabel(selectedAchievement.status) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Источник</span>
            <span class="detail-value">{{ selectedAchievement.source === 'moodle' ? 'Moodle' : 'Ручной ввод' }}</span>
          </div>
          <div class="detail-row" v-if="selectedAchievement.description">
            <span class="detail-label">Описание</span>
            <span class="detail-value">{{ selectedAchievement.description }}</span>
          </div>
          <div class="detail-row" v-if="selectedAchievement.files && selectedAchievement.files.length">
            <span class="detail-label">Файлы</span>
            <div class="detail-skills">
              <span v-for="file in selectedAchievement.files" :key="file" class="file-chip clickable" @click="openFile(file)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span class="file-link">{{ file }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </span>
            </div>
          </div>
          <div class="detail-row" v-if="selectedAchievement.skills.length">
            <span class="detail-label">Навыки</span>
            <div class="detail-skills">
              <span v-for="skill in selectedAchievement.skills" :key="skill" class="skill-chip">{{ skill }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="selectedAchievement = null">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-page { max-width: 1200px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }

.header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
  text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
}
.btn-primary { background: #4361ee; color: white; }
.btn-primary:hover { background: #3651d4; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-secondary:hover { background: #d1d5db; }
.btn-outline { background: white; color: #4361ee; border: 1.5px solid #4361ee; }
.btn-outline:hover { background: #eef0ff; }
.btn-ghost { background: transparent; color: #6b7280; }
.btn-ghost:hover { background: #f3f4f6; }

.filter-badge {
  background: #ef4444; color: white; border-radius: 50%;
  width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}

/* Filters */
.filter-panel {
  background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.filter-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
.filter-group label { font-size: 12px; font-weight: 600; color: #6b7280; }
.filter-input, .filter-select {
  padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none;
}
.filter-input:focus, .filter-select:focus { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee;
  border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Grid */
.achievements-grid { display: grid; gap: 12px; }

.achievement-card {
  background: white; border-radius: 12px; padding: 16px 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer;
  transition: all 0.2s; position: relative;
}
.achievement-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }

.card-type-icon { font-size: 28px; width: 44px; text-align: center; flex-shrink: 0; }
.card-content { flex: 1; min-width: 0; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.card-meta { display: flex; gap: 10px; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.card-skills { display: flex; gap: 4px; flex-wrap: wrap; }

.skill-chip {
  font-size: 11px; padding: 2px 8px; background: #f0f0f5; color: #6b7280;
  border-radius: 4px; font-weight: 500;
}

.card-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }

.status-badge {
  font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
}
.status-approved { background: #f0fdf4; color: #16a34a; }
.status-pending { background: #fffbeb; color: #d97706; }
.status-rejected { background: #fef2f2; color: #dc2626; }

.moodle-badge {
  font-size: 10px; padding: 2px 8px; background: #eef2ff; color: #4361ee; border-radius: 4px; font-weight: 600;
}

.delete-btn {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; color: #d1d5db; cursor: pointer;
  padding: 4px; border-radius: 6px; opacity: 0; transition: all 0.2s;
}
.achievement-card:hover .delete-btn { opacity: 1; }
.delete-btn:hover { background: #fef2f2; color: #dc2626; }

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px; color: #9ca3af;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 20px;
}
.modal {
  background: white; border-radius: 16px; width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
}
.modal-sm { max-width: 480px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
}
.modal-header h2 { margin: 0; font-size: 18px; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group select, .form-group textarea {
  padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* File Uploading Indicator */
.file-uploading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: #6b7280;
  font-size: 13px;
}
.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #4361ee;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* File Dropzone */
.file-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}
.file-dropzone:hover {
  border-color: #4361ee;
  background: #eef0ff;
}
.file-dropzone svg {
  color: #9ca3af;
  margin-bottom: 6px;
}
.file-dropzone p {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}
.file-preview-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.file-preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 12px;
}
.file-name {
  flex: 1;
  color: #374151;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-remove {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 16px;
  padding: 0 2px;
}
.file-remove:hover {
  color: #dc2626;
}

.detail-row {
  display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5;
}
.detail-label { font-size: 13px; color: #6b7280; min-width: 100px; flex-shrink: 0; }
.detail-value { font-size: 14px; color: #1a1a2e; font-weight: 500; }
.detail-skills { display: flex; flex-wrap: wrap; gap: 4px; }

.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 12px;
  background: #f0f4ff;
  color: #4361ee;
  border-radius: 8px;
}

.file-chip.clickable {
  cursor: pointer;
  transition: all 0.2s;
}

.file-chip.clickable:hover {
  background: #4361ee;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.3);
}

.file-chip.clickable:hover svg {
  stroke: white;
}

.file-link {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
