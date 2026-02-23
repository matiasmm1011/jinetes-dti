const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// GET /api/students/search?q=nombre_o_carnet
router.get('/search', async (req, res) => {
  const { q } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'La búsqueda debe tener al menos 2 caracteres' })
  }

  try {
    const searchTerm = q.trim().toLowerCase()

    const { data, error } = await supabase
      .from('estudiantes')
      .select('id, nombre, apellido, codigo, sellos')
      .or(`nombre.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
      .order('apellido')
      .limit(20)

    if (error) throw error

    res.json({ students: data })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('id, nombre, apellido, codigo, sellos')
      .eq('id', req.params.id)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Estudiante no encontrado' })

    res.json({ student: data })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

module.exports = router
