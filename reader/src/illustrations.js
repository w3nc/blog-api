// Maps a post id to its picture in reader/public/illustrations/.
// Posts without an entry keep the drawn shapes from Illustration.jsx.
// The ids match the sample posts created by api/prisma/seed.js.
const POST_ART = {
  1: '/illustrations/three-apps.svg',
  2: '/illustrations/jwt.svg',
  3: '/illustrations/prisma.svg',
  4: '/illustrations/admin.svg',
  5: '/illustrations/moderation.svg',
};

// Returns the picture path for a post id, or '' when there is none.
export function artFor(postId) {
  return POST_ART[postId] || '';
}
