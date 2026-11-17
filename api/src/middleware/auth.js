// Middleware that reads "Authorization: Bearer <token>" and figures out who
// the caller is. Two versions: one that requires login, one that needs AUTHOR.

import { verifyToken } from '../lib/jwt.js';
import { HttpError } from '../lib/http-error.js';

export function makeAuth(config, prisma) {
  // 1) Put the user on req.user when the token is valid. Otherwise 401.
  const requireAuth = async (req, _res, next) => {
    try {
      const header = req.headers.authorization || '';
      if (!header.startsWith('Bearer ')) {
        throw new HttpError(401, 'Missing or malformed Authorization header. Send: Authorization: Bearer <token>');
      }

      const token = header.slice('Bearer '.length).trim();
      let payload;
      try {
        payload = verifyToken(token, config);
      } catch {
        throw new HttpError(401, 'Token is invalid or expired. Log in again.');
      }

      // Look the user up so a deleted account cannot keep using an old token.
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, role: true },
      });
      if (!user) throw new HttpError(401, 'Token belongs to a user that no longer exists.');

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };

  // 2) Same, but the account must be an AUTHOR.
  const requireAuthor = (req, res, next) => {
    requireAuth(req, res, (err) => {
      if (err) return next(err);
      if (req.user.role !== 'AUTHOR') {
        return next(new HttpError(403, 'This route is for authors only.'));
      }
      next();
    });
  };

  return { requireAuth, requireAuthor };
}
