import { Router } from 'express';
import { prisma } from '../../prisma.js';

const router = Router();
const VALID_STATUSES = ['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW'];

// GET /api/admin/appointments
router.get('/', async (req, res, next) => {
  try {
    const { status, branchId, date, search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (branchId) where.branchId = Number(branchId);
    if (date) where.date = new Date(date + 'T00:00:00');

    if (search) {
      where.customer = {
        OR: [
          { name:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer:     { select: { name: true, email: true, phone: true } },
          professional: { select: { name: true, role: true } },
          branch:       { select: { name: true } },
          services:     { include: { service: { select: { name: true, price: true } } } },
        },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        skip:  (Number(page) - 1) * Number(limit),
        take:  Number(limit),
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({ appointments, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/appointments/stats — KPIs para dashboard
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const [todayCount, weekCount, pendingCount, totalCustomers, revenueThisWeek] =
      await Promise.all([
        prisma.appointment.count({ where: { date: { gte: today, lte: todayEnd } } }),
        prisma.appointment.count({ where: { date: { gte: weekStart }, status: { not: 'CANCELADO' } } }),
        prisma.appointment.count({ where: { status: 'PENDIENTE' } }),
        prisma.customer.count(),
        prisma.appointment.aggregate({
          _sum: { totalPrice: true },
          where: { date: { gte: weekStart }, status: { in: ['CONFIRMADO', 'COMPLETADO'] } },
        }),
      ]);

    res.json({
      todayCount,
      weekCount,
      pendingCount,
      totalCustomers,
      weekRevenue: revenueThisWeek._sum.totalPrice ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/appointments/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Válidos: ${VALID_STATUSES.join(', ')}` });
    }

    const apt = await prisma.appointment.update({
      where: { id: req.params.id },
      data:  { status },
      include: { customer: { select: { name: true, email: true } } },
    });

    res.json(apt);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Turno no encontrado' });
    next(err);
  }
});

// DELETE /api/admin/appointments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Turno no encontrado' });
    next(err);
  }
});

export default router;
