import { formatDate, getInitials, resolvePhoto } from '../lib/format'

export default function GeniusCard({ genio, onOpenPhoto }) {
  const proyectos = genio.proyectosGrandiosos ?? []
  const logros = genio.logros ?? []
  const photo = resolvePhoto(genio.foto)

  return (
    <article className={`genius-card${genio.destacado ? ' genius-card--featured' : ''}`} data-reveal>
      {photo ? (
        <button
          type="button"
          className="genius-card__media"
          onClick={(event) => onOpenPhoto?.(genio, event.currentTarget)}
          aria-label={`Ampliar la imagen de ${genio.nombre}`}
        >
          <img
            src={photo}
            alt={genio.nombre}
            className="genius-card__image"
            loading="lazy"
            decoding="async"
          />
          <span className="genius-card__zoom" aria-hidden="true">
            🔍
          </span>
        </button>
      ) : (
        <div className="genius-card__media genius-card__media--empty" aria-hidden="true">
          <span className="genius-card__initials">{getInitials(genio.nombre)}</span>
        </div>
      )}

      <div className="genius-card__body">
        <div className="genius-card__top">
          <h3 className="genius-card__name">{genio.nombre}</h3>
          {genio.destacado && <span className="chip chip--warn">★ Destacado</span>}
        </div>

        <p className="genius-card__title">{genio.titulo}</p>
        <p className="card__subtitle">
          {genio.lugarNacimiento} · {formatDate(genio.nacimiento)}
        </p>

        <p className="genius-card__bio">{genio.biografia}</p>

        <div className="genius-card__grid">
          {proyectos.length > 0 && (
            <div>
              <h4 className="panel__title">Proyectos destacados</h4>
              <div className="project-list">
                {proyectos.map((proyecto) => (
                  <div key={proyecto.nombre} className="project">
                    <p className="project__name">{proyecto.nombre}</p>
                    <p className="project__text">{proyecto.descripcion}</p>
                    <p className="project__impact">
                      <strong>Impacto:</strong> {proyecto.impacto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            {logros.length > 0 && (
              <>
                <h4 className="panel__title">Logros</h4>
                <ul className="feature-list">
                  {logros.map((logro) => (
                    <li key={logro}>{logro}</li>
                  ))}
                </ul>
              </>
            )}

            {genio.filosofia && (
              <div className="project mt-1">
                <p className="project__name">Filosofía de inversión</p>
                <p className="project__text">{genio.filosofia}</p>
              </div>
            )}
          </div>
        </div>

        {genio.fraseCelebre && (
          <blockquote className="genius-card__quote">
            “{genio.fraseCelebre}”
            <cite>{genio.nombre}</cite>
          </blockquote>
        )}
      </div>
    </article>
  )
}
