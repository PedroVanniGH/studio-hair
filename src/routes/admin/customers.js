import { Router } from 'express';
import { prisma } from '../../prisma.js';

const router = Router();

// GET /api/admin/customers
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { appointments: true } },
          appointments: {
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      customers: customers.map(c => ({
        ...c,
        appointmentCount: c._count.appointments,
        lastVisit: c.appointments[0]?.createdAt ?? null,
        appointments: undefined,
        _count: undefined,
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/customers/:id — con historial completo
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        appointments: {
          include: {
            branch:       { select: { name: true } },
            professional: { select: { name: true } },
            services:     { include: { service: { select: { name: true, price: true } } } },
          },
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        },
      },
    });

    if (!customer) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

export default router;
