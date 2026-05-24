<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_ACHIEVEMENTS, MOCK_PORTFOLIOS } from '@/services/authStore'

const portfolios = ref([])
const achievements = ref([])
const isLoading = ref(true)
const showCreateModal = ref(false)
const editingPortfolio = ref(null)
const draggedItem = ref(null)

const newPortfolio = ref({
  title: '',
  template: 'cv',
  description: '',
  access_level: 'public'
})

const templates = [
  { value: 'cv', label: 'Стиль резюме (CV)', desc: 'Для работодателей' },
  { value: 'academic', label: 'Академический', desc: 'Для учёбы и науки' },
  { value: 'creative', label: 'Творческий', desc: 'Для портфолио работ' }
]

function exportToPdf(pf) {
  // Собираем данные для PDF
  const sections = [...new Set(pf.items?.map(i => i.section) || [])]

  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
        h1 { font-size: 28px; margin-bottom: 6px; color: #1a1a2e; }
        .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
        hr { border: none; border-top: 2px solid #4361ee; margin-bottom: 24px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 16px; font-weight: 700; color: #4361ee; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .item { padding: 10px 14px; background: #f9fafb; border-radius: 8px; margin-bottom: 6px; font-size: 14px; }
        .item-title { font-weight: 600; color: #1a1a2e; }
        .item-desc { color: #6b7280; font-size: 13px; margin-top: 2px; }
        .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
        .badge { display: inline-block; padding: 2px 8px; background: #eef0ff; color: #4361ee; border-radius: 4px; font-size: 11px; margin-top: 4px; }
      </style>
    </head>
    <body>
      <h1>${pf.title}</h1>
      <div class="subtitle">Сформировано из электронного портфолио СахГУ</div>
      <hr>`

  sections.forEach(section => {
    content += `<div class="section"><div class="section-title">${section}</div>`
    pf.items.filter(i => i.section === section).forEach(item => {
      const ach = getAchievementById(item.achievement_id)
      if (ach) {
        content += `<div class="item">
          <div class="item-title">${ach.title}</div>
          <div class="item-desc">${ach.description || ''} ${ach.date ? '• ' + ach.date : ''}</div>
          ${ach.skills?.length ? '<div>' + ach.skills.map(s => `<span class="badge">${s}</span>`).join(' ') + '</div>' : ''}
        </div>`
      }
    })
    content += `</div>`
  })

  content += `<div class="footer">Сахалинский государственный университет • Электронное портфолио</div></body></html>`

  // Открываем в новом окне для печати/сохранения PDF
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(content)
    win.document.close()
    win.focus()
  }
}

onMounted(() => {
  setTimeout(() => {
    portfolios.value = MOCK_PORTFOLIOS
    achievements.value = MOCK_ACHIEVEMENTS
    isLoading.value = false
  }, 300)
})

function createPortfolio() {
  const pf = {
    id: Date.now(),
    title: newPortfolio.value.title,
    template: newPortfolio.value.template,
    description: newPortfolio.value.description,
    access_level: newPortfolio.value.access_level,
    created_at: new Date().toISOString().split('T')[0],
    items: []
  }
  portfolios.value.push(pf)
  showCreateModal.value = false
  newPortfolio.value = { title: '', template: 'cv', description: '', access_level: 'public' }
}

function deletePortfolio(id) {
  portfolios.value = portfolios.value.filter(p => p.id !== id)
}

function editPortfolio(pf) {
  editingPortfolio.value = JSON.parse(JSON.stringify(pf))
}

function savePortfolio() {
  const idx = portfolios.value.findIndex(p => p.id === editingPortfolio.value.id)
  if (idx !== -1) {
    portfolios.value[idx] = editingPortfolio.value
  }
  editingPortfolio.value = null
}

function addItemToPortfolio(pf, achievement) {
  if (!pf.items) pf.items = []
  const section = achievement.category
  pf.items.push({
    id: Date.now(),
    achievement_id: achievement.id,
    section,
    display_order: pf.items.length
  })
}

function removeItem(pf, itemId) {
  pf.items = pf.items.filter(i => i.id !== itemId)
}

function getAchievementById(id) {
  return achievements.value.find(a => a.id === id)
}

function getTemplateLabel(val) {
  const t = templates.find(t => t.value === val)
  return t ? t.label : val
}

function getStatusLabel(status) {
  return { approved: 'Подтверждено', pending: 'На проверке', rejected: 'Отклонено' }[status] || status
}
</script>

<template>
  <div class="portfolio-page">
    <div class="page-header">
      <div>
        <h1>Конструктор портфолио</h1>
        <p class="subtitle">Создавайте и настраивайте свои портфолио для разных целей</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Создать портфолио
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Загрузка портфолио...</p>
    </div>

    <template v-else>
      <!-- Portfolio Cards -->
      <div class="portfolio-grid">
        <div v-for="pf in portfolios" :key="pf.id" class="portfolio-card">
          <div class="portfolio-card-header">
            <div class="portfolio-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                <path d="M8 7h8M8 11h6M8 15h4" />
              </svg>
            </div>
            <div class="portfolio-info">
              <h3 class="portfolio-title">{{ pf.title }}</h3>
              <span class="portfolio-template">{{ getTemplateLabel(pf.template) }}</span>
            </div>
            <button class="portfolio-menu-btn" @click="editPortfolio(pf)" title="Редактировать">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          <div class="portfolio-card-body">
            <p v-if="pf.description" class="portfolio-desc">{{ pf.description }}</p>
            <div class="portfolio-stats">
              <span class="portfolio-stat">
                <strong>{{ pf.items?.length || 0 }}</strong> элементов
              </span>
              <span class="portfolio-stat">
                <strong>{{ new Date(pf.created_at).toLocaleDateString('ru-RU') }}</strong>
              </span>
            </div>

            <!-- Sections -->
            <div class="portfolio-sections" v-if="pf.items?.length">
              <div v-for="(section, idx) in [...new Set(pf.items.map(i => i.section))]" :key="idx" class="section-block">
                <div class="section-title">{{ section }}</div>
                <div class="section-items">
                  <div v-for="item in pf.items.filter(i => i.section === section)" :key="item.id" class="section-item" draggable="true">
                    <span class="item-title">{{ getAchievementById(item.achievement_id)?.title || 'Достижение' }}</span>
                    <button class="item-remove" @click="removeItem(pf, item.id)">&times;</button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="empty-sections">Добавьте достижения в портфолио</p>
          </div>

          <div class="portfolio-card-footer">
            <button class="btn btn-ghost-sm" @click="deletePortfolio(pf.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Удалить
            </button>
            <div class="footer-right">
              <span class="access-badge" :class="pf.access_level">
                {{ pf.access_level === 'public' ? 'Публичный' : pf.access_level === 'link' ? 'По ссылке' : 'Приватный' }}
              </span>
              <button class="btn btn-ghost-sm" @click="exportToPdf(pf)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Экспорт PDF
              </button>
            </div>
          </div>
        </div>

        <!-- Create Card -->
        <div class="create-card" @click="showCreateModal = true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <p>Создать новое портфолио</p>
        </div>
      </div>

      <!-- Create Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Новое портфолио</h2>
            <button class="modal-close" @click="showCreateModal = false">&times;</button>
          </div>
          <form @submit.prevent="createPortfolio" class="modal-body">
            <div class="form-group">
              <label>Название *</label>
              <input v-model="newPortfolio.title" required placeholder="Например: Портфолио для трудоустройства" />
            </div>
            <div class="form-group">
              <label>Шаблон оформления</label>
              <div class="template-options">
                <div
                  v-for="t in templates"
                  :key="t.value"
                  class="template-option"
                  :class="{ selected: newPortfolio.template === t.value }"
                  @click="newPortfolio.template = t.value"
                >
                  <div class="template-name">{{ t.label }}</div>
                  <div class="template-desc">{{ t.desc }}</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="newPortfolio.description" rows="2" placeholder="Для кого это портфолио?"></textarea>
            </div>
            <div class="form-group">
              <label>Уровень доступа</label>
              <select v-model="newPortfolio.access_level">
                <option value="public">Публичный (видят все)</option>
                <option value="link">Только по ссылке</option>
                <option value="private">Приватный (только я)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="showCreateModal = false">Отмена</button>
              <button type="submit" class="btn btn-primary">Создать</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="editingPortfolio" class="modal-overlay" @click.self="editingPortfolio = null">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h2>Редактирование: {{ editingPortfolio.title }}</h2>
            <button class="modal-close" @click="editingPortfolio = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="edit-layout">
              <!-- Left: Available Achievements -->
              <div class="edit-panel">
                <h3>Доступные достижения</h3>
                <div class="available-achievements">
                  <div
                    v-for="a in achievements.filter(ach => !editingPortfolio.items?.some(i => i.achievement_id === ach.id))"
                    :key="a.id"
                    class="available-item"
                    @click="addItemToPortfolio(editingPortfolio, a)"
                  >
                    <span class="available-icon">{{ { science: '🔬', education: '📚', social: '🤝', sport: '⚽', creative: '🎨' }[a.type] || '📌' }}</span>
                    <div class="available-info">
                      <span class="available-title">{{ a.title }}</span>
                      <span class="available-meta">{{ a.category }} • {{ getStatusLabel(a.status) }}</span>
                    </div>
                    <button class="add-btn" title="Добавить">+</button>
                  </div>
                </div>
              </div>

              <!-- Right: Portfolio structure -->
              <div class="edit-panel">
                <h3>Структура портфолио</h3>
                <div class="form-group">
                  <label>Название</label>
                  <input v-model="editingPortfolio.title" />
                </div>
                <div class="form-group">
                  <label>Уровень доступа</label>
                  <select v-model="editingPortfolio.access_level">
                    <option value="public">Публичный</option>
                    <option value="link">По ссылке</option>
                    <option value="private">Приватный</option>
                  </select>
                </div>
                <div class="edit-items">
                  <div v-for="(section, idx) in [...new Set(editingPortfolio.items?.map(i => i.section) || [])]" :key="idx" class="edit-section">
                    <div class="edit-section-title">{{ section }}</div>
                    <div
                      v-for="item in editingPortfolio.items?.filter(i => i.section === section)"
                      :key="item.id"
                      class="edit-item"
                    >
                      <span class="edit-item-title">{{ getAchievementById(item.achievement_id)?.title }}</span>
                      <button class="item-remove" @click="removeItem(editingPortfolio, item.id)">&times;</button>
                    </div>
                  </div>
                  <p v-if="!editingPortfolio.items?.length" class="empty-items">Нажмите на достижение слева, чтобы добавить его</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="editingPortfolio = null">Отмена</button>
            <button class="btn btn-primary" @click="savePortfolio">Сохранить</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.portfolio-page { max-width: 1200px; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
}
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
  text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
}
.btn-primary { background: #4361ee; color: white; }
.btn-primary:hover { background: #3651d4; }
.btn-ghost { background: transparent; color: #6b7280; padding: 9px 18px; }
.btn-ghost:hover { background: #f3f4f6; }
.btn-ghost-sm {
  background: transparent; color: #6b7280; border: none; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 6px 10px; border-radius: 6px;
}
.btn-ghost-sm:hover { background: #f3f4f6; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee;
  border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

.portfolio-card {
  background: white; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;
}
.portfolio-card-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid #f5f5f5;
}
.portfolio-icon {
  width: 44px; height: 44px; background: #eef0ff; color: #4361ee;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.portfolio-info { flex: 1; min-width: 0; }
.portfolio-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0; }
.portfolio-template { font-size: 12px; color: #6b7280; }
.portfolio-menu-btn {
  background: none; border: none; color: #9ca3af; cursor: pointer;
  padding: 6px; border-radius: 6px;
}
.portfolio-menu-btn:hover { background: #f3f4f6; color: #374151; }

.portfolio-card-body { padding: 16px 20px; }
.portfolio-desc { font-size: 13px; color: #6b7280; margin: 0 0 12px; }
.portfolio-stats { display: flex; gap: 16px; margin-bottom: 12px; }
.portfolio-stat { font-size: 12px; color: #6b7280; }

.portfolio-sections { display: flex; flex-direction: column; gap: 12px; }
.section-block { }
.section-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; }
.section-items { display: flex; flex-direction: column; gap: 4px; }
.section-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; background: #f9fafb; border-radius: 6px; font-size: 12px;
}
.section-item:hover { background: #f0f0f5; }
.item-title { color: #374151; }
.item-remove {
  background: none; border: none; color: #9ca3af; cursor: pointer;
  font-size: 16px; padding: 0 2px;
}
.item-remove:hover { color: #dc2626; }
.empty-sections { font-size: 13px; color: #9ca3af; text-align: center; padding: 16px; }

.portfolio-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid #f5f5f5;
}
.footer-right { display: flex; align-items: center; gap: 8px; }
.access-badge {
  font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500;
}
.access-badge.public { background: #f0fdf4; color: #16a34a; }
.access-badge.link { background: #fffbeb; color: #d97706; }
.access-badge.private { background: #f3f4f6; color: #6b7280; }

.create-card {
  background: white; border: 2px dashed #e5e7eb; border-radius: 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px; cursor: pointer; transition: all 0.2s;
}
.create-card:hover { border-color: #4361ee; background: #fafbff; }
.create-card p { font-size: 14px; color: #9ca3af; margin: 8px 0 0; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.modal {
  background: white; border-radius: 16px; width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
}
.modal-lg { max-width: 900px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
}
.modal-header h2 { margin: 0; font-size: 18px; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group select, .form-group textarea {
  padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
}

.template-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.template-option {
  padding: 12px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s;
}
.template-option:hover { border-color: #c7d2fe; }
.template-option.selected { border-color: #4361ee; background: #eef0ff; }
.template-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.template-desc { font-size: 11px; color: #6b7280; margin-top: 2px; }

/* Edit Layout */
.edit-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.edit-panel h3 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }

.available-achievements {
  display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto;
}
.available-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.available-item:hover { background: #f0f4ff; }
.available-icon { font-size: 18px; }
.available-info { flex: 1; min-width: 0; }
.available-title { font-size: 13px; font-weight: 500; color: #1a1a2e; display: block; }
.available-meta { font-size: 11px; color: #6b7280; }
.add-btn {
  width: 24px; height: 24px; border-radius: 6px; background: #eef0ff; color: #4361ee;
  border: none; cursor: pointer; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center;
}
.add-btn:hover { background: #4361ee; color: white; }

.edit-items { display: flex; flex-direction: column; gap: 8px; }
.edit-section { }
.edit-section-title { font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
.edit-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 10px; background: #f9fafb; border-radius: 6px; font-size: 12px;
}
.edit-item-title { color: #374151; }
.empty-items { font-size: 13px; color: #9ca3af; text-align: center; padding: 20px; }
</style>