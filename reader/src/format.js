// Small helpers for dates, names, colours and reading time.

// "November 15, 2026"
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// About 200 words per minute, never less than 1 minute.
export function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// "maria" -> "MA", "jon dela cruz" -> "JC"
export function initials(name) {
  const words = String(name).trim().split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
}

// "maria" -> "Maria"
export function displayName(username) {
  return username.charAt(0).toUpperCase() + username.slice(1);
}

// "1 comment" / "3 comments"
export function commentLabel(count) {
  return `${count} ${count === 1 ? 'comment' : 'comments'}`;
}

// Pastel background for an avatar. The same name always gets the same colour.
const AVATAR_COLORS = ['#fce3c8', '#d6e8f5', '#e2f1df', '#f5dee9', '#e9e4f7'];
export function avatarColor(seed) {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
