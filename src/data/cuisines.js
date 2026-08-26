import { IRAQI_DISHES } from './cuisines/iraqi.js'
import { AMERICAN_DISHES } from './cuisines/american.js'
import { MEXICAN_DISHES } from './cuisines/mexican.js'
import { ITALIAN_DISHES } from './cuisines/italian.js'
import { INDIAN_DISHES } from './cuisines/indian.js'
import { CHINESE_DISHES } from './cuisines/chinese.js'
import { JAPANESE_DISHES } from './cuisines/japanese.js'
import { THAI_DISHES } from './cuisines/thai.js'
import { KOREAN_DISHES } from './cuisines/korean.js'
import { MEDITERRANEAN_DISHES } from './cuisines/mediterranean.js'

// Each cuisine's dish list lives in its own file under ./cuisines/ so it can
// be authored/reviewed independently. Nutrition values are per 100g of the
// prepared dish — see the comment in cuisines/iraqi.js for why.
export const CUISINES = [
  { id: 'iraqi', label: 'Iraqi', emoji: '🇮🇶' },
  { id: 'american', label: 'American', emoji: '🇺🇸' },
  { id: 'mexican', label: 'Mexican', emoji: '🇲🇽' },
  { id: 'italian', label: 'Italian', emoji: '🇮🇹' },
  { id: 'indian', label: 'Indian', emoji: '🇮🇳' },
  { id: 'chinese', label: 'Chinese', emoji: '🇨🇳' },
  { id: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
  { id: 'thai', label: 'Thai', emoji: '🇹🇭' },
  { id: 'korean', label: 'Korean', emoji: '🇰🇷' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
]

export const CUISINE_DISHES = {
  iraqi: IRAQI_DISHES,
  american: AMERICAN_DISHES,
  mexican: MEXICAN_DISHES,
  italian: ITALIAN_DISHES,
  indian: INDIAN_DISHES,
  chinese: CHINESE_DISHES,
  japanese: JAPANESE_DISHES,
  thai: THAI_DISHES,
  korean: KOREAN_DISHES,
  mediterranean: MEDITERRANEAN_DISHES,
}

export const ALL_CUISINE_DISHES = Object.values(CUISINE_DISHES).flat()

// Go-to one-tap suggestions for the "low on fiber" insight.
export const FIBER_BOOST_DISHES = {
  iraqi: 'fasolia',
  american: 'chili-beans',
}

export function findDish(id) {
  return ALL_CUISINE_DISHES.find((d) => d.id === id) || null
}
