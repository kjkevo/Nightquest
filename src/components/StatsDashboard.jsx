import { BarChart3, Zap, Calendar, Target, TrendingUp, Flame } from 'lucide-react'
import { useGameStats } from '../hooks/useGameStats'

export default function StatsDashboard() {
  const stats = useGameStats()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-quest-gold" />
        <h3 className="font-display text-lg font-bold text-white">Stats Dashboard</h3>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Missions */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-yellow-400" />
            <p className="font-display text-[9px] uppercase tracking-widest text-gray-500">Missions</p>
          </div>
          <p className="font-display text-2xl font-black text-yellow-400">
            {stats.totalMissions}
          </p>
          <p className="font-body text-[10px] text-gray-600">Total Completed</p>
        </div>

        {/* Total Quests */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1">
            <Target size={14} className="text-blue-400" />
            <p className="font-display text-[9px] uppercase tracking-widest text-gray-500">Quests</p>
          </div>
          <p className="font-display text-2xl font-black text-blue-400">
            {stats.totalQuestsCompleted}
          </p>
          <p className="font-body text-[10px] text-gray-600">Completed</p>
        </div>

        {/* Nights Played */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-purple-400" />
            <p className="font-display text-[9px] uppercase tracking-widest text-gray-500">Nights</p>
          </div>
          <p className="font-display text-2xl font-black text-purple-400">
            {stats.totalNights}
          </p>
          <p className="font-body text-[10px] text-gray-600">Played</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className="text-green-400" />
            <p className="font-display text-[9px] uppercase tracking-widest text-gray-500">Rate</p>
          </div>
          <p className="font-display text-2xl font-black text-green-400">
            {stats.completionRate}%
          </p>
          <p className="font-body text-[10px] text-gray-600">Completion</p>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="space-y-3">
        {/* Difficulty Breakdown */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
          <p className="font-display text-sm font-bold text-white">Difficulty Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="font-body text-xs text-gray-300">Easy</p>
              </div>
              <p className="font-display text-sm font-bold text-green-400">
                {stats.difficultyBreakdown.easy}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="font-body text-xs text-gray-300">Medium</p>
              </div>
              <p className="font-display text-sm font-bold text-amber-400">
                {stats.difficultyBreakdown.medium}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="font-body text-xs text-gray-300">Hard</p>
              </div>
              <p className="font-display text-sm font-bold text-red-400">
                {stats.difficultyBreakdown.hard}
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-1.5 pt-2 border-t border-quest-border">
            {[
              { label: 'Easy', value: stats.difficultyBreakdown.easy, color: 'bg-green-500', total: stats.totalMissions },
              { label: 'Medium', value: stats.difficultyBreakdown.medium, color: 'bg-amber-500', total: stats.totalMissions },
              { label: 'Hard', value: stats.difficultyBreakdown.hard, color: 'bg-red-500', total: stats.totalMissions },
            ].map(({ label, value, color, total }) => {
              const percentage = total > 0 ? (value / total) * 100 : 0
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-body text-[9px] text-gray-600">{label}</p>
                    <p className="font-display text-[9px] font-bold text-gray-400">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Solo vs Squad */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
          <p className="font-display text-sm font-bold text-white">Game Mode Split</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-quest-bg rounded-lg p-3 border border-quest-border text-center">
              <p className="font-display text-xl font-black text-blue-400">
                {stats.missionsByType.solo.completed}
              </p>
              <p className="font-body text-[10px] text-gray-500 mt-1">Solo Missions</p>
              <p className="font-display text-xs text-gray-600 mt-1">
                {stats.missionsByType.solo.percentage}%
              </p>
            </div>
            <div className="bg-quest-bg rounded-lg p-3 border border-quest-border text-center">
              <p className="font-display text-xl font-black text-purple-400">
                {stats.missionsByType.squad.completed}
              </p>
              <p className="font-body text-[10px] text-gray-500 mt-1">Squad Missions</p>
              <p className="font-display text-xs text-gray-600 mt-1">
                {stats.missionsByType.squad.percentage}%
              </p>
            </div>
          </div>

          {/* Mode split bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${stats.missionsByType.solo.percentage}%` }}
            />
            <div
              className="bg-purple-500 transition-all duration-500"
              style={{ width: `${stats.missionsByType.squad.percentage}%` }}
            />
          </div>
        </div>

        {/* Venue Type Breakdown */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
          <p className="font-display text-sm font-bold text-white">Missions by Venue</p>
          <div className="space-y-2">
            {Object.values(stats.venueStats).map((venue) => (
              <div key={venue.label} className="flex items-center justify-between p-2 rounded-lg bg-quest-bg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{venue.icon}</span>
                  <p className="font-body text-xs text-gray-300">{venue.label}</p>
                </div>
                <p className="font-display text-sm font-bold text-quest-gold">
                  {venue.completed}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Venue & Averages */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1 mb-1">
              <Flame size={14} className="text-orange-400" />
              <p className="font-display text-[9px] uppercase tracking-widest text-gray-500">Favorite</p>
            </div>
            <p className="font-display text-sm font-bold text-white line-clamp-2">
              {stats.favoriteVenue}
            </p>
            <p className="font-body text-[10px] text-gray-600">Most Played Venue</p>
          </div>

          <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={14} className="text-cyan-400" />
              <p className="font-display text-[9px] uppercase tracking-widest text-gray-500">Average</p>
            </div>
            <p className="font-display text-sm font-bold text-cyan-400">
              {stats.avgMissionsPerNight}
            </p>
            <p className="font-body text-[10px] text-gray-600">Missions per Night</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
          <p className="font-display text-sm font-bold text-white">Journey Stats</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="font-display text-lg font-black text-quest-gold">
                {stats.uniqueVenuesCount}
              </p>
              <p className="font-body text-[10px] text-gray-600">Unique Venues</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-black text-quest-gold">
                {stats.daysSinceStart}
              </p>
              <p className="font-body text-[10px] text-gray-600">Days Active</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-black text-quest-gold">
                {stats.avgQuestsPerNight}
              </p>
              <p className="font-body text-[10px] text-gray-600">Quests per Night</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-black text-quest-gold">
                {stats.totalNights > 0 ? (stats.totalMissions / stats.totalNights).toFixed(1) : 0}
              </p>
              <p className="font-body text-[10px] text-gray-600">Missions per Night</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
