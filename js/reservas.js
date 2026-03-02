// ============================================================
// STUDIO HAIR — Wizard de Reservas (reservar.html)
// ============================================================

const Wizard = (() => {
  let state = {
    step: 1,
    branch: null,    // id de sucursal
    services: [],    // array de service ids
    staff: null,     // id de profesional (null = cualquiera)
    date: null,      // "YYYY-MM-DD"
    time: null,      // "HH:MM"
    customer: { name: "", email: "", phone: "", notes: "" },
    totalDuration: 0,
    totalPrice: 0,
  };

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

  // ── Mostrar panel activo ─────────────────────────────────
  function showPanel(n) {
    document.querySelectorAll(".wizard-panel").forEach((p, i) => {
      p.classList.toggle("active", i + 1 === n);
    });
    renderSteps();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Calcular totales ─────────────────────────────────────
  function recalculate() {
    state.totalDuration = state.services.reduce((acc, sid) => {
      const s = Utils.getServiceById(sid);
      return acc + (s ? s.duration + s.buffer : 0);
    }, 0);
    state.totalPrice = state.services.reduce((acc, sid) => {
      const s = Utils.getServiceById(sid);
      return acc + (s ? s.price : 0);
    }, 0);
  }

  // ── PASO 1: Sucursal ─────────────────────────────────────
  function renderStep1() {
    const container = document.getElementById("branch-choices");
    if (!container) return;
    container.innerHTML = SH.branches.filter(b => b.active).map(b => `
      <button class="choice-btn ${state.branch === b.id ? 'selected' : ''}"
        onclick="Wizard.selectBranch('${b.id}')" aria-pressed="${state.branch === b.id}">
        <span class="choice-name">${b.name}</span>
        <span class="choice-sub">${b.address}</span>
      </button>`
    ).join("");
  }

  function selectBranch(id) {
    state.branch = id;
    state.staff = null; // Reset staff al cambiar sucursal
    renderStep1();
  }

  // ── PASO 2: Servicios ────────────────────────────────────
  function renderStep2() {
    const container = document.getElementById("service-choices");
    if (!container) return;
    // Agrupar por categoría
    let html = "";
    SH.categories.forEach(cat => {
      const catServices = SH.services.filter(s => s.category === cat.id && s.active);
      if (!catServices.length) return;
      html += `<div class="service-cat-group">
        <h4 style="font-family:var(--font-head);font-size:.85rem;font-weight:700;
          text-transform:uppercase;letter-spacing:.07em;color:var(--c-muted);margin-bottom:10px">
          ${cat.icon} ${cat.label}</h4>
        <div class="choice-grid">
          ${catServices.map(s => `
            <button class="choice-btn ${state.services.includes(s.id) ? 'selected' : ''}"
              onclick="Wizard.toggleService('${s.id}')" aria-pressed="${state.services.includes(s.id)}">
              <span class="choice-name">${s.name}</span>
              <span class="choice-sub">${Utils.formatPrice(s.price)} · ${s.duration} min</span>
            </button>`).join("")}
        </div>
      </div>`;
    });
    container.innerHTML = html;
    updateServiceSummary();
  }

  function toggleService(id) {
    const idx = state.services.indexOf(id);
    if (idx === -1) state.services.push(id);
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
    const names = state.services.map(id => Utils.getServiceById(id)?.name || "").join(", ");
    el.innerHTML = `
      <p style="font-size:.9rem"><strong>Seleccionado:</strong> ${names}</p>
      <p style="font-size:.9rem;margin-top:4px"><strong>Total estimado:</strong> ${Utils.formatPrice(state.totalPrice)} · ${state.totalDuration} min</p>`;
  }

  // ── PASO 3: Profesional ──────────────────────────────────
  function renderStep3() {
    const container = document.getElementById("staff-choices");
    if (!container) return;
    const branch = state.branch;
    // Filtrar staff por sucursal que pueda hacer al menos uno de los servicios
    const available = SH.staff.filter(p => {
      if (!p.active) return false;
      if (branch && p.branch_id !== branch) return false;
      return state.services.some(sid => p.services.includes(sid));
    });

    let html = `
      <button class="choice-btn ${state.staff === null ? 'selected' : ''}"
        onclick="Wizard.selectStaff(null)" aria-pressed="${state.staff === null}">
        <span class="choice-name">Cualquier profesional</span>
        <span class="choice-sub">El primero disponible</span>
      </button>`;

    html += available.map(p => `
      <button class="choice-btn ${state.staff === p.id ? 'selected' : ''}"
        onclick="Wizard.selectStaff('${p.id}')" aria-pressed="${state.staff === p.id}">
        <span class="choice-name">${p.name}</span>
        <span class="choice-sub">${p.role} · ★ ${p.rating}</span>
      </button>`).join("");

    container.innerHTML = `<div class="choice-grid">${html}</div>`;
  }

  function selectStaff(id) {
    state.staff = id;
    renderStep3();
  }

  // ── PASO 4: Fecha y hora ─────────────────────────────────
  let calendarMonth, calendarYear;

  function renderStep4() {
    const now = new Date();
    if (!calendarMonth) { calendarMonth = now.getMonth(); calendarYear = now.getFullYear(); }
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
      const isPast = dt < today;
      const isDom = dt.getDay() === 0;
      const isSelected = state.date === isoDate;
      const isToday = dt.getTime() === today.getTime();
      const disabled = isPast || isDom;
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

  function renderTimeSlots() {
    const container = document.getElementById("time-slots");
    if (!container) return;
    if (!state.date) {
      container.innerHTML = `<p style="color:var(--c-muted);font-size:.9rem">Primero elegí una fecha.</p>`;
      return;
    }
    container.innerHTML = `<p style="color:var(--c-muted);font-size:.88rem">Cargando horarios...</p>`;
    setTimeout(() => {
      const slots = Utils.getAvailableTimes(state.branch, state.staff, state.date, state.totalDuration);
      if (!slots.length) {
        container.innerHTML = `<div class="empty-state" style="padding:24px 0"><div class="empty-icon">📅</div><p>No hay turnos disponibles para este día. Probá con otra fecha.</p></div>`;
        return;
      }
      container.innerHTML = `<div class="time-grid">
        ${slots.map(t => `
          <button class="time-btn ${state.time === t ? 'selected' : ''}"
            onclick="Wizard.selectTime('${t}')" aria-pressed="${state.time === t}">${t}</button>`
        ).join("")}
      </div>`;
    }, 300);
  }

  function selectTime(t) {
    state.time = t;
    renderTimeSlots();
  }

  // ── PASO 5: Datos del cliente ────────────────────────────
  function renderStep5() {
    document.getElementById("summary-branch").textContent   = Utils.getBranchById(state.branch)?.name || "-";
    document.getElementById("summary-services").textContent = state.services.map(id => Utils.getServiceById(id)?.name || "").join(", ");
    document.getElementById("summary-staff").textContent    = state.staff ? Utils.getStaffById(state.staff)?.name || "-" : "Cualquier profesional";
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

  // ── Confirmar reserva ────────────────────────────────────
  function confirmBooking() {
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

    setTimeout(() => {
      const apt = {
        id: Utils.generateId("apt"),
        branch_id:    state.branch,
        service_ids:  [...state.services],
        staff_id:     state.staff,
        date:         state.date,
        time:         state.time,
        duration:     state.totalDuration,
        status:       "pendiente",
        customer:     { ...state.customer },
        notes:        state.customer.notes,
        created_at:   new Date().toISOString(),
      };
      Store.addAppointment(apt);
      // Guardar/actualizar cliente
      Store.addCustomer({
        id: Utils.generateId("c"),
        name:  state.customer.name,
        email: state.customer.email,
        phone: state.customer.phone,
        notes: "", allergies: "", preferences: "",
        created_at: new Date().toISOString().split("T")[0],
      });

      showPanel(6); // Panel de éxito
      renderSuccess(apt);
    }, 1000);
  }

  function renderSuccess(apt) {
    const branch  = Utils.getBranchById(apt.branch_id);
    const svcList = apt.service_ids.map(id => Utils.getServiceById(id)?.name || "").join(", ");
    const staff   = apt.staff_id ? Utils.getStaffById(apt.staff_id)?.name : "Primer profesional disponible";
    const whatsappMsg = encodeURIComponent(
      `Hola Studio Hair! Quiero confirmar mi turno del ${Utils.formatDate(apt.date)} a las ${apt.time} para ${svcList}.`
    );
    document.getElementById("success-content").innerHTML = `
      <div class="confirm-success">
        <div class="confirm-icon">✓</div>
        <h2>¡Turno solicitado!</h2>
        <p>Tu solicitud fue recibida. Te contactaremos para confirmar tu turno.</p>
        <div class="booking-summary" style="text-align:left;margin-bottom:28px">
          <h4>Resumen de tu turno</h4>
          <div class="summary-row"><span class="summary-label">Sucursal</span><strong>${branch?.name}</strong></div>
          <div class="summary-row"><span class="summary-label">Servicios</span><strong>${svcList}</strong></div>
          <div class="summary-row"><span class="summary-label">Profesional</span><strong>${staff}</strong></div>
          <div class="summary-row"><span class="summary-label">Fecha</span><strong>${Utils.formatDate(apt.date)}</strong></div>
          <div class="summary-row"><span class="summary-label">Hora</span><strong>${apt.time} hs</strong></div>
          <div class="summary-row"><span class="summary-label">Duración aprox.</span><span>${apt.duration} min</span></div>
          <div class="summary-row"><span class="summary-label">Precio estimado</span><strong>${Utils.formatPrice(state.totalPrice)}</strong></div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="https://wa.me/${SH.brand.whatsapp}?text=${whatsappMsg}" target="_blank" rel="noopener"
            class="btn btn-gold"><span>💬</span> Confirmar por WhatsApp</a>
          <a href="index.html" class="btn btn-outline">Volver al inicio</a>
        </div>
        <p style="font-size:.82rem;color:var(--c-muted);margin-top:20px">
          Número de turno: <strong>#${apt.id}</strong>
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

  // ── Navegación entre pasos ───────────────────────────────
  function next() {
    if (!validateStep(state.step)) return;
    state.step++;
    if (state.step > TOTAL_STEPS) { confirmBooking(); return; }
    showPanel(state.step);
    // Render según paso
    if (state.step === 2) renderStep2();
    if (state.step === 3) renderStep3();
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

  // ── Init ─────────────────────────────────────────────────
  function init() {
    renderSteps();
    showPanel(1);
    renderStep1();
  }

  return {
    init, next, prev, changeMonth,
    selectBranch, toggleService, selectStaff,
    selectDate, selectTime,
    confirmBooking,
  };
})();

// Auto-init si estamos en reservar.html
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("wizard-steps")) Wizard.init();
  });
} else {
  if (document.getElementById("wizard-steps")) Wizard.init();
}
