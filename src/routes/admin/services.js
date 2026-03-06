import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma.js';

const router = Router();

const ServiceSchema = z.object({
  slug:        z.string().min(2).max(100),
  name:        z.string().min(2).max(100),
  category:    z.string().min(2).max(50),
  description: z.string().max(500).optional().nullable(),
  durationMin: z.number().int().positive(),
  bufferMin:   z.number().int().min(0).optional(),
  price:       z.number().positive(),
  popular:     z.boolean().optional(),
  active:      z.boolean().optional(),
  imageUrl:    z.string().url().optional().nullable(),
});

// GET /api/admin/services
router.get('/', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      include: { _count: { select: { appointments: true } } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/services
router.post('/', async (req, res, next) => {
  try {
    const parsed = ServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    // Verificar slug único
    const existing = await prisma.service.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return res.status(409).json({ error: 'Ya existe un servicio con ese slug' });

    const service = await prisma.service.create({ data: parsed.data });
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/services/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const service = await prisma.service.update({
      where: { id: Number(req.params.id) },
      data:  req.body,
    });
    res.json(service);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Servicio no encontrado' });
    next(err);
  }
});

// DELETE /api/admin/services/:id — soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.service.update({
      where: { id: Number(req.params.id) },
      data:  { active: false },
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Servicio no encontrado' });
    next(err);
  }
});

export default router;
