import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open = false, onClose = () => {}, film = null, children = null }) {
  const [mounted, setMounted] = useState(false)
  const [peopleNames, setPeopleNames] = useState([])

  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setIsDark(e.matches)
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler)
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setMounted(false)
    const raf = requestAnimationFrame(() => setMounted(true))
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      setMounted(false)
      setPeopleNames([])
    }
  }, [open, onClose])

  useEffect(() => {
    let active = true
    async function fetchPeople(urls) {
      if (!urls?.length) return setPeopleNames([])
      try {
        const results = await Promise.all(
          urls.map((u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null))
        )
        if (!active) return
        const names = results.map((r) => r?.name || '').filter(Boolean)
        setPeopleNames(names)
      } catch {
        if (active) setPeopleNames([])
      }
    }
    fetchPeople(film?.people)
    return () => {
      active = false
    }
  }, [film])

  if (!open) return null

  const data = film || {}

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: 2147483640,
    display: 'block',
    background: 'rgba(15, 23, 42, 0.85)' ,
  }

  const centeredWrapper = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: mounted ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -48%) scale(0.985)',
    transition: 'transform 200ms cubic-bezier(.2,.9,.3,1), opacity 160ms ease',
    opacity: mounted ? 1 : 0,
    zIndex: 2147483647,
    width: 'min(720px, calc(100% - 40px))',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

  }


  const dialogStyle = {
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    padding: '22px',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '720px',
    lineHeight: 1.5,
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  }

  const imgStyle = {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '14px',
    filter: isDark ? 'brightness(0.9)' : 'none',
    backgroundColor: isDark ? '#1e293b' : '#f3f4f6',
  }

  const titleStyle = {
    margin: 0,
    fontSize: '1.25rem',
    marginBottom: '6px',
    fontWeight: 600,
    color: isDark ? '#f1f5f9' : '#111827',
  }
  const subtitleStyle = {
    margin: 0,
    fontSize: '0.95rem',
    fontStyle: 'italic',
    marginBottom: '10px',
    color: isDark ? '#94a3b8' : '#475569',
  }
  const descStyle = {
    marginTop: '12px',
    color: isDark ? '#fffff' : '#00000',
    whiteSpace: 'pre-wrap',
  }

  const closeBtnStyle = {
    fontSize: '24px',
    lineHeight: 1,
    border: 'none',
    background: 'transparent',
    color: isDark ? '#f8fafc' : '#111827',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  }


  const scoreStyle = {
    fontWeight: 700,
    color: isDark ? '#facc15' : '#ca8a04',
    fontSize: '1.1rem',
  }

  const modalNode = (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={centeredWrapper}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div style={dialogStyle}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={onClose} aria-label="Close modal" style={closeBtnStyle}>
              &times;
            </button>
          </div>

          {data.movie_banner && (
            <img src={data.movie_banner} alt={data.title || 'poster'} style={imgStyle} />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              {data.title && (
                <h3 id="modal-title" style={titleStyle}>
                  {data.title} {data.release_date ? `(${data.release_date})` : ''}
                </h3>
              )}
              {data.original_title && (
                <p style={subtitleStyle}>
                  {data.original_title}{' '}
                  {data.original_title_romanised ? `(${data.original_title_romanised})` : ''}
                </p>
              )}
            </div>
            {data.rt_score && <div style={scoreStyle}>{data.rt_score}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
            {data.producer && <div style={subtitleStyle}>Producer: {data.producer}</div>}
            {data.director && <div style={subtitleStyle}>Director: {data.director}</div>}
          </div>

          {data.description && <p style={descStyle}>{data.description}</p>}

          {children}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body)
    return createPortal(modalNode, document.body)
  return modalNode
}
