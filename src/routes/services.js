import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/services?category=corte
router.get('/', async (req, res, next) => {
  try {
    const where = { active: true };
    if (req.query.category) where.category = req.query.category;

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res, next) => {
  try {
    const service = await prisma.service.findFirst({
      where: { id: Number(req.params.id), active: true },
    });
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) {
    next(err);
  }
});

export default router;
