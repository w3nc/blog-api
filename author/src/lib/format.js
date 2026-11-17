// Small helpers shared by the dashboard pages.

// "Nov 15" - short date for the tables.
export function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// "Nov 15, 2026 14:05" - used for comments.
export function longDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// Turns "node.js, express" into ["node.js", "express"] for the tags input.
export function parseTags(text) {
  return text
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);
}
