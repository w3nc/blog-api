// JWT sign and verify.
// The token payload is tiny on purpose: only the user id and role.
// Everything else is looked up from the database by the auth middleware.

import jwt from 'jsonwebtoken';

export function signToken(user, config) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyToken(token, config) {
  // Throws if the signature is wrong or the token expired.
  return jwt.verify(token, config.jwtSecret);
}
