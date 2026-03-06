import { prisma } from '../prisma.js';

/**
 * Convierte "HH:MM" a minutos desde medianoche.
 */
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convierte minutos desde medianoche a "HH:MM".
 */
function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * Genera slots disponibles para:
 * @param {number} branchId
 * @param {number|null} professionalId  — null = "cualquier profesional"
 * @param {string} date                  — "YYYY-MM-DD"
 * @param {number} totalMinutes          — duración total del turno
 * @param {number} slotInterval          — cada cuántos minutos aparece un slot (default 30)
 * @returns {Array<{start:string, end:string}>}
 */
export async function getAvailableSlots({
  branchId,
  professionalId,
  date,
  totalMinutes,
  slotInterval = 30,
}) {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = String(dateObj.getDay()); // "0"=dom ... "6"=sab

  // ── 1. Determinar ventana de trabajo ────────────────────────────────────
  let workStart = '09:00';
  let workEnd   = '20:00';

  if (professionalId) {
    const prof = await prisma.professional.findFirst({
      where: { id: professionalId, active: true },
    });
    if (!prof) return [];

    const avail = prof.availability?.[dayOfWeek];
    if (!avail) return []; // día libre para este profesional

    workStart = avail[0].from;
    workEnd   = avail[0].to;
  } else {
    // Sin profesional específico: usar horario de la sucursal
    const branch = await prisma.branch.findFirst({ where: { id: branchId, active: true } });
    if (!branch) return [];
    const branchHours = branch.hours?.[dayOfWeek];
    if (!branchHours) return []; // sucursal cerrada ese día
  }

  // ── 2. Obtener turnos existentes ese día (confirmados o pendientes) ──────
  const existing = await prisma.appointment.findMany({
    where: {
      branchId,
      date:   dateObj,
      status: { in: ['PENDIENTE', 'CONFIRMADO'] },
      // Si hay profesional específico, filtrar solo sus turnos
      ...(professionalId ? { professionalId } : {}),
    },
    select: { startTime: true, endTime: true },
  });

  // ── 3. Generar todos los slots posibles dentro de la ventana ─────────────
  const slots = [];
  const endMinutes = timeToMinutes(workEnd);
  let current = timeToMinutes(workStart);

  while (current + totalMinutes <= endMinutes) {
    const slotEnd = current + totalMinutes;
    const startStr = minutesToTime(current);
    const endStr   = minutesToTime(slotEnd);

    const hasConflict = existing.some(apt => {
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd   = timeToMinutes(apt.endTime);
      // Overlap: [current, slotEnd) intersecta con [aptStart, aptEnd)
      return current < aptEnd && slotEnd > aptStart;
    });

    if (!hasConflict) {
      slots.push({ start: startStr, end: endStr });
    }

    current += slotInterval;
  }

  return slots;
}
