import { useEffect, useState } from 'react'

export function useScrollSpy(ids) {
  const key = ids.join('|')
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    const sectionIds = key.split('|').filter(Boolean)
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (elements.length === 0 || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [key])

  return activeId
}
