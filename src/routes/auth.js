import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const router = Router();

// POST /api/admin/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Cookie httpOnly: no accesible desde JS del cliente
    res.cookie('sh_admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 días en ms
    });

    res.json({ ok: true, email: admin.email });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('sh_admin_token');
  res.json({ ok: true });
});

// GET /api/admin/auth/me — para verificar sesión activa desde el frontend
router.get('/me', (req, res) => {
  const token =
    req.cookies?.sh_admin_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: payload.email });
  } catch {
    res.clearCookie('sh_admin_token');
    res.status(401).json({ error: 'Sesión expirada' });
  }
});

export default router;
