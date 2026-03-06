import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes         from './routes/auth.js';
import branchRoutes       from './routes/branches.js';
import serviceRoutes      from './routes/services.js';
import professionalRoutes from './routes/professionals.js';
import availabilityRoutes from './routes/availability.js';
import appointmentRoutes  from './routes/appointments.js';
import adminRoutes        from './routes/admin/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use(
  helmet({
    // Deshabilitar para no romper los scripts inline del HTML existente
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin:      process.env.BASE_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// General: 200 req / 15 min por IP
app.use(
  '/api',
  rateLimit({
    windowMs:          15 * 60 * 1000,
    max:               200,
    standardHeaders:   true,
    legacyHeaders:     false,
    message:           { error: 'Demasiadas solicitudes. Intentá en unos minutos.' },
  })
);

// Auth: máximo 10 intentos de login / 15 min por IP
app.use(
  '/api/admin/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      10,
    message:  { error: 'Demasiados intentos de login. Esperá 15 minutos.' },
  })
);

// Crear turno: máximo 20 reservas / hora por IP
app.use(
  '/api/appointments',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max:      20,
    message:  { error: 'Límite de reservas alcanzado. Intentá más tarde.' },
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/admin/auth',  authRoutes);
app.use('/api/branches',    branchRoutes);
app.use('/api/services',    serviceRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/availability',  availabilityRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/admin',         adminRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ─── Archivos estáticos del frontend (HTML/CSS/JS) ────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// Fallback: cualquier ruta no-API sirve index.html (SPA-style)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Error handler global ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
});

// ─── Start (solo en desarrollo local) ────────────────────────────────────────
// En Vercel el servidor es serverless; exportamos el app en vez de escuchar.
if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Studio Hair corriendo en http://localhost:${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    console.log(`   Admin:    http://localhost:${PORT}/admin/login.html`);
    console.log(`   API:      http://localhost:${PORT}/api/health`);
    console.log(`   DB:       ${process.env.DATABASE_URL ? '✓ configurada' : '✗ DATABASE_URL no encontrada'}\n`);
  });
}

export default app;
