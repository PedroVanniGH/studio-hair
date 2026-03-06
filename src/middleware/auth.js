import jwt from 'jsonwebtoken';

/**
 * Middleware: verifica JWT en cookie httpOnly o header Authorization.
 * Si el token es válido, adjunta req.admin = { adminId, email }.
 */
export function requireAdmin(req, res, next) {
  const token =
    req.cookies?.sh_admin_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión.' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('sh_admin_token');
    return res.status(401).json({ error: 'Sesión expirada. Iniciá sesión nuevamente.' });
  }
}
