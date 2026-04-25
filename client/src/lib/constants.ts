/**
 * Shared constants for the diAry web app
 */

export const MOOD_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  happy: { icon: '/manus-storage/happy_emoji_29a38d9a.svg', label: 'Happy', color: '#FFD700' },
  sad: { icon: '/manus-storage/sad_emoji_ce9f039b.svg', label: 'Sad', color: '#6B8EC2' },
  angry: { icon: '/manus-storage/angry_emoji_42d4c119.svg', label: 'Angry', color: '#E85D4A' },
  bored: { icon: '/manus-storage/bored_emoji_7f0882ae.svg', label: 'Bored', color: '#A0A0A0' },
  naughty: { icon: '/manus-storage/naughty_emoji_89c568d1.svg', label: 'Naughty', color: '#D4A5E5' },
  romantic: { icon: '/manus-storage/romantic_emoji_77cb660b.svg', label: 'Romantic', color: '#FF6B8A' },
  sick: { icon: '/manus-storage/sick_emoji_3d6e548a.svg', label: 'Sick', color: '#8BC34A' },
  sleepy: { icon: '/manus-storage/sleepy_emoji_0263111a.svg', label: 'Sleepy', color: '#9C8FD0' },
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
