<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/services/authStore'

const { state, updateProfile, updateAvatar } = useAuth()
const isEditing = ref(false)
const fileInputRef = ref(null)

const editForm = ref({ name: '', bio: '', department: '', position: '', phone: '', telegram: '' })
const avatarPreview = ref(null)

function startEditing() {
  const u = state.user
  editForm.value = { name: u?.name || '', bio: u?.bio || '', department: u?.department || '', position: u?.position || '', phone: u?.phone || '', telegram: u?.telegram || '' }
  avatarPreview.value = null
  isEditing.value = true
}

function saveProfile() { updateProfile(editForm.value); isEditing.value = false }
function cancelEdit() { isEditing.value = false; avatarPreview.value = null }

function triggerFileInput() { fileInputRef.value?.click() }

function handleAvatarUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { updateAvatar(e.target.result); avatarPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

function removeAvatar() { updateAvatar(null); avatarPreview.value = null }

const initials = computed(() => (state.user?.name || '').split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase())
const currentAvatar = computed(() => avatarPreview.value || state.user?.avatar || null)
</script>
<template>
  <div class="profile-page">
    <div class="page-header"><h1>Профиль преподавателя</h1></div>
    <div class="profile-layout">
      <div class="profile-card profile-main">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <div v-if="currentAvatar" class="avatar-img"><img :src="currentAvatar" :alt="state.user?.name" /></div>
            <div v-else class="avatar-large">{{ initials }}</div>
            <div class="avatar-overlay"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
          </div>
          <div class="avatar-info">
            <h2>{{ state.user?.name }}</h2>
            <p class="avatar-role">{{ state.user?.position }} • {{ state.user?.department }}</p>
            <button v-if="currentAvatar" class="btn-avatar-remove" @click.stop="removeAvatar">Удалить фото</button>
          </div>
          <input ref="fileInputRef" type="file" accept="image/*" hidden @change="handleAvatarUpload" />
        </div>

        <div v-if="!isEditing" class="profile-details">
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">{{ state.user?.email }}</span></div>
            <div class="detail-item"><span class="detail-label">Институт</span><span class="detail-value">{{ state.user?.institute }}</span></div>
            <div class="detail-item"><span class="detail-label">Кафедра</span><span class="detail-value">{{ state.user?.department }}</span></div>
            <div class="detail-item"><span class="detail-label">Должность</span><span class="detail-value">{{ state.user?.position }}</span></div>
            <div class="detail-item"><span class="detail-label">О себе</span><span class="detail-value">{{ state.user?.bio || 'Не указано' }}</span></div>
            <div class="detail-item"><span class="detail-label">Телефон</span><span class="detail-value">{{ state.user?.phone || 'Не указан' }}</span></div>
            <div class="detail-item"><span class="detail-label">Telegram</span><span class="detail-value">{{ state.user?.telegram || 'Не указан' }}</span></div>
          </div>
          <button class="btn btn-primary" @click="startEditing">Редактировать профиль</button>
        </div>

        <div v-else class="profile-edit">
          <div class="form-group"><label>ФИО</label><input v-model="editForm.name" /></div>
          <div class="form-group"><label>Кафедра</label><input v-model="editForm.department" /></div>
          <div class="form-group"><label>Должность</label><input v-model="editForm.position" /></div>
          <div class="form-group"><label>О себе</label><textarea v-model="editForm.bio" rows="3"></textarea></div>
          <div class="form-group"><label>Телефон</label><input v-model="editForm.phone" /></div>
          <div class="form-group"><label>Telegram</label><input v-model="editForm.telegram" /></div>
          <div class="form-actions"><button class="btn btn-ghost" @click="cancelEdit">Отмена</button><button class="btn btn-primary" @click="saveProfile">Сохранить</button></div>
        </div>
      </div>

      <div class="profile-side">
        <div class="profile-card"><h3>Статистика</h3>
          <div class="stat-rows">
            <div class="stat-row"><span class="stat-row-label">Роль</span><span class="stat-row-value">Преподаватель</span></div>
            <div class="stat-row"><span class="stat-row-label">Статус</span><span class="stat-row-value" style="color:#16a34a;">Активен</span></div>
          </div>
        </div>
        <div class="profile-card"><h3>Настройки</h3>
          <div class="settings-group">
            <div class="setting-item"><div class="setting-info"><span class="setting-title">Показывать email</span></div><label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label></div>
            <div class="setting-item"><div class="setting-info"><span class="setting-title">Показывать телефон</span></div><label class="toggle"><input type="checkbox" /><span class="toggle-slider"></span></label></div>
            <div class="setting-item"><div class="setting-info"><span class="setting-title">Уведомления о проверках</span></div><label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.profile-page { max-width: 1000px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0; }
.profile-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
.profile-card { background: white; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.profile-card + .profile-card { margin-top: 16px; }
.profile-card h3 { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0 0 16px; }
.avatar-section { display: flex; align-items: flex-start; gap: 20px; padding-bottom: 24px; border-bottom: 1px solid #f0f0f0; margin-bottom: 24px; }
.avatar-wrapper { position: relative; width: 80px; height: 80px; cursor: pointer; border-radius: 20px; overflow: hidden; flex-shrink: 0; }
.avatar-img { width: 100%; height: 100%; }
.avatar-img img { width: 100%; height: 100%; object-fit: cover; }
.avatar-large { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; }
.avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; border-radius: 20px; }
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }
.btn-avatar-remove { background: none; border: none; color: #dc2626; font-size: 12px; cursor: pointer; padding: 0; margin-top: 4px; }
.btn-avatar-remove:hover { text-decoration: underline; }
.avatar-info h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.avatar-role { font-size: 14px; color: #6b7280; margin: 0; }
.detail-grid { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.detail-item { display: flex; flex-direction: column; gap: 2px; }
.detail-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 15px; color: #1a1a2e; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }
.btn-primary { background: #4361ee; color: white; } .btn-primary:hover { background: #3651d4; }
.btn-ghost { background: transparent; color: #6b7280; } .btn-ghost:hover { background: #f3f4f6; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.form-group input, .form-group textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.form-actions { display: flex; gap: 8px; margin-top: 8px; }
.stat-rows { display: flex; flex-direction: column; gap: 12px; }
.stat-row { display: flex; justify-content: space-between; align-items: center; }
.stat-row-label { font-size: 13px; color: #6b7280; }
.stat-row-value { font-size: 13px; font-weight: 600; color: #1a1a2e; }
.settings-group { display: flex; flex-direction: column; gap: 16px; }
.setting-item { display: flex; justify-content: space-between; align-items: center; }
.setting-info { flex: 1; }
.setting-title { font-size: 13px; font-weight: 600; color: #1a1a2e; display: block; }
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 12px; transition: 0.3s; }
.toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 2px; bottom: 2px; background: white; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .toggle-slider { background: #4361ee; }
.toggle input:checked + .toggle-slider::before { transform: translateX(20px); }
</style>