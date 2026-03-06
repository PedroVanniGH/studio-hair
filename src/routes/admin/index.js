import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import appointmentsRouter  from './appointments.js';
import customersRouter     from './customers.js';
import professionalsRouter from './professionals.js';
import servicesRouter      from './services.js';

const router = Router();

// Todas las rutas /api/admin/* requieren autenticación
router.use(requireAdmin);
router.use('/appointments',  appointmentsRouter);
router.use('/customers',     customersRouter);
router.use('/professionals', professionalsRouter);
router.use('/services',      servicesRouter);

export default router;
