const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const adminAuth = require('../middleware/adminAuth')

// POST /api/admin/verify — verify admin key
router.post('/verify', (req, res) => {
  const { key } = req.body
  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Clave incorrecta' })
  }
  res.json({ ok: true })
})

// All routes below require admin auth
router.use(adminAuth)

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('id, nombre, apellido, codigo, sellos, created_at')
      .order('apellido')

    if (error) throw error
    res.json({ students: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener estudiantes' })
  }
})

// POST /api/admin/students
router.post('/students', async (req, res) => {
  const { nombre, apellido, codigo } = req.body

  if (!nombre?.trim() || !apellido?.trim() || !codigo?.trim()) {
    return res.status(400).json({ error: 'Nombre, apellido y código son obligatorios' })
  }

  try {
    // Check if codigo already exists
    const { data: existing } = await supabase
      .from('estudiantes')
      .select('id')
      .eq('codigo', codigo.trim())
      .single()

    if (existing) {
      return res.status(409).json({ error: `El código ${codigo} ya está registrado` })
    }

    const { data, error } = await supabase
      .from('estudiantes')
      .insert({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        codigo: codigo.trim(),
        sellos: 0
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ student: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear estudiante' })
  }
})

// PATCH /api/admin/students/:id/sellos
router.patch('/students/:id/sellos', async (req, res) => {
  const { sellos } = req.body

  if (typeof sellos !== 'number' || sellos < 0 || sellos > 7) {
    return res.status(400).json({ error: 'Sellos debe ser un número entre 0 y 7' })
  }

  try {
    const { data, error } = await supabase
      .from('estudiantes')
      .update({ sellos })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error || !data) return res.status(404).json({ error: 'Estudiante no encontrado' })

    res.json({ student: data })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar sellos' })
  }
})

// DELETE /api/admin/students/:id
router.delete('/students/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('estudiantes')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar estudiante' })
  }
})

module.exports = router
