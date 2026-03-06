import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { getAvailableSlots } from '../services/availability.js';
import { sendConfirmationEmail } from '../services/email.js';
import { requireClient } from '../middleware/clientAuth.js';

const router = Router();

// ─── Schema de validación ─────────────────────────────────────────────────────
const CreateSchema = z.object({
  branchId:       z.number({ required_error: 'branchId es requerido' }).int().positive(),
  professionalId: z.number().int().positive().nullable().optional(),
  serviceIds:     z.array(z.number().int().positive()).min(1, 'Seleccioná al menos un servicio'),
  date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  startTime:      z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  customer: z.object({
    name:  z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Email inválido'),
    phone: z.string().min(6, 'Teléfono inválido').max(20).optional(),
  }),
  notes: z.string().max(500).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// ─── POST /api/appointments — Crear turno ─────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { branchId, professionalId, serviceIds, date, startTime, customer, notes } = parsed.data;

    // 1. Validar que la fecha no sea pasada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(date + 'T00:00:00');
    if (aptDate < today) {
      return res.status(400).json({ error: 'No se pueden reservar turnos en fechas pasadas' });
    }

    // 2. Obtener servicios y calcular duración + precio
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, active: true },
    });
    if (services.length !== serviceIds.length) {
      return res.status(400).json({ error: 'Uno o más servicios seleccionados no son válidos' });
    }

    const totalMinutes = services.reduce((sum, s) => sum + s.durationMin + s.bufferMin, 0);
    const totalPrice   = services.reduce((sum, s) => sum + Number(s.price), 0);
    const endMinutes   = timeToMinutes(startTime) + totalMinutes;
    const endTime      = minutesToTime(endMinutes);

    // 3. Doble validación de disponibilidad (backend siempre valida)
    const slots = await getAvailableSlots({
      branchId,
      professionalId: professionalId ?? null,
      date,
      totalMinutes,
    });

    const isAvailable = slots.some(s => s.start === startTime);
    if (!isAvailable) {
      return res.status(409).json({
        error: 'El horario seleccionado ya no está disponible. Por favor elegí otro horario.',
      });
    }

    // 4. Upsert cliente (no duplicar por email)
    const dbCustomer = await prisma.customer.upsert({
      where:  { email: customer.email.toLowerCase().trim() },
      update: { name: customer.name, phone: customer.phone ?? null },
      create: {
        name:  customer.name,
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone ?? null,
      },
    });

    // 5. Crear el turno (el UNIQUE constraint evita double booking por race condition)
    const cancelToken = crypto.randomBytes(32).toString('hex');

    const appointment = await prisma.appointment.create({
      data: {
        branchId,
        professionalId:   professionalId ?? null,
        customerId:       dbCustomer.id,
        date:             aptDate,
        startTime,
        endTime,
        totalDurationMin: totalMinutes,
        totalPrice,
        status:           'PENDIENTE',
        notes:            notes?.trim() || null,
        cancelToken,
        services: {
          create: serviceIds.map(id => ({ serviceId: id })),
        },
      },
      include: {
        branch:       { select: { name: true } },
        professional: { select: { name: true } },
        services:     { include: { service: { select: { name: true, price: true } } } },
      },
    });

    // 6. Enviar email de confirmación (asíncrono, no bloquea la respuesta)
    sendConfirmationEmail({
      to:           dbCustomer.email,
      customerName: dbCustomer.name,
      appointment,
      cancelToken,
    }).catch(err => console.error('[EMAIL] Error al enviar confirmación:', err.message));

    res.status(201).json({
      id:          appointment.id,
      status:      appointment.status,
      date,
      startTime:   appointment.startTime,
      endTime:     appointment.endTime,
      totalPrice:  appointment.totalPrice,
      totalMin:    appointment.totalDurationMin,
      branch:      appointment.branch,
      professional: appointment.professional,
      services:    appointment.services.map(s => ({ name: s.service.name, price: s.service.price })),
      cancelToken,
    });
  } catch (err) {
    // P2002 = Unique constraint violation → race condition (dos personas eligieron el mismo slot)
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'El horario fue tomado por otro cliente en este instante. Por favor elegí otro.',
      });
    }
    next(err);
  }
});

// ─── GET /api/appointments/my?email=... — Mis turnos ─────────────────────────
router.get('/my', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Se requiere el parámetro email' });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        appointments: {
          include: {
            branch:       { select: { name: true, address: true } },
            professional: { select: { name: true, role: true } },
            services:     { include: { service: { select: { name: true, price: true } } } },
          },
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        },
      },
    });

    if (!customer) {
      return res.json({ customer: null, appointments: [] });
    }

    res.json({
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
      appointments: customer.appointments.map(apt => ({
        id:          apt.id,
        date:        apt.date,
        startTime:   apt.startTime,
        endTime:     apt.endTime,
        status:      apt.status,
        totalPrice:  apt.totalPrice,
        totalMin:    apt.totalDurationMin,
        branch:      apt.branch,
        professional: apt.professional,
        services:    apt.services.map(s => s.service),
        cancelToken: apt.cancelToken,
        createdAt:   apt.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/appointments/mine — Mis turnos (sesión activa) ─────────────────
router.get('/mine', requireClient, async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customer.customerId },
      include: {
        appointments: {
          include: {
            branch:       { select: { name: true, address: true } },
            professional: { select: { name: true, role: true } },
            services:     { include: { service: { select: { name: true, price: true } } } },
          },
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        },
      },
    });

    if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.json({
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
      appointments: customer.appointments.map(apt => ({
        id:           apt.id,
        date:         apt.date,
        startTime:    apt.startTime,
        endTime:      apt.endTime,
        status:       apt.status,
        totalPrice:   apt.totalPrice,
        totalMin:     apt.totalDurationMin,
        branch:       apt.branch,
        professional: apt.professional,
        services:     apt.services.map(s => s.service),
        cancelToken:  apt.cancelToken,
        createdAt:    apt.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/appointments/cancel/:token — Cancelar turno (desde email) ───────
router.get('/cancel/:token', async (req, res, next) => {
  try {
    const apt = await prisma.appointment.findUnique({
      where:   { cancelToken: req.params.token },
      include: { customer: true },
    });

    if (!apt) {
      return res.status(404).json({ error: 'Token de cancelación no válido' });
    }

    if (['CANCELADO', 'COMPLETADO', 'NO_SHOW'].includes(apt.status)) {
      return res.status(400).json({
        error: 'Este turno ya fue ' + apt.status.toLowerCase(),
      });
    }

    // Verificar que falten al menos 2 horas
    const aptDatetime = new Date(
      `${apt.date.toISOString().split('T')[0]}T${apt.startTime}:00`
    );
    const diffHours = (aptDatetime - new Date()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      return res.status(400).json({
        error: 'No se puede cancelar con menos de 2 horas de anticipación. Por favor contactá al salón directamente.',
      });
    }

    await prisma.appointment.update({
      where: { id: apt.id },
      data:  { status: 'CANCELADO' },
    });

    // Redirigir a página de confirmación de cancelación
    res.redirect(`/mis-turnos.html?cancelled=1&email=${encodeURIComponent(apt.customer.email)}`);
  } catch (err) {
    next(err);
  }
});

export default router;
