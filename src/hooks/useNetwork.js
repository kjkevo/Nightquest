import { useState, useEffect } from 'react'

export function useNetwork() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const goOnline  = () => { setOnline(true);  setWasOffline(true) }
    const goOffline = () => { setOnline(false) }

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const dismissReconnect = () => setWasOffline(false)

  return { online, wasOffline, dismissReconnect }
}
