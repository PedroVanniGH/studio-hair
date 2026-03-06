import jwt from 'jsonwebtoken';

/** Protege rutas que requieren sesión de cliente. Devuelve 401 si no hay token válido. */
export function requireClient(req, res, next) {
  const token =
    req.cookies?.sh_client_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Iniciá sesión para continuar.' });
  }

  try {
    req.customer = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('sh_client_token');
    return res.status(401).json({ error: 'Sesión expirada. Iniciá sesión nuevamente.' });
  }
}

/** Para rutas opcionales: si hay token válido setea req.customer, si no, req.customer = null. */
export function optionalClient(req, res, next) {
  const token =
    req.cookies?.sh_client_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    req.customer = null;
    return next();
  }

  try {
    req.customer = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.clearCookie('sh_client_token');
    req.customer = null;
  }
  next();
}
