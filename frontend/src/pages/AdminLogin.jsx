import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyAdminKey } from '../lib/api.js'
import Navbar from '../components/Navbar.jsx'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!key.trim()) return

    setLoading(true)
    setError('')

    try {
      await verifyAdminKey(key.trim())
      sessionStorage.setItem('admin_key', key.trim())
      navigate('/admin')
    } catch {
      setError('Clave incorrecta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.icon}>🔐</div>
          <h1 className={styles.title}>Panel Administrador</h1>
          <p className={styles.subtitle}>Ingresa la clave secreta para continuar</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="password"
              placeholder="Clave secreta..."
              value={key}
              onChange={e => setKey(e.target.value)}
              className={styles.input}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="submit"
              className={styles.btn}
              disabled={loading || !key.trim()}
            >
              {loading ? <span className={styles.spinner} /> : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
