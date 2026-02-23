import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Add admin key to requests when available
api.interceptors.request.use(config => {
  const adminKey = sessionStorage.getItem('admin_key')
  if (adminKey) config.headers['x-admin-key'] = adminKey
  return config
})

// STUDENTS
export const searchStudents = (query) =>
  api.get(`/students/search?q=${encodeURIComponent(query)}`)

export const getStudent = (id) =>
  api.get(`/students/${id}`)

// ADMIN
export const getAllStudents = () =>
  api.get('/admin/students')

export const createStudent = (data) =>
  api.post('/admin/students', data)

export const updateSellos = (id, sellos) =>
  api.patch(`/admin/students/${id}/sellos`, { sellos })

export const deleteStudent = (id) =>
  api.delete(`/admin/students/${id}`)

export const verifyAdminKey = (key) =>
  api.post('/admin/verify', { key })

export default api
