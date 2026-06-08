import { useState, useEffect } from 'react'

const KEY = 'nq_theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(KEY) ?? 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light-mode')
    } else {
      root.classList.remove('light-mode')
    }
    try { localStorage.setItem(KEY, theme) } catch {}
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'

  return { theme, isDark, toggleTheme, setTheme }
}
