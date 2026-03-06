import { Router } from 'express';
import { prisma } from '../prisma.js';
import { getAvailableSlots } from '../services/availability.js';

const router = Router();

/**
 * GET /api/availability
 * Query params:
 *   - branchId (required)
 *   - date (required) "YYYY-MM-DD"
 *   - serviceIds (required) "1,3,5"
 *   - professionalId (optional) — si no se manda, busca para "cualquier profesional"
 */
router.get('/', async (req, res, next) => {
  try {
    const { branchId, date, serviceIds, professionalId } = req.query;

    // Validaciones básicas
    if (!branchId || !date || !serviceIds) {
      return res.status(400).json({
        error: 'Se requieren branchId, date y serviceIds como query params',
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Usá YYYY-MM-DD' });
    }

    // No permitir fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date + 'T00:00:00') < today) {
      return res.status(400).json({ error: 'No se pueden consultar fechas pasadas' });
    }

    // Calcular duración total sumando los servicios pedidos
    const ids = String(serviceIds).split(',').map(Number).filter(Boolean);
    const services = await prisma.service.findMany({
      where: { id: { in: ids }, active: true },
      select: { durationMin: true, bufferMin: true },
    });

    if (!services.length) {
      return res.status(400).json({ error: 'Servicios no válidos' });
    }

    const totalMinutes = services.reduce((s, r) => s + r.durationMin + r.bufferMin, 0);

    const slots = await getAvailableSlots({
      branchId:       Number(branchId),
      professionalId: professionalId ? Number(professionalId) : null,
      date,
      totalMinutes,
    });

    res.json({ slots, totalMinutes, date });
  } catch (err) {
    next(err);
  }
});

export default router;
