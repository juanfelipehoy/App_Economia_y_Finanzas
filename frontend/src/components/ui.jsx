export const Chip = ({ tone = 'neutral', children }) => (
  <li className={`chip chip--${tone}`}>{children}</li>
)

export const ChipRow = ({ items, tone, limit }) => {
  if (!Array.isArray(items) || items.length === 0) return null
  const visible = limit ? items.slice(0, limit) : items
  const rest = limit ? items.length - visible.length : 0

  return (
    <ul className="chip-row">
      {visible.map((item) => (
        <Chip key={item} tone={tone}>
          {item}
        </Chip>
      ))}
      {rest > 0 && <Chip tone="neutral">+{rest}</Chip>}
    </ul>
  )
}

export const SectionHead = ({ eyebrow, title, lead, id, children }) => (
  <header className="section__head" data-reveal>
    {eyebrow && <span className="section__eyebrow">{eyebrow}</span>}
    <h2 className="section__title" id={id}>
      {title}
    </h2>
    {lead && <p className="section__lead">{lead}</p>}
    {children}
  </header>
)

export const EmptyState = ({ icon = '🔎', title, text, children }) => (
  <div className="empty" data-reveal>
    <span className="empty__icon" aria-hidden="true">
      {icon}
    </span>
    <p className="empty__title">{title}</p>
    {text && <p className="empty__text">{text}</p>}
    {children}
  </div>
)

export const DataCard = ({
  badge,
  badgeTone,
  title,
  subtitle,
  text,
  stats = [],
  tags,
  tagTone,
  tagLimit,
  aviso,
  enlace,
  enlaceTexto,
}) => (
  <article className="card" data-reveal>
    <div className="card__head">
      {badge && (
        <span className={`card__badge${badgeTone ? ` card__badge--${badgeTone}` : ''}`}>{badge}</span>
      )}
      <div className="card__titles">
        <h3 className="card__title">{title}</h3>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
    </div>

    {text && <p className="card__text">{text}</p>}
    <ChipRow items={tags} tone={tagTone} limit={tagLimit} />

    {stats.length > 0 && (
      <dl className="card__stats">
        {stats.map(({ label, value, highlight, nota }) => (
          <div key={label} className={`card__stat${highlight ? ' card__stat--highlight' : ''}`}>
            <dt>{label}</dt>
            <dd>
              {value ?? '—'}
              {nota && <span className="card__stat-note">{nota}</span>}
            </dd>
          </div>
        ))}
      </dl>
    )}

    {aviso && <p className="card__notice">{aviso}</p>}

    {enlace && (
      <a className="card__link" href={enlace} target="_blank" rel="noopener noreferrer">
        {enlaceTexto ?? 'Ver fuente'} →
      </a>
    )}
  </article>
)
