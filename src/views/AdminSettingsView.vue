<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(true)
const activeTab = ref('general')
const settings = ref({
  general: {
    siteName: 'Электронное портфолио СахГУ',
    maxFileSize: 10,
    allowedExtensions: 'pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg,gif,txt',
    defaultTemplate: 'cv'
  },
  moodle: {
    enabled: true,
    url: 'https://moodle.sakhgu.ru',
    apiKey: '••••••••••••••••',
    syncInterval: 24,
    autoImport: true
  },
  cdo: {
    enabled: true,
    url: 'https://cdo.sakhgu.ru',
    apiKey: '••••••••••••••••',
    syncInterval: 24
  },
  access: {
    allowGuestView: true,
    requireVerification: true,
    maxPortfoliosPerUser: 10,
    defaultAccessLevel: 'private'
  }
})

const templates = ['cv', 'academic', 'creative', 'report']

onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 300)
})

function saveSettings() {
  alert('Настройки сохранены.')
}

function testConnection(system) {
  alert(`Проверка подключения к ${system === 'moodle' ? 'Moodle' : 'ЦДО'}...\n\nСтатус: Подключение успешно.`)
}
</script>

<template>
  <div class="admin-settings">
    <div class="page-header">
      <div>
        <h1>Настройки системы</h1>
        <p class="subtitle">Управление параметрами интеграций и конфигурацией модуля</p>
      </div>
      <button class="btn btn-primary" @click="saveSettings">Сохранить настройки</button>
    </div>

    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>Загрузка...</p></div>

    <template v-else>
      <div class="settings-tabs">
        <button class="st-tab" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">Основные</button>
        <button class="st-tab" :class="{ active: activeTab === 'moodle' }" @click="activeTab = 'moodle'">Moodle</button>
        <button class="st-tab" :class="{ active: activeTab === 'cdo' }" @click="activeTab = 'cdo'">ЦДО</button>
        <button class="st-tab" :class="{ active: activeTab === 'access' }" @click="activeTab = 'access'">Доступ</button>
      </div>

      <div v-if="activeTab === 'general'" class="settings-section">
        <h3>Основные настройки</h3>
        <div class="settings-card">
          <div class="form-group"><label>Название системы</label><input v-model="settings.general.siteName" /></div>
          <div class="form-row">
            <div class="form-group"><label>Макс. размер файла (МБ)</label><input v-model.number="settings.general.maxFileSize" type="number" /></div>
            <div class="form-group"><label>Шаблон по умолчанию</label><select v-model="settings.general.defaultTemplate"><option v-for="t in templates" :key="t" :value="t">{{ t }}</option></select></div>
          </div>
          <div class="form-group"><label>Разрешённые расширения</label><input v-model="settings.general.allowedExtensions" /></div>
        </div>
      </div>

      <div v-if="activeTab === 'moodle'" class="settings-section">
        <h3>Интеграция с Moodle</h3>
        <div class="settings-card">
          <div class="form-group"><label class="checkbox-label"><input v-model="settings.moodle.enabled" type="checkbox" /><span>Включить интеграцию</span></label></div>
          <div class="form-group"><label>URL сервера</label><input v-model="settings.moodle.url" :disabled="!settings.moodle.enabled" /></div>
          <div class="form-group"><label>API ключ</label><input v-model="settings.moodle.apiKey" type="password" :disabled="!settings.moodle.enabled" /></div>
          <div class="form-row">
            <div class="form-group"><label>Интервал синхронизации (часы)</label><input v-model.number="settings.moodle.syncInterval" type="number" :disabled="!settings.moodle.enabled" /></div>
            <div class="form-group" style="justify-content:flex-end;display:flex;"><button class="btn btn-outline" @click="testConnection('moodle')" :disabled="!settings.moodle.enabled">Проверить подключение</button></div>
          </div>
          <div class="form-group"><label class="checkbox-label"><input v-model="settings.moodle.autoImport" type="checkbox" :disabled="!settings.moodle.enabled" /><span>Автоматический импорт достижений</span></label></div>
        </div>
      </div>

      <div v-if="activeTab === 'cdo'" class="settings-section">
        <h3>Интеграция с ЦДО</h3>
        <div class="settings-card">
          <div class="form-group"><label class="checkbox-label"><input v-model="settings.cdo.enabled" type="checkbox" /><span>Включить интеграцию</span></label></div>
          <div class="form-group"><label>URL сервера</label><input v-model="settings.cdo.url" :disabled="!settings.cdo.enabled" /></div>
          <div class="form-group"><label>API ключ</label><input v-model="settings.cdo.apiKey" type="password" :disabled="!settings.cdo.enabled" /></div>
          <div class="form-row">
            <div class="form-group"><label>Интервал синхронизации (часы)</label><input v-model.number="settings.cdo.syncInterval" type="number" :disabled="!settings.cdo.enabled" /></div>
            <div class="form-group" style="justify-content:flex-end;display:flex;"><button class="btn btn-outline" @click="testConnection('cdo')" :disabled="!settings.cdo.enabled">Проверить подключение</button></div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'access'" class="settings-section">
        <h3>Настройки доступа</h3>
        <div class="settings-card">
          <div class="form-group"><label class="checkbox-label"><input v-model="settings.access.allowGuestView" type="checkbox" /><span>Разрешить просмотр гостям (по ссылке)</span></label></div>
          <div class="form-group"><label class="checkbox-label"><input v-model="settings.access.requireVerification" type="checkbox" /><span>Требовать верификацию достижений</span></label></div>
          <div class="form-row">
            <div class="form-group"><label>Макс. портфолио на пользователя</label><input v-model.number="settings.access.maxPortfoliosPerUser" type="number" /></div>
            <div class="form-group"><label>Уровень доступа по умолчанию</label><select v-model="settings.access.defaultAccessLevel"><option value="private">Приватный</option><option value="link">По ссылке</option><option value="public">Публичный</option></select></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-settings { max-width: 800px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
.subtitle { font-size: 14px; color: #6b7280; margin: 0; }
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #6b7280; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #4361ee; border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.settings-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #e5e7eb; padding: 4px; border-radius: 10px; width: fit-content; flex-wrap: wrap; }
.st-tab { padding: 8px 18px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; background: transparent; color: #6b7280; transition: all 0.2s; }
.st-tab.active { background: white; color: #1a1a2e; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.settings-section { }
.settings-section h3 { font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }
.settings-card { background: white; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group select { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.form-group input:disabled, .form-group select:disabled { background: #f9fafb; color: #9ca3af; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500 !important; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: #4361ee; color: white; }
.btn-primary:hover { background: #3651d4; }
.btn-outline { background: white; color: #4361ee; border: 1.5px solid #4361ee; }
.btn-outline:hover { background: #eef0ff; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
</style>