export const ensurePreconnectTag = (url: string) => {
  const origin = new URL(url, window.location.origin).origin
  const existingLink = document.querySelector<HTMLLinkElement>(
    `link[rel="preconnect"][href="${origin}"]`,
  )

  if (existingLink) {
    return
  }

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = origin
  link.crossOrigin = ''
  document.head.appendChild(link)
}
