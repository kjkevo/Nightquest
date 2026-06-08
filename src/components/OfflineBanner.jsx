import { WifiOff, Wifi, X } from 'lucide-react'

export default function OfflineBanner({ online, wasOffline, onDismiss }) {
  if (online && !wasOffline) return null

  if (!online) {
    return (
      <div className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-4 py-2.5"
        style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)' }}>
        <WifiOff size={13} className="text-red-200 flex-shrink-0" />
        <p className="font-display text-[11px] uppercase tracking-widest text-red-100 font-bold">
          Offline — plan &amp; contacts available
        </p>
      </div>
    )
  }

  // Back online
  return (
    <div className="fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-4 py-2.5 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, #14532d, #166534)' }}>
      <Wifi size={13} className="text-green-200 flex-shrink-0" />
      <p className="font-display text-[11px] uppercase tracking-widest text-green-100 font-bold">
        Back online
      </p>
      <button onClick={onDismiss} className="ml-2 text-green-300 hover:text-white transition-colors">
        <X size={12} />
      </button>
    </div>
  )
}
