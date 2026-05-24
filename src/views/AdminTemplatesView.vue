<script setup>
import { ref, onMounted } from 'vue'

const templates = ref([])
const isLoading = ref(true)
const showEditModal = ref(false)
const editTemplate = ref({ title: '', description: '', type: '', sections: '' })

const templateTypes = [
  { value: 'cv', label: 'Резюме (CV-like)' },
  { value: 'academic', label: 'Академический' },
  { value: 'creative', label: 'Творческий' },
  { value: 'report', label: 'Аттестационный отчёт' }
]

onMounted(() => {
  setTimeout(() => {
    templates.value = [
      { id: 1, title: 'Для трудоустройства', type: 'cv', description: 'Стандартный шаблон в стиле резюме для HR-специалистов', sections: 'Образование, Опыт, Достижения, Навыки, Курсы', usedCount: 12, isActive: true },
      { id: 2, title: 'Академический', type: 'academic', description: 'Для научной и преподавательской деятельности', sections: 'Публикации, Конференции, Проекты, Награды', usedCount: 8, isActive: true },
      { id: 3, title: 'Для аттестации', type: 'report', description: 'Формализованный отчёт для подачи на высшую категорию', sections: 'Учебная деятельность, Развитие способностей, Личный вклад, Признание', usedCount: 5, isActive: true },
      { id: 4, title: 'Творческий', type: 'creative', description: 'Визуальный шаблон для портфолио творческих специальностей', sections: 'Портфолио работ, Проекты, Достижения', usedCount: 3, isActive: false },
      { id: 5, title: 'Студенческий', type: 'cv', description: 'Базовый шаблон для студентов', sections: 'Образование, Достижения, Навыки, Доп. образование', usedCount: 15, isActive: true }
    ]
    isLoading.value = false
  }, 300)
})

function openEdit(tpl) {
  editTemplate.value = { ...tpl, sections: tpl.sections }
  showEditModal.value = true
}

function saveTemplate() {
  const idx = templates.value.findIndex(t => t.id === editTemplate.value.id)
  if (idx !== -1) {
    templates.value[idx] = { ...editTemplate.value }
  }
  showEditModal.value = false
}

function toggleActive(tpl) {
  tpl.isActive = !tpl.isActive
}
</script>

<template>
  <div class="admin-templates">
    <div class="page-header"><div><h1>Шаблоны портфолио</h1><p class="subtitle">Управление визуальными шаблонами для сборки портфолио</p></div></div>
    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка шаблонов...</p></div>
    <template v-else>
      <div class="templates-grid">
        <div v-for="tpl in templates" :key="tpl.id" class="template-card" :class="{ inactive: !tpl.isActive }">
          <div class="tpl-header"><div class="tpl-icon">{{ tpl.type === 'cv' ? '📄' : tpl.type === 'academic' ? '🎓' : tpl.type === 'report' ? '📋' : '🎨' }}</div><div class="tpl-info"><div class="tpl-title">{{ tpl.title }}</div><div class="tpl-type">{{ templateTypes.find(t => t.value === tpl.type)?.label }}</div></div><label class="toggle"><input type="checkbox" :checked="tpl.isActive" @change="toggleActive(tpl)" /><span class="toggle-slider"></span></label></div>
          <div class="tpl-body"><p class="tpl-desc">{{ tpl.description }}</p><div class="tpl-sections"><span class="sections-label">Секции:</span><div class="sections-tags"><span v-for="s in tpl.sections.split(', ')" :key="s" class="section-tag">{{ s }}</span></div></div></div>
          <div class="tpl-footer"><span class="tpl-usage">Используется в {{ tpl.usedCount }} портфолио</span><button class="btn btn-ghost" @click="openEdit(tpl)">Редактировать</button></div>
        </div>
      </div>
    </template>
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal"><div class="modal-header"><h2>Редактирование шаблона</h2><button class="modal-close" @click="showEditModal = false">&times;</button></div><div class="modal-body"><div class="form-group"><label>Название</label><input v-model="editTemplate.title" /></div><div class="form-group"><label>Описание</label><textarea v-model="editTemplate.description" rows="2"></textarea></div><div class="form-group"><label>Тип</label><select v-model="editTemplate.type"><option v-for="t in templateTypes" :key="t.value" :value="t.value">{{ t.label }}</option></select></div><div class="form-group"><label>Секции (через запятую)</label><input v-model="editTemplate.sections" /></div></div><div class="modal-footer"><button class="btn btn-ghost" @click="showEditModal = false">Отмена</button><button class="btn btn-primary" @click="saveTemplate">Сохранить</button></div></div>
    </div>
  </div>
</template>
<style scoped>.admin-templates { max-width: 1200px; }.page-header { margin-bottom: 24px; }.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }.subtitle { font-size: 14px; color: #6b7280; margin: 0; }.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }@keyframes spin { to { transform: rotate(360deg); } }.templates-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }@media (max-width: 768px) { .templates-grid { grid-template-columns: 1fr; } }.template-card { background: white; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }.template-card.inactive { opacity: 0.6; }.tpl-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f5f5f5; }.tpl-icon { font-size: 28px; }.tpl-info { flex: 1; }.tpl-title { font-size: 15px; font-weight: 700; color: #1a1a2e; }.tpl-type { font-size: 12px; color: #6b7280; }.tpl-body { padding: 16px 20px; }.tpl-desc { font-size: 13px; color: #374151; margin: 0 0 12px; }.sections-label { font-size: 12px; font-weight: 600; color: #6b7280; display: block; margin-bottom: 6px; }.sections-tags { display: flex; flex-wrap: wrap; gap: 4px; }.section-tag { font-size: 11px; padding: 3px 8px; background: #f0f0f5; color: #6b7280; border-radius: 4px; }.tpl-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #f9fafb; }.tpl-usage { font-size: 12px; color: #9ca3af; }.toggle { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }.toggle input { opacity: 0; width: 0; height: 0; }.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 22px; transition: 0.3s; }.toggle-slider:before { content: ""; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }.toggle input:checked + .toggle-slider { background: #4361ee; }.toggle input:checked + .toggle-slider:before { transform: translateX(18px); }.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }.btn-primary { background: #4361ee; color: white; }.btn-ghost { background: transparent; color: #6b7280; }.btn-ghost:hover { background: #f3f4f6; }.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }.modal { background: white; border-radius: 16px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; }.modal-header h2 { margin: 0; font-size: 18px; }.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af; }.modal-body { padding: 20px 24px; }.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 8px; }.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }.form-group label { font-size: 13px; font-weight: 600; color: #374151; }.form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }</style>