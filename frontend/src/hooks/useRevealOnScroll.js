import { useEffect } from 'react'

const OBSERVER_OPTIONS = { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }

export function useRevealOnScroll() {
  useEffect(() => {
    const supported = 'IntersectionObserver' in window
    const observer = supported
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          })
        }, OBSERVER_OPTIONS)
      : null

    const scan = (root) => {
      root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((node) => {
        node.classList.add('reveal')
        if (observer) observer.observe(node)
        else node.classList.add('is-visible')
      })
    }

    scan(document)

    // El contenido se carga de forma diferida (React.lazy), así que hay que
    // Incorporar los nodos que aparecen después del primer render.
    const mutations = new MutationObserver(() => scan(document))
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer?.disconnect()
    }
  }, [])
}
