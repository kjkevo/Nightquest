import { useState } from 'react'
import { Settings, Sun, Moon, Bell, Download, Trash2, Copy, Info, AlertCircle } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { usePlayerProfile } from '../hooks/usePlayerProfile'

// All app data keys (excluding rank/progression which should NEVER be deleted)
const NQ_DELETABLE_KEYS = [
  'nq_badges',
  'nq_campus_numbers',
  'nq_checkin_timer',
  'nq_checkins',
  'nq_costs',
  'nq_coverreports',
  'nq_custom_games',
  'nq_custom_venues',
  'nq_designated_driver',
  'nq_got_home',
  'nq_history',
  'nq_location',
  'nq_loyalty_stamps',
  'nq_meetup_pins',
  'nq_micro_reviews',
  'nq_mission_history',
  'nq_night_start',
  'nq_nights_history',
  'nq_onboard_squad',
  'nq_pinned_badges',
  'nq_pkey',
  'nq_planner',
  'nq_player_name',
  'nq_player_profile',
  'nq_seen_tasks',
  'nq_session_solo',
  'nq_session_squad',
  'nq_session_start',
  'nq_session_xp',
  'nq_setup',
  'nq_squad_room',
  'nq_squad_rooms',
  'nq_trusted_contacts',
  'nq_vs_games',
  // NEVER DELETE: 'nq_xp' - Rank and progression are permanent
  // NEVER DELETE: 'nq_theme' - Theme preference is permanent
  // NEVER DELETE: 'nq_notifications_enabled' - Notification preference is permanent
]

// All data keys for export (including rank/progression)
const NQ_EXPORT_KEYS = [
  ...NQ_DELETABLE_KEYS,
  'nq_xp',
  'nq_theme',
  'nq_notifications_enabled',
]

export default function SettingsSection() {
  const { isDark, toggleTheme } = useTheme()
  const { campus, setCampus } = usePlayerProfile()
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nq_notifications_enabled') ?? 'true')
    } catch {
      return true
    }
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [dataExported, setDataExported] = useState(false)
  const [showCampusEdit, setShowCampusEdit] = useState(false)
  const [campusInput, setCampusInput] = useState(campus || '')

  // Save notification preference
  const handleNotificationToggle = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    try {
      localStorage.setItem('nq_notifications_enabled', JSON.stringify(newValue))
    } catch {}
  }

  // Export user data as JSON
  const handleExportData = () => {
    try {
      const allData = {}
      
      // Collect all nq_ prefixed data (including rank/progression)
      NQ_EXPORT_KEYS.forEach(key => {
        const value = localStorage.getItem(key)
        if (value !== null) {
          try {
            allData[key] = JSON.parse(value)
          } catch {
            allData[key] = value
          }
        }
      })

      // Create blob and download
      const dataStr = JSON.stringify(allData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `nightquest-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setDataExported(true)
      setTimeout(() => setDataExported(false), 3000)
    } catch (err) {
      alert('Failed to export data: ' + err.message)
    }
  }

  // Delete game data EXCEPT rank/progression (which is permanent)
  const handleDeleteGameData = () => {
    try {
      // Delete only deletable keys (never delete rank/progression)
      NQ_DELETABLE_KEYS.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Force page reload to reset state
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    } catch (err) {
      alert('Failed to delete data: ' + err.message)
    }
  }

  // Save campus preference
  const handleSaveCampus = () => {
    setCampus(campusInput)
    setShowCampusEdit(false)
  }

  return (
    <div className="space-y-4">
      {/* Theme Settings */}
      <div className="bg-quest-panel border border-quest-border rounded-lg p-4 space-y-3">
        <p className="font-display text-xs uppercase tracking-widest text-gray-500">Theme Preference</p>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-quest-bg border border-quest-border hover:border-quest-gold-dim transition-colors">
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-400" />}
            <div className="text-left">
              <p className="font-display text-sm font-bold text-white">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="font-body text-xs text-gray-600">
                {isDark ? 'Easy on the eyes at night' : 'Bright and energetic'}
              </p>
            </div>
          </div>
          <div className="text-xl">{isDark ? '🌙' : '☀️'}</div>
        </button>
      </div>

      {/* Location / Campus */}
      <div className="bg-quest-panel border border-quest-border rounded-lg p-4 space-y-3">
        <p className="font-display text-xs uppercase tracking-widest text-gray-500">Location Preference</p>
        
        {!showCampusEdit ? (
          <button
            onClick={() => setShowCampusEdit(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-quest-bg border border-quest-border hover:border-quest-gold-dim transition-colors text-left">
            <div>
              <p className="font-display text-sm font-bold text-white">
                {campus || 'Set your campus'}
              </p>
              <p className="font-body text-xs text-gray-600 mt-0.5">
                {campus ? 'Venues near you' : 'Help us show nearby venues'}
              </p>
            </div>
            <span className="text-lg">📍</span>
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={campusInput}
              onChange={(e) => setCampusInput(e.target.value)}
              placeholder="e.g., UC Berkeley Campus"
              maxLength={40}
              className="w-full px-3 py-2 rounded-lg bg-quest-bg border border-quest-border text-white placeholder-gray-600 focus:outline-none focus:border-quest-gold focus:ring-1 focus:ring-quest-gold/50 font-body text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveCampus}
                className="flex-1 py-2 rounded-lg bg-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all btn-press">
                Save
              </button>
              <button
                onClick={() => {
                  setCampusInput(campus || '')
                  setShowCampusEdit(false)
                }}
                className="flex-1 py-2 rounded-lg border border-quest-border font-display text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-300 transition-colors btn-press">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-quest-panel border border-quest-border rounded-lg p-4 space-y-3">
        <p className="font-display text-xs uppercase tracking-widest text-gray-500">Notifications</p>
        <button
          onClick={handleNotificationToggle}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-quest-bg border border-quest-border hover:border-quest-gold-dim transition-colors">
          <div className="flex items-center gap-3">
            <Bell size={18} className={notificationsEnabled ? 'text-quest-gold' : 'text-gray-600'} />
            <div className="text-left">
              <p className="font-display text-sm font-bold text-white">
                {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
              </p>
              <p className="font-body text-xs text-gray-600">
                {notificationsEnabled ? 'Stay updated on quests' : 'Muted notifications'}
              </p>
            </div>
          </div>
          <div
            className={`w-12 h-6 rounded-full transition-all flex items-center ${
              notificationsEnabled ? 'bg-quest-gold' : 'bg-gray-700'
            }`}>
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Your Data Section */}
      <div className="border-t border-quest-border pt-4 space-y-3">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-900/20 border border-blue-800/50">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="font-body text-xs text-blue-300">
            Your data is stored locally on your device. You can export it anytime. Your rank and progression are permanently saved.
          </p>
        </div>

        <p className="font-display text-xs uppercase tracking-widest text-gray-500">Your Data</p>

        {/* Export Data Button */}
        <button
          onClick={handleExportData}
          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
            dataExported
              ? 'bg-green-900/20 border-green-700 text-green-400'
              : 'bg-quest-bg border-quest-border hover:border-quest-gold-dim text-gray-400'
          }`}>
          <div className="flex items-center gap-3">
            <Download size={18} />
            <div className="text-left">
              <p className="font-display text-sm font-bold">
                {dataExported ? 'Data Exported!' : 'Export Data'}
              </p>
              <p className="font-body text-xs text-gray-600">
                {dataExported ? 'Check your downloads' : 'Download as JSON file'}
              </p>
            </div>
          </div>
          {dataExported && <span className="text-lg">✓</span>}
        </button>

        {/* Delete Data Button */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-quest-bg border border-quest-border hover:border-red-700 text-gray-400 hover:text-red-400 transition-colors">
            <div className="flex items-center gap-3">
              <Trash2 size={18} />
              <div className="text-left">
                <p className="font-display text-sm font-bold">Clear Game Data</p>
                <p className="font-body text-xs text-gray-600">Reset progress (rank stays)</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-lg border border-red-800/50 bg-red-900/20">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="font-body text-xs text-yellow-300">
                Your <span className="font-bold">rank and progression are permanent</span> and will be kept. Only game history and other data will be cleared.
              </p>
            </div>
            <p className="font-body text-sm text-red-300">
              Clear all game data? You'll start fresh, but your level and rank badges stay forever.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-quest-border font-display text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-300 transition-colors btn-press">
                Cancel
              </button>
              <button
                onClick={handleDeleteGameData}
                className="flex-1 py-2 rounded-lg border border-red-700 bg-red-700/20 font-display text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors btn-press">
                Clear Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Permanent Data Notice */}
      <div className="bg-quest-gold/10 border border-quest-gold/30 rounded-lg p-3 space-y-1">
        <p className="font-display text-xs uppercase tracking-widest text-quest-gold">🏆 Permanent Forever</p>
        <p className="font-body text-xs text-gray-300">
          Your XP, rank level, and rank badges are <span className="font-bold text-quest-gold">permanently saved</span> and will never be deleted. They'll keep growing as you level up!
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="text-center pt-2">
        <p className="font-body text-[10px] text-gray-600">
          NightQuest respects your privacy. All data stays on your device. 🔒
        </p>
      </div>
    </div>
  )
}
