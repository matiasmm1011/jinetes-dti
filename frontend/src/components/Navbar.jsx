import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <img src="/logo.jpg" alt="Jinetes DTI" className={styles.logo} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>JINETES</span>
            <span className={styles.brandSub}>DTI</span>
          </div>
        </Link>
        <div className={styles.links}>
          {!isAdmin ? (
            <Link to="/admin/login" className={styles.adminLink}>
              Panel Admin
            </Link>
          ) : (
            <Link to="/" className={styles.adminLink}>
              Ver Portal
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
