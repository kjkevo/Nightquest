import { useEffect } from 'react'

export default function NotFound() {
  // Update theme-color for dark bg
  useEffect(() => {
    const meta = document.getElementById('theme-color-meta')
    if (meta) meta.setAttribute('content', '#0a0a0f')
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12"
      style={{ background: '#0a0a0f' }}
    >
      {/* Glow orb */}
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
            boxShadow: '0 0 60px rgba(124,58,237,0.25)',
          }}
        >
          <span className="text-5xl select-none">⚔️</span>
        </div>
      </div>

      <p className="font-display text-xs uppercase tracking-[0.35em] text-purple-500 mb-2">
        Error 404
      </p>
      <h1 className="font-display text-2xl font-black text-white mb-3 leading-tight">
        Quest Not Found
      </h1>
      <p className="font-body text-gray-500 text-base max-w-xs leading-relaxed mb-8">
        This path leads nowhere. The quest you seek doesn't exist — but the night is still young.
      </p>

      <a
        href="/"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest transition-all"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: '#fff',
          boxShadow: '0 0 24px rgba(124,58,237,0.4)',
        }}
      >
        ← Return to Base Camp
      </a>

      <p className="font-body text-xs text-gray-700 mt-10 tracking-widest uppercase">
        NightQuest · Conquer the Night
      </p>
    </div>
  )
}
