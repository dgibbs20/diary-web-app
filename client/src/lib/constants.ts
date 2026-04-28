/**
 * Shared constants for the diAry web app
 */

export const MOOD_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  // Positive
  happy:        { emoji: '😊',    label: 'Happy',        color: '#E8C547' },
  grateful:     { emoji: '🙏',    label: 'Grateful',     color: '#D4A574' },
  excited:      { emoji: '✨',    label: 'Excited',      color: '#F0C674' },
  peaceful:     { emoji: '🕊️',    label: 'Peaceful',     color: '#B8D4C8' },
  confident:    { emoji: '💪',    label: 'Confident',    color: '#C9A84C' },
  motivated:    { emoji: '🔥',    label: 'Motivated',    color: '#E07856' },
  proud:        { emoji: '🏆',    label: 'Proud',        color: '#D4AF37' },
  hopeful:      { emoji: '🌅',    label: 'Hopeful',      color: '#E8B587' },
  loved:        { emoji: '💛',    label: 'Loved',        color: '#F2D16B' },
  accomplished: { emoji: '⭐',    label: 'Accomplished', color: '#E8C547' },
  inspired:     { emoji: '💡',    label: 'Inspired',     color: '#F0CB5C' },
  content:      { emoji: '🌿',    label: 'Content',      color: '#A8B89C' },
  // Hard
  sad:          { emoji: '😔',    label: 'Sad',          color: '#7A8FAB' },
  anxious:      { emoji: '😰',    label: 'Anxious',      color: '#9BAEC4' },
  angry:        { emoji: '😤',    label: 'Angry',        color: '#C45A4A' },
  stressed:     { emoji: '😩',    label: 'Stressed',     color: '#B07868' },
  lonely:       { emoji: '🌑',    label: 'Lonely',       color: '#5C5870' },
  overwhelmed:  { emoji: '🌊',    label: 'Overwhelmed',  color: '#6E8AA8' },
  frustrated:   { emoji: '😣',    label: 'Frustrated',   color: '#B86B5A' },
  heartbroken:  { emoji: '💔',    label: 'Heartbroken',  color: '#A85878' },
  depressed:    { emoji: '🌧️',    label: 'Depressed',    color: '#6B7588' },
  exhausted:    { emoji: '😮‍💨',  label: 'Exhausted',    color: '#8A8074' },
  // Neutral
  meh:          { emoji: '😐',    label: 'Meh',          color: '#A89E8C' },
  numb:         { emoji: '🪨',    label: 'Numb',         color: '#8C8478' },
  indifferent:  { emoji: '🌫️',    label: 'Indifferent',  color: '#B0A89C' },
  just_okay:    { emoji: '👌',    label: 'Just Okay',    color: '#BCB098' },
  // Fun
  unbothered:   { emoji: '🧘',    label: 'Unbothered',   color: '#B8A878' },
  silly:        { emoji: '🎭',    label: 'Silly',        color: '#D4906B' },
  adventurous:  { emoji: '🧭',    label: 'Adventurous',  color: '#C49060' },
  // Reflective
  restless:     { emoji: '🌀',    label: 'Restless',     color: '#8C9CB0' },
  reflective:   { emoji: '🪞',    label: 'Reflective',   color: '#A8A090' },
  serene:       { emoji: '🌸',    label: 'Serene',       color: '#E0BCC8' },
};

export const AI_MODES = [
  { id: 'auto', label: 'Auto', description: 'AI chooses the best mode based on your entry', icon: '✨' },
  { id: 'vault', label: 'Vault', description: 'Secure reflection and deep analysis', icon: '🔒' },
  { id: 'friend', label: 'Friend', description: 'Warm, supportive conversation', icon: '💛' },
  { id: 'mirror', label: 'Mirror', description: 'Honest reflection of your thoughts', icon: '🪞' },
  { id: 'insight', label: 'Insight', description: 'Analytical patterns and growth', icon: '💡' },
];

export const SUBSCRIPTION_TIERS = {
  free: { name: 'Free', entriesPerDay: 3, aiCallsPerDay: 5 },
  diary_elite: { name: 'Elite', entriesPerDay: Infinity, aiCallsPerDay: Infinity },
};
