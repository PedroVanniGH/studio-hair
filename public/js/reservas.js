// ============================================================
// STUDIO HAIR — Wizard de Reservas (reservar.html)
// v2 — usa la API real del backend en vez de localStorage
// ============================================================

const Wizard = (() => {
  let state = {
    step: 1,
    branch: null,        // objeto branch de la API { id, name, address, ... }
    services: [],        // array de objetos service de SH.services (para display)
    serviceIds: [],      // array de ID numéricos (para la API)
    staff: null,         // objeto professional de la API (null = cualquiera)
    date: null,          // "YYYY-MM-DD"
    time: null,          // "HH:MM"
    customer: { name: "", email: "", phone: "", notes: "" },
    totalDuration: 0,
    totalPrice: 0,
    _branches: [],
    _professionals: [],
  };

  // Mapeo: id de SH.services (ej "s1") → id numérico en la BD
  let serviceSlugToId = {};

  const TOTAL_STEPS = 5;

  // ── Render Steps Indicator ───────────────────────────────
  function renderSteps() {
    const labels = ["Sucursal", "Servicios", "Profesional", "Fecha y hora", "Tus datos"];
    const container = document.getElementById("wizard-steps");
    if (!container) return;
    container.innerHTML = labels.map((lbl, i) => {
      const n = i + 1;
      let cls = "";
      if (n < state.step) cls = "done";
      else if (n === state.step) cls = "active";
      return `
      <div class="wizard-step ${cls}" aria-label="Paso ${n}: ${lbl}">
        <div class="step-num ${n < state.step ? 'check' : ''}">${n < state.step ? '✓' : n}</div>
        <span>${lbl}</span>
      </div>`;
    }).join("");
  }

  function showPanel(n) {
    document.querySelectorAll(".wizard-panel").forEach((p, i) => {
      p.classList.toggle("active", i + 1 === n);
    });
    renderSteps();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setLoading(containerId, msg) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<p style="color:var(--c-muted);font-size:.9rem">${msg || 'Cargando...'}</p>`;
  }

  function setError(containerId, msg) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${msg}</p></div>`;
  }

  // ── Calcular totales ─────────────────────────────────────
  function recalculate() {
    state.totalDuration = state.services.reduce((acc, s) =>
      acc + (s.durationMin || s.duration || 0) + (s.bufferMin || s.buffer || 0), 0);
    state.totalPrice = state.services.reduce((acc, s) => acc + Number(s.price || 0), 0);
  }

  function getApiServiceIds() {
    return state.services
      .map(s => serviceSlugToId[s.id])
      .filter(id => typeof id === 'number' && id > 0);
  }

  // ── PASO 1: Sucursal ─────────────────────────────────────
  async function renderStep1() {
    const container = document.getElementById("branch-choices");
    if (!container) return;

    if (!state._branches.length) {
      setLoading("branch-choices", "Cargando sucursales...");
      try {
        state._branches = await Api.branches();
      } catch (err) {
        setError("branch-choices", "No se pudieron cargar las sucursales. Recargá la página.");
        return;
      }
    }

    container.innerHTML = state._branches
      .filter(b => b.active)
      .map(b => `
        <button class="choice-btn ${state.branch?.id === b.id ? 'selected' : ''}"
          onclick="Wizard.selectBranch(${b.id})" aria-pressed="${state.branch?.id === b.id}">
          <span class="choice-name">${b.name}</span>
          <span class="choice-sub">${b.address}</span>
        </button>`)
      .join("");
  }

  function selectBranch(id) {
    state.branch = state._branches.find(b => b.id === id) || null;
    state.staff = null;
    state._professionals = [];
    renderStep1();
  }

  // ── PASO 2: Servicios (usa SH.services del data.js para display) ──────────
  function renderStep2() {
    const container = document.getElementById("service-choices");
    if (!container) return;

    let html = "";
    SH.categories.forEach(cat => {
      const catServices = SH.services.filter(s => s.category === cat.id && s.active);
      if (!catServices.length) return;
      html += `<div class="service-cat-group">
        <h4 style="font-family:var(--font-head);font-size:.85rem;font-weight:700;
          text-transform:uppercase;letter-spacing:.07em;color:var(--c-muted);margin-bottom:10px">
          ${cat.icon} ${cat.label}</h4>
        <div class="choice-grid">
          ${catServices.map(s => {
            const isSel = state.services.some(sel => sel.id === s.id);
            return `
            <button class="choice-btn ${isSel ? 'selected' : ''}"
              onclick="Wizard.toggleService('${s.id}')" aria-pressed="${isSel}">
              <span class="choice-name">${s.name}</span>
              <span class="choice-sub">${Utils.formatPrice(s.price)} · ${s.duration} min</span>
            </button>`;
          }).join("")}
        </div>
      </div>`;
    });
    container.innerHTML = html;
    updateServiceSummary();
  }

  function toggleService(shId) {
    const svc = SH.services.find(s => s.id === shId);
    if (!svc) return;
    const idx = state.services.findIndex(s => s.id === shId);
    if (idx === -1) state.services.push({ ...svc });
    else state.services.splice(idx, 1);
    recalculate();
    renderStep2();
  }

  function updateServiceSummary() {
    const el = document.getElementById("service-summary");
    if (!el) return;
    if (!state.services.length) {
      el.innerHTML = '<p style="color:var(--c-muted);font-size:.9rem">Elegí al menos un servicio.</p>';
      return;
    }
    recalculate();
    const names = state.services.map(s => s.name).join(", ");
    el.innerHTML = `
      <p style="font-size:.9rem"><strong>Seleccionado:</strong> ${names}</p>
      <p style="font-size:.9rem;margin-top:4px"><strong>Total estimado:</strong> ${Utils.formatPrice(state.totalPrice)} · ${state.totalDuration} min</p>`;
  }

  // ── PASO 3: Profesional (desde la API) ──────────────────
  async function renderStep3() {
    const container = document.getElementById("staff-choices");
    if (!container) return;

    if (!state._professionals.length) {
      setLoading("staff-choices", "Cargando profesionales disponibles...");
      try {
        const apiIds = getApiServiceIds();
        state._professionals = await Api.professionals(state.branch?.id, apiIds);
      } catch (err) {
        setError("staff-choices", "No se pudieron cargar los profesionales.");
        return;
      }
    }

    let html = `
      <button class="choice-btn ${state.staff === null ? 'selected' : ''}"
        onclick="Wizard.selectStaff(null)" aria-pressed="${state.staff === null}">
        <span class="choice-name">Cualquier profesional</span>
        <span class="choice-sub">El primero disponible</span>
      </button>`;

    html += state._professionals.map(p => `
      <button class="choice-btn ${state.staff?.id === p.id ? 'selected' : ''}"
        onclick="Wizard.selectStaff(${p.id})" aria-pressed="${state.staff?.id === p.id}">
        ${p.photoUrl ? `<img src="${p.photoUrl}" alt="${p.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;margin-right:8px">` : ''}
        <span>
          <span class="choice-name">${p.name}</span>
          <span class="choice-sub">${p.role} · ★ ${p.rating}</span>
        </span>
      </button>`).join("");

    container.innerHTML = `<div class="choice-grid">${html}</div>`;
  }

  function selectStaff(id) {
    state.staff = id === null ? null : (state._professionals.find(p => p.id === id) || null);
    renderStep3();
  }

  // ── PASO 4: Fecha y hora ─────────────────────────────────
  let calendarMonth, calendarYear;

  function renderStep4() {
    const now = new Date();
    if (calendarMonth === undefined) { calendarMonth = now.getMonth(); calendarYear = now.getFullYear(); }
    renderCalendar();
    renderTimeSlots();
  }

  function renderCalendar() {
    const container = document.getElementById("calendar-container");
    if (!container) return;
    const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const dows = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    let days = '';
    for (let i = 0; i < firstDay; i++) days += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(calendarYear, calendarMonth, d);
      dt.setHours(0,0,0,0);
      const isoDate = `${calendarYear}-${String(calendarMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isPast     = dt < today;
      const isDom      = dt.getDay() === 0;
      const isSelected = state.date === isoDate;
      const isToday    = dt.getTime() === today.getTime();
      const disabled   = isPast || isDom;
      days += `<button class="cal-day ${disabled?'disabled':''} ${isSelected?'selected':''} ${isToday&&!isSelected?'today':''}"
        ${disabled ? 'disabled' : `onclick="Wizard.selectDate('${isoDate}')"`}
        aria-label="${d} de ${months[calendarMonth]}" aria-pressed="${isSelected}">${d}</button>`;
    }

    container.innerHTML = `
      <div class="calendar-header">
        <button class="cal-nav" onclick="Wizard.changeMonth(-1)" aria-label="Mes anterior">←</button>
        <h4>${months[calendarMonth]} ${calendarYear}</h4>
        <button class="cal-nav" onclick="Wizard.changeMonth(1)" aria-label="Mes siguiente">→</button>
      </div>
      <div class="calendar-grid">
        ${dows.map(d => `<div class="cal-dow">${d}</div>`).join("")}
        ${days}
      </div>`;
  }

  function changeMonth(dir) {
    calendarMonth += dir;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    if (calendarMonth < 0)  { calendarMonth = 11; calendarYear--; }
    renderCalendar();
  }

  function selectDate(isoDate) {
    state.date = isoDate;
    state.time = null;
    renderCalendar();
    renderTimeSlots();
  }

  async function renderTimeSlots() {
    const container = document.getElementById("time-slots");
    if (!container) return;

    if (!state.date) {
      container.innerHTML = `<p style="color:var(--c-muted);font-size:.9rem">Primero elegí una fecha.</p>`;
      return;
    }

    const apiIds = getApiServiceIds();
    if (!apiIds.length) {
      container.innerHTML = `<p style="color:var(--c-muted);font-size:.9rem">No se pudo calcular la disponibilidad. Recargá.</p>`;
      return;
    }

    setLoading("time-slots", "Consultando disponibilidad...");

    try {
      const result = await Api.availability({
        branchId:       state.branch.id,
        date:           state.date,
        serviceIds:     apiIds,
        professionalId: state.staff?.id ?? null,
      });

      if (!result.slots?.length) {
        container.innerHTML = `
          <div class="empty-state" style="padding:24px 0">
            <div class="empty-icon">📅</div>
            <p>No hay turnos disponibles para este día. Probá con otra fecha.</p>
          </div>`;
        return;
      }

      container.innerHTML = `<div class="time-grid">
        ${result.slots.map(slot => `
          <button class="time-btn ${state.time === slot.start ? 'selected' : ''}"
            onclick="Wizard.selectTime('${slot.start}')" aria-pressed="${state.time === slot.start}">
            ${slot.start}
          </button>`).join("")}
      </div>`;
    } catch (err) {
      setError("time-slots", err?.error || "No se pudo consultar la disponibilidad.");
    }
  }

  function selectTime(t) {
    state.time = t;
    renderTimeSlots();
  }

  // ── PASO 5: Resumen ──────────────────────────────────────
  function renderStep5() {
    document.getElementById("summary-branch").textContent   = state.branch?.name || "-";
    document.getElementById("summary-services").textContent = state.services.map(s => s.name).join(", ");
    document.getElementById("summary-staff").textContent    = state.staff ? state.staff.name : "Cualquier profesional";
    document.getElementById("summary-date").textContent     = Utils.formatDate(state.date);
    document.getElementById("summary-time").textContent     = state.time;
    document.getElementById("summary-duration").textContent = `${state.totalDuration} min`;
    document.getElementById("summary-price").textContent    = Utils.formatPrice(state.totalPrice);
  }

  // ── Validaciones por paso ────────────────────────────────
  function validateStep(n) {
    if (n === 1 && !state.branch) {
      Components.toast("Por favor elegí una sucursal.", "error"); return false;
    }
    if (n === 2 && !state.services.length) {
      Components.toast("Elegí al menos un servicio.", "error"); return false;
    }
    if (n === 4) {
      if (!state.date) { Components.toast("Seleccioná una fecha.", "error"); return false; }
      if (!state.time) { Components.toast("Seleccioná un horario.", "error"); return false; }
    }
    return true;
  }

  // ── Confirmar reserva (POST a la API) ────────────────────
  async function confirmBooking() {
    const name  = document.getElementById("cust-name").value.trim();
    const email = document.getElementById("cust-email").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const notes = document.getElementById("cust-notes").value.trim();

    let valid = true;
    if (!name)  { markError("cust-name");  valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { markError("cust-email"); valid = false; }
    if (!phone || phone.length < 8) { markError("cust-phone"); valid = false; }
    if (!valid) { Components.toast("Completá todos los campos requeridos correctamente.", "error"); return; }

    clearErrors();
    state.customer = { name, email, phone, notes };

    const btn = document.getElementById("btn-confirm");
    btn.disabled = true;
    btn.innerHTML = `<span class="loading-spinner"></span> Confirmando...`;

    const apiIds = getApiServiceIds();
    if (!apiIds.length) {
      btn.disabled = false;
      btn.textContent = "Confirmar reserva";
      Components.toast("Error al identificar los servicios. Recargá la página.", "error");
      return;
    }

    try {
      const result = await Api.createAppointment({
        branchId:       state.branch.id,
        professionalId: state.staff?.id ?? null,
        serviceIds:     apiIds,
        date:           state.date,
        startTime:      state.time,
        customer: {
          name:  state.customer.name,
          email: state.customer.email,
          phone: state.customer.phone || undefined,
        },
        notes: state.customer.notes || undefined,
      });

      showPanel(6);
      renderSuccess(result);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Confirmar reserva";
      Components.toast(err?.error || "No se pudo confirmar el turno. Intentá nuevamente.", "error");
    }
  }

  function renderSuccess(apt) {
    const dateStr    = apt.date ? Utils.formatDate(apt.date.split('T')[0]) : Utils.formatDate(state.date);
    const svcList    = apt.services?.map(s => s.name).join(", ") || state.services.map(s => s.name).join(", ");
    const branchName = apt.branch?.name || state.branch?.name || "";
    const profName   = apt.professional?.name || (state.staff ? state.staff.name : "Primer profesional disponible");
    const custEmail  = state.customer.email;

    document.getElementById("success-content").innerHTML = `
      <div class="confirm-success">
        <div class="confirm-icon">✓</div>
        <h2>¡Turno solicitado!</h2>
        <p>Tu solicitud fue recibida. Recibirás un email de confirmación en <strong>${custEmail}</strong>.</p>
        <div class="booking-summary" style="text-align:left;margin-bottom:28px">
          <h4>Resumen de tu turno</h4>
          <div class="summary-row"><span class="summary-label">Sucursal</span><strong>${branchName}</strong></div>
          <div class="summary-row"><span class="summary-label">Servicios</span><strong>${svcList}</strong></div>
          <div class="summary-row"><span class="summary-label">Profesional</span><strong>${profName}</strong></div>
          <div class="summary-row"><span class="summary-label">Fecha</span><strong>${dateStr}</strong></div>
          <div class="summary-row"><span class="summary-label">Hora</span><strong>${apt.startTime} hs</strong></div>
          <div class="summary-row"><span class="summary-label">Duración aprox.</span><span>${apt.totalMin} min</span></div>
          <div class="summary-row"><span class="summary-label">Precio estimado</span><strong>${Utils.formatPrice(Number(apt.totalPrice))}</strong></div>
          <div class="summary-row">
            <span class="summary-label">Estado</span>
            <span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:4px;font-size:.85rem;font-weight:600">PENDIENTE</span>
          </div>
        </div>
        <p style="font-size:.9rem;color:var(--c-muted);margin-bottom:20px">
          Te avisaremos por email cuando el salón confirme tu turno.<br>
          Podés cancelar hasta 2 horas antes desde el link en el email.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="mis-turnos.html?email=${encodeURIComponent(custEmail)}" class="btn btn-gold">
            Ver mis turnos
          </a>
          <a href="index.html" class="btn btn-outline">Volver al inicio</a>
        </div>
        <p style="font-size:.82rem;color:var(--c-muted);margin-top:20px">
          Número de reserva: <strong>#${apt.id}</strong>
        </p>
      </div>`;
  }

  function markError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("error");
  }

  function clearErrors() {
    document.querySelectorAll(".form-control.error").forEach(el => el.classList.remove("error"));
  }

  // ── Navegación ───────────────────────────────────────────
  async function next() {
    if (!validateStep(state.step)) return;
    state.step++;
    if (state.step > TOTAL_STEPS) {
      state.step = TOTAL_STEPS;
      await confirmBooking();
      return;
    }
    showPanel(state.step);
    if (state.step === 2) renderStep2();
    if (state.step === 3) await renderStep3();
    if (state.step === 4) renderStep4();
    if (state.step === 5) renderStep5();
  }

  function prev() {
    if (state.step <= 1) return;
    state.step--;
    showPanel(state.step);
    if (state.step === 1) renderStep1();
    if (state.step === 2) renderStep2();
    if (state.step === 3) renderStep3();
    if (state.step === 4) renderStep4();
  }

  // ── Cargar mapeo de slugs SH → IDs numéricos de BD ───────
  async function loadServiceMapping() {
    try {
      const apiServices = await Api.services();
      apiServices.forEach(apiSvc => {
        // Correlacionar por nombre (normalizando a minúsculas)
        const shSvc = SH.services.find(s =>
          s.name.toLowerCase().trim() === apiSvc.name.toLowerCase().trim()
        );
        if (shSvc) serviceSlugToId[shSvc.id] = apiSvc.id;
        // También por slug directo
        serviceSlugToId[apiSvc.slug] = apiSvc.id;
      });
    } catch (err) {
      console.warn('[Wizard] No se pudo cargar mapeo de servicios:', err?.error);
    }
  }

  // ── Init ─────────────────────────────────────────────────
  async function init() {
    // Verificar sesión activa — si no está logueado, redirigir al login
    try {
      await Api.auth.me();
    } catch (_) {
      window.location.href = '/login.html?redirect=reservar.html&msg=Para+reservar+un+turno+necesit%C3%A1s+iniciar+sesi%C3%B3n.';
      return;
    }

    renderSteps();
    showPanel(1);
    await Promise.all([loadServiceMapping(), renderStep1()]);

    // Pre-seleccionar servicio desde query param (ej: reservar.html?servicio=s2)
    const preService = new URLSearchParams(location.search).get('servicio');
    if (preService && SH.services.find(s => s.id === preService)) {
      toggleService(preService);
    }
  }

  return {
    init, next, prev, changeMonth,
    selectBranch, toggleService, selectStaff,
    selectDate, selectTime, confirmBooking,
  };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("wizard-steps")) Wizard.init();
  });
} else {
  if (document.getElementById("wizard-steps")) Wizard.init();
}
