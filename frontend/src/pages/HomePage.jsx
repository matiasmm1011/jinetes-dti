import { useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import StudentCard from "../components/StudentCard.jsx";
import { searchStudents } from "../lib/api.js";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      if (!query.trim()) return;

      setLoading(true);
      setError("");
      setSearched(false);

      try {
        const { data } = await searchStudents(query.trim());
        setResults(data.students || []);
        setSearched(true);
      } catch (err) {
        setError("Error al buscar. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (searched) {
      setSearched(false);
      setResults([]);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroDecor} />
          <img src="/logo.jpg" alt="Jinetes DTI" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>
            Tarjeta de
            <br />
            <span className={styles.heroAccent}>Actividades</span>
          </h1>
          <p className={styles.heroSub}>
            Busca por tu nombre o codigo para ver tus sellos y cuánto te falta
            para el premio
          </p>
        </section>

        {/* Search */}
        <section className={styles.searchSection}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Escribe tu nombre, apellido o código..."
                value={query}
                onChange={handleInputChange}
                className={styles.searchInput}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setSearched(false);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className={styles.searchBtn}
              disabled={loading || !query.trim()}
            >
              {loading ? <span className={styles.spinner} /> : "Buscar"}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          {/* Results */}
          {searched && (
            <div className={styles.results}>
              {results.length === 0 ? (
                <div className={styles.noResults}>
                  <span className={styles.noResultsIcon}>🐎</span>
                  <p>
                    No se encontró ningún estudiante con ese nombre o carnet.
                  </p>
                  <small>Verifica que estés registrado en el sistema.</small>
                </div>
              ) : (
                <>
                  <p className={styles.resultsCount}>
                    {results.length} resultado{results.length !== 1 ? "s" : ""}{" "}
                    encontrado{results.length !== 1 ? "s" : ""}
                  </p>
                  <div className={styles.resultsList}>
                    {results.map((student) => (
                      <button
                        key={student.id}
                        className={styles.resultCard}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className={styles.resultInfo}>
                          <span className={styles.resultName}>
                            {student.nombre} {student.apellido}
                          </span>
                          <span className={styles.resultCode}>
                            Carnet: {student.codigo}
                          </span>
                        </div>
                        <div className={styles.resultSellos}>
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className={`${styles.miniSello} ${i < student.sellos ? styles.miniSelloActive : ""}`}
                            />
                          ))}
                        </div>
                        <span className={styles.resultArrow}>→</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Info strip */}
        <section className={styles.infoStrip}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎯</span>
            <p>
              Participa en <strong>7 actividades</strong> y gana un premio
              especial
            </p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔍</span>
            <p>Introduce tu codigo para ver el estado de tu tarjeta</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🏆</span>
            <p>¡Llena todos los sellos y reclama tu recompensa!</p>
          </div>
        </section>
      </main>

      {selectedStudent && (
        <StudentCard
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
