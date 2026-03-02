// ============================================================
// STUDIO HAIR — Componentes reutilizables (Header, Footer, etc.)
// Uso: llamar Components.init() al final del body de cada página.
// ============================================================

const Components = {
  // ── Devuelve el HTML a insertar ──────────────────────────
  headerHTML(activePage = "") {
    const nav = [
      { href: "../servicios.html",   label: "Servicios" },
      { href: "../precios.html",     label: "Precios" },
      { href: "../equipo.html",      label: "Equipo" },
      { href: "../galeria.html",     label: "Galería" },
      { href: "../promociones.html", label: "Promos" },
      { href: "../blog.html",        label: "Blog" },
      { href: "../contacto.html",    label: "Contacto" },
    ];
    // Ajustar hrefs según profundidad (admin está un nivel más abajo)
    const isAdmin = window.location.pathname.includes("/admin/");
    const base = isAdmin ? "../" : "";
    const indexHref = isAdmin ? "../index.html" : "index.html";

    const navLinks = nav.map(n => {
      const href = isAdmin ? n.href : n.href.replace("../", "");
      const isActive = document.title.toLowerCase().includes(n.label.toLowerCase()) ? "active" : "";
      return `<a href="${href}" class="${isActive}" aria-current="${isActive ? 'page' : 'false'}">${n.label}</a>`;
    }).join("");

    return `
<header class="site-header" role="banner" id="site-header">
  <div class="header-inner">
    <a href="${indexHref}" class="header-logo" aria-label="Studio Hair - Inicio">
      <span class="logo-icon">✂</span>
      Studio <span>Hair</span>
    </a>
    <nav class="header-nav" role="navigation" aria-label="Navegación principal">
      ${navLinks}
    </nav>
    <div class="header-actions">
      <a href="https://wa.me/${SH.brand.whatsapp}" target="_blank" rel="noopener" class="btn-wa-header" aria-label="Contactar por WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        <span>WhatsApp</span>
      </a>
      <a href="${base}reservar.html" class="btn btn-primary btn-sm">Reservar turno</a>
      <button class="hamburger" id="hamburger" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<nav class="mobile-menu" id="mobile-menu" aria-label="Menú móvil">
  <a href="${indexHref}">Inicio</a>
  ${nav.map(n => `<a href="${isAdmin ? n.href : n.href.replace("../", "")}">${n.label}</a>`).join("")}
  <a href="${base}reservar.html" class="btn btn-primary btn-sm" style="margin-top:8px">✂ Reservar turno</a>
</nav>`;
  },

  footerHTML() {
    const isAdmin = window.location.pathname.includes("/admin/");
    const base = isAdmin ? "../" : "";
    return `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">✂ Studio <span>Hair</span></div>
        <p>Tu salón de confianza desde ${SH.brand.year}. Donde cada corte cuenta una historia. Dos sucursales en Buenos Aires.</p>
        <div class="footer-social">
          <a href="https://instagram.com/studiohair_ar" target="_blank" rel="noopener" title="Instagram" aria-label="Seguinos en Instagram">📸</a>
          <a href="https://facebook.com/studiohair.ar" target="_blank" rel="noopener" title="Facebook" aria-label="Seguinos en Facebook">📘</a>
          <a href="https://wa.me/${SH.brand.whatsapp}" target="_blank" rel="noopener" title="WhatsApp" aria-label="Escribinos por WhatsApp">💬</a>
          <a href="https://tiktok.com/@studiohair_ar" target="_blank" rel="noopener" title="TikTok" aria-label="Seguinos en TikTok">🎵</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Servicios</h4>
        <ul>
          <li><a href="${base}servicios.html#corte">Cortes</a></li>
          <li><a href="${base}servicios.html#color">Color</a></li>
          <li><a href="${base}servicios.html#barber">Barber</a></li>
          <li><a href="${base}servicios.html#tratamiento">Tratamientos</a></li>
          <li><a href="${base}servicios.html#peinado">Peinados</a></li>
          <li><a href="${base}servicios.html#unas">Uñas</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Navegación</h4>
        <ul>
          <li><a href="${base}index.html">Inicio</a></li>
          <li><a href="${base}equipo.html">Equipo</a></li>
          <li><a href="${base}galeria.html">Galería</a></li>
          <li><a href="${base}promociones.html">Promociones</a></li>
          <li><a href="${base}blog.html">Blog</a></li>
          <li><a href="${base}faq.html">FAQ</a></li>
          <li><a href="${base}contacto.html">Contacto</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contacto</h4>
        <ul class="footer-contact">
          <li>
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
            Thames 1650, Palermo
          </li>
          <li>
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
            Av. Corrientes 4820, Villa Crespo
          </li>
          <li>
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
            ${SH.brand.phone}
          </li>
          <li>
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
            ${SH.brand.email}
          </li>
          <li>
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Lun–Vie 9:00–20:00 · Sáb 9:00–19:00
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="newsletter-section">
    <div class="container">
      <h2>¿Querés enterarte de nuestras promos?</h2>
      <p>Suscribite al newsletter y recibí ofertas exclusivas antes que nadie.</p>
      <form class="newsletter-form" id="newsletter-form" novalidate>
        <input type="email" placeholder="tu@email.com" aria-label="Tu email" required>
        <button type="submit" class="btn btn-gold">Suscribirme</button>
      </form>
    </div>
  </div>
  <div class="container">
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Studio Hair. Todos los derechos reservados.</span>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">
        <a href="${base}privacidad.html">Política de privacidad</a>
        <a href="${base}privacidad.html#terminos">Términos y condiciones</a>
        <a href="${base}faq.html">Preguntas frecuentes</a>
        <a href="${base}admin/login.html" style="opacity:.4">Admin</a>
      </div>
    </div>
  </div>
</footer>`;
  },

  ctaFloatHTML() {
    const isAdmin = window.location.pathname.includes("/admin/");
    const base = isAdmin ? "../" : "";
    return `
<div class="cta-float" aria-label="Acciones rápidas">
  <a href="${base}reservar.html" class="btn-reservar" aria-label="Reservar turno">✂ Reservar</a>
  <a href="https://wa.me/${SH.brand.whatsapp}" target="_blank" rel="noopener" class="btn-whatsapp" aria-label="Contactar por WhatsApp">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    WhatsApp
  </a>
</div>`;
  },

  cookieBannerHTML() {
    const isAdmin = window.location.pathname.includes("/admin/");
    const base = isAdmin ? "../" : "";
    return `
<div class="cookie-banner" id="cookie-banner" role="dialog" aria-label="Aviso de cookies">
  <p>Usamos cookies para mejorar tu experiencia. Al continuar navegando aceptás nuestra <a href="${base}privacidad.html">política de privacidad</a>.</p>
  <div class="cookie-actions">
    <button class="btn btn-outline btn-sm" id="cookie-reject" style="color:#fff;border-color:rgba(255,255,255,.3)">Rechazar</button>
    <button class="btn btn-gold btn-sm" id="cookie-accept">Aceptar</button>
  </div>
</div>`;
  },

  toastContainerHTML() {
    return `<div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="true"></div>`;
  },

  // ── Métodos de comportamiento ────────────────────────────
  initHeader() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!hamburger || !mobileMenu) return;
    hamburger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open);
    });
    // Cerrar al hacer click afuera
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", false);
      }
    });
    // Sticky shadow
    const header = document.getElementById("site-header");
    window.addEventListener("scroll", () => {
      header && header.classList.toggle("scrolled", window.scrollY > 10);
    });
  },

  initCookieBanner() {
    if (localStorage.getItem("sh_cookies")) return;
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;
    setTimeout(() => banner.classList.add("visible"), 1200);
    document.getElementById("cookie-accept").addEventListener("click", () => {
      localStorage.setItem("sh_cookies", "accepted");
      banner.classList.remove("visible");
    });
    document.getElementById("cookie-reject").addEventListener("click", () => {
      localStorage.setItem("sh_cookies", "rejected");
      banner.classList.remove("visible");
    });
  },

  initNewsletter() {
    const form = document.getElementById("newsletter-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector("input[type=email]").value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Components.toast("Por favor ingresá un email válido.", "error");
        return;
      }
      Components.toast("¡Genial! Te sumaste al newsletter de Studio Hair.", "success");
      form.reset();
    });
  },

  toast(message, type = "default") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    const icons = { success: "✓", error: "✕", default: "ℹ" };
    t.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  },

  // ── Punto de entrada principal ───────────────────────────
  init(activePage = "") {
    // Inyectar header
    const headerMount = document.getElementById("header-mount");
    if (headerMount) headerMount.innerHTML = this.headerHTML(activePage);

    // Inyectar footer
    const footerMount = document.getElementById("footer-mount");
    if (footerMount) footerMount.innerHTML = this.footerHTML();

    // Inyectar CTA flotante
    const ctaMount = document.getElementById("cta-float-mount");
    if (ctaMount) ctaMount.innerHTML = this.ctaFloatHTML();

    // Inyectar cookie banner
    const cookieMount = document.getElementById("cookie-mount");
    if (cookieMount) cookieMount.innerHTML = this.cookieBannerHTML();

    // Inyectar toast container
    const toastMount = document.getElementById("toast-mount");
    if (toastMount) toastMount.innerHTML = this.toastContainerHTML();

    // Inicializar comportamientos
    this.initHeader();
    this.initCookieBanner();
    this.initNewsletter();
  },
};
