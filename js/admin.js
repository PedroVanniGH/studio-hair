// ============================================================
// STUDIO HAIR — Admin Panel Logic
// ============================================================

const Admin = {
  // ── Auth ─────────────────────────────────────────────────
  requireAuth() {
    if (!Store.isAdminLoggedIn()) {
      window.location.href = "login.html";
    }
  },

  login(e) {
    e.preventDefault();
    const email    = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value;
    const errEl    = document.getElementById("login-error");

    if (Store.checkAdmin(email, password)) {
      Store.adminLogin();
      window.location.href = "dashboard.html";
    } else {
      errEl.textContent = "Email o contraseña incorrectos. Intentá de nuevo.";
      errEl.classList.add("visible");
    }
  },

  logout() {
    Store.adminLogout();
    window.location.href = "login.html";
  },

  // ── Toast ─────────────────────────────────────────────────
  toast(message, type = "default") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    const icons = { success: "✓", error: "✕", default: "ℹ" };
    t.innerHTML = `<span>${icons[type] || "ℹ"}</span><span>${message}</span>`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },

  // ── Modals ────────────────────────────────────────────────
  openModal(id) {
    document.getElementById(id)?.classList.add("open");
    document.body.style.overflow = "hidden";
  },

  closeModal(id) {
    document.getElementById(id)?.classList.remove("open");
    document.body.style.overflow = "";
  },

  // ── Dashboard KPIs ───────────────────────────────────────
  renderDashboard() {
    const apts = Store.getAppointments();
    const today = new Date().toISOString().split("T")[0];
    const thisWeek = (() => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + 1);
      return d.toISOString().split("T")[0];
    })();

    const todayApts  = apts.filter(a => a.date === today && a.status !== "cancelado");
    const weekApts   = apts.filter(a => a.date >= thisWeek && a.status !== "cancelado");
    const pending    = apts.filter(a => a.status === "pendiente");
    const customers  = Store.getCustomers();

    const incomeWeek = weekApts.reduce((acc, a) => {
      return acc + (a.service_ids || []).reduce((s, id) => s + (Utils.getServiceById(id)?.price || 0), 0);
    }, 0);

    setEl("kpi-today",    todayApts.length);
    setEl("kpi-week",     weekApts.length);
    setEl("kpi-pending",  pending.length);
    setEl("kpi-income",   Utils.formatPrice(incomeWeek));
    setEl("kpi-customers",customers.length);

    // Próximos turnos de hoy
    const todayList = document.getElementById("today-appointments");
    if (todayList) {
      if (!todayApts.length) {
        todayList.innerHTML = `<div class="empty-state" style="padding:24px 0"><div class="empty-icon">📅</div><p>No hay turnos para hoy.</p></div>`;
      } else {
        todayList.innerHTML = todayApts.sort((a,b) => a.time.localeCompare(b.time)).map(apt => {
          const branch  = Utils.getBranchById(apt.branch_id);
          const svcList = (apt.service_ids||[]).map(id => Utils.getServiceById(id)?.name||"").join(", ");
          return `
          <div class="apt-item" data-status="${apt.status}">
            <div class="apt-time">${apt.time}</div>
            <div class="apt-info">
              <div class="apt-name">${apt.customer?.name || "Sin nombre"}</div>
              <div class="apt-sub">${svcList} · ${branch?.name || "-"}</div>
            </div>
            <span class="badge badge-${statusClass(apt.status)}">${apt.status}</span>
            <div class="apt-actions">
              <button class="action-btn view" onclick="Admin.viewAppointment('${apt.id}')">Ver</button>
            </div>
          </div>`;
        }).join("");
      }
    }

    // Turnos pendientes de confirmación
    const pendingList = document.getElementById("pending-appointments");
    if (pendingList) {
      if (!pending.length) {
        pendingList.innerHTML = `<div class="empty-state" style="padding:24px 0"><div class="empty-icon">✅</div><p>No hay turnos pendientes.</p></div>`;
      } else {
        pendingList.innerHTML = pending.slice(0,5).map(apt => {
          const svcList = (apt.service_ids||[]).map(id => Utils.getServiceById(id)?.name||"").join(", ");
          return `
          <div class="apt-item" data-status="pendiente">
            <div class="apt-time">${apt.date?.split("-").reverse().join("/")}<br><small>${apt.time}</small></div>
            <div class="apt-info">
              <div class="apt-name">${apt.customer?.name || "Sin nombre"}</div>
              <div class="apt-sub">${svcList}</div>
            </div>
            <div class="apt-actions">
              <button class="action-btn edit" onclick="Admin.confirmAppointment('${apt.id}')">Confirmar</button>
              <button class="action-btn delete" onclick="Admin.cancelAppointment('${apt.id}')">Cancelar</button>
            </div>
          </div>`;
        }).join("");
      }
    }
  },

  // ── Turnos ────────────────────────────────────────────────
  renderAppointments(filter = {}) {
    const tbody = document.getElementById("appointments-tbody");
    if (!tbody) return;
    let apts = Store.getAppointments();

    // Aplicar filtros
    if (filter.status && filter.status !== "todos") apts = apts.filter(a => a.status === filter.status);
    if (filter.branch && filter.branch !== "todas") apts = apts.filter(a => a.branch_id === filter.branch);
    if (filter.date)   apts = apts.filter(a => a.date === filter.date);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      apts = apts.filter(a =>
        (a.customer?.name || "").toLowerCase().includes(q) ||
        (a.customer?.email || "").toLowerCase().includes(q)
      );
    }

    apts = apts.sort((a, b) => {
      const da = a.date + a.time; const db = b.date + b.time;
      return db.localeCompare(da);
    });

    if (!apts.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--c-muted)">No hay turnos que coincidan con el filtro.</td></tr>`;
      return;
    }

    tbody.innerHTML = apts.map(apt => {
      const branch  = Utils.getBranchById(apt.branch_id);
      const svcList = (apt.service_ids||[]).map(id => Utils.getServiceById(id)?.name||"").join(", ");
      const staff   = apt.staff_id ? Utils.getStaffById(apt.staff_id)?.name || "—" : "Cualquiera";
      const price   = (apt.service_ids||[]).reduce((s,id)=>s+(Utils.getServiceById(id)?.price||0),0);
      return `
      <tr>
        <td>${apt.date?.split("-").reverse().join("/")} ${apt.time}</td>
        <td><strong>${apt.customer?.name || "—"}</strong><br><small style="color:var(--c-muted)">${apt.customer?.phone||""}</small></td>
        <td title="${svcList}">${svcList.length > 30 ? svcList.slice(0,30)+"…" : svcList}</td>
        <td>${staff}</td>
        <td>${branch?.name || "—"}</td>
        <td><span class="badge badge-${statusClass(apt.status)}">${apt.status}</span></td>
        <td>
          <div class="table-actions">
            <select class="admin-select" style="font-size:.78rem;padding:4px 8px" onchange="Admin.changeStatus('${apt.id}',this.value)" aria-label="Cambiar estado">
              ${["pendiente","confirmado","completado","cancelado","no-show"].map(s =>
                `<option value="${s}" ${apt.status===s?"selected":""}>${s}</option>`).join("")}
            </select>
            <button class="action-btn delete" onclick="Admin.deleteAppointment('${apt.id}')">✕</button>
          </div>
        </td>
      </tr>`;
    }).join("");
  },

  changeStatus(id, status) {
    Store.updateAppointment(id, { status });
    Admin.toast(`Estado actualizado a: ${status}`, "success");
    renderAppointmentsIfActive();
  },

  confirmAppointment(id) {
    Store.updateAppointment(id, { status: "confirmado" });
    Admin.toast("Turno confirmado.", "success");
    Admin.renderDashboard();
    Admin.renderAppointments();
  },

  cancelAppointment(id) {
    if (!confirm("¿Cancelar este turno?")) return;
    Store.updateAppointment(id, { status: "cancelado" });
    Admin.toast("Turno cancelado.", "success");
    Admin.renderDashboard();
    Admin.renderAppointments();
  },

  deleteAppointment(id) {
    if (!confirm("¿Eliminar este turno permanentemente?")) return;
    Store.deleteAppointment(id);
    Admin.toast("Turno eliminado.", "success");
    renderAppointmentsIfActive();
  },

  viewAppointment(id) {
    const apt     = Store.getAppointments().find(a => a.id === id);
    if (!apt) return;
    const branch  = Utils.getBranchById(apt.branch_id);
    const svcList = (apt.service_ids||[]).map(id => Utils.getServiceById(id)?.name||"").join(", ");
    const staff   = apt.staff_id ? Utils.getStaffById(apt.staff_id)?.name : "Cualquier profesional";
    const price   = (apt.service_ids||[]).reduce((s,id)=>s+(Utils.getServiceById(id)?.price||0),0);

    const body = document.getElementById("apt-detail-body");
    if (body) body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group"><label class="form-label">Cliente</label><div style="font-weight:600">${apt.customer?.name||"—"}</div></div>
        <div class="form-group"><label class="form-label">Email</label><div>${apt.customer?.email||"—"}</div></div>
        <div class="form-group"><label class="form-label">Teléfono</label><div>${apt.customer?.phone||"—"}</div></div>
        <div class="form-group"><label class="form-label">Estado</label><div><span class="badge badge-${statusClass(apt.status)}">${apt.status}</span></div></div>
        <div class="form-group"><label class="form-label">Fecha y hora</label><div>${apt.date} ${apt.time}</div></div>
        <div class="form-group"><label class="form-label">Duración</label><div>${apt.duration} min</div></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Servicios</label><div>${svcList}</div></div>
        <div class="form-group"><label class="form-label">Profesional</label><div>${staff}</div></div>
        <div class="form-group"><label class="form-label">Sucursal</label><div>${branch?.name||"—"}</div></div>
        <div class="form-group"><label class="form-label">Precio estimado</label><div style="font-weight:700;color:var(--c-gold)">${Utils.formatPrice(price)}</div></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Notas</label><div>${apt.notes||"—"}</div></div>
      </div>`;
    Admin.openModal("modal-apt-detail");
  },

  // ── Clientes ──────────────────────────────────────────────
  renderCustomers(search = "") {
    const tbody = document.getElementById("customers-tbody");
    if (!tbody) return;
    let customers = Store.getCustomers();
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
      );
    }
    const allApts = Store.getAppointments();
    if (!customers.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--c-muted)">No hay clientes registrados.</td></tr>`;
      return;
    }
    tbody.innerHTML = customers.map(c => {
      const cApts = allApts.filter(a => a.customer?.email === c.email);
      const last  = cApts.sort((a,b)=>b.date.localeCompare(a.date))[0];
      const initials = c.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
      return `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px">
          <div class="table-avatar-placeholder">${initials}</div>
          <div><strong>${c.name}</strong></div>
        </div></td>
        <td>${c.email}</td>
        <td>${c.phone || "—"}</td>
        <td>${cApts.length}</td>
        <td>${last ? last.date.split("-").reverse().join("/") : "—"}</td>
        <td>
          <button class="action-btn view" onclick="Admin.viewCustomer('${c.id}')">Ver historial</button>
        </td>
      </tr>`;
    }).join("");
  },

  viewCustomer(id) {
    const c = Store.getCustomers().find(x => x.id === id);
    if (!c) return;
    const allApts = Store.getAppointments();
    const cApts   = allApts.filter(a => a.customer?.email === c.email)
                            .sort((a,b) => b.date.localeCompare(a.date));
    const body = document.getElementById("customer-detail-body");
    if (body) body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
        <div class="form-group"><label class="form-label">Nombre</label><div style="font-weight:600">${c.name}</div></div>
        <div class="form-group"><label class="form-label">Email</label><div>${c.email}</div></div>
        <div class="form-group"><label class="form-label">Teléfono</label><div>${c.phone||"—"}</div></div>
        <div class="form-group"><label class="form-label">Cliente desde</label><div>${c.created_at||"—"}</div></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Notas</label><div>${c.notes||"—"}</div></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Alergias</label><div>${c.allergies||"—"}</div></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Preferencias</label><div>${c.preferences||"—"}</div></div>
      </div>
      <hr style="border:none;border-top:1px solid var(--c-border);margin-bottom:20px">
      <h4 style="font-family:var(--font-head);font-weight:700;margin-bottom:14px">Historial de turnos (${cApts.length})</h4>
      ${cApts.length ? cApts.map(apt => {
        const svcList = (apt.service_ids||[]).map(id => Utils.getServiceById(id)?.name||"").join(", ");
        return `<div class="apt-item" data-status="${apt.status}" style="margin-bottom:8px">
          <div class="apt-time">${apt.date.split("-").reverse().join("/")} ${apt.time}</div>
          <div class="apt-info"><div class="apt-sub">${svcList}</div></div>
          <span class="badge badge-${statusClass(apt.status)}">${apt.status}</span>
        </div>`;
      }).join("") : `<p style="color:var(--c-muted)">No hay turnos registrados.</p>`}`;
    Admin.openModal("modal-customer-detail");
  },

  // ── Helpers ───────────────────────────────────────────────
  formatDate: (d) => d.split("-").reverse().join("/"),
};

// ── Helpers globales ────────────────────────────────────────
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function statusClass(s) {
  const map = { pendiente: "pending", confirmado: "confirmed", completado: "completed", cancelado: "cancelled", "no-show": "noshow" };
  return map[s] || "pending";
}

function renderAppointmentsIfActive() {
  if (document.getElementById("appointments-tbody")) {
    const status = document.getElementById("filter-status")?.value || "todos";
    const branch = document.getElementById("filter-branch")?.value || "todas";
    const date   = document.getElementById("filter-date")?.value || "";
    const search = document.getElementById("search-apt")?.value || "";
    Admin.renderAppointments({ status, branch, date, search });
  }
  if (document.getElementById("today-appointments")) {
    Admin.renderDashboard();
  }
}

// Init cierre de modales con backdrop click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "";
  }
});
