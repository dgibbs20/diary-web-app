/**
 * Shared constants for the diAry web app
 */

export const MOOD_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  happy: { icon: '/assets/images/happy_emoji.svg', label: 'Happy', color: '#FFD700' },
  sad: { icon: '/assets/images/sad_emoji.svg', label: 'Sad', color: '#6B8EC2' },
  angry: { icon: '/assets/images/angry_emoji.svg', label: 'Angry', color: '#E85D4A' },
  bored: { icon: '/assets/images/bored_emoji.svg', label: 'Bored', color: '#A0A0A0' },
  naughty: { icon: '/assets/images/naughty_emoji.svg', label: 'Naughty', color: '#D4A5E5' },
  romantic: { icon: '/assets/images/romantic_emoji.svg', label: 'Romantic', color: '#FF6B8A' },
  sick: { icon: '/assets/images/sick_emoji.svg', label: 'Sick', color: '#8BC34A' },
  sleepy: { icon: '/assets/images/sleepy_emoji.svg', label: 'Sleepy', color: '#9C8FD0' },
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
