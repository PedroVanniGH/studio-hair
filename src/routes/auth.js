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

// PATCH /api/admin/auth/password — Cambiar contraseña del admin
router.patch('/password', async (req, res, next) => {
  try {
    const token =
      req.cookies?.sh_admin_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ error: 'No autenticado' });

    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch { res.clearCookie('sh_admin_token'); return res.status(401).json({ error: 'Sesión expirada' }); }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } });
    if (!admin) return res.status(404).json({ error: 'Admin no encontrado' });

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
