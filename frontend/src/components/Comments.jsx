import { useState } from 'react'
import { EmptyState, SectionHead } from './ui'
import { formatToday, getInitials } from '../lib/format'
import { useLocalStorage } from '../hooks/useLocalStorage'

const STORAGE_KEY = 'finanzasmundo:comentarios'

export default function Comments() {
  const [comments, setComments] = useLocalStorage(STORAGE_KEY, [])
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleanAuthor = author.trim()
    const cleanText = text.trim()
    if (!cleanAuthor || !cleanText) return

    setComments((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: cleanAuthor,
        text: cleanText,
        date: formatToday(),
      },
    ])
    setAuthor('')
    setText('')
  }

  return (
    <section className="section section--tinted" id="comentarios">
      <div className="section__inner">
        <SectionHead
          eyebrow="Comunidad"
          title="Comentarios"
          lead="Comparte tus ideas y preguntas sobre economía y finanzas con el resto de la comunidad."
        />

        <form className="comment-form" onSubmit={handleSubmit} data-reveal>
          <div className="comment-form__row">
            <label className="field">
              <span className="sr-only">Tu nombre</span>
              <input
                type="text"
                className="input"
                placeholder="Tu nombre"
                value={author}
                maxLength={60}
                onChange={(event) => setAuthor(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="sr-only">Tu comentario</span>
              <textarea
                className="textarea"
                placeholder="Escribe tu comentario..."
                value={text}
                maxLength={800}
                onChange={(event) => setText(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="comment-form__foot">
            <p className="comment-form__hint">
              {comments.length === 0
                ? 'Sé la primera persona en comentar.'
                : `${comments.length} ${comments.length === 1 ? 'comentario' : 'comentarios'} en total.`}
            </p>
            <button type="submit" className="btn btn--primary btn--ghost-sm">
              Publicar comentario
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Todavía no hay comentarios"
            text="Los comentarios se guardan en este navegador. Empieza tú la conversación."
          />
        ) : (
          <ul className="comment-list">
            {comments
              .slice()
              .reverse()
              .map((comment) => (
                <li key={comment.id} className="comment">
                  <span className="comment__avatar" aria-hidden="true">
                    {getInitials(comment.author)}
                  </span>
                  <div className="comment__body">
                    <div className="comment__head">
                      <span className="comment__author">{comment.author}</span>
                      <span className="comment__date">{comment.date}</span>
                      <button
                        type="button"
                        className="comment__delete"
                        onClick={() =>
                          setComments((current) => current.filter((item) => item.id !== comment.id))
                        }
                        aria-label={`Eliminar comentario de ${comment.author}`}
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="comment__text">{comment.text}</p>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  )
}
