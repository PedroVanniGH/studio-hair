import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/professionals?branchId=1&serviceId=3
router.get('/', async (req, res, next) => {
  try {
    const where = { active: true };
    if (req.query.branchId) where.branchId = Number(req.query.branchId);

    // Filtrar por servicio si se especifica
    if (req.query.serviceId) {
      where.services = {
        some: { serviceId: Number(req.query.serviceId) },
      };
    }

    // Filtrar por múltiples serviceIds
    if (req.query.serviceIds) {
      const ids = req.query.serviceIds.split(',').map(Number).filter(Boolean);
      if (ids.length) {
        where.services = {
          some: { serviceId: { in: ids } },
        };
      }
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        branch:   { select: { name: true } },
        services: { include: { service: { select: { id: true, name: true, category: true } } } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(professionals);
  } catch (err) {
    next(err);
  }
});

// GET /api/professionals/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prof = await prisma.professional.findFirst({
      where: { id: Number(req.params.id), active: true },
      include: {
        branch:   { select: { name: true } },
        services: { include: { service: { select: { id: true, name: true, category: true } } } },
      },
    });
    if (!prof) return res.status(404).json({ error: 'Profesional no encontrado' });
    res.json(prof);
  } catch (err) {
    next(err);
  }
});

export default router;
