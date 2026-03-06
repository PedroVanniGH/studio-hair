// ============================================================
// STUDIO HAIR — Cliente API (reemplaza localStorage)
// Todos los datos ahora vienen del backend en /api/*
// ============================================================

const Api = {
  // ── Internos ───────────────────────────────────────────────
  async _request(method, path, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Enviar cookies (JWT admin)
    };
    if (data) opts.body = JSON.stringify(data);

    const res = await fetch('/api' + path, opts);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) throw json;
    return json;
  },

  get:    (path)       => Api._request('GET',    path),
  post:   (path, data) => Api._request('POST',   path, data),
  patch:  (path, data) => Api._request('PATCH',  path, data),
  delete: (path)       => Api._request('DELETE', path),

  // ── Públicos ───────────────────────────────────────────────
  branches() {
    return Api.get('/branches');
  },

  services(category) {
    return Api.get('/services' + (category ? `?category=${category}` : ''));
  },

  professionals(branchId, serviceIds) {
    const params = new URLSearchParams();
    if (branchId)   params.append('branchId', branchId);
    if (serviceIds?.length) params.append('serviceIds', serviceIds.join(','));
    const q = params.toString();
    return Api.get('/professionals' + (q ? `?${q}` : ''));
  },

  availability({ branchId, date, serviceIds, professionalId }) {
    const params = new URLSearchParams({ branchId, date, serviceIds: serviceIds.join(',') });
    if (professionalId) params.append('professionalId', professionalId);
    return Api.get(`/availability?${params}`);
  },

  createAppointment(data) {
    return Api.post('/appointments', data);
  },

  myAppointments(email) {
    return Api.get(`/appointments/my?email=${encodeURIComponent(email)}`);
  },

  cancelAppointment(token) {
    // Redirige al servidor que maneja la cancelación
    window.location.href = `/api/appointments/cancel/${token}`;
  },

  // ── Admin ──────────────────────────────────────────────────
  admin: {
    login(email, password) {
      return Api.post('/admin/auth/login', { email, password });
    },
    logout() {
      return Api.post('/admin/auth/logout', {});
    },
    me() {
      return Api.get('/admin/auth/me');
    },

    // Turnos
    appointments(params = {}) {
      const q = new URLSearchParams(params).toString();
      return Api.get('/admin/appointments' + (q ? `?${q}` : ''));
    },
    appointmentStats() {
      return Api.get('/admin/appointments/stats');
    },
    updateStatus(id, status) {
      return Api.patch(`/admin/appointments/${id}/status`, { status });
    },
    deleteAppointment(id) {
      return Api.delete(`/admin/appointments/${id}`);
    },

    // Clientes
    customers(params = {}) {
      const q = new URLSearchParams(params).toString();
      return Api.get('/admin/customers' + (q ? `?${q}` : ''));
    },
    customer(id) {
      return Api.get(`/admin/customers/${id}`);
    },

    // Profesionales
    professionals() {
      return Api.get('/admin/professionals');
    },
    createProfessional(data) {
      return Api.post('/admin/professionals', data);
    },
    updateProfessional(id, data) {
      return Api.patch(`/admin/professionals/${id}`, data);
    },
    deactivateProfessional(id) {
      return Api.delete(`/admin/professionals/${id}`);
    },

    // Servicios
    services() {
      return Api.get('/admin/services');
    },
    createService(data) {
      return Api.post('/admin/services', data);
    },
    updateService(id, data) {
      return Api.patch(`/admin/services/${id}`, data);
    },
    deactivateService(id) {
      return Api.delete(`/admin/services/${id}`);
    },
  },
};

window.Api = Api;
