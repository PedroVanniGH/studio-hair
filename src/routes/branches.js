import { Router } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/branches
router.get('/', async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { active: true },
      orderBy: { id: 'asc' },
    });
    res.json(branches);
  } catch (err) {
    next(err);
  }
});

// GET /api/branches/:id
router.get('/:id', async (req, res, next) => {
  try {
    const branch = await prisma.branch.findFirst({
      where: { id: Number(req.params.id), active: true },
    });
    if (!branch) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(branch);
  } catch (err) {
    next(err);
  }
});

export default router;
