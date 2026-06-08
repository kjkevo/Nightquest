import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Share } from 'lucide-react'

const DISMISSED_KEY = 'nq_install_dismissed'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIOSGuide, setShowIOSGuide]     = useState(false)
  const [dismissed, setDismissed]           = useState(() => {
    try { return !!localStorage.getItem(DISMISSED_KEY) } catch { return false }
  })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode() || dismissed) return

    // Android / Chrome install prompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show after a short delay so it doesn't appear immediately on load
      setTimeout(() => setVisible(true), 8000)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS: show the guide after 8s if on iOS and not installed
    if (isIOS()) {
      setTimeout(() => setVisible(true), 8000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch {}
  }

  const install = async () => {
    if (isIOS()) {
      setShowIOSGuide(true)
      return
    }
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') dismiss()
    setDeferredPrompt(null)
  }

  if (!visible || dismissed || isInStandaloneMode()) return null

  return (
    <>
      {/* Install banner */}
      <div className="fixed bottom-[5.5rem] inset-x-0 z-50 px-4 animate-slide-up">
        <div className="max-w-lg mx-auto bg-quest-panel border border-quest-gold-dim/40 rounded-2xl p-4 shadow-2xl"
          style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 0 20px rgba(160,120,48,0.15)' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900 to-quest-bg border border-purple-700/40 flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-gray-100">Add NightQuest to Home Screen</p>
              <p className="font-body text-[11px] text-gray-500 mt-0.5">
                Get tonight's plan widget · Works offline · No app store needed
              </p>
            </div>
            <button onClick={dismiss} className="text-gray-600 hover:text-gray-400 flex-shrink-0 mt-0.5">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={dismiss}
              className="flex-1 py-2 rounded-xl border border-quest-border text-gray-500 font-display text-[10px] uppercase tracking-widest hover:text-gray-300 transition-colors">
              Maybe later
            </button>
            <button onClick={install}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-[10px] font-bold uppercase tracking-widest btn-press">
              {isIOS() ? <Share size={12} /> : <Download size={12} />}
              {isIOS() ? 'How to install' : 'Install'}
            </button>
          </div>
        </div>
      </div>

      {/* iOS share guide modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4"
          style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowIOSGuide(false)}>
          <div className="w-full max-w-sm bg-quest-panel border border-quest-border rounded-2xl p-5 space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-gray-100">Add to Home Screen</h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-gray-600 hover:text-gray-400">
                <X size={14} />
              </button>
            </div>
            <ol className="space-y-3">
              {[
                { step: '1', icon: <Share size={14} className="text-blue-400" />, text: 'Tap the Share button at the bottom of Safari' },
                { step: '2', icon: <span className="text-sm">📋</span>, text: 'Scroll down and tap "Add to Home Screen"' },
                { step: '3', icon: <span className="text-sm">✅</span>, text: 'Tap "Add" in the top right — you\'re done!' },
              ].map(({ step, icon, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-900/40 border border-purple-700/40 flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <p className="font-body text-sm text-gray-300 leading-snug">{text}</p>
                </li>
              ))}
            </ol>
            <button onClick={() => { setShowIOSGuide(false); dismiss() }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-widest btn-press">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
