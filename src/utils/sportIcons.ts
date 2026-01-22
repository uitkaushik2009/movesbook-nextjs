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
  'RUGBY': '🏉',
  'AMERICAN_FOOTBALL': '🏈',
  'ARCHERY': '🏹',
  'ARTISTIC_GYMNASTICS': '🤸‍♀️',
  'ATHLETICS': '🏃‍♂️',
  'BADMINTON': '🏸',
  'BILLIARDS': '🎱',
  'BOATING': '⛵',
  'BOWLING': '🎳',
  'CANOEING': '🛶',
  'CANOE': '🛶',
  'CLASSIC_DANCE': '💃',
  'CRICKET': '🏏',
  'CROSS_COUNTRY_SKIING': '⛷️',
  'CYCLOCROSS': '🚵',
  'DANCE': '💃',
  'DIPS': '💪',
  'DIVING': '🤿',
  'DOWNHILL_SKIING': '⛷️',
  'FENCING': '🤺',
  'FIELD_HOCKEY': '🏑',
  'FISHING': '🎣',
  'FREESTYLE_WRESTLING': '🤼',
  'HANDBALL': '🤾',
  'HANG_GLIDING': '🪂',
  'HORSE_RACING': '🏇',
  'ICE_SKATING': '⛸️',
  'JUMPS': '🏃‍♂️',
  'KAYAK': '🛶',
  'KICKBOXING': '🥊',
  'LIFTING': '🏋️',
  'MODERN_DANCE': '💃',
  'MOTORING': '🏎️',
  'MOUNTAIN_BIKE': '🚵',
  'MOUNTAIN_CLIMBING': '🧗',
  'MTB': '🚵',
  'PING_PONG': '🏓',
  'POLO': '🏇',
  'POWERLIFTING': '🏋️',
  'RACQUETBALL': '🎾',
  'RHYTHMIC_GYMNASTICS': '🤸‍♀️',
  'SAILING': '⛵',
  'SHOT_PUT': '🏋️',
  'SKATEBOARD': '🛹',
  'SKI_JUMP': '🎿',
  'SKI_SLALOM': '⛷️',
  'SNORKELING': '🤿',
  'SPARTAN': '🏃‍♂️',
  'SPINNING': '🚴',
  'TANGO': '💃',
  'TECHNICAL': '⚙️',
  'THROWS': '🏋️',
  'TREKKING': '🥾',
  'WATER_POLO': '🤽',
  'WATER_SKI': '🎿',
  'WINDSURF': '🏄',
  'CYCLING_TOURISM': '🚴',
  'CALISTENIC': '💪'
};

// Image path mapping for sports
const SPORT_IMAGES: Record<string, string> = {
  'SWIM': '/icons/swimming.jpg',
  'BIKE': '/icons/cycling.jpg',
  'RUN': '/icons/running.jpg',
  'BODY_BUILDING': '/icons/weights.jpg',
  'ROWING': '/icons/rowing.jpg',
  'SKATE': '/icons/skating.jpg',
  'GYMNASTIC': '/icons/gymnastic.jpg',
  'STRETCHING': '/icons/stretching.jpg',
  'PILATES': '/icons/pilaters.jpg',
  'YOGA': '/icons/yoga.jpg',
  'SKI': '/icons/ski.jpg',
  'SNOWBOARD': '/icons/snowboard.jpg',
  'TECHNICAL_MOVES': '/icons/technical.jpg',
  'FREE_MOVES': '/icons/gymnastic.jpg',
  'SOCCER': '/icons/soccer.jpg',
  'BASKETBALL': '/icons/basketball.jpg',
  'TENNIS': '/icons/tennis.jpg',
  'VOLLEYBALL': '/icons/volley.jpg',
  'GOLF': '/icons/golf.jpg',
  'BOXING': '/icons/boxe.jpg',
  'MARTIAL_ARTS': '/icons/martial arts.jpg',
  'CLIMBING': '/icons/mountain climbing.jpg',
  'HIKING': '/icons/hiking.jpg',
  'WALKING': '/icons/walking.jpg',
  'DANCING': '/icons/dance.jpg',
  'CROSSFIT': '/icons/crossfit.jpg',
  'TRIATHLON': '/icons/triathlon.jpg',
  'TRACK_FIELD': '/icons/athletic.jpg',
  'SURFING': '/icons/surf.jpg',
  'BASEBALL': '/icons/baseball.jpg',
  'ICE_HOCKEY': '/icons/hockey.jpg',
  'RUGBY': '/icons/rugby.jpg',
  'AMERICAN_FOOTBALL': '/icons/american football.jpg',
  'ARCHERY': '/icons/arch.jpg',
  'ARTISTIC_GYMNASTICS': '/icons/artistic gymnastics.jpg',
  'ATHLETICS': '/icons/athletic.jpg',
  'BADMINTON': '/icons/badminton.jpg',
  'BILLIARDS': '/icons/billiards.jpg',
  'BOATING': '/icons/boating.jpg',
  'BOWLING': '/icons/bowling.jpg',
  'CANOEING': '/icons/canoe.jpg',
  'CANOE': '/icons/canoe.jpg',
  'CLASSIC_DANCE': '/icons/classic dance.jpg',
  'CRICKET': '/icons/cricket.jpg',
  'CROSS_COUNTRY_SKIING': '/icons/cross-country skiing.jpg',
  'CYCLOCROSS': '/icons/cyclocross.jpg',
  'DANCE': '/icons/dance.jpg',
  'DIPS': '/icons/dips.jpg',
  'DIVING': '/icons/diving.jpg',
  'DOWNHILL_SKIING': '/icons/downhill skiing.jpg',
  'FENCING': '/icons/fancing.jpg',
  'FIELD_HOCKEY': '/icons/field hockey.jpg',
  'FISHING': '/icons/fishing.jpg',
  'FREESTYLE_WRESTLING': '/icons/freestyle wrestling.jpg',
  'HANDBALL': '/icons/handball.jpg',
  'HANG_GLIDING': '/icons/hang gliding.jpg',
  'HORSE_RACING': '/icons/horse racing.jpg',
  'ICE_SKATING': '/icons/ice skating.jpg',
  'JUMPS': '/icons/jumps.jpg',
  'KAYAK': '/icons/kayak.jpg',
  'KICKBOXING': '/icons/kick boxing.jpg',
  'LIFTING': '/icons/lifting.jpg',
  'MODERN_DANCE': '/icons/modern_dance.jpg',
  'MOTORING': '/icons/Motoring.jpg',
  'MOUNTAIN_BIKE': '/icons/mountain bike.jpg',
  'MOUNTAIN_CLIMBING': '/icons/mountain climbing.jpg',
  'MTB': '/icons/MTB.jpg',
  'PING_PONG': '/icons/ping pong.jpg',
  'POLO': '/icons/polo.jpg',
  'POWERLIFTING': '/icons/power_lifting.jpg',
  'RACQUETBALL': '/icons/raquetball.jpg',
  'RHYTHMIC_GYMNASTICS': '/icons/rhythmic gymnastics.jpg',
  'SAILING': '/icons/sailing.jpg',
  'SHOT_PUT': '/icons/shot.jpg',
  'SKATEBOARD': '/icons/skateboard.jpg',
  'SKI_JUMP': '/icons/ski jump.jpg',
  'SKI_SLALOM': '/icons/ski slalom.jpg',
  'SNORKELING': '/icons/snorkeling.jpg',
  'SPARTAN': '/icons/spartan.jpg',
  'SPINNING': '/icons/spining.jpg',
  'TANGO': '/icons/tango.jpg',
  'TECHNICAL': '/icons/technical.jpg',
  'THROWS': '/icons/throwes.jpg',
  'TREKKING': '/icons/trekking.jpg',
  'WATER_POLO': '/icons/water polo.jpg',
  'WATER_SKI': '/icons/waterl ski.jpg',
  'WINDSURF': '/icons/windsurf.jpg',
  'CYCLING_TOURISM': '/icons/cicloturism.jpg',
  'CALISTENIC': '/icons/calistenic.jpg'
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

