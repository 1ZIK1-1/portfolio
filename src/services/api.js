import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('portfolio_user') || 'null')
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('portfolio_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
)

// Auth endpoints
export const authAPI = {
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },
  logout() {
    return api.post('/auth/logout')
  },
  getProfile() {
    return api.get('/auth/profile')
  }
}

// Achievements endpoints
export const achievementsAPI = {
  getAll(params = {}) {
    return api.get('/achievements', { params })
  },
  getById(id) {
    return api.get(`/achievements/${id}`)
  },
  create(data) {
    return api.post('/achievements', data)
  },
  update(id, data) {
    return api.put(`/achievements/${id}`, data)
  },
  delete(id) {
    return api.delete(`/achievements/${id}`)
  },
  syncFromMoodle() {
    return api.post('/achievements/sync-moodle')
  },
  uploadFile(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/achievements/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Portfolio endpoints
export const portfolioAPI = {
  getAll(params = {}) {
    return api.get('/portfolios', { params })
  },
  getById(id) {
    return api.get(`/portfolios/${id}`)
  },
  create(data) {
    return api.post('/portfolios', data)
  },
  update(id, data) {
    return api.put(`/portfolios/${id}`, data)
  },
  delete(id) {
    return api.delete(`/portfolios/${id}`)
  },
  addItem(portfolioId, achievementId, section, order) {
    return api.post(`/portfolios/${portfolioId}/items`, { achievement_id: achievementId, section, display_order: order })
  },
  removeItem(portfolioId, itemId) {
    return api.delete(`/portfolios/${portfolioId}/items/${itemId}`)
  },
  reorderItems(portfolioId, items) {
    return api.put(`/portfolios/${portfolioId}/items/reorder`, { items })
  },
  generateLink(portfolioId, expiresInDays = 30) {
    return api.post(`/portfolios/${portfolioId}/share`, { expires_in_days: expiresInDays })
  },
  exportPdf(portfolioId) {
    return api.get(`/portfolios/${portfolioId}/export/pdf`, { responseType: 'blob' })
  }
}

// Categories & Skills
export const catalogAPI = {
  getCategories() {
    return api.get('/categories')
  },
  getSkills() {
    return api.get('/skills')
  }
}

export default api