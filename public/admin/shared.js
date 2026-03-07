// ============================================================
// STUDIO HAIR — Admin Shared Layout
// v2 — usa JWT (cookie httpOnly) en vez de sessionStorage
// ============================================================

// Verificar autenticación al cargar cualquier página admin
(function requireAuth() {
  fetch('/api/admin/auth/me', { credentials: 'include' })
    .then(r => { if (!r.ok) window.location.href = 'login.html'; })
    .catch(() => { window.location.href = 'login.html'; });
})();

function getSidebarHTML(activePage) {
  const items = [
    { href: "dashboard.html",       icon: "grid",     label: "Dashboard" },
    { href: "turnos.html",          icon: "calendar", label: "Turnos",       badge: true },
    { href: "servicios-admin.html", icon: "tag",      label: "Servicios" },
    { href: "profesionales.html",   icon: "users",    label: "Profesionales" },
    { href: "clientes.html",        icon: "people",   label: "Clientes" },
    { href: "sucursales-admin.html",icon: "pin",      label: "Sucursales" },
    { href: "ajustes.html",         icon: "gear",     label: "Ajustes" },
  ];

  const icons = {
    grid: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>`,
    calendar: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>`,
    tag: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/></svg>`,
    users: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>`,
    people: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>`,
    pin: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>`,
    gear: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  };

  const navLinks = items.map(item => {
    const isActive = window.location.pathname.endsWith(item.href) || window.location.href.includes(item.href);
    // El badge se actualiza async via updatePendingBadge()
    const badgeHTML = item.badge ? `<span class="badge-count" id="sidebar-pending-badge" style="display:none">0</span>` : "";
    return `<a href="${item.href}" class="${isActive ? 'active' : ''}" ${isActive ? 'aria-current="page"' : ''}>
      ${icons[item.icon] || ''}${item.label}${badgeHTML}
    </a>`;
  }).join("");

  return `
  <aside class="sidebar" id="sidebar" aria-label="Navegación del panel">
    <div class="sidebar-logo">✂ Studio <span>Hair</span></div>
    <nav class="sidebar-nav" role="navigation">${navLinks}</nav>
    <div class="sidebar-footer">
      <a href="../index.html" target="_blank" rel="noopener">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
        Ver sitio público
      </a>
      <a href="#" id="logout-btn">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" style="width:18px;height:18px"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>
        Cerrar sesión
      </a>
    </div>
  </aside>`;
}

// Actualiza el badge de "pendientes" en el sidebar desde la API
async function updatePendingBadge() {
  try {
    const res  = await fetch('/api/admin/appointments/stats', { credentials: 'include' });
    const data = await res.json();
    const badge = document.getElementById('sidebar-pending-badge');
    if (badge && data.pendingCount > 0) {
      badge.textContent = data.pendingCount;
      badge.style.display = 'inline-block';
    }
  } catch (_) {}
}

// Auto-inject sidebar + setup logout + hamburger
document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("sidebar-mount");
  if (mount) {
    mount.outerHTML = getSidebarHTML();
    updatePendingBadge();
  }

  // ── Hamburger sidebar toggle ──────────────────────────────
  const topbar  = document.querySelector('.admin-topbar');
  const sidebar = document.getElementById('sidebar');
  if (topbar && sidebar) {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Hamburger button (solo si no está ya en el DOM)
    if (!document.getElementById('hamburger-btn')) {
      const btn = document.createElement('button');
      btn.className = 'hamburger-btn';
      btn.id = 'hamburger-btn';
      btn.setAttribute('aria-label', 'Abrir menú');
      btn.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>`;
      const firstChild = topbar.firstElementChild;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;align-items:center;gap:12px';
      topbar.insertBefore(wrapper, firstChild);
      wrapper.appendChild(btn);
      wrapper.appendChild(firstChild);
    }

    function openSidebar()  { sidebar.classList.add('open');    overlay.classList.add('visible');    document.body.style.overflow = 'hidden'; }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); document.body.style.overflow = ''; }
    document.getElementById('hamburger-btn')?.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);
  }

  // Logout button
  document.addEventListener('click', async function(e) {
    if (e.target.closest('#logout-btn')) {
      e.preventDefault();
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = 'login.html';
    }
  });
});
