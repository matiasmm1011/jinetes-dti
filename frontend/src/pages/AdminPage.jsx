import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { getAllStudents, createStudent, updateSellos, deleteStudent } from '../lib/api.js'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', apellido: '', codigo: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const checkAuth = useCallback(() => {
    const key = sessionStorage.getItem('admin_key')
    if (!key) navigate('/admin/login')
  }, [navigate])

  const loadStudents = useCallback(async () => {
    try {
      const { data } = await getAllStudents()
      setStudents(data.students || [])
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    checkAuth()
    loadStudents()
  }, [checkAuth, loadStudents])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.codigo.trim()) {
      setFormError('Todos los campos son obligatorios')
      return
    }
    setFormLoading(true)
    setFormError('')
    try {
      const { data } = await createStudent(formData)
      setStudents(prev => [data.student, ...prev])
      setFormData({ nombre: '', apellido: '', codigo: '' })
      setShowForm(false)
      showSuccess(`✓ Estudiante ${data.student.nombre} agregado exitosamente`)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al crear estudiante')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSellosChange = async (student, delta) => {
    const newSellos = Math.max(0, Math.min(7, student.sellos + delta))
    if (newSellos === student.sellos) return

    // Optimistic update
    setStudents(prev =>
      prev.map(s => s.id === student.id ? { ...s, sellos: newSellos } : s)
    )

    try {
      await updateSellos(student.id, newSellos)
      showSuccess(`✓ Sellos de ${student.nombre} actualizados a ${newSellos}`)
    } catch {
      // Revert
      setStudents(prev =>
        prev.map(s => s.id === student.id ? { ...s, sellos: student.sellos } : s)
      )
    }
  }

  const handleDelete = async (student) => {
    if (!confirm(`¿Eliminar a ${student.nombre} ${student.apellido}? Esta acción no se puede deshacer.`)) return

    setStudents(prev => prev.filter(s => s.id !== student.id))
    try {
      await deleteStudent(student.id)
      showSuccess(`✓ Estudiante ${student.nombre} eliminado`)
    } catch {
      setStudents(prev => [student, ...prev])
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_key')
    navigate('/')
  }

  const filtered = students.filter(s =>
    `${s.nombre} ${s.apellido} ${s.codigo}`.toLowerCase().includes(searchQ.toLowerCase())
  )

  const stats = {
    total: students.length,
    withSellos: students.filter(s => s.sellos > 0).length,
    completed: students.filter(s => s.sellos >= 7).length,
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Panel de Administración</h1>
            <p className={styles.subtitle}>Jinetes DTI — Gestión de Estudiantes</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{stats.total}</span>
            <span className={styles.statLabel}>Estudiantes totales</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{stats.withSellos}</span>
            <span className={styles.statLabel}>Con al menos 1 sello</span>
          </div>
          <div className={`${styles.statCard} ${styles.statCardGold}`}>
            <span className={styles.statNum}>{stats.completed}</span>
            <span className={styles.statLabel}>Tarjetas completas 🏆</span>
          </div>
        </div>

        {/* Actions bar */}
        <div className={styles.actionsBar}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={styles.addBtn}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancelar' : '+ Agregar Estudiante'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Nuevo Estudiante</h3>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.formRow}>
                <input
                  placeholder="Nombre *"
                  value={formData.nombre}
                  onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                  className={styles.formInput}
                  autoFocus
                />
                <input
                  placeholder="Apellido *"
                  value={formData.apellido}
                  onChange={e => setFormData(p => ({ ...p, apellido: e.target.value }))}
                  className={styles.formInput}
                />
                <input
                  placeholder="Código de carnet *"
                  value={formData.codigo}
                  onChange={e => setFormData(p => ({ ...p, codigo: e.target.value }))}
                  className={styles.formInput}
                />
              </div>
              {formError && <p className={styles.formError}>{formError}</p>}
              <button type="submit" className={styles.formBtn} disabled={formLoading}>
                {formLoading ? 'Guardando...' : 'Guardar Estudiante'}
              </button>
            </form>
          </div>
        )}

        {/* Success toast */}
        {successMsg && (
          <div className={styles.toast}>{successMsg}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className={styles.loading}>Cargando estudiantes...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Carnet</th>
                  <th>Sellos</th>
                  <th>Progreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      {searchQ ? 'No se encontraron resultados' : 'No hay estudiantes registrados'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(student => (
                    <tr key={student.id} className={student.sellos >= 7 ? styles.rowComplete : ''}>
                      <td className={styles.tdName}>{student.nombre}</td>
                      <td>{student.apellido}</td>
                      <td><code className={styles.code}>{student.codigo}</code></td>
                      <td>
                        <div className={styles.sellosControl}>
                          <button
                            className={styles.sellosBtn}
                            onClick={() => handleSellosChange(student, -1)}
                            disabled={student.sellos <= 0}
                          >−</button>
                          <span className={styles.sellosNum}>
                            {student.sellos}
                            {student.sellos >= 7 && ' 🏆'}
                          </span>
                          <button
                            className={`${styles.sellosBtn} ${styles.sellosBtnAdd}`}
                            onClick={() => handleSellosChange(student, 1)}
                            disabled={student.sellos >= 7}
                          >+</button>
                        </div>
                      </td>
                      <td>
                        <div className={styles.miniProgress}>
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className={`${styles.dot} ${i < student.sellos ? styles.dotActive : ''}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(student)}
                          title="Eliminar estudiante"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filtered.length > 0 && (
              <p className={styles.tableFooter}>
                Mostrando {filtered.length} de {students.length} estudiantes
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
