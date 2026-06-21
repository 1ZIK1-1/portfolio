<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, MOCK_USER_STUDENT, MOCK_USER_TEACHER, MOCK_USER_ADMIN } from '@/services/authStore'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Пожалуйста, введите email и пароль'
    return
  }

  isLoading.value = true

  // Demo auth - в реальном приложении здесь будет API запрос
  setTimeout(() => {
    if (email.value === 'student@sakhgu.ru' && password.value === 'student') {
      login({
        ...MOCK_USER_STUDENT,
        email: email.value
      })
      router.push('/dashboard')
    } else if (email.value === 'teacher@sakhgu.ru' && password.value === 'teacher') {
      login({
        ...MOCK_USER_TEACHER,
        email: email.value
      })
      router.push('/teacher/dashboard')
    } else if (email.value === 'admin@sakhgu.ru' && password.value === 'admin') {
      login({
        ...MOCK_USER_ADMIN,
        email: email.value
      })
      router.push('/admin/dashboard')
    } else {
      error.value = 'Неверный email или пароль'
    }
    isLoading.value = false
  }, 800)
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <img src="/logo_min.png" alt="Логотип" width="48" height="48" />
        </div>
        <h1>Электронное портфолио</h1>
        <p class="subtitle">Сахалинский государственный университет</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Введите ваш email"
            autocomplete="email"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            autocomplete="current-password"
            :disabled="isLoading"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Войти</span>
        </button>
      </form>

      <div class="demo-info">
        <p><strong>Демо-доступ:</strong></p>
        <div class="demo-accounts">
          <div class="demo-account">
            <span class="demo-role">🎓 Студент:</span>
            <code>student@sakhgu.ru / student</code>
          </div>
          <div class="demo-account">
            <span class="demo-role">👨‍🏫 Преподаватель:</span>
            <code>teacher@sakhgu.ru / teacher</code>
          </div>
          <div class="demo-account">
            <span class="demo-role">🛡️ Администратор:</span>
            <code>admin@sakhgu.ru / admin</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: #eef0ff;
  border-radius: 16px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.login-btn {
  padding: 14px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.login-btn:hover:not(:disabled) {
  background: #3651d4;
}

.login-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-info {
  margin-top: 24px;
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  text-align: left;
  font-size: 13px;
  color: #166534;
}

.demo-info p {
  margin: 0 0 8px;
  text-align: center;
}

.demo-accounts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-account {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(255,255,255,0.6);
  border-radius: 6px;
}

.demo-role {
  font-weight: 600;
  font-size: 12px;
}

.demo-account code {
  font-size: 12px;
  color: #1a1a2e;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}
</style>