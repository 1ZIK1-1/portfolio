<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_TEACHER_ACHIEVEMENTS, MOCK_TEACHER_PORTFOLIOS } from '@/services/authStore'

const portfolios = ref([])
const achievements = ref([])
const isLoading = ref(true)
const showCreateModal = ref(false)
const editingPortfolio = ref(null)

const newPortfolio = ref({ title: '', template: 'academic', description: '', access_level: 'private' })

const templates = [
  { value: 'cv', label: 'Стиль резюме (CV)', desc: 'Для коллег и руководства' },
  { value: 'academic', label: 'Академический', desc: 'Для аттестации' },
  { value: 'creative', label: 'Творческий', desc: 'Для портфолио работ' }
]

onMounted(() => {
  setTimeout(() => {
    portfolios.value = MOCK_TEACHER_PORTFOLIOS
    achievements.value = MOCK_TEACHER_ACHIEVEMENTS
    isLoading.value = false
  }, 300)
})

function createPortfolio() {
  portfolios.value.push({ id: Date.now(), ...newPortfolio.value, created_at: new Date().toISOString().split('T')[0], items: [] })
  showCreateModal.value = false
  newPortfolio.value = { title: '', template: 'academic', description: '', access_level: 'private' }
}

function deletePortfolio(id) { portfolios.value = portfolios.value.filter(p => p.id !== id) }
function editPortfolio(pf) { editingPortfolio.value = JSON.parse(JSON.stringify(pf)) }
function savePortfolio() {
  const idx = portfolios.value.findIndex(p => p.id === editingPortfolio.value.id)
  if (idx !== -1) portfolios.value[idx] = editingPortfolio.value
  editingPortfolio.value = null
}
function addItemToPortfolio(pf, ach) {
  if (!pf.items) pf.items = []
  pf.items.push({ id: Date.now(), achievement_id: ach.id, section: ach.category, display_order: pf.items.length })
}
function removeItem(pf, itemId) { pf.items = pf.items.filter(i => i.id !== itemId) }
function getAchievementById(id) { return achievements.value.find(a => a.id === id) }
function getTemplateLabel(v) { const t = templates.find(t => t.value === v); return t ? t.label : v }
function getStatusLabel(s) { return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[s] || s }

function exportToPdf(pf) {
  const sections = [...new Set(pf.items?.map(i => i.section) || [])]
  let content = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
    h1 { font-size: 28px; margin-bottom: 6px; }
    .subtitle { color: #6b7280; margin-bottom: 24px; font-size: 14px; }
    hr { border: none; border-top: 2px solid #4361ee; margin-bottom: 24px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: 700; color: #4361ee; margin-bottom: 8px; text-transform: uppercase; }
    .item { padding: 10px 14px; background: #f9fafb; border-radius: 8px; margin-bottom: 6px; font-size: 14px; }
    .item-title { font-weight: 600; color: #1a1a2e; }
    .item-desc { color: #6b7280; font-size: 13px; }
    .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style></head><body>
    <h1>${pf.title}</h1>
    <div class="subtitle">Сформировано из электронного портфолио СахГУ</div><hr>`
  sections.forEach(section => {
    content += `<div class="section"><div class="section-title">${section}</div>`
    pf.items.filter(i => i.section === section).forEach(item => {
      const ach = getAchievementById(item.achievement_id)
      if (ach) content += `<div class="item"><div class="item-title">${ach.title}</div><div class="item-desc">${ach.description || ''} ${ach.date ? '• ' + ach.date : ''}</div></div>`
    })
    content += `</div>`
  })
  content += `<div class="footer">Сахалинский государственный университет • Электронное портфолио</div></body></html>`
  const win = window.open('', '_blank')
  if (win) { win.document.write(content); win.document.close(); win.focus() }
}
</script>

<template>
  <div class="portfolio-page">
    <div class="page-header">
      <div><h1>Мои портфолио</h1><p class="subtitle">Портфолио для аттестации и публичного представления</p></div>
      <button class="btn btn-primary" @click="showCreateModal = true">+ Создать портфолио</button>
    </div>

    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка...</p></div>

    <template v-else>
      <div class="portfolio-grid">
        <div v-for="pf in portfolios" :key="pf.id" class="portfolio-card">
          <div class="portfolio-card-header">
            <div class="portfolio-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
            <div class="portfolio-info"><h3>{{ pf.title }}</h3><span>{{ getTemplateLabel(pf.template) }}</span></div>
            <button class="btn-icon" @click="editPortfolio(pf)" title="Редактировать"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
          </div>
          <div class="portfolio-card-body">
            <p v-if="pf.description" class="desc">{{ pf.description }}</p>
            <div class="stats"><span><strong>{{ pf.items?.length || 0 }}</strong> элементов</span><span>{{ new Date(pf.created_at).toLocaleDateString('ru-RU') }}</span></div>
            <div v-if="pf.items?.length" class="sections">
              <div v-for="section in [...new Set(pf.items.map(i => i.section))]" :key="section" class="section">
                <div class="section-title">{{ section }}</div>
                <div v-for="item in pf.items.filter(i => i.section === section)" :key="item.id" class="section-item">
                  <span>{{ getAchievementById(item.achievement_id)?.title }}</span>
                </div>
              </div>
            </div>
            <p v-else class="empty">Добавьте достижения в портфолио</p>
          </div>
          <div class="portfolio-card-footer">
            <button class="btn-ghost-sm" @click="deletePortfolio(pf.id)">🗑 Удалить</button>
            <div class="footer-right">
              <span class="access-badge" :class="pf.access_level">{{ { public: 'Публичный', link: 'По ссылке', private: 'Приватный' }[pf.access_level] }}</span>
              <button class="btn-ghost-sm" @click="exportToPdf(pf)">📄 Экспорт PDF</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create Modal (reused from student, simplified) -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header"><h2>Новое портфолио</h2><button class="modal-close" @click="showCreateModal = false">&times;</button></div>
        <form @submit.prevent="createPortfolio" class="modal-body">
          <div class="form-group"><label>Название *</label><input v-model="newPortfolio.title" required /></div>
          <div class="form-group"><label>Шаблон</label>
            <div class="template-options">
              <div v-for="t in templates" :key="t.value" class="template-option" :class="{ selected: newPortfolio.template === t.value }" @click="newPortfolio.template = t.value">
                <div class="template-name">{{ t.label }}</div>
                <div class="template-desc">{{ t.desc }}</div>
              </div>
            </div>
          </div>
          <div class="form-group"><label>Описание</label><textarea v-model="newPortfolio.description" rows="2"></textarea></div>
          <div class="form-group"><label>Доступ</label><select v-model="newPortfolio.access_level"><option value="public">Публичный</option><option value="link">По ссылке</option><option value="private">Приватный</option></select></div>
          <div class="modal-actions"><button type="button" class="btn btn-ghost" @click="showCreateModal = false">Отмена</button><button type="submit" class="btn btn-primary">Создать</button></div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingPortfolio" class="modal-overlay" @click.self="editingPortfolio = null">
      <div class="modal modal-lg">
        <div class="modal-header"><h2>Редактирование</h2><button class="modal-close" @click="editingPortfolio = null">&times;</button></div>
        <div class="modal-body">
          <div class="edit-layout">
            <div class="edit-panel"><h3>Достижения</h3>
              <div class="available-achievements">
                <div v-for="a in achievements.filter(ach => !editingPortfolio.items?.some(i => i.achievement_id === ach.id))" :key="a.id" class="available-item" @click="addItemToPortfolio(editingPortfolio, a)">
                  <span>{{ a.title }}</span><button class="add-btn">+</button>
                </div>
              </div>
            </div>
            <div class="edit-panel"><h3>Структура</h3>
              <div class="form-group"><label>Название</label><input v-model="editingPortfolio.title" /></div>
              <div class="edit-items">
                <div v-for="section in [...new Set(editingPortfolio.items?.map(i => i.section) || [])]" :key="section" class="edit-section">
                  <div class="edit-section-title">{{ section }}</div>
                  <div v-for="item in editingPortfolio.items?.filter(i => i.section === section)" :key="item.id" class="edit-item">
                    <span>{{ getAchievementById(item.achievement_id)?.title }}</span>
                    <button class="item-remove" @click="removeItem(editingPortfolio, item.id)">&times;</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-ghost" @click="editingPortfolio = null">Отмена</button><button class="btn btn-primary" @click="savePortfolio">Сохранить</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portfolio-page { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
.btn-primary { background: #4361ee; color: white; }
.btn-ghost { background: transparent; color: #6b7280; } .btn-ghost:hover { background: #f3f4f6; }
.btn-ghost-sm { background: transparent; color: #6b7280; border: none; cursor: pointer; font-size: 12px; padding: 6px 10px; border-radius: 6px; } .btn-ghost-sm:hover { background: #f3f4f6; }
.btn-icon { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 6px; border-radius: 6px; } .btn-icon:hover { background: #f3f4f6; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.portfolio-card { background: white; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
.portfolio-card-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; }
.portfolio-icon { width: 40px; height: 40px; background: #eef0ff; color: #4361ee; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.portfolio-info { flex: 1; } .portfolio-info h3 { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0; } .portfolio-info span { font-size: 12px; color: #6b7280; }
.portfolio-card-body { padding: 16px 20px; }
.desc { font-size: 13px; color: #6b7280; margin: 0 0 12px; }
.stats { display: flex; gap: 16px; font-size: 12px; color: #6b7280; margin-bottom: 12px; }
.sections { display: flex; flex-direction: column; gap: 8px; }
.section-title { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 4px; }
.section-item { display: flex; align-items: center; padding: 6px 10px; background: #f9fafb; border-radius: 6px; font-size: 12px; }
.empty { font-size: 13px; color: #9ca3af; text-align: center; padding: 16px; }
.portfolio-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid #f5f5f5; }
.footer-right { display: flex; align-items: center; gap: 8px; }
.access-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
.access-badge.public { background: #f0fdf4; color: #16a34a; } .access-badge.link { background: #fffbeb; color: #d97706; } .access-badge.private { background: #f3f4f6; color: #6b7280; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: white; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-lg { max-width: 900px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h2 { margin: 0; font-size: 18px; } .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px 24px; } .modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.template-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.template-option { padding: 12px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; } .template-option.selected { border-color: #4361ee; background: #eef0ff; }
.template-name { font-size: 13px; font-weight: 600; } .template-desc { font-size: 11px; color: #6b7280; }
.edit-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.edit-panel h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px; }
.available-achievements { display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto; }
.available-item { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; } .available-item:hover { background: #f0f4ff; }
.add-btn { width: 24px; height: 24px; border-radius: 6px; background: #eef0ff; color: #4361ee; border: none; cursor: pointer; font-weight: 700; }
.edit-items { display: flex; flex-direction: column; gap: 4px; }
.edit-section-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 2px; }
.edit-item { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; background: #f9fafb; border-radius: 6px; font-size: 12px; }
.item-remove { background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px; } .item-remove:hover { color: #dc2626; }
</style>