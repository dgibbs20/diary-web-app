/**
 * RegisterProfileService — detects user communication style from journal entries.
 * TypeScript port of the Flutter RegisterProfileService.
 * Returns a profile label string, 'general', or null (insufficient data).
 */

const PROFILE_LABELS: Record<string, string> = {
  aave:         'AAVE — expressive, community-rooted, direct',
  genz:         'Gen Z — casual, ironic, internet-native',
  academic:     'Academic — formal, analytical, precise',
  oldmoney:     'Old Money — refined, understated, traditional',
  spiritual:    'Spiritual — reflective, faith-centered, hopeful',
  workingclass: 'Working Class — grounded, direct, resilient',
};

function buildWordFreq(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const raw of text.split(/\s+/)) {
    const word = raw.replace(/[^a-z]/g, '');
    if (word) freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}

function countWord(freq: Map<string, number>, word: string): number {
  return freq.get(word) || 0;
}

function countPhrase(text: string, phrase: string): number {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (text.match(new RegExp(escaped, 'g')) || []).length;
}

function scoreMarkers(freq: Map<string, number>, markers: string[]): number {
  return markers.reduce((sum, m) => sum + countWord(freq, m), 0);
}

export function analyzeRegisterProfile(entries: string[]): string | null {
  if (entries.length < 3) return null;

  const combined = entries.join(' ').toLowerCase();
  const freq = buildWordFreq(combined);
  const words = combined.split(/\s+/).filter(Boolean);

  const scores: Record<string, number> = {
    aave: 0,
    genz: 0,
    academic: 0,
    oldmoney: 0,
    spiritual: 0,
    workingclass: 0,
  };

  // AAVE
  scores.aave += scoreMarkers(freq, [
    'finna', 'lowkey', 'highkey', 'bussin', 'slay', 'periodt',
    'chile', 'sis', 'bestie', 'deadass', 'ion', 'tryna', 'fam', 'bruh',
  ]);
  scores.aave += countPhrase(combined, 'no cap');
  scores.aave += countPhrase(combined, 'fr fr');

  // Gen Z
  scores.genz += scoreMarkers(freq, [
    'ngl', 'tbh', 'idk', 'lmao', 'lol', 'omg', 'vibe', 'vibes',
    'literally', 'slay', 'mid',
  ]);
  scores.genz += countPhrase(combined, 'understood the assignment');
  scores.genz += countPhrase(combined, "it's giving");
  scores.genz += countPhrase(combined, 'rent free');
  scores.genz += countPhrase(combined, 'main character');
  // Ellipsis overuse
  const ellipsisCount = (combined.match(/\.\.\./g) || []).length;
  if (ellipsisCount >= 3) scores.genz += 2;

  // Academic
  scores.academic += scoreMarkers(freq, [
    'therefore', 'however', 'furthermore', 'consequently', 'perspective',
    'analysis', 'framework', 'context', 'notion', 'perhaps', 'significant',
  ]);
  const avgWordLen = words.reduce((sum, w) => sum + w.replace(/[^a-z]/g, '').length, 0) / (words.length || 1);
  if (avgWordLen > 6) scores.academic += 2;
  const sentences = combined.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLen = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / (sentences.length || 1);
  if (avgSentenceLen > 20) scores.academic += 2;

  // Old Money
  scores.oldmoney += scoreMarkers(freq, [
    'rather', 'quite', 'indeed', 'terribly', 'frightfully', 'awfully',
    'shall', 'ought', 'dreadfully', 'jolly', 'ghastly', 'bother',
  ]);

  // Spiritual
  scores.spiritual += scoreMarkers(freq, [
    'god', 'spirit', 'soul', 'faith', 'pray', 'prayer', 'blessed',
    'universe', 'divine', 'manifest', 'peace', 'grateful', 'grace', 'healing',
  ]);

  // Working Class
  scores.workingclass += scoreMarkers(freq, [
    'work', 'job', 'boss', 'paycheck', 'bills', 'rent', 'grind',
    'hustle', 'overtime', 'shift', 'tired', 'broke',
  ]);

  const [topProfile, topScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  if (topScore < 3) return 'general';

  return PROFILE_LABELS[topProfile] ?? 'general';
}
