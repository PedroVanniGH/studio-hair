import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma.js';

const router = Router();

const ProfessionalSchema = z.object({
  name:         z.string().min(2).max(100),
  role:         z.string().min(2).max(100),
  bio:          z.string().max(500).optional().nullable(),
  photoUrl:     z.string().url().optional().nullable(),
  branchId:     z.number().int().positive(),
  active:       z.boolean().optional(),
  instagram:    z.string().max(100).optional().nullable(),
  rating:       z.number().min(1).max(5).optional(),
  availability: z.record(z.string(), z.union([
    z.null(),
    z.array(z.object({ from: z.string(), to: z.string() })),
  ])).optional(),
  serviceIds: z.array(z.number().int().positive()).optional(),
});

// GET /api/admin/professionals
router.get('/', async (req, res, next) => {
  try {
    const pros = await prisma.professional.findMany({
      include: {
        branch:   { select: { name: true } },
        services: { include: { service: { select: { id: true, name: true } } } },
        _count:   { select: { appointments: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(pros);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/professionals
router.post('/', async (req, res, next) => {
  try {
    const parsed = ProfessionalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const { serviceIds, ...data } = parsed.data;

    const defaultAvailability = {
      "0": null,
      "1": [{ from: "09:00", to: "20:00" }],
      "2": [{ from: "09:00", to: "20:00" }],
      "3": [{ from: "09:00", to: "20:00" }],
      "4": [{ from: "09:00", to: "20:00" }],
      "5": [{ from: "09:00", to: "20:00" }],
      "6": [{ from: "09:00", to: "14:00" }],
    };

    const prof = await prisma.professional.create({
      data: {
        ...data,
        availability: data.availability ?? defaultAvailability,
        ...(serviceIds?.length ? {
          services: { create: serviceIds.map(id => ({ serviceId: id })) },
        } : {}),
      },
      include: { branch: { select: { name: true } }, services: { include: { service: true } } },
    });
    res.status(201).json(prof);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/professionals/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { serviceIds, ...data } = req.body;

    const updateData = { ...data };

    // Si se mandan serviceIds, reemplazar servicios
    if (Array.isArray(serviceIds)) {
      updateData.services = {
        deleteMany: {},
        create: serviceIds.map(id => ({ serviceId: id })),
      };
    }

    const prof = await prisma.professional.update({
      where: { id: Number(req.params.id) },
      data:  updateData,
      include: { branch: { select: { name: true } }, services: { include: { service: true } } },
    });
    res.json(prof);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Profesional no encontrado' });
    next(err);
  }
});

// DELETE /api/admin/professionals/:id — soft delete (desactiva)
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.professional.update({
      where: { id: Number(req.params.id) },
      data:  { active: false },
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Profesional no encontrado' });
    next(err);
  }
});

export default router;
