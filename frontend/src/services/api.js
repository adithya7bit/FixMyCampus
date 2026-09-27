/**
 * FixMyCampus API Client
 * Connects React frontend to FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export const api = {
  // Health
  getHealth: () => request('/api/health'),
  getDepartments: () => request('/api/departments'),
  getDemoUsers: () => request('/api/users/demo'),

  // AI & Detection
  classifyComplaint: (title, description, attachment_desc = '') => 
    request('/api/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ title, description, attachment_desc })
    }),

  checkDuplicates: (data) =>
    request('/api/ai/check-duplicates', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Complaints
  getComplaints: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v)
    })
    const qs = query.toString() ? `?${query.toString()}` : ''
    return request(`/api/complaints${qs}`)
  },

  getComplaintDetail: (id) => request(`/api/complaints/${id}`),

  createComplaint: (data) =>
    request('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateStatus: (id, data) =>
    request(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  verifyResolution: (id, data) =>
    request(`/api/complaints/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  upvoteComplaint: (id, userId) =>
    request(`/api/complaints/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    }),

  // SLA Auto-Escalation
  runEscalation: () =>
    request('/api/escalation/run', {
      method: 'POST'
    }),

  // Analytics & Heatmap
  getAnalytics: () => request('/api/analytics/overview'),
  getCampusHeatmap: () => request('/api/analytics/heatmap'),

  // Food Hygiene
  getFoodChecklistItems: () => request('/api/food-hygiene/checklist-items'),
  getFoodInspections: () => request('/api/food-hygiene/inspections'),
  submitFoodInspection: (data) =>
    request('/api/food-hygiene/inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Notifications
  getNotifications: (userId) => request(`/api/notifications${userId ? `?user_id=${userId}` : ''}`),
  markNotificationRead: (id) =>
    request(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  // Reset Seed Data
  resetDemoData: () =>
    request('/api/seed/reset', {
      method: 'POST'
    })
}
