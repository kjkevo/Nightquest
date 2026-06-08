// ─── Venue Data ───────────────────────────────────────────────────────────────
// All times in 24h "HH:MM" strings. busynessBase = peak-hour baseline (0-100).

export const VENUE_TYPES = ['All', 'Bar', 'Club', 'Lounge', 'Rooftop', 'Brewery', 'Late Food']
export const DRESS_CODES   = { casual: 'Casual', 'smart-casual': 'Smart Casual', upscale: 'Upscale', strict: 'Strict' }

export const VENUES = [
  // ── BARS ────────────────────────────────────────────────────────────────────
  {
    id: 1, name: 'The Rusty Anchor', type: 'Bar',
    neighborhood: 'Downtown', address: '214 Harbor St',
    distanceMiles: 0.4, walkMinutes: 8,
    hours: { open: '15:00', close: '02:00' },
    coverCharge: { amount: 0, verified: true, note: 'Always free' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 74, rating: 4.1, reviewCount: 312,
    tags: ['pool tables', 'sports TVs', 'cheap beer', 'jukebox'],
    amenities: ['Pool Tables', 'Sports TVs', 'Outdoor Patio', 'Jukebox'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri'], start: '15:00', end: '19:00', deals: ['$3 drafts', '$5 well drinks', '$2 off all cocktails'] }],
    specials: [
      { day: 'Wed', name: 'Wing Night', description: '25¢ wings all night with any drink purchase.' },
      { day: 'Thu', name: 'Industry Night', description: '50% off food & drinks for service industry workers with ID.' },
    ],
    campusArea: false, campusDistanceMiles: 1.2,
    vibe: 'lively', priceRange: 1,
    phone: '(555) 204-1188', instagram: '@rustyanchorbar',
  },
  {
    id: 2, name: 'The Library Bar', type: 'Bar',
    neighborhood: 'Campus District', address: '88 University Ave',
    distanceMiles: 0.2, walkMinutes: 4,
    hours: { open: '16:00', close: '02:00' },
    coverCharge: { amount: 0, verified: true, note: 'Free always' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 88, rating: 4.3, reviewCount: 541,
    tags: ['college bar', 'trivia nights', 'cheap shots', 'late kitchen'],
    amenities: ['Late Kitchen', 'Trivia Nights', 'Beer Pong Tables', 'Outdoor Seating'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu'], start: '16:00', end: '20:00', deals: ['$2 domestics', '$4 wells', '$1 off all drafts'] }],
    specials: [
      { day: 'Mon', name: 'Monday Trivia', description: 'Pub trivia 8–10 PM. Teams of 6 max. Prizes for top 3.' },
      { day: 'Tue', name: 'Taco Tuesday', description: '$2 tacos + $3 margaritas all night.' },
      { day: 'Fri', name: "Friday Buckets", description: '5-beer buckets for $15 all night.' },
    ],
    campusArea: true, campusDistanceMiles: 0.1,
    vibe: 'lively', priceRange: 1,
    phone: '(555) 302-7755', instagram: '@thelibrarybar',
  },
  {
    id: 3, name: 'Pioneer Tap Room', type: 'Bar',
    neighborhood: 'Arts District', address: '407 Pioneer Blvd',
    distanceMiles: 0.7, walkMinutes: 14,
    hours: { open: '14:00', close: '01:00' },
    coverCharge: { amount: 0, verified: true, note: 'No cover' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 56, rating: 4.4, reviewCount: 229,
    tags: ['craft beer', 'local brews', 'chill vibes', 'dog friendly'],
    amenities: ['Dog Friendly', 'Board Games', 'Craft Beer Wall', 'Outdoor Garden'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], start: '14:00', end: '17:00', deals: ['$1 off all pints', '$5 house wine'] }],
    specials: [
      { day: 'Sat', name: 'Live Acoustic', description: 'Live music from local artists, 7–10 PM.' },
    ],
    campusArea: false, campusDistanceMiles: 0.9,
    vibe: 'chill', priceRange: 2,
    phone: '(555) 408-3312', instagram: '@pioneertaproom',
  },
  {
    id: 4, name: 'The Speakeasy', type: 'Bar',
    neighborhood: 'Historic District', address: '12 Cellar Lane (basement)',
    distanceMiles: 0.9, walkMinutes: 18,
    hours: { open: '18:00', close: '02:00' },
    coverCharge: { amount: 0, verified: false, note: 'Occasionally $5 on weekends' },
    dressCode: 'smart-casual', ageRequirement: 21,
    busynessBase: 61, rating: 4.6, reviewCount: 188,
    tags: ['craft cocktails', 'intimate', 'jazz', 'secret entrance'],
    amenities: ['Live Jazz', 'Craft Cocktails', 'VIP Booths', 'No TVs'],
    happyHours: [{ days: ['Tue','Wed','Thu'], start: '18:00', end: '20:30', deals: ['$8 craft cocktails (normally $14)', '$6 wines'] }],
    specials: [
      { day: 'Thu', name: 'Jazz Night', description: 'Live jazz quartet 8 PM–midnight.' },
    ],
    campusArea: false, campusDistanceMiles: 1.4,
    vibe: 'chill', priceRange: 3,
    phone: '(555) 119-0044', instagram: '@thespeakeasybar',
  },
  {
    id: 5, name: 'Bourbon & Blues', type: 'Bar',
    neighborhood: 'Midtown', address: '55 Oak Street',
    distanceMiles: 1.1, walkMinutes: 22,
    hours: { open: '17:00', close: '02:00' },
    coverCharge: { amount: 5, verified: true, note: '$5 after 9 PM on Fri/Sat' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 69, rating: 4.0, reviewCount: 276,
    tags: ['bourbon selection', 'live blues', 'dancing', 'whiskey bar'],
    amenities: ['Dance Floor', 'Live Music', '200+ Bourbons', 'Full Kitchen'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri'], start: '17:00', end: '20:00', deals: ['$6 bourbon select', '$4 beers', '$8 cocktails'] }],
    specials: [
      { day: 'Fri', name: 'Blues Night', description: 'Live blues band 9 PM–1 AM. $5 cover includes 1 drink.' },
      { day: 'Sat', name: 'Open Mic Blues', description: 'Sign-up blues open mic, 8–11 PM.' },
    ],
    campusArea: false, campusDistanceMiles: 1.8,
    vibe: 'lively', priceRange: 2,
    phone: '(555) 517-9900', instagram: '@bourbonandbluesnightclub',
  },

  // ── CLUBS ───────────────────────────────────────────────────────────────────
  {
    id: 6, name: 'Club Eclipse', type: 'Club',
    neighborhood: 'Entertainment District', address: '900 Neon Row',
    distanceMiles: 1.3, walkMinutes: 26,
    hours: { open: '22:00', close: '04:00' },
    coverCharge: { amount: 20, verified: true, note: '$20 standard. Guest list: free before 11 PM' },
    dressCode: 'smart-casual', ageRequirement: 21,
    busynessBase: 87, rating: 4.2, reviewCount: 1043,
    tags: ['EDM', 'resident DJs', 'VIP tables', 'light show'],
    amenities: ['VIP Tables', 'Bottle Service', 'State-of-Art Sound', 'Smoke Machine'],
    happyHours: [],
    specials: [
      { day: 'Fri', name: "Ladies Night", description: 'Free entry for ladies before midnight. $6 cocktails all night.' },
      { day: 'Sat', name: 'Guest DJ', description: 'Weekly guest DJ. Check Instagram for lineups.' },
      { day: 'Thu', name: 'College Night', description: '$10 entry with valid college ID. $4 wells until midnight.' },
    ],
    campusArea: false, campusDistanceMiles: 1.5,
    vibe: 'intense', priceRange: 3,
    phone: '(555) 900-2233', instagram: '@clubeclipseofficial',
  },
  {
    id: 7, name: 'Velvet Underground', type: 'Club',
    neighborhood: 'Midtown', address: '701 West 5th Ave',
    distanceMiles: 1.6, walkMinutes: 32,
    hours: { open: '21:00', close: '04:00' },
    coverCharge: { amount: 25, verified: true, note: '$25 standard. Members free.' },
    dressCode: 'upscale', ageRequirement: 21,
    busynessBase: 82, rating: 4.4, reviewCount: 714,
    tags: ['hip-hop', 'R&B', 'bottle service', 'exclusive'],
    amenities: ['VIP Sections', 'Bottle Service', 'Celebrity Sightings', 'Dress Code Enforced'],
    happyHours: [],
    specials: [
      { day: 'Fri', name: 'R&B Fridays', description: 'Best R&B & hip-hop in the city. Guest list closes at 10 PM.' },
      { day: 'Sat', name: 'VIP Saturday', description: 'Table reservations required for entry after 11 PM.' },
    ],
    campusArea: false, campusDistanceMiles: 2.1,
    vibe: 'exclusive', priceRange: 4,
    phone: '(555) 701-5544', instagram: '@velvetundergroundclub',
  },
  {
    id: 8, name: 'Neon Garden', type: 'Club',
    neighborhood: 'Entertainment District', address: '1200 Electric Ave',
    distanceMiles: 1.4, walkMinutes: 28,
    hours: { open: '21:00', close: '05:00' },
    coverCharge: { amount: 20, verified: true, note: '$15 before midnight, $20 after' },
    dressCode: 'casual', ageRequirement: 18,
    busynessBase: 91, rating: 4.1, reviewCount: 889,
    tags: ['EDM', 'techno', 'house', 'open-air dance floor', '18+'],
    amenities: ['Open-Air Floor', 'Multiple Rooms', 'Art Installations', '18+ Friendly'],
    happyHours: [],
    specials: [
      { day: 'Thu', name: '18+ Night', description: 'Doors open at 9. $10 for 18–20, free for 21+.' },
      { day: 'Fri', name: 'House Fridays', description: 'Deep & tech house all night. Resident + guest DJs.' },
      { day: 'Sat', name: 'NEON Saturday', description: 'Main room goes hard until 5 AM.' },
    ],
    campusArea: false, campusDistanceMiles: 1.6,
    vibe: 'intense', priceRange: 2,
    phone: '(555) 1200-2020', instagram: '@neongardenclub',
  },
  {
    id: 9, name: 'After Hours', type: 'Club',
    neighborhood: 'Downtown', address: '3 Late Street',
    distanceMiles: 0.8, walkMinutes: 16,
    hours: { open: '23:00', close: '06:00' },
    coverCharge: { amount: 15, verified: true, note: '$10 before 1 AM, $15 after' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 95, rating: 3.9, reviewCount: 502,
    tags: ['after hours', 'late night', 'underground', 'techno'],
    amenities: ['Coat Check', 'Smoking Patio', 'Cash Only Bar', 'No Photos Policy'],
    happyHours: [],
    specials: [
      { day: 'Fri', name: 'Late Entry Discount', description: 'Free entry 11–11:30 PM sharp. First come, first served (50 spots).' },
      { day: 'Sat', name: 'All Night Rave', description: 'Doors 11 PM – 6 AM. Non-stop floor.' },
    ],
    campusArea: false, campusDistanceMiles: 1.0,
    vibe: 'intense', priceRange: 2,
    phone: '(555) 003-2260', instagram: '@afterhoursdowntown',
  },
  {
    id: 10, name: 'Warehouse Social', type: 'Club',
    neighborhood: 'Warehouse District', address: '555 Industrial Way',
    distanceMiles: 1.9, walkMinutes: 38,
    hours: { open: '20:00', close: '04:00' },
    coverCharge: { amount: 15, verified: true, note: '$15 flat. Free parking in lot.' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 72, rating: 4.3, reviewCount: 418,
    tags: ['warehouse vibes', 'multiple DJs', 'large venue', 'mixed music'],
    amenities: ['Free Parking', 'Multiple Floors', 'Outdoor Courtyard', 'Food Trucks Fri/Sat'],
    happyHours: [{ days: ['Fri','Sat'], start: '20:00', end: '22:00', deals: ['$5 beers', '$7 cocktails', 'Free entry before 9'] }],
    specials: [
      { day: 'Fri', name: 'Food Trucks', description: 'Local food trucks in the courtyard until 1 AM.' },
      { day: 'Sat', name: 'Multi-Genre Night', description: 'Hip-hop, house, and Latin all in different rooms.' },
    ],
    campusArea: false, campusDistanceMiles: 2.3,
    vibe: 'lively', priceRange: 2,
    phone: '(555) 555-8801', instagram: '@warehousesocial',
  },

  // ── LOUNGES / ROOFTOP ────────────────────────────────────────────────────────
  {
    id: 11, name: 'Noir Lounge', type: 'Lounge',
    neighborhood: 'Midtown', address: '340 Marble Ave',
    distanceMiles: 1.0, walkMinutes: 20,
    hours: { open: '18:00', close: '02:00' },
    coverCharge: { amount: 0, verified: true, note: 'No cover. Bottle minimums for tables.' },
    dressCode: 'smart-casual', ageRequirement: 21,
    busynessBase: 58, rating: 4.5, reviewCount: 301,
    tags: ['craft cocktails', 'low key', 'mood lighting', 'date night'],
    amenities: ['Table Reservations', 'Curated Cocktail Menu', 'No TVs', 'Piano Bar Thurs–Sat'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri'], start: '18:00', end: '21:00', deals: ['$10 signature cocktails (reg $16)', '$8 wine', '$6 beer'] }],
    specials: [
      { day: 'Thu', name: 'Piano Night', description: 'Live pianist 8 PM–midnight.' },
    ],
    campusArea: false, campusDistanceMiles: 1.9,
    vibe: 'chill', priceRange: 3,
    phone: '(555) 340-4455', instagram: '@noirlounge',
  },
  {
    id: 12, name: 'Skyline Rooftop', type: 'Rooftop',
    neighborhood: 'Downtown', address: '1 Summit Tower, 24th Floor',
    distanceMiles: 0.6, walkMinutes: 12,
    hours: { open: '17:00', close: '01:00' },
    coverCharge: { amount: 15, verified: true, note: '$15 on weekends. Free weekdays.' },
    dressCode: 'smart-casual', ageRequirement: 21,
    busynessBase: 77, rating: 4.7, reviewCount: 624,
    tags: ['city views', 'rooftop', 'cocktails', 'Instagrammable'],
    amenities: ['360° City Views', 'Heated Outdoor Seating', 'Fire Pits', 'Sunset Sessions'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri'], start: '17:00', end: '20:00', deals: ['$5 off all cocktails', '$8 wine', 'Free entry (no cover on weekdays)'] }],
    specials: [
      { day: 'Fri', name: 'Sunset Happy Hour', description: 'Extended HH until 8 PM with DJ from 7.' },
      { day: 'Sat', name: 'Rooftop Session', description: '$15 cover includes welcome cocktail.' },
    ],
    campusArea: false, campusDistanceMiles: 1.1,
    vibe: 'lively', priceRange: 3,
    phone: '(555) 001-7700', instagram: '@skylinerooftopbar',
  },
  {
    id: 13, name: 'The Penthouse', type: 'Lounge',
    neighborhood: 'Downtown', address: '88 Grand Ave, Top Floor',
    distanceMiles: 0.7, walkMinutes: 14,
    hours: { open: '19:00', close: '02:00' },
    coverCharge: { amount: 0, verified: false, note: 'No cover but minimum spend at table ($100+)' },
    dressCode: 'upscale', ageRequirement: 21,
    busynessBase: 49, rating: 4.6, reviewCount: 182,
    tags: ['exclusive', 'VIP', 'bottle service', 'skyline views'],
    amenities: ['VIP Only Sections', 'Champagne List', 'Concierge', 'Valet Parking'],
    happyHours: [],
    specials: [
      { day: 'Sat', name: 'Members Night', description: 'Priority entry for members. Non-members require reservation.' },
    ],
    campusArea: false, campusDistanceMiles: 1.2,
    vibe: 'exclusive', priceRange: 4,
    phone: '(555) 088-0001', instagram: '@thepenthousebar',
  },

  // ── BREWERY ─────────────────────────────────────────────────────────────────
  {
    id: 14, name: 'Hops & Dreams', type: 'Brewery',
    neighborhood: 'Warehouse District', address: '212 Barrel St',
    distanceMiles: 1.7, walkMinutes: 34,
    hours: { open: '14:00', close: '23:00' },
    coverCharge: { amount: 0, verified: true, note: 'Free. Taproom open to public.' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 44, rating: 4.8, reviewCount: 397,
    tags: ['craft beer', 'on-site brewery', 'dog friendly', 'food trucks', 'board games'],
    amenities: ['Brewery Tours', 'Dog Friendly', 'Board Games', 'Food Trucks Weekends', 'Growler Fills'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri'], start: '14:00', end: '17:00', deals: ['$1 off all pints', 'Free brewery tour at 3 PM', '$12 growler fills'] }],
    specials: [
      { day: 'Sat', name: 'New Release Saturday', description: 'New seasonal taps every Saturday at noon.' },
      { day: 'Sun', name: 'Sunday Funday', description: '$5 pints all day.' },
    ],
    campusArea: false, campusDistanceMiles: 2.0,
    vibe: 'chill', priceRange: 2,
    phone: '(555) 212-4488', instagram: '@hopsanddreams',
  },

  // ── CAMPUS ──────────────────────────────────────────────────────────────────
  {
    id: 15, name: 'Campus Cantina', type: 'Bar',
    neighborhood: 'Campus District', address: '5 Greek Row',
    distanceMiles: 0.3, walkMinutes: 6,
    hours: { open: '17:00', close: '02:00' },
    coverCharge: { amount: 0, verified: true, note: 'Always free' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 91, rating: 3.8, reviewCount: 703,
    tags: ['college bar', 'margaritas', 'game nights', 'karaoke'],
    amenities: ['Karaoke Weekends', 'Foosball', 'Beer Pong', 'Late Kitchen Until 1 AM'],
    happyHours: [{ days: ['Mon','Tue','Wed','Thu','Fri'], start: '17:00', end: '20:00', deals: ['$3 domestics', '$5 margaritas', '$2 off nachos'] }],
    specials: [
      { day: 'Tue', name: "$2 Tuesday", description: '$2 tacos + $2 domestic beers all night.' },
      { day: 'Wed', name: "Ladies Night", description: 'Free margaritas for ladies 9–10 PM. $5 margs all night.' },
      { day: 'Thu', name: 'Thirsty Thursday', description: '$3 shots, $4 wells until midnight.' },
      { day: 'Sat', name: 'Karaoke Night', description: 'Karaoke from 9 PM. Sign up at the bar.' },
    ],
    campusArea: true, campusDistanceMiles: 0.05,
    vibe: 'lively', priceRange: 1,
    phone: '(555) 005-0303', instagram: '@campuscantina',
  },
  {
    id: 16, name: 'Greek Row Tavern', type: 'Bar',
    neighborhood: 'Campus District', address: '17 Frat Row',
    distanceMiles: 0.25, walkMinutes: 5,
    hours: { open: '20:00', close: '02:00' },
    coverCharge: { amount: 5, verified: true, note: '$5 Thu–Sat. Free Mon–Wed.' },
    dressCode: 'casual', ageRequirement: 21,
    busynessBase: 85, rating: 3.6, reviewCount: 411,
    tags: ['college', 'party bar', 'beer pong tables', 'loud music'],
    amenities: ['Beer Pong Tables', 'Flip Cup Tournaments', 'DJ Booth', 'Photo Booth'],
    happyHours: [{ days: ['Mon','Tue','Wed'], start: '20:00', end: '22:00', deals: ['$2 cans', '$3 shots', 'Free entry all night'] }],
    specials: [
      { day: 'Thu', name: 'College Night', description: '$5 cover with student ID. $3 domestics all night.' },
      { day: 'Fri', name: 'Flip Cup Fridays', description: 'Tournament starts at 10 PM. $20 entry, winner takes pot.' },
    ],
    campusArea: true, campusDistanceMiles: 0.1,
    vibe: 'intense', priceRange: 1,
    phone: '(555) 017-5500', instagram: '@greekrowtavern',
  },

  // ── LATE FOOD ────────────────────────────────────────────────────────────────
  {
    id: 17, name: 'Midnight Kitchen', type: 'Late Food',
    neighborhood: 'Downtown', address: '42 Night Owl Lane',
    distanceMiles: 0.5, walkMinutes: 10,
    hours: { open: '22:00', close: '05:00' },
    coverCharge: { amount: 0, verified: true, note: 'No cover. Restaurant only.' },
    dressCode: 'casual', ageRequirement: 0,
    busynessBase: 66, rating: 4.5, reviewCount: 892,
    tags: ['late night eats', 'burgers', 'poutine', 'breakfast all night'],
    amenities: ['All-Night Breakfast', 'Bar Service', 'Outdoor Seating', 'No Wait Policy'],
    happyHours: [],
    specials: [
      { day: 'Fri', name: 'Loaded Fries Friday', description: 'Any loaded fries for $8 after midnight.' },
      { day: 'Sat', name: 'Drunk Breakfast', description: 'Full breakfast menu from 1–5 AM on Saturdays.' },
    ],
    campusArea: false, campusDistanceMiles: 0.8,
    vibe: 'chill', priceRange: 1,
    phone: '(555) 042-2400', instagram: '@midnightkitchenbar',
  },
  {
    id: 18, name: 'Grillhouse Late Night', type: 'Late Food',
    neighborhood: 'Campus District', address: '99 Campus Blvd',
    distanceMiles: 0.3, walkMinutes: 6,
    hours: { open: '21:00', close: '04:00' },
    coverCharge: { amount: 0, verified: true, note: 'No cover' },
    dressCode: 'casual', ageRequirement: 0,
    busynessBase: 73, rating: 4.2, reviewCount: 614,
    tags: ['chicken', 'waffles', 'campus food', 'open late'],
    amenities: ['Drive-Thru After 2 AM', 'Beer Selection', 'Giant Portions', 'Student Discount'],
    happyHours: [],
    specials: [
      { day: 'Mon', name: 'Student Monday', description: '10% off with valid student ID.' },
      { day: 'Fri', name: 'Party Pack Deal', description: '$35 party pack: 20 tenders, 4 sides, 4 drinks.' },
    ],
    campusArea: true, campusDistanceMiles: 0.15,
    vibe: 'chill', priceRange: 1,
    phone: '(555) 099-3366', instagram: '@grillhouselatenight',
  },
  {
    id: 19, name: 'The Breakfast Club', type: 'Late Food',
    neighborhood: 'Entertainment District', address: '808 Neon Row',
    distanceMiles: 1.3, walkMinutes: 26,
    hours: { open: '00:00', close: '07:00' },
    coverCharge: { amount: 0, verified: true, note: 'No cover. Midnight–7 AM only.' },
    dressCode: 'casual', ageRequirement: 0,
    busynessBase: 79, rating: 4.3, reviewCount: 445,
    tags: ['24h weekend', 'pancakes', 'eggs', 'post-club', 'bar crawl pit stop'],
    amenities: ['Bar Crawl Friendly', 'Massive Portions', 'DJ Until 3 AM', 'Photo Wall'],
    happyHours: [],
    specials: [
      { day: 'Fri', name: "Post-Club Special", description: "$12 full breakfast + coffee from 2–5 AM." },
      { day: 'Sat', name: "Post-Club Special", description: "$12 full breakfast + coffee from 2–5 AM." },
    ],
    campusArea: false, campusDistanceMiles: 1.4,
    vibe: 'lively', priceRange: 1,
    phone: '(555) 808-0001', instagram: '@thebreakfastclubdiner',
  },
  {
    id: 20, name: 'Slice & Dice Pizza', type: 'Late Food',
    neighborhood: 'Campus District', address: '33 College Lane',
    distanceMiles: 0.2, walkMinutes: 4,
    hours: { open: '18:00', close: '04:00' },
    coverCharge: { amount: 0, verified: true, note: 'No cover' },
    dressCode: 'casual', ageRequirement: 0,
    busynessBase: 80, rating: 4.0, reviewCount: 1102,
    tags: ['pizza', 'by the slice', 'cheap', 'student staple', 'open late'],
    amenities: ['By-the-Slice', 'Whole Pies', 'Beer & Wine', 'Fast Service'],
    happyHours: [],
    specials: [
      { day: 'Wed', name: '2-for-1 Slices', description: 'Buy one slice, get one free all day Wednesday.' },
      { day: 'Fri', name: 'Midnight Madness', description: '$2 slices midnight–2 AM every Friday.' },
      { day: 'Sat', name: 'Midnight Madness', description: '$2 slices midnight–2 AM every Saturday.' },
    ],
    campusArea: true, campusDistanceMiles: 0.1,
    vibe: 'chill', priceRange: 1,
    phone: '(555) 033-7474', instagram: '@sliceanddice',
  },
]

// ─── Utility functions ────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function isOpenNow(venue, now = new Date()) {
  const [openH, openM] = venue.hours.open.split(':').map(Number)
  const [closeH, closeM] = venue.hours.close.split(':').map(Number)
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const openMins = openH * 60 + openM
  let closeMins = closeH * 60 + closeM
  if (closeMins < openMins) closeMins += 24 * 60 // overnight venue
  const normalizedCurrent = currentMins < openMins ? currentMins + 24 * 60 : currentMins
  return normalizedCurrent >= openMins && normalizedCurrent < closeMins
}

export function computeBusyness(venue, now = new Date()) {
  const hour = now.getHours() + now.getMinutes() / 60
  const dow = now.getDay()
  const isWeekend = dow === 5 || dow === 6 || dow === 0

  let timeMult = 0.1
  if (hour >= 0 && hour < 2)   timeMult = isWeekend ? 0.95 : 0.80
  else if (hour >= 23)          timeMult = isWeekend ? 0.90 : 0.72
  else if (hour >= 22)          timeMult = isWeekend ? 0.82 : 0.62
  else if (hour >= 21)          timeMult = isWeekend ? 0.72 : 0.52
  else if (hour >= 19)          timeMult = isWeekend ? 0.55 : 0.38
  else if (hour >= 17)          timeMult = 0.28
  else if (hour >= 14)          timeMult = 0.18
  else if (hour >= 2 && hour < 6) timeMult = isWeekend ? 0.35 : 0.05

  const flicker = Math.sin(Date.now() / 45000 + venue.id * 2.3) * 2.5
  const raw = venue.busynessBase * timeMult + flicker
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function getCurrentHappyHour(venue, now = new Date()) {
  const dayName = DAY_NAMES[now.getDay()]
  const currentMins = now.getHours() * 60 + now.getMinutes()
  for (const hh of venue.happyHours) {
    if (!hh.days.includes(dayName)) continue
    const [sh, sm] = hh.start.split(':').map(Number)
    const [eh, em] = hh.end.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins   = eh * 60 + em
    if (currentMins >= startMins && currentMins < endMins) return hh
  }
  return null
}

export function getTodaySpecials(venue, now = new Date()) {
  const dayName = DAY_NAMES[now.getDay()]
  return venue.specials.filter(s => s.day === dayName)
}

export function formatCover(coverCharge) {
  if (!coverCharge.amount) return 'Free'
  return `$${coverCharge.amount}`
}

export function busynessLabel(pct) {
  if (pct >= 90) return { label: 'Packed',  color: '#ef4444' }
  if (pct >= 70) return { label: 'Busy',    color: '#f97316' }
  if (pct >= 45) return { label: 'Lively',  color: '#eab308' }
  if (pct >= 20) return { label: 'Mellow',  color: '#22c55e' }
  return              { label: 'Quiet',   color: '#6b7280' }
}

// ─── Check-in system ──────────────────────────────────────────────────────────
const CHECKIN_KEY = 'nq_checkins'
const DECAY_MS = 2 * 60 * 60 * 1000 // 2 hours

export function submitCheckin(venueId, level) {
  const all = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}')
  const arr = (all[venueId] || []).filter(c => Date.now() - c.ts < DECAY_MS)
  arr.push({ level, ts: Date.now() })
  all[venueId] = arr
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(all))
}

export function getCheckinBusyness(venueId) {
  const all = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}')
  const now = Date.now()
  const recent = (all[venueId] || []).filter(c => now - c.ts < DECAY_MS)
  if (!recent.length) return null
  let total = 0, weight = 0
  for (const c of recent) {
    const age = (now - c.ts) / DECAY_MS
    const w = 1 - age * 0.4
    total += c.level * w; weight += w
  }
  return Math.round(total / weight)
}

// Cover charge crowdsource
const COVER_KEY = 'nq_coverreports'

export function reportCover(venueId, amount) {
  const all = JSON.parse(localStorage.getItem(COVER_KEY) || '{}')
  all[venueId] = { amount, ts: Date.now() }
  localStorage.setItem(COVER_KEY, JSON.stringify(all))
}

export function getCrowdCover(venueId) {
  const all = JSON.parse(localStorage.getItem(COVER_KEY) || '{}')
  const report = all[venueId]
  if (!report) return null
  const hoursAgo = (Date.now() - report.ts) / 3600000
  if (hoursAgo > 8) return null // stale
  return { amount: report.amount, hoursAgo: Math.round(hoursAgo) }
}
