import { useState } from 'react'
import { User, Edit, Save, X, MapPin, Calendar } from 'lucide-react'
import { usePlayerProfile } from '../hooks/usePlayerProfile'

export default function IdentitySection({ totalXP }) {
  const { profile, setDisplayName, setAvatar, setMotto, setCampus, getAvatarEmoji, getAvatarLabel, formatMemberSince, AVATAR_PRESETS } = usePlayerProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: profile.displayName,
    motto: profile.motto,
    campus: profile.campus,
    avatar: profile.avatar,
  })
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const handleSave = () => {
    setDisplayName(editForm.displayName)
    setMotto(editForm.motto)
    setCampus(editForm.campus)
    setAvatar(editForm.avatar)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      displayName: profile.displayName,
      motto: profile.motto,
      campus: profile.campus,
      avatar: profile.avatar,
    })
    setIsEditing(false)
    setShowAvatarPicker(false)
  }

  const memberDate = profile.memberSince ? formatMemberSince(profile.memberSince) : 'Today'

  return (
    <div className="rounded-2xl border-2 border-quest-gold/30 bg-quest-panel p-6 space-y-4"
      style={{ boxShadow: '0 0 20px rgba(240,192,96,0.08)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User size={18} className="text-quest-gold" />
          <h3 className="font-display text-lg font-bold text-white">Identity</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-quest-gold hover:bg-quest-gold/10 transition-colors">
          {isEditing ? <X size={16} /> : <Edit size={16} />}
        </button>
      </div>

      {!isEditing ? (
        // View Mode
        <div className="space-y-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-quest-gold/10 border-2 border-quest-gold flex items-center justify-center text-5xl flex-shrink-0">
              {getAvatarEmoji(profile.avatar)}
            </div>
            <div className="flex-1">
              <p className="font-display text-sm text-quest-gold uppercase tracking-widest">Display Name</p>
              <p className="font-display text-xl font-black text-white">
                {profile.displayName || 'Night Wanderer'}
              </p>
              <p className="font-body text-xs text-gray-500 mt-1">
                {getAvatarLabel(profile.avatar)}
              </p>
            </div>
          </div>

          {/* Motto */}
          {profile.motto && (
            <div className="bg-quest-bg rounded-lg p-3 border border-quest-border">
              <p className="font-body text-sm italic text-gray-300">
                "{profile.motto}"
              </p>
            </div>
          )}

          {/* Campus / City */}
          {profile.campus && (
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin size={14} className="text-quest-gold" />
              <p className="font-body text-sm">{profile.campus}</p>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center gap-2 text-gray-400 pt-2 border-t border-quest-border">
            <Calendar size={14} className="text-quest-gold" />
            <p className="font-body text-xs">Member since {memberDate}</p>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4">
          {/* Avatar Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-display text-xs uppercase tracking-widest text-gray-400">Avatar</p>
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="font-body text-xs text-quest-gold hover:text-quest-gold/80">
                {showAvatarPicker ? 'Hide' : 'Show'} all
              </button>
            </div>

            {showAvatarPicker ? (
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setEditForm(f => ({ ...f, avatar: preset.id }))}
                    className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all border-2 ${
                      editForm.avatar === preset.id
                        ? 'border-quest-gold bg-quest-gold/10'
                        : 'border-quest-border bg-quest-bg hover:border-quest-gold-dim'
                    }`}
                    title={preset.label}>
                    {preset.emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-quest-gold/10 border-2 border-quest-gold flex items-center justify-center text-4xl">
                  {getAvatarEmoji(editForm.avatar)}
                </div>
                <p className="font-body text-sm text-gray-400">{getAvatarLabel(editForm.avatar)}</p>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="font-display text-xs uppercase tracking-widest text-gray-400 block mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={editForm.displayName}
              onChange={(e) => setEditForm(f => ({ ...f, displayName: e.target.value }))}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full px-3 py-2 rounded-lg bg-quest-bg border border-quest-border text-white placeholder-gray-600 focus:outline-none focus:border-quest-gold focus:ring-1 focus:ring-quest-gold/50 font-body text-sm"
            />
            <p className="font-body text-[10px] text-gray-600 mt-1">
              {editForm.displayName.length}/30
            </p>
          </div>

          {/* Motto */}
          <div>
            <label className="font-display text-xs uppercase tracking-widest text-gray-400 block mb-2">
              Personal Motto
            </label>
            <input
              type="text"
              value={editForm.motto}
              onChange={(e) => setEditForm(f => ({ ...f, motto: e.target.value }))}
              placeholder="e.g., Always Hard Mode"
              maxLength={50}
              className="w-full px-3 py-2 rounded-lg bg-quest-bg border border-quest-border text-white placeholder-gray-600 focus:outline-none focus:border-quest-gold focus:ring-1 focus:ring-quest-gold/50 font-body text-sm"
            />
            <p className="font-body text-[10px] text-gray-600 mt-1">
              {editForm.motto.length}/50
            </p>
          </div>

          {/* Campus / City */}
          <div>
            <label className="font-display text-xs uppercase tracking-widest text-gray-400 block mb-2 flex items-center gap-1">
              <MapPin size={12} /> Campus / City
            </label>
            <input
              type="text"
              value={editForm.campus}
              onChange={(e) => setEditForm(f => ({ ...f, campus: e.target.value }))}
              placeholder="e.g., UC Berkeley Campus"
              maxLength={40}
              className="w-full px-3 py-2 rounded-lg bg-quest-bg border border-quest-border text-white placeholder-gray-600 focus:outline-none focus:border-quest-gold focus:ring-1 focus:ring-quest-gold/50 font-body text-sm"
            />
            <p className="font-body text-[10px] text-gray-600 mt-1">
              {editForm.campus.length}/40
            </p>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 pt-2 border-t border-quest-border">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all btn-press">
              <Save size={14} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 rounded-lg border border-quest-border font-display text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-300 transition-colors btn-press">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
