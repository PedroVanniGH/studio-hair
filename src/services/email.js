import nodemailer from 'nodemailer';

let transporter = null;

function isSmtpConfigured() {
  return (
    process.env.SMTP_USER &&
    !process.env.SMTP_USER.startsWith('COMPLETAR_') &&
    process.env.SMTP_USER !== 'tu-email@gmail.com' &&
    process.env.SMTP_PASS &&
    !process.env.SMTP_PASS.startsWith('COMPLETAR_')
  );
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    const level = process.env.NODE_ENV === 'production' ? 'error' : 'warn';
    console[level](
      '[EMAIL] SMTP no configurado (SMTP_USER/SMTP_PASS ausentes). ' +
      'Los emails NO se enviarán. Revisá las variables de entorno.'
    );
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Verifica la conexión SMTP al arrancar el servidor.
 * Llama a esta función desde server.js para detectar errores de config temprano.
 */
export async function verifySmtpConnection() {
  if (!isSmtpConfigured()) {
    console.warn('[EMAIL] SMTP no configurado — envío de emails deshabilitado.');
    return false;
  }
  try {
    const t = getTransporter();
    await t.verify();
    console.log('[EMAIL] Conexión SMTP verificada OK (host:', process.env.SMTP_HOST || 'smtp.gmail.com', ')');
    return true;
  } catch (err) {
    console.error('[EMAIL] Fallo al verificar conexión SMTP:', err.message);
    return false;
  }
}

/**
 * Email de confirmación de turno al cliente.
 * Se llama de forma asíncrona (no bloquea la respuesta HTTP).
 */
export async function sendConfirmationEmail({ to, customerName, appointment, cancelToken }) {
  const t = getTransporter();
  if (!t) {
    console.error('[EMAIL] sendConfirmationEmail: email NO enviado a', to, '— SMTP sin configurar.');
    return;
  }

  const cancelUrl = `${process.env.BASE_URL}/api/appointments/cancel/${cancelToken}`;
  const myApptsUrl = `${process.env.BASE_URL}/mis-turnos.html?email=${encodeURIComponent(to)}`;

  const dateObj = new Date(appointment.date);
  const dateStr = dateObj.toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  const services = (appointment.services || [])
    .map(s => s.service?.name || s.name || '')
    .filter(Boolean)
    .join(', ');

  const branchName    = appointment.branch?.name || '';
  const profName      = appointment.professional?.name || 'A confirmar';
  const totalPrice    = Number(appointment.totalPrice).toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  });

  await t.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: `Turno recibido — Studio Hair`,
    html: `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <div style="background:#1a1a2e;padding:20px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#c9a84c;margin:0;font-size:24px">✂ Studio Hair</h1>
  </div>
  <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
    <h2 style="color:#1a1a2e;margin-top:0">¡Hola ${customerName}! Tu turno fue registrado.</h2>
    <p style="color:#666">Tu solicitud fue recibida. Te confirmaremos el turno a la brevedad.</p>

    <div style="background:#fff;border:1px solid #eee;border-radius:6px;padding:16px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#666;width:40%">Fecha</td><td style="padding:6px 0;font-weight:bold">${dateStr}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Hora</td><td style="padding:6px 0;font-weight:bold">${appointment.startTime} hs</td></tr>
        <tr><td style="padding:6px 0;color:#666">Servicios</td><td style="padding:6px 0">${services}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Sucursal</td><td style="padding:6px 0">${branchName}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Profesional</td><td style="padding:6px 0">${profName}</td></tr>
        <tr><td style="padding:6px 0;color:#666">Total estimado</td><td style="padding:6px 0;font-weight:bold">${totalPrice}</td></tr>
        <tr>
          <td style="padding:6px 0;color:#666">Estado</td>
          <td style="padding:6px 0">
            <span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:4px;font-size:13px">PENDIENTE</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin:24px 0">
      <a href="${myApptsUrl}" style="background:#1a1a2e;color:#c9a84c;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:4px">
        Ver mis turnos
      </a>
      <a href="${cancelUrl}" style="background:#fff;color:#dc3545;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;border:1px solid #dc3545;margin:4px">
        Cancelar turno
      </a>
    </div>

    <p style="font-size:12px;color:#999;text-align:center">
      Podés cancelar hasta 2 horas antes del turno.<br>
      Si tenés dudas, escribinos a <a href="mailto:hola@studiohair.com.ar">hola@studiohair.com.ar</a>
    </p>
  </div>
</body>
</html>`,
  });

  console.log('[EMAIL] Confirmación enviada a:', to);
}

// ─── Email de bienvenida al registrarse ───────────────────────────────────────
export async function sendWelcomeEmail({ to, customerName }) {
  const t = getTransporter();
  if (!t) { console.error('[EMAIL] sendWelcomeEmail: email NO enviado a', to, '— SMTP sin configurar.'); return; }

  await t.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: '¡Bienvenido/a a Studio Hair!',
    html: `
<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <div style="background:#1a1a2e;padding:20px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#c9a84c;margin:0;font-size:24px">✂ Studio Hair</h1>
  </div>
  <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
    <h2 style="color:#1a1a2e;margin-top:0">¡Hola ${customerName}! Tu cuenta fue creada.</h2>
    <p style="color:#666">Ya podés iniciar sesión para ver y gestionar tus turnos en cualquier momento.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.BASE_URL}/login.html" style="background:#c9a84c;color:#1a1a2e;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
        Ir a mis turnos
      </a>
    </div>
    <p style="font-size:12px;color:#999;text-align:center">¿Tenés dudas? Escribinos a <a href="mailto:hola@studiohair.com.ar">hola@studiohair.com.ar</a></p>
  </div>
</body></html>`,
  });
  console.log('[EMAIL] Bienvenida enviada a:', to);
}

// ─── Email de recuperación de contraseña ─────────────────────────────────────
export async function sendPasswordResetEmail({ to, customerName, resetUrl }) {
  const t = getTransporter();
  if (!t) { console.error('[EMAIL] sendPasswordResetEmail: email NO enviado a', to, '— SMTP sin configurar.'); return; }

  await t.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: 'Recuperá tu contraseña — Studio Hair',
    html: `
<!DOCTYPE html><html lang="es"><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <div style="background:#1a1a2e;padding:20px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#c9a84c;margin:0;font-size:24px">✂ Studio Hair</h1>
  </div>
  <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
    <h2 style="color:#1a1a2e;margin-top:0">Hola ${customerName}, recuperá tu contraseña.</h2>
    <p style="color:#666">Hacé click en el botón para crear una nueva contraseña. El link es válido por 1 hora.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${resetUrl}" style="background:#1a1a2e;color:#c9a84c;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
        Crear nueva contraseña
      </a>
    </div>
    <p style="font-size:12px;color:#999;text-align:center">Si no solicitaste este cambio, podés ignorar este email.</p>
  </div>
</body></html>`,
  });
  console.log('[EMAIL] Reset de contraseña enviado a:', to);
}
