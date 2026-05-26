<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/services/authStore'
import { useAchievementStore, getFileContent, saveFileContent } from '@/services/achievementStore'
import { openFilePreview, readFileAsDataURL } from '@/services/fileViewer'
import FilePreviewCard from '@/components/FilePreviewCard.vue'
import FilePreviewModal from '@/components/FilePreviewModal.vue'

const { state } = useAuth()
const achievementStore = useAchievementStore()

const achievements = ref([])
const isLoading = ref(true)
const showAddModal = ref(false)
const showFilter = ref(false)
const selectedAchievement = ref(null)

const filters = ref({ category: '', status: '', source: '', search: '', dateFrom: '', dateTo: '' })

const newAchievement = ref({ title: '', type: 'education', category: 'Учебная деятельность', description: '', level: 'вузовский', date: new Date().toISOString().split('T')[0], skills: '', newFiles: [], fileUploading: false })

const fileInputRef = ref(null)

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files) return
  newAchievement.value.fileUploading = true
  for (const file of files) {
    try {
      const dataURL = await readFileAsDataURL(file)
      const newIdx = newAchievement.value.newFiles.length
      newAchievement.value.newFiles.push({ name: file.name, data: dataURL })
      // Сразу открываем предпросмотр с кнопками подтверждения
      previewFileData.value = { fileName: file.name, content: dataURL }
      previewConfirmMode.value = true
      pendingFileIndex.value = newIdx
      showFilePreview.value = true
    } catch (e) { alert(`Ошибка при чтении файла "${file.name}": ${e.message}`) }
  }
  newAchievement.value.fileUploading = false
}

function removeFile(index) { newAchievement.value.newFiles.splice(index, 1) }
function triggerFileInput() { fileInputRef.value?.click() }

const categories = ['Учебная деятельность', 'Научная деятельность', 'Внеучебная деятельность', 'Дополнительное образование']
const types = [{ value: 'science', label: '🔬 Научная' }, { value: 'education', label: '📚 Учебная' }, { value: 'social', label: '🤝 Социальная' }, { value: 'sport', label: '⚽ Спортивная' }, { value: 'creative', label: '🎨 Творческая' }]
const levels = ['вузовский', 'региональный', 'всероссийский', 'международный']

onMounted(() => {
  setTimeout(() => {
    achievements.value = achievementStore.getByUserId(state.user?.id)
    isLoading.value = false
  }, 300)
})

const filteredAchievements = computed(() => achievements.value.filter(a => {
  if (filters.value.category && a.category !== filters.value.category) return false
  if (filters.value.status && a.status !== filters.value.status) return false
  if (filters.value.source && a.source !== filters.value.source) return false
  if (filters.value.search && !a.title.toLowerCase().includes(filters.value.search.toLowerCase())) return false
  return true
}))

function clearFilters() { filters.value = { category: '', status: '', source: '', search: '', dateFrom: '', dateTo: '' } }

async function addAchievement() {
  const achievementData = { title: newAchievement.value.title, type: newAchievement.value.type, category: newAchievement.value.category, date: newAchievement.value.date, description: newAchievement.value.description, skills: newAchievement.value.skills.split(',').map(s => s.trim()).filter(Boolean), level: newAchievement.value.level }
  achievementData.files = newAchievement.value.newFiles.map(f => f.name)
  const saved = achievementStore.addAchievement(achievementData, state.user?.id, state.user?.name, state.user?.group)
  for (const file of newAchievement.value.newFiles) { saveFileContent(saved.id, file.name, file.data) }
  achievements.value.unshift(saved)
  showAddModal.value = false
  newAchievement.value = { title: '', type: 'education', category: 'Учебная деятельность', description: '', level: 'вузовский', date: new Date().toISOString().split('T')[0], skills: '', newFiles: [] }
}

function deleteAchievement(id) { achievementStore.deleteAchievement(id, state.user?.id); achievements.value = achievements.value.filter(a => a.id !== id) }
function getStatusLabel(status) { return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[status] || status }
function getLevelLabel(level) { const labels = { вузовский: 'Вуз', региональный: 'Регион', всероссийский: 'РФ', международный: 'Мир' }; return labels[level] || level }

const activeFiltersCount = computed(() => { let c = 0; if (filters.value.category) c++; if (filters.value.status) c++; if (filters.value.source) c++; if (filters.value.search) c++; return c })

// File preview modal
const showFilePreview = ref(false)
const previewFileData = ref({ fileName: '', content: '' })
const previewConfirmMode = ref(false)
const pendingFileIndex = ref(-1) // индекс файла в newFiles, который ожидает подтверждения

function openFilePreviewModal(fileName) {
  if (!selectedAchievement.value) return
  const content = getFileContent(selectedAchievement.value.id, fileName)
  if (content) { previewFileData.value = { fileName, content }; showFilePreview.value = true }
}

function closeFilePreview() { showFilePreview.value = false; previewFileData.value = { fileName: '', content: '' }; previewConfirmMode.value = false; pendingFileIndex.value = -1 }

function confirmFileAdd() {
  showFilePreview.value = false
  previewFileData.value = { fileName: '', content: '' }
  previewConfirmMode.value = false
  pendingFileIndex.value = -1
}

function cancelFileAdd() {
  // Удаляем файл, который был загружен
  if (pendingFileIndex.value >= 0) {
    newAchievement.value.newFiles.splice(pendingFileIndex.value, 1)
  }
  showFilePreview.value = false
  previewFileData.value = { fileName: '', content: '' }
  previewConfirmMode.value = false
  pendingFileIndex.value = -1
}
</script>
<template>
  <div class="achievements-page">
    <div class="page-header"><div><h1>Мои достижения</h1><p class="subtitle">{{ achievements.length }} достижений в портфолио</p></div><div class="header-actions"><button class="btn btn-secondary" @click="showFilter = !showFilter">Фильтр<span v-if="activeFiltersCount" class="filter-badge">{{ activeFiltersCount }}</span></button><button class="btn btn-primary" @click="showAddModal = true">Добавить достижение</button></div></div>
    <div v-if="showFilter" class="filter-panel"><div class="filter-row"><div class="filter-group"><label>Поиск</label><input v-model="filters.search" type="text" placeholder="Поиск..." class="filter-input" /></div><div class="filter-group"><label>Категория</label><select v-model="filters.category" class="filter-select"><option value="">Все</option><option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option></select></div><div class="filter-group"><label>Статус</label><select v-model="filters.status" class="filter-select"><option value="">Все</option><option value="approved">Подтверждено</option><option value="pending">На проверке</option><option value="rejected">Отклонено</option></select></div><div class="filter-group"><label>Источник</label><select v-model="filters.source" class="filter-select"><option value="">Все</option><option value="manual">Ручной ввод</option><option value="moodle">Moodle</option></select></div><button class="btn btn-ghost" @click="clearFilters">Сбросить</button></div></div>
    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка...</p></div>
    <div v-else class="achievements-grid">
      <div v-for="item in filteredAchievements" :key="item.id" class="achievement-card" @click="selectedAchievement = item">
        <div class="card-type-icon">{{ { science: '🔬', education: '📚', social: '🤝', sport: '⚽', creative: '🎨' }[item.type] || '📌' }}</div>
        <div class="card-content"><div class="card-title">{{ item.title }}</div><div class="card-meta"><span class="card-category">{{ item.category }}</span><span class="card-level">{{ getLevelLabel(item.level) }}</span><span class="card-date">{{ item.date }}</span></div><div class="card-skills"><span v-for="skill in item.skills" :key="skill" class="skill-chip">{{ skill }}</span></div></div>
        <div class="card-status"><span :class="'status-badge status-' + item.status">{{ getStatusLabel(item.status) }}</span><span v-if="item.source === 'moodle'" class="moodle-badge">Moodle</span></div>
        <button class="delete-btn" @click.stop="deleteAchievement(item.id)" title="Удалить">🗑️</button>
      </div>
      <div v-if="filteredAchievements.length === 0" class="empty-state"><p>Достижения не найдены</p><button class="btn btn-primary" @click="showAddModal = true">Добавить первое достижение</button></div>
    </div>

    <!-- Add Achievement Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal"><div class="modal-header"><h2>Новое достижение</h2><button class="modal-close" @click="showAddModal = false">&times;</button></div>
      <form @submit.prevent="addAchievement" class="modal-body">
        <div class="form-group"><label>Название *</label><input v-model="newAchievement.title" required placeholder="Введите название" /></div>
        <div class="form-row"><div class="form-group"><label>Тип</label><select v-model="newAchievement.type"><option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option></select></div><div class="form-group"><label>Категория</label><select v-model="newAchievement.category"><option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option></select></div></div>
        <div class="form-row"><div class="form-group"><label>Уровень</label><select v-model="newAchievement.level"><option v-for="lvl in levels" :key="lvl" :value="lvl">{{ lvl }}</option></select></div><div class="form-group"><label>Дата</label><input v-model="newAchievement.date" type="date" /></div></div>
        <div class="form-group"><label>Описание</label><textarea v-model="newAchievement.description" rows="3" placeholder="Краткое описание..."></textarea></div>
        <div class="form-group"><label>Навыки (через запятую)</label><input v-model="newAchievement.skills" placeholder="Например: Python, SQL" /></div>
        <div class="form-group"><label>Прикрепить файлы</label>
          <div class="file-dropzone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileUpload($event)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><p>Нажмите или перетащите файлы сюда</p></div>
          <input ref="fileInputRef" type="file" multiple hidden @change="handleFileUpload" />
          <div v-if="newAchievement.fileUploading" class="file-uploading"><div class="spinner-sm"></div><span>Чтение файлов...</span></div>
          <div v-if="newAchievement.newFiles.length" class="file-preview-list">
            <FilePreviewCard v-for="(file, idx) in newAchievement.newFiles" :key="idx" :fileName="file.name" :fileData="file.data" removable @remove="removeFile(idx)" @open="(e) => { previewFileData.value = e; showFilePreview.value = true }" />
          </div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" @click="showAddModal = false">Отмена</button><button type="submit" class="btn btn-primary">Добавить</button></div>
      </form></div>
    </div>

    <!-- View Achievement Modal -->
    <div v-if="selectedAchievement" class="modal-overlay" @click.self="selectedAchievement = null">
      <div class="modal modal-sm"><div class="modal-header"><h2>Детали достижения</h2><button class="modal-close" @click="selectedAchievement = null">&times;</button></div>
      <div class="modal-body">
        <div class="detail-row"><span class="detail-label">Название</span><span class="detail-value">{{ selectedAchievement.title }}</span></div>
        <div class="detail-row"><span class="detail-label">Категория</span><span class="detail-value">{{ selectedAchievement.category }}</span></div>
        <div class="detail-row"><span class="detail-label">Уровень</span><span class="detail-value">{{ selectedAchievement.level }}</span></div>
        <div class="detail-row"><span class="detail-label">Дата</span><span class="detail-value">{{ selectedAchievement.date }}</span></div>
        <div class="detail-row"><span class="detail-label">Статус</span><span :class="'status-badge status-' + selectedAchievement.status">{{ getStatusLabel(selectedAchievement.status) }}</span></div>
        <div class="detail-row"><span class="detail-label">Источник</span><span class="detail-value">{{ selectedAchievement.source === 'moodle' ? 'Moodle' : 'Ручной ввод' }}</span></div>
        <div class="detail-row" v-if="selectedAchievement.description"><span class="detail-label">Описание</span><span class="detail-value">{{ selectedAchievement.description }}</span></div>
        <div class="detail-row files-row" v-if="selectedAchievement.files && selectedAchievement.files.length">
          <span class="detail-label">Файлы</span>
          <div class="file-cards-list">
            <FilePreviewCard v-for="file in selectedAchievement.files" :key="file" :fileName="file" :achievementId="selectedAchievement.id" @open="(e) => openFilePreviewModal(e.fileName)" />
          </div>
        </div>
        <div class="detail-row" v-if="selectedAchievement.skills.length"><span class="detail-label">Навыки</span><div class="detail-skills"><span v-for="skill in selectedAchievement.skills" :key="skill" class="skill-chip">{{ skill }}</span></div></div>
        <div class="modal-footer"><button class="btn btn-ghost" @click="selectedAchievement = null">Закрыть</button></div>
      </div></div>
    </div>

    <!-- File Preview Modal -->
    <FilePreviewModal :show="showFilePreview" :fileName="previewFileData.fileName" :fileContent="previewFileData.content" :confirmMode="previewConfirmMode" @close="closeFilePreview" @confirm="confirmFileAdd" @cancel="cancelFileAdd" />
  </div>
</template>
<style scoped>
.achievements-page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: #4361ee; color: white; } .btn-primary:hover { background: #3651d4; }
.btn-secondary { background: #e5e7eb; color: #374151; } .btn-secondary:hover { background: #d1d5db; }
.btn-ghost { background: transparent; color: #6b7280; } .btn-ghost:hover { background: #f3f4f6; }
.filter-badge { background: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
.filter-panel { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.filter-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
.filter-group label { font-size: 12px; font-weight: 600; color: #6b7280; }
.filter-input, .filter-select { padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.achievements-grid { display: grid; gap: 12px; }
.achievement-card { background: white; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.2s; position: relative; }
.achievement-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }
.card-type-icon { font-size: 28px; width: 44px; text-align: center; flex-shrink: 0; }
.card-content { flex: 1; min-width: 0; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
.card-meta { display: flex; gap: 10px; font-size: 12px; color: #6b7280; margin-bottom: 6px; flex-wrap: wrap; }
.card-skills { display: flex; gap: 4px; flex-wrap: wrap; }
.skill-chip { font-size: 11px; padding: 2px 8px; background: #f0f0f5; color: #6b7280; border-radius: 4px; font-weight: 500; }
.card-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.status-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.status-approved { background: #f0fdf4; color: #16a34a; }
.status-pending { background: #fffbeb; color: #d97706; }
.status-rejected { background: #fef2f2; color: #dc2626; }
.moodle-badge { font-size: 10px; padding: 2px 8px; background: #eef2ff; color: #4361ee; border-radius: 4px; font-weight: 600; }
.delete-btn { position: absolute; top: 12px; right: 12px; background: none; border: none; color: #d1d5db; cursor: pointer; padding: 4px; border-radius: 6px; opacity: 0; transition: all 0.2s; }
.achievement-card:hover .delete-btn { opacity: 1; } .delete-btn:hover { background: #fef2f2; color: #dc2626; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; color: #9ca3af; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: white; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-sm { max-width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h2 { margin: 0; font-size: 18px; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.file-uploading { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #6b7280; font-size: 13px; }
.spinner-sm { width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; }
.file-dropzone { border: 2px dashed #d1d5db; border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafafa; }
.file-dropzone:hover { border-color: #4361ee; background: #eef0ff; }
.file-dropzone svg { color: #9ca3af; margin-bottom: 6px; }
.file-dropzone p { font-size: 13px; color: #9ca3af; margin: 0; }
.file-preview-list { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.detail-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.detail-label { font-size: 13px; color: #6b7280; min-width: 100px; flex-shrink: 0; font-weight: 500; }
.detail-value { font-size: 14px; color: #1a1a2e; font-weight: 500; }
.detail-skills { display: flex; flex-wrap: wrap; gap: 4px; }
.file-cards-list { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.files-row .detail-label { align-self: flex-start; padding-top: 8px; }
</style>