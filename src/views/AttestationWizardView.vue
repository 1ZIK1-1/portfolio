<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_TEACHER_ACHIEVEMENTS, MOCK_USER_TEACHER } from '@/services/authStore'

const achievements = ref([])
const currentStep = ref(1)
const isLoading = ref(true)
const showResult = ref(false)

const reportPeriod = ref({
  from: '2021-09-01',
  to: '2026-06-30'
})

onMounted(() => {
  setTimeout(() => {
    achievements.value = MOCK_TEACHER_ACHIEVEMENTS
    isLoading.value = false
  }, 300)
})

const attestedAchievements = computed(() => achievements.value.filter(a => a.status === 'approved'))

const categoryGroups = computed(() => {
  const groups = {}
  attestedAchievements.value.forEach(a => {
    if (!groups[a.category]) groups[a.category] = []
    groups[a.category].push(a)
  })
  return groups
})

const allSkills = computed(() => {
  const s = new Set()
  attestedAchievements.value.forEach(a => a.skills.forEach(sk => s.add(sk)))
  return [...s]
})

function nextStep() {
  if (currentStep.value < 4) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function generateReport() {
  showResult.value = true
  currentStep.value = 4
}

function exportPdf() {
  let content = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
    h1 { font-size: 24px; margin-bottom: 4px; color: #1a1a2e; }
    .title { font-size: 16px; color: #4361ee; margin-bottom: 20px; }
    .header-info { display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    hr { border: none; border-top: 2px solid #4361ee; margin-bottom: 20px; }
    h2 { font-size: 16px; color: #4361ee; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; }
    .item { padding: 8px 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 4px; font-size: 13px; }
    .item-title { font-weight: 600; }
    .item-desc { color: #6b7280; font-size: 12px; }
    .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; }
    .total { margin-top: 20px; padding: 12px; background: #eef0ff; border-radius: 8px; font-size: 14px; }
    .total strong { color: #4361ee; }
  </style></head><body>
    <h1>Аттестационный отчёт</h1>
    <div class="title">Для установления высшей квалификационной категории</div>
    <hr>
    <div class="header-info">
      <span><strong>Преподаватель:</strong> ${MOCK_USER_TEACHER.name}</span>
      <span><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</span>
    </div>
    <div class="header-info">
      <span><strong>Должность:</strong> ${MOCK_USER_TEACHER.position}</span>
      <span><strong>Кафедра:</strong> ${MOCK_USER_TEACHER.department}</span>
    </div>
    <div class="header-info">
      <span><strong>Период:</strong> ${reportPeriod.value.from} — ${reportPeriod.value.to}</span>
      <span><strong>Всего достижений:</strong> ${attestedAchievements.value.length}</span>
    </div>
    <hr>`

  Object.entries(categoryGroups.value).forEach(([cat, items]) => {
    content += `<h2>${cat}</h2>`
    items.forEach(a => {
      content += `<div class="item">
        <div class="item-title">${a.title}</div>
        <div class="item-desc">${a.description || ''} ${a.date ? '• ' + a.date : ''}${a.level ? ' • Уровень: ' + a.level : ''}</div>
      </div>`
    })
  })

  content += `<div class="total">Всего подтверждённых достижений: <strong>${attestedAchievements.value.length}</strong></div>`
  content += `<div class="footer">Сахалинский государственный университет • Электронное портфолио • Сформировано ${new Date().toLocaleString('ru-RU')}</div></body></html>`

  const win = window.open('', '_blank')
  if (win) { win.document.write(content); win.document.close(); win.focus() }
}
</script>

<template>
  <div class="wizard-page">
    <div class="page-header">
      <div>
        <h1>Мастер аттестационных отчётов</h1>
        <p class="subtitle">Формирование отчёта для подачи на высшую квалификационную категорию</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка данных...</p></div>

    <template v-else>
      <!-- Progress Steps -->
      <div class="steps">
        <div v-for="step in 4" :key="step" class="step" :class="{ active: currentStep >= step, done: currentStep > step }">
          <div class="step-number">{{ step }}</div>
          <div class="step-label">
            <template v-if="step === 1">Выбор периода</template>
            <template v-else-if="step === 2">Агрегация данных</template>
            <template v-else-if="step === 3">Предпросмотр</template>
            <template v-else>Экспорт</template>
          </div>
        </div>
      </div>

      <div class="wizard-content">
        <!-- Step 1: Period selection -->
        <div v-if="currentStep === 1" class="wizard-card">
          <h2>Шаг 1: Выбор периода</h2>
          <p class="wizard-desc">Выберите период, за который формируется отчёт. Для аттестации на высшую категорию — последние 5 лет.</p>
          <div class="period-form">
            <div class="form-row">
              <div class="form-group">
                <label>Начало периода</label>
                <input v-model="reportPeriod.from" type="date" />
              </div>
              <div class="form-group">
                <label>Окончание периода</label>
                <input v-model="reportPeriod.to" type="date" />
              </div>
            </div>
            <div class="period-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              <span>Автоматически установлен период 5 лет. Вы можете изменить даты вручную.</span>
            </div>
          </div>
          <div class="wizard-nav">
            <span></span>
            <button class="btn btn-primary" @click="nextStep">Далее →</button>
          </div>
        </div>

        <!-- Step 2: Data aggregation -->
        <div v-if="currentStep === 2" class="wizard-card">
          <h2>Шаг 2: Автоматическая агрегация данных</h2>
          <p class="wizard-desc">Система собрала следующие данные по категориям:</p>
          <div class="aggregation-list">
            <div v-for="(items, cat) in categoryGroups" :key="cat" class="agg-item">
              <div class="agg-header">
                <span class="agg-category">{{ cat }}</span>
                <span class="agg-count">{{ items.length }} {{ items.length === 1 ? 'достижение' : items.length < 5 ? 'достижения' : 'достижений' }}</span>
              </div>
              <div class="agg-items">
                <div v-for="a in items" :key="a.id" class="agg-row">
                  <span class="agg-title">{{ a.title }}</span>
                  <span class="agg-source">{{ { manual: 'Ручной', moodle: 'Moodle', cdo: 'ЦДО' }[a.source] || a.source }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="aggregation-total">
            <strong>Всего:</strong> {{ attestedAchievements.length }} подтверждённых достижений
            <span v-if="allSkills.length"> • {{ allSkills.length }} навыков</span>
          </div>
          <div class="wizard-nav">
            <button class="btn btn-ghost" @click="prevStep">← Назад</button>
            <button class="btn btn-primary" @click="nextStep">Далее →</button>
          </div>
        </div>

        <!-- Step 3: Preview -->
        <div v-if="currentStep === 3" class="wizard-card">
          <h2>Шаг 3: Предпросмотр отчёта</h2>
          <p class="wizard-desc">Проверьте сформированный отчёт перед экспортом.</p>
          <div class="preview-report">
            <div class="preview-header">
              <h3>Аттестационный отчёт</h3>
              <p class="preview-subtitle">Для установления высшей квалификационной категории</p>
            </div>
            <div class="preview-meta">
              <div><strong>Преподаватель:</strong> {{ MOCK_USER_TEACHER.name }}</div>
              <div><strong>Должность:</strong> {{ MOCK_USER_TEACHER.position }}</div>
              <div><strong>Кафедра:</strong> {{ MOCK_USER_TEACHER.department }}</div>
              <div><strong>Период:</strong> {{ reportPeriod.from }} — {{ reportPeriod.to }}</div>
            </div>
            <hr>
            <div v-for="(items, cat) in categoryGroups" :key="cat" class="preview-section">
              <h4>{{ cat }}</h4>
              <div v-for="a in items" :key="a.id" class="preview-item">
                <div class="preview-item-title">{{ a.title }}</div>
                <div class="preview-item-desc">{{ a.description }} • {{ a.date }}{{ a.level ? ' • ' + a.level : '' }}</div>
              </div>
            </div>
            <div class="preview-total">Всего подтверждённых достижений: <strong>{{ attestedAchievements.length }}</strong></div>
          </div>
          <div class="wizard-nav">
            <button class="btn btn-ghost" @click="prevStep">← Назад</button>
            <button class="btn btn-primary" @click="generateReport">Сформировать отчёт →</button>
          </div>
        </div>

        <!-- Step 4: Export -->
        <div v-if="currentStep === 4" class="wizard-card">
          <div class="export-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2>Отчёт сформирован!</h2>
            <p>Аттестационный отчёт готов к экспорту. Вы можете скачать его в формате PDF.</p>
          </div>

          <div class="export-summary">
            <div class="summary-item">
              <span class="summary-label">Преподаватель</span>
              <span class="summary-value">{{ MOCK_USER_TEACHER.name }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Период</span>
              <span class="summary-value">{{ reportPeriod.from }} — {{ reportPeriod.to }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Категорий</span>
              <span class="summary-value">{{ Object.keys(categoryGroups).length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Достижений</span>
              <span class="summary-value">{{ attestedAchievements.length }}</span>
            </div>
          </div>

          <div class="wizard-nav">
            <button class="btn btn-ghost" @click="currentStep = 1">Начать заново</button>
            <button class="btn btn-primary" @click="exportPdf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Скачать PDF
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.wizard-page { max-width: 900px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

.steps { display: flex; margin-bottom: 32px; gap: 0; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.step { display: flex; align-items: center; gap: 10px; flex: 1; position: relative; }
.step::after { content: ''; position: absolute; right: -50%; top: 20px; width: 100%; height: 2px; background: #e5e7eb; z-index: 0; }
.step:last-child::after { display: none; }
.step.done::after { background: #4361ee; }
.step-number { width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; color: #9ca3af; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; z-index: 1; transition: all 0.3s; }
.step.active .step-number { background: #4361ee; color: white; }
.step.done .step-number { background: #16a34a; color: white; }
.step-label { font-size: 13px; color: #9ca3af; font-weight: 500; white-space: nowrap; }
.step.active .step-label { color: #4361ee; font-weight: 600; }
.step.done .step-label { color: #16a34a; }

.wizard-content { }
.wizard-card { background: white; border-radius: 14px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.wizard-card h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.wizard-desc { font-size: 14px; color: #6b7280; margin-bottom: 24px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.form-group input:focus { border-color: #4361ee; box-shadow: 0 0 0 3px rgba(67,97,238,0.1); }
.period-info { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; padding: 12px; background: #f9fafb; border-radius: 8px; }

.wizard-nav { display: flex; justify-content: space-between; margin-top: 28px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; }
.btn-primary { background: #4361ee; color: white; } .btn-primary:hover { background: #3651d4; }
.btn-ghost { background: transparent; color: #6b7280; } .btn-ghost:hover { background: #f3f4f6; }

/* Aggregation */
.aggregation-list { display: flex; flex-direction: column; gap: 16px; }
.agg-item { }
.agg-header { display: flex; justify-content: space-between; padding: 10px 14px; background: #eef0ff; border-radius: 8px; font-size: 14px; }
.agg-category { font-weight: 600; color: #4361ee; }
.agg-count { color: #6b7280; font-size: 13px; }
.agg-items { padding: 8px 0; }
.agg-row { display: flex; justify-content: space-between; padding: 6px 14px; font-size: 13px; }
.agg-title { color: #1a1a2e; }
.agg-source { color: #6b7280; font-size: 11px; padding: 2px 8px; background: #f0f0f5; border-radius: 4px; }
.aggregation-total { margin-top: 16px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; font-size: 14px; color: #166534; }

/* Preview */
.preview-report { background: #f9fafb; border-radius: 10px; padding: 24px; font-size: 13px; }
.preview-header { margin-bottom: 16px; }
.preview-header h3 { font-size: 18px; color: #1a1a2e; margin: 0 0 4px; }
.preview-subtitle { color: #4361ee; font-weight: 500; margin: 0; }
.preview-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px; color: #374151; margin-bottom: 12px; }
.preview-report hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
.preview-section { margin-bottom: 16px; }
.preview-section h4 { font-size: 14px; color: #4361ee; margin-bottom: 6px; }
.preview-item { padding: 6px 0; }
.preview-item-title { font-weight: 600; color: #1a1a2e; }
.preview-item-desc { color: #6b7280; font-size: 12px; }
.preview-total { margin-top: 12px; padding: 10px; background: #eef0ff; border-radius: 6px; font-size: 14px; color: #4361ee; }

/* Export */
.export-success { text-align: center; padding: 24px; }
.export-success h2 { margin-top: 12px; }
.export-success p { color: #6b7280; font-size: 14px; }
.export-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
.summary-item { text-align: center; padding: 16px; background: #f9fafb; border-radius: 10px; }
.summary-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.summary-value { font-size: 16px; font-weight: 700; color: #1a1a2e; }
</style>