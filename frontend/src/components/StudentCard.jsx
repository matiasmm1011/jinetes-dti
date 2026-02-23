import { useState } from 'react'
import styles from './StudentCard.module.css'

// Map sello count to card image
// 0 sellos = card image 1 (all empty), 1 sello = card2, etc.
// Based on your 7 images: card1-card7 where card7 = all 7 sellos filled
const CARD_IMAGES = {
  0: null, // no card yet
  1: '/card1.jpg',
  2: '/card2.jpg',
  3: '/card3.jpg',
  4: '/card4.jpg',
  5: '/card5.jpg',
  6: '/card6.jpg',
  7: '/card7.jpg',
}

export default function StudentCard({ student, onClose }) {
  const { nombre, apellido, codigo, sellos } = student
  const cardImage = CARD_IMAGES[sellos] || CARD_IMAGES[1]
  const isComplete = sellos >= 7

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <div className={styles.studentInfo}>
            <h2 className={styles.name}>{nombre} {apellido}</h2>
            <span className={styles.codigo}>Carnet: {codigo}</span>
          </div>
          <div className={styles.sellosCount}>
            <span className={styles.sellosNum}>{sellos}</span>
            <span className={styles.sellosLabel}>/ 7 sellos</span>
          </div>
        </div>

        {isComplete && (
          <div className={styles.winner}>
            🏆 ¡Felicidades! ¡Has completado todas las actividades!
          </div>
        )}

        <div className={styles.cardWrapper}>
          {sellos === 0 ? (
            <div className={styles.noCard}>
              <div className={styles.noCardIcon}>🐎</div>
              <p>Aún no tienes sellos. ¡Participa en las actividades!</p>
            </div>
          ) : (
            <img
              src={cardImage}
              alt={`Tarjeta con ${sellos} sello${sellos !== 1 ? 's' : ''}`}
              className={styles.cardImage}
            />
          )}
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(sellos / 7) * 100}%` }}
            />
          </div>
          <p className={styles.progressText}>
            {sellos < 7
              ? `Te faltan ${7 - sellos} actividad${7 - sellos !== 1 ? 'es' : ''} para completar tu tarjeta`
              : '¡Tarjeta completa! Ve a reclamar tu premio'}
          </p>
        </div>
      </div>
    </div>
  )
}
