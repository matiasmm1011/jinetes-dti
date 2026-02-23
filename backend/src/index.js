require('dotenv').config()
const express = require('express')
const cors = require('cors')

const studentsRouter = require('./routes/students')
const adminRouter = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Jinetes DTI API' })
})

// Routes
app.use('/api/students', studentsRouter)
app.use('/api/admin', adminRouter)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`🐎 Jinetes DTI API corriendo en http://localhost:${PORT}`)
})

module.exports = app
