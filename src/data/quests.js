import {
  MessageCircle, Beer, Skull, Trophy, Music, Camera, Sparkles,
  Users, Crown, Sword, Mic, Heart, Hand, Globe, Zap,
  Star, Theater, Radio, Award, Glasses,
} from 'lucide-react'

// ─── Rarity Config ────────────────────────────────────────────────────────────
export const RARITY_CONFIG = {
  common:    { label: 'Common',    weight: 50, borderCls: 'rarity-common',    textCls: 'rarity-common-text',    bg: 'rgba(107,114,128,0.12)' },
  rare:      { label: 'Rare',      weight: 30, borderCls: 'rarity-rare',      textCls: 'rarity-rare-text',      bg: 'rgba(59,130,246,0.10)'  },
  epic:      { label: 'Epic',      weight: 15, borderCls: 'rarity-epic',      textCls: 'rarity-epic-text',      bg: 'rgba(124,58,237,0.12)'  },
  legendary: { label: 'Legendary', weight: 5,  borderCls: 'rarity-legendary', textCls: 'rarity-legendary-text', bg: 'rgba(249,115,22,0.10)'  },
}

// ─── Level / XP Config ────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1,  title: 'Barfly',           xpRequired: 0     },
  { level: 2,  title: 'Nightcrawler',     xpRequired: 200   },
  { level: 3,  title: 'Social Rogue',     xpRequired: 500   },
  { level: 4,  title: 'Chaos Agent',      xpRequired: 900   },
  { level: 5,  title: 'Party Paladin',    xpRequired: 1400  },
  { level: 6,  title: 'Quest Champion',   xpRequired: 2100  },
  { level: 7,  title: 'Night Legend',     xpRequired: 3000  },
  { level: 8,  title: 'Mythic Reveler',   xpRequired: 4500  },
  { level: 9,  title: 'Ascended Soul',    xpRequired: 6500  },
  { level: 10, title: 'Eternal Quester',  xpRequired: 10000 },
]

export function getLevelInfo(xp) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i]
      next = LEVELS[i + 1] || null
      break
    }
  }
  const xpIntoLevel = xp - current.xpRequired
  const xpForNextLevel = next ? next.xpRequired - current.xpRequired : 1
  const progress = next ? Math.min((xpIntoLevel / xpForNextLevel) * 100, 100) : 100
  return { ...current, next, xpIntoLevel, xpForNextLevel, progress, totalXP: xp }
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES = ['All', 'Social', 'Daring', 'Challenge', 'Chill', 'Wild']

// ─── 30 Quests ────────────────────────────────────────────────────────────────
export const QUESTS = [
  // ── COMMON ──────────────────────────────────────────────────────────────────
  {
    id: 1, title: 'Hat Whisperer',
    description: "Find someone wearing a hat and ask for the most surprising fun fact they know. You must listen to the ENTIRE fact before moving on.",
    category: 'Social', rarity: 'common', difficulty: 1, xp: 50, icon: MessageCircle,
    tip: "Bonus points if their fact is actually mind-blowing.", timeLimitMinutes: 10,
  },
  {
    id: 2, title: 'Dance Master Initiation',
    description: "Approach someone who is dancing and ask them to teach you their signature move. Perform it immediately with full commitment.",
    category: 'Social', rarity: 'common', difficulty: 2, xp: 80, icon: Music,
    tip: "Hesitation is the enemy of the dance floor. Commit fully.", timeLimitMinutes: 10,
  },
  {
    id: 3, title: "Bartender's Blessing",
    description: "Ask the bartender what their personal all-time favourite drink to make is — then order exactly that. Watch their face light up.",
    category: 'Chill', rarity: 'common', difficulty: 1, xp: 60, icon: Sparkles,
    tip: "That moment of genuine delight is the whole quest.", timeLimitMinutes: null,
  },
  {
    id: 4, title: 'Thumb War Declaration',
    description: "Challenge a stranger to a best-of-three thumb war. Introduce yourself like it's a sanctioned bout before round one.",
    category: 'Daring', rarity: 'common', difficulty: 1, xp: 70, icon: Sword,
    tip: 'Announce "This is not a drill" with total sincerity.', timeLimitMinutes: 5,
  },
  {
    id: 5, title: 'Name Game',
    description: "Find someone whose first name starts with the same letter as yours. Strike up a full conversation and find two things you have in common.",
    category: 'Social', rarity: 'common', difficulty: 1, xp: 55, icon: Users,
    tip: "Use the name coincidence as your conversation opener.", timeLimitMinutes: 8,
  },
  {
    id: 6, title: 'Compliment Chain',
    description: "Give 3 genuine, specific compliments to 3 completely different strangers. Nothing generic — make each one personal and real.",
    category: 'Social', rarity: 'common', difficulty: 1, xp: 65, icon: Heart,
    tip: "Compliment something you genuinely notice, not just their outfit.", timeLimitMinutes: 10,
  },
  {
    id: 7, title: 'Two Truths, One Lie',
    description: "Play a round of Two Truths and One Lie with a stranger. They go first. You must correctly guess their lie to claim the XP.",
    category: 'Social', rarity: 'common', difficulty: 2, xp: 75, icon: Glasses,
    tip: "The lie is usually the one that sounds most impressive.", timeLimitMinutes: 8,
  },
  {
    id: 8, title: 'Rock Paper Scissors',
    description: "Challenge someone to a best-of-five Rock Paper Scissors tournament. Treat it with the gravity of a world championship match.",
    category: 'Daring', rarity: 'common', difficulty: 1, xp: 65, icon: Hand,
    tip: "Statistics show most people throw Rock on the first round.", timeLimitMinutes: 5,
  },
  {
    id: 9, title: 'Drink Origin Story',
    description: "Ask someone why they ordered the drink they're holding. There must be a story. Dig until you find it.",
    category: 'Chill', rarity: 'common', difficulty: 1, xp: 55, icon: Beer,
    tip: "People always have a reason. The first answer is rarely the real one.", timeLimitMinutes: null,
  },
  {
    id: 10, title: 'Tourist Mode',
    description: "For the next 10 minutes, pretend you're visiting from abroad. Maintain your chosen origin story in every conversation.",
    category: 'Challenge', rarity: 'common', difficulty: 2, xp: 90, icon: Globe,
    tip: "Pick a country you actually know something about.", timeLimitMinutes: 10,
  },
  {
    id: 11, title: 'Fun Fact Relay',
    description: "Share your best fun fact with a stranger. They must then share theirs. Keep going until one of you runs out.",
    category: 'Social', rarity: 'common', difficulty: 1, xp: 60, icon: Zap,
    tip: "Prepare a backup fact in case your opener lands flat.", timeLimitMinutes: 8,
  },
  {
    id: 12, title: 'Navigator',
    description: "Memorise everyone in your group's drink order without writing anything down. Successfully get every drink correct.",
    category: 'Chill', rarity: 'common', difficulty: 2, xp: 70, icon: Star,
    tip: "Chunk similar drinks together in your memory first.", timeLimitMinutes: null,
  },

  // ── RARE ─────────────────────────────────────────────────────────────────────
  {
    id: 13, title: 'The Dark Potion',
    description: "Ask the bartender to pour you a drink you've never heard of. No Googling allowed — you must trust the process and drink whatever appears.",
    category: 'Daring', rarity: 'rare', difficulty: 2, xp: 120, icon: Skull,
    tip: 'Ask for something "off-menu" for extra mystique.', timeLimitMinutes: 5,
  },
  {
    id: 14, title: 'Trivia Duel',
    description: "Locate the tallest person in the venue and challenge them to one trivia question. Whoever wins, the other buys the next round.",
    category: 'Social', rarity: 'rare', difficulty: 3, xp: 150, icon: Trophy,
    tip: '"What country invented champagne?" is your trump card.', timeLimitMinutes: 20,
  },
  {
    id: 15, title: 'Party Crasher (Legal)',
    description: "Find a group celebrating something — birthday, promotion, breakup — and join their toast with a heartfelt one-liner they'll remember.",
    category: 'Social', rarity: 'rare', difficulty: 2, xp: 130, icon: Crown,
    tip: '"I don\'t know you but I believe in you" works universally.', timeLimitMinutes: 20,
  },
  {
    id: 16, title: 'DJ Request Diplomat',
    description: "Poll 3 different people for their song request, then negotiate your way to having ONE of those songs actually played.",
    category: 'Social', rarity: 'rare', difficulty: 3, xp: 140, icon: Radio,
    tip: "Go in with confidence. Staff respond to people who know what they want.", timeLimitMinutes: 20,
  },
  {
    id: 17, title: 'Secret Handshake',
    description: "Invent a custom secret handshake with a willing stranger in under 2 minutes. It must have at least 5 distinct moves.",
    category: 'Social', rarity: 'rare', difficulty: 2, xp: 125, icon: Hand,
    tip: "Start with a fist bump as move 1 — it establishes trust fast.", timeLimitMinutes: 10,
  },
  {
    id: 18, title: 'Celebrity Lookalike',
    description: "Find a person who resembles a celebrity, approach them, and tell them which celebrity — and exactly why you think so.",
    category: 'Daring', rarity: 'rare', difficulty: 2, xp: 115, icon: Camera,
    tip: "Only do this if it's a genuine, flattering comparison.", timeLimitMinutes: 10,
  },
  {
    id: 19, title: 'The Mock Interview',
    description: "Conduct a serious 2-minute mock job interview with a stranger about their evening. Ask follow-up questions. Take notes on your phone.",
    category: 'Daring', rarity: 'rare', difficulty: 3, xp: 135, icon: Mic,
    tip: '"Where do you see yourself in five drinks?" is a classic.', timeLimitMinutes: 10,
  },
  {
    id: 20, title: 'Foreign Language Toast',
    description: "Deliver a toast out loud in a foreign language you don't speak fluently. Commit with full confidence and no apologies.",
    category: 'Daring', rarity: 'rare', difficulty: 3, xp: 130, icon: Award,
    tip: "Japanese: Kanpai. Korean: Geonbae. Russian: Za zdorovye. You're welcome.", timeLimitMinutes: 5,
  },
  {
    id: 21, title: 'Slow Clap Initiator',
    description: "Begin a slow, deliberate clap in the bar and keep going with total conviction until at least 4 other people join in.",
    category: 'Wild', rarity: 'rare', difficulty: 3, xp: 145, icon: Award,
    tip: "Eye contact and confidence are the only tools you have.", timeLimitMinutes: 10,
  },
  {
    id: 22, title: 'Six Degrees',
    description: "Find someone who knows someone you know. You have 15 minutes and can ask anyone. Prove Kevin Bacon's theorem.",
    category: 'Social', rarity: 'rare', difficulty: 3, xp: 120, icon: Users,
    tip: "Start with location — hometown connections surface fastest.", timeLimitMinutes: 15,
  },

  // ── EPIC ─────────────────────────────────────────────────────────────────────
  {
    id: 23, title: 'Cinematic Tongue',
    description: "Hold a full conversation with a stranger using only movie quotes for at least 2 minutes. No breaking character whatsoever.",
    category: 'Challenge', rarity: 'epic', difficulty: 4, xp: 300, icon: Skull,
    tip: '"Why so serious?" and "I\'ll be back" cover about 80% of situations.', timeLimitMinutes: 15,
  },
  {
    id: 24, title: 'Heroic Portrait',
    description: "Convince a complete stranger to strike a superhero power pose with you for a photo. Both of you must look absolutely legendary.",
    category: 'Daring', rarity: 'epic', difficulty: 3, xp: 260, icon: Camera,
    tip: "Superman or Wonder Woman photograph best. Offer to send them the photo.", timeLimitMinutes: 15,
  },
  {
    id: 25, title: 'The Fabricator',
    description: "Introduce yourself to a stranger using a completely fabricated identity — fake name, fake job, fake hometown. Hold it for 5 minutes.",
    category: 'Challenge', rarity: 'epic', difficulty: 4, xp: 280, icon: Glasses,
    tip: "Keep your fake life adjacent to reality so you don't contradict yourself.", timeLimitMinutes: 15,
  },
  {
    id: 26, title: 'Shot Mime',
    description: "Order a round of drinks for your group using only hand gestures and absolutely zero words. The bartender must understand you.",
    category: 'Wild', rarity: 'epic', difficulty: 4, xp: 320, icon: Hand,
    tip: "Establish eye contact first, then mime pouring. Smile — a lot.", timeLimitMinutes: 10,
  },
  {
    id: 27, title: 'Speed Socialite',
    description: "Have 5 genuine conversations with 5 different strangers — each at least 90 seconds long — in 15 minutes flat.",
    category: 'Challenge', rarity: 'epic', difficulty: 4, xp: 290, icon: Heart,
    tip: "Transition with 'I\'d love to chat more but I\'m on a mission.' They'll want to know more.", timeLimitMinutes: 20,
  },
  {
    id: 28, title: 'Group Selfie Commander',
    description: "Organise and take a group selfie with at least 6 strangers. Everyone must be genuinely smiling. No sad photos.",
    category: 'Daring', rarity: 'epic', difficulty: 3, xp: 270, icon: Users,
    tip: "Say 'cheese' in three different languages for maximum charisma.", timeLimitMinutes: 15,
  },

  // ── LEGENDARY ────────────────────────────────────────────────────────────────
  {
    id: 29, title: 'Serpent of the Dance Floor',
    description: "Start a conga line with a minimum of 3 strangers. It must travel at least 10 feet across the venue and survive for 30 seconds.",
    category: 'Wild', rarity: 'legendary', difficulty: 5, xp: 500, icon: Crown,
    tip: "Confidence is the only currency here. Start moving — they will follow.", timeLimitMinutes: 30,
  },
  {
    id: 30, title: 'Karaoke Monarch',
    description: "Get yourself on a stage, mic, or improvised platform and perform any song while at least 6 strangers cheer you on by name.",
    category: 'Wild', rarity: 'legendary', difficulty: 5, xp: 600, icon: Mic,
    tip: "Announce your 'stage name' before performing for maximum legend status.", timeLimitMinutes: 30,
  },
]

// ─── Weighted random quest picker ─────────────────────────────────────────────
export function pickRandomQuest(pool, excludeId = null) {
  const eligible = pool.filter(q => q.id !== excludeId)
  if (!eligible.length) return pool[Math.floor(Math.random() * pool.length)]

  // Build weighted list
  const weighted = []
  for (const q of eligible) {
    const w = RARITY_CONFIG[q.rarity]?.weight ?? 10
    for (let i = 0; i < w; i++) weighted.push(q)
  }
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export function filterQuests(category) {
  if (!category || category === 'All') return QUESTS
  return QUESTS.filter(q => q.category === category)
}
