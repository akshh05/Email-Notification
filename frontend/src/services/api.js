import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  auth: { username: 'admin', password: 'admin123' }
})

// ── Emails ──────────────────────────────────────────────
export const sendEmail    = (data) => api.post('/emails/send', data)
export const retryEmail   = (id)   => api.post(`/emails/${id}/retry`)
export const getEmailById = (id)   => api.get(`/emails/${id}`)
export const getAllEmails  = ()     => api.get('/emails')

// ── Templates ───────────────────────────────────────────
export const createTemplate = (data) => api.post('/templates', data)
export const getTemplateById = (id)  => api.get(`/templates/${id}`)
export const getAllTemplates  = ()    => api.get('/templates')
export const updateTemplate  = (id, data) => api.put(`/templates/${id}`, data)
export const deleteTemplate  = (id)  => api.delete(`/templates/${id}`)

// ── Reports ─────────────────────────────────────────────
export const getStatistics = () => api.get('/reports/emails/statistics')

export default api