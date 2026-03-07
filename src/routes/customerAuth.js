import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireClient } from '../middleware/clientAuth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.js';

const router = Router();

const COOKIE_OPTS = () => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const schema = z.object({
      name:     z.string().min(2).max(100),
      email:    z.string().email(),
      phone:    z.string().min(6).max(20).optional(),
      password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { name, email, phone, password } = parsed.data;
    const emailNorm = email.toLowerCase().trim();

    // ¿Ya existe con contraseña?
    const existing = await prisma.customer.findUnique({ where: { email: emailNorm } });
    if (existing?.passwordHash) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email. Iniciá sesión.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Si ya existe como invitado (hizo una reserva antes), actualizar; si no, crear
    const customer = existing
      ? await prisma.customer.update({
          where: { email: emailNorm },
          data:  { name, phone: phone ?? null, passwordHash },
        })
      : await prisma.customer.create({
          data: { name, email: emailNorm, phone: phone ?? null, passwordHash },
        });

    const token = jwt.sign(
      { customerId: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('sh_client_token', token, COOKIE_OPTS());

    // Email de bienvenida (asíncrono)
    sendWelcomeEmail({ to: customer.email, customerName: customer.name })
      .catch(err => console.error('[EMAIL] Error bienvenida:', err.message));

    res.status(201).json({ ok: true, name: customer.name, email: customer.email });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!customer?.passwordHash) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { customerId: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('sh_client_token', token, COOKIE_OPTS());
    res.json({ ok: true, name: customer.name, email: customer.email });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('sh_client_token');
  res.json({ ok: true });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireClient, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where:  { id: req.customer.customerId },
      select: { name: true, email: true, phone: true },
    });
    if (!customer) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'El email es requerido' });

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Responder siempre ok (no revelar si el email existe)
    if (!customer?.passwordHash) {
      return res.json({ ok: true });
    }

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.customer.update({
      where: { id: customer.id },
      data:  { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl || baseUrl.includes('localhost')) {
      console.warn(
        '[AUTH] forgot-password: BASE_URL es "' + baseUrl + '". ' +
        'En producción debe apuntar al dominio real (ej: https://studiohair.vercel.app). ' +
        'El link del email será incorrecto.'
      );
    }

    const resetUrl = `${baseUrl}/login.html?reset=${token}`;
    console.log('[AUTH] forgot-password: enviando reset a', customer.email, '| expiry:', expiry.toISOString());

    sendPasswordResetEmail({ to: customer.email, customerName: customer.name, resetUrl })
      .catch(err => console.error('[EMAIL] Error al enviar reset password a', customer.email, ':', err.message));

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const customer = await prisma.customer.findUnique({
      where: { passwordResetToken: token },
    });

    if (!customer) {
      return res.status(400).json({ error: 'Token inválido o ya utilizado' });
    }

    if (customer.passwordResetExpiry < new Date()) {
      return res.status(400).json({ error: 'El link de recuperación expiró. Solicitá uno nuevo.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.customer.update({
      where: { id: customer.id },
      data:  { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
