/**
 * Sport Icons Utility
 * Provides both emoji and image icons for sports based on user settings
 */

// Emoji mapping for sports
const SPORT_EMOJIS: Record<string, string> = {
  'SWIM': '🏊',
  'BIKE': '🚴',
  'RUN': '🏃',
  'BODY_BUILDING': '💪',
  'ROWING': '🚣',
  'SKATE': '⛸️',
  'GYMNASTIC': '🤸',
  'STRETCHING': '🧘',
  'PILATES': '🧘‍♀️',
  'YOGA': '🧘‍♂️',
  'SKI': '⛷️',
  'SNOWBOARD': '🏂',
  'TECHNICAL_MOVES': '⚙️',
  'FREE_MOVES': '🤾',
  'SOCCER': '⚽',
  'BASKETBALL': '🏀',
  'TENNIS': '🎾',
  'VOLLEYBALL': '🏐',
  'GOLF': '⛳',
  'BOXING': '🥊',
  'MARTIAL_ARTS': '🥋',
  'CLIMBING': '🧗',
  'HIKING': '🥾',
  'WALKING': '🚶',
  'DANCING': '💃',
  'CROSSFIT': '🏋️',
  'TRIATHLON': '🏊‍♂️',
  'TRACK_FIELD': '🏃‍♀️',
  'SURFING': '🏄',
  'BASEBALL': '⚾',
  'ICE_HOCKEY': '🏒',
  'RUGBY': '🏉'
};

// Image path mapping for sports
const SPORT_IMAGES: Record<string, string> = {
  'SWIM': '/icons/swimming.jpg',
  'BIKE': '/icons/cycling.jpg',
  'RUN': '/icons/running.jpg',
  'BODY_BUILDING': '/icons/weights.jpg',
  'ROWING': '/icons/rowing.jpg',
  'SKATE': '/icons/skating.jpg',
  'GYMNASTIC': '/icons/gymnastics.jpg',
  'STRETCHING': '/icons/stretching.jpg',
  'PILATES': '/icons/pilaters.jpg', // Note: actual filename has typo
  'YOGA': '/icons/yoga.jpg',
  'SKI': '/icons/skiing.jpg',
  'SNOWBOARD': '/icons/snowboard.jpg', // Fixed: was 'snowboarding.jpg'
  'TECHNICAL_MOVES': '/icons/Technical/technical.jpg',
  'FREE_MOVES': '/icons/gymnastics.jpg', // Fallback
  'SOCCER': '/icons/Technical/soccer.jpg',
  'BASKETBALL': '/icons/Technical/basketball.jpg',
  'TENNIS': '/icons/Technical/tennis.jpg',
  'VOLLEYBALL': '/icons/volley.jpg',
  'GOLF': '/icons/golf.jpg',
  'BOXING': '/icons/boxe.jpg',
  'MARTIAL_ARTS': '/icons/Technical/martial_arts.jpg',
  'CLIMBING': '/icons/climbing.jpg',
  'HIKING': '/icons/hiking.jpg',
  'WALKING': '/icons/walking.jpg',
  'DANCING': '/icons/modern_dance.jpg', // Fixed: was 'dancing.jpg'
  'CROSSFIT': '/icons/weights.jpg', // Fallback
  'TRIATHLON': '/icons/triathlon.jpg',
  'TRACK_FIELD': '/icons/Technical/athletic.jpg', // Fixed: was 'track_field.jpg'
  'SURFING': '/icons/surfing.jpg',
  'BASEBALL': '/icons/Technical/baseball.jpg',
  'ICE_HOCKEY': '/icons/ice_hockey.jpg',
  'RUGBY': '/icons/Technical/rugby.jpg'
};

/**
 * Get sport emoji icon
 */
export function getSportEmoji(sport: string): string {
  return SPORT_EMOJIS[sport] || '🏋️';
}

/**
 * Get sport image path
 */
export function getSportImagePath(sport: string): string {
  return SPORT_IMAGES[sport] || '/icons/running.jpg';
}

/**
 * Get sport icon based on type (emoji or image)
 * @param sport - Sport code (e.g., 'SWIM', 'RUN')
 * @param iconType - 'emoji' or 'icon'
 * @returns Emoji string or image path
 */
export function getSportIcon(sport: string, iconType: 'emoji' | 'icon' = 'emoji'): string {
  if (iconType === 'icon') {
    return getSportImagePath(sport);
  }
  return getSportEmoji(sport);
}

/**
 * Check if icon type is image
 */
export function isImageIcon(iconType: string): boolean {
  return iconType === 'icon' || iconType === 'image';
}

