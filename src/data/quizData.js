// ─── Vibe Quiz ────────────────────────────────────────────────────────────────
export const QUIZ_QUESTIONS = [
  {
    id: 'energy',
    question: "What's your energy tonight?",
    emoji: '⚡',
    options: [
      { id: 'dead',    label: 'Running on fumes', emoji: '💤', desc: 'Somewhere chill, maybe one drink' },
      { id: 'mellow',  label: 'Laid back',         emoji: '🌙', desc: 'Good vibes, no chaos please'     },
      { id: 'lively',  label: 'Ready to go',       emoji: '🎉', desc: 'Let\'s actually have a night'    },
      { id: 'feral',   label: 'Absolutely unhinged',emoji: '🔥', desc: 'No sleep till 5am, let\'s go'   },
    ],
  },
  {
    id: 'budget',
    question: 'Budget per person tonight?',
    emoji: '💸',
    options: [
      { id: 'broke',   label: 'Under $20',      emoji: '🪙', desc: 'Pregame heavy, spend light'     },
      { id: 'modest',  label: '$20 – $50',      emoji: '💵', desc: 'Reasonable night out'            },
      { id: 'solid',   label: '$50 – $100',     emoji: '💴', desc: 'Full experience, don\'t skimp'  },
      { id: 'baller',  label: 'No limit',       emoji: '💎', desc: 'Bottle service, VIP, all of it' },
    ],
  },
  {
    id: 'crowd',
    question: 'Dream crowd size?',
    emoji: '👥',
    options: [
      { id: 'tiny',    label: 'Intimate',       emoji: '🤫', desc: 'Under 50 people, can hear yourself think' },
      { id: 'medium',  label: 'Medium',         emoji: '🍻', desc: 'Busy but not overwhelming'               },
      { id: 'large',   label: 'Packed',         emoji: '🎪', desc: 'Shoulder to shoulder energy'             },
      { id: 'any',     label: 'Doesn\'t matter',emoji: '🌊', desc: 'Vibe > headcount'                       },
    ],
  },
  {
    id: 'music',
    question: 'What\'s on the playlist?',
    emoji: '🎧',
    options: [
      { id: 'jazz',    label: 'Chill / Jazz',   emoji: '🎷', desc: 'Piano bars, acoustics, good conversation' },
      { id: 'hiphop',  label: 'Hip-hop / R&B',  emoji: '🎤', desc: 'Hits only, no skips'                     },
      { id: 'edm',     label: 'EDM / House',    emoji: '🎛', desc: 'Drop it, don\'t stop it'                  },
      { id: 'live',    label: 'Live music',     emoji: '🎸', desc: 'Real instruments, real energy'            },
    ],
  },
  {
    id: 'distance',
    question: 'How far will you go?',
    emoji: '📍',
    options: [
      { id: 'walk',    label: 'Walking only',    emoji: '🚶', desc: 'Campus area or downtown core'    },
      { id: 'short',   label: 'Short ride',      emoji: '🚗', desc: 'Up to 15 min away'              },
      { id: 'far',     label: 'Anywhere',        emoji: '✈️', desc: 'Best spot wins regardless of distance' },
      { id: 'campus',  label: 'Campus area',     emoji: '🎓', desc: 'Stay close to campus'            },
    ],
  },
]

// Score a venue (0–100) against quiz answers
export function scoreVenue(venue, answers) {
  let score = 0
  const { energy, budget, crowd, music, distance } = answers

  // Energy → vibe + type
  const energyMap = { dead: ['chill'], mellow: ['chill','lively'], lively: ['lively','intense'], feral: ['intense','exclusive'] }
  if (energyMap[energy]?.includes(venue.vibe)) score += 25

  // Budget → priceRange
  const budgetMap = { broke: [1], modest: [1,2], solid: [2,3], baller: [3,4] }
  if (budgetMap[budget]?.includes(venue.priceRange)) score += 20

  // Crowd → busynessBase
  const crowdMap = { tiny: [0,50], medium: [40,75], large: [65,100], any: [0,100] }
  const [min,max] = crowdMap[crowd] || [0,100]
  if (venue.busynessBase >= min && venue.busynessBase <= max) score += 20

  // Music → tags
  const musicTagMap = {
    jazz:   ['jazz','piano','craft cocktails','acoustic'],
    hiphop: ['hip-hop','r&b','dancing'],
    edm:    ['edm','techno','house','dj'],
    live:   ['live blues','live music','live jazz','live acoustic'],
  }
  const tags = venue.tags.join(' ').toLowerCase() + ' ' + venue.amenities.join(' ').toLowerCase()
  if (musicTagMap[music]?.some(t => tags.includes(t))) score += 20

  // Distance
  const distMap = { walk: 1.0, short: 1.8, far: 99, campus: 0.4 }
  if (venue.distanceMiles <= (distMap[distance] || 99)) score += 15
  if (distance === 'campus' && venue.campusArea) score += 10

  return Math.min(100, score)
}

// ─── Group Challenges ─────────────────────────────────────────────────────────
export const GROUP_CHALLENGES = [
  {
    id: 'gc_deploy',
    title: 'Full Squad Deployment',
    desc: 'Get 3+ squad members checked in at the same venue within 20 minutes of each other.',
    points: 300, minPlayers: 3, icon: '👥', rarity: 'common', category: 'coordination',
    unlocks: null,
  },
  {
    id: 'gc_crawl',
    title: 'Three-Venue Crawl',
    desc: 'Visit 3 different venues in one night. All must appear on someone\'s night plan.',
    points: 500, minPlayers: 2, icon: '🗺️', rarity: 'rare', category: 'exploration',
    unlocks: 'Pioneer Tap loyalty card bonus stamp',
  },
  {
    id: 'gc_photo',
    title: 'Squad Portrait',
    desc: 'Take a group photo with your entire squad at a venue and one stranger in the shot.',
    points: 250, minPlayers: 3, icon: '📸', rarity: 'common', category: 'social',
    unlocks: null,
  },
  {
    id: 'gc_round',
    title: 'Designated Buyer',
    desc: 'One squad member buys a round for everyone. Log it in the cost tracker.',
    points: 200, minPlayers: 2, icon: '🍺', rarity: 'common', category: 'social',
    unlocks: null,
  },
  {
    id: 'gc_quiz',
    title: 'Trivia Supremacy',
    desc: 'Enter and complete a pub trivia night as a squad. Placing is bonus, participating counts.',
    points: 600, minPlayers: 2, icon: '🧠', rarity: 'rare', category: 'challenge',
    unlocks: 'Library Bar double-stamp night (Mondays)',
  },
  {
    id: 'gc_karaoke',
    title: 'Karaoke Ensemble',
    desc: 'Perform a group karaoke song. All squad members must be visible on stage at the same time.',
    points: 800, minPlayers: 3, icon: '🎤', rarity: 'epic', category: 'performance',
    unlocks: 'Campus Cantina karaoke priority slot',
  },
  {
    id: 'gc_safe',
    title: 'Squad Guardian',
    desc: 'Every squad member uses the buddy check-in system AND taps "I Got Home" on the same night.',
    points: 1000, minPlayers: 2, icon: '🛡️', rarity: 'epic', category: 'safety',
    unlocks: 'NightQuest Gold Squad Badge',
  },
  {
    id: 'gc_legend',
    title: 'Legendary Night',
    desc: 'Complete 4+ quests, visit 3+ venues, and have all squad home safe — in one night.',
    points: 2000, minPlayers: 2, icon: '👑', rarity: 'legendary', category: 'achievement',
    unlocks: 'Neon Garden guest-list priority (one-time)',
  },
  {
    id: 'gc_crawl_full',
    title: 'The Grand Crawl',
    desc: 'Complete a 5-venue bar crawl in a single night. Each venue must be at a different address.',
    points: 1500, minPlayers: 2, icon: '🌆', rarity: 'legendary', category: 'exploration',
    unlocks: 'Club Eclipse guest-list (Thursdays, one-time)',
  },
  {
    id: 'gc_first',
    title: 'Opening Night',
    desc: 'Be at a venue that opens on a new night of the week for the first time. Report to the squad.',
    points: 400, minPlayers: 1, icon: '🎊', rarity: 'rare', category: 'discovery',
    unlocks: null,
  },
]

// ─── Loyalty perk data per venue (venueId → perk) ────────────────────────────
export const LOYALTY_PERKS = {
  1:  { stampsNeeded: 5,  perk: 'One free well drink on your 5th visit',      tier: 'silver' },
  2:  { stampsNeeded: 4,  perk: '$5 off your tab on 4th check-in',            tier: 'bronze' },
  3:  { stampsNeeded: 6,  perk: 'Free pint of house beer',                    tier: 'bronze' },
  5:  { stampsNeeded: 5,  perk: 'Free entry on a blues night',                tier: 'silver' },
  6:  { stampsNeeded: 8,  perk: 'Guest list for one night (you + 1)',         tier: 'gold'   },
  7:  { stampsNeeded: 10, perk: 'Complimentary cocktail on arrival',          tier: 'gold'   },
  8:  { stampsNeeded: 7,  perk: 'Free entry Saturday + priority queue',       tier: 'gold'   },
  12: { stampsNeeded: 5,  perk: 'Free entry on weekdays (saves $15)',         tier: 'silver' },
  14: { stampsNeeded: 6,  perk: 'Free brewery tour + tasting flight',        tier: 'silver' },
  15: { stampsNeeded: 4,  perk: 'Free margarita during ladies night',        tier: 'bronze' },
}
