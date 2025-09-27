/*
 main.js - interactions clean version
 - Theme toggle (persist in localStorage)
 - Lazy image setup
 - Reveal on scroll (IntersectionObserver)
 - Modal quick view
 - Newsletter handler stub
 - Smooth anchors, ESC to close modal
*/

(function(){
  // Elements / selectors
  const root = document.documentElement; // use data-theme on <html>
  const themeKey = 'skystep_theme';

  // Init year display
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // THEME: read stored preference or system
  function getInitialTheme(){
    const stored = localStorage.getItem(themeKey);
    if(stored) return stored;
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    localStorage.setItem(themeKey, theme);
    // update toggle button aria-pressed if present
    const toggle = document.getElementById('theme-toggle');
    if(toggle) toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  // Setup toggle if exists
  function setupThemeToggle(){
    const t = document.getElementById('theme-toggle');
    if(!t) return;
    t.addEventListener('click', ()=>{
      const current = root.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      t.focus();
    });
  }

  // Lazy images (native + data-src)
  function lazyInit(){
    document.querySelectorAll('img.lazy').forEach(img=>{
      // set native lazy attribute
      if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
      const src = img.getAttribute('data-src');
      if(src && !img.src){
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }

  // Reveal on scroll
  function revealInit(){
    const items = document.querySelectorAll('.reveal');
    if(!items.length) return;
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.12});
    items.forEach(i => io.observe(i));
  }

  // Modal
  const modal = document.getElementById('modal');
  function openQuickView(name, price){
    if(!modal) return;
    const content = document.getElementById('modal-content');
    if(!content) return;
    content.innerHTML = '<h3 style="margin:0 0 8px">' + escapeHtml(name) + '</h3>' +
      '<p style="color:var(--muted);margin:0 0 12px">Prix: <strong style="color:var(--accent)">' + price + '€</strong></p>' +
      '<p style="margin:0 0 12px;color:var(--muted)">Court descriptif du produit. Remplacez par vos détails.</p>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="cta-primary" onclick="addToCartSafe(\''+escapeJs(name)+'\','+price+');closeModal()">Ajouter au panier</button>' +
        '<button class="btn" onclick="closeModal()">Fermer</button>' +
      '</div>';
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
  }

  // Expose safe wrappers for inline onclick in HTML (keeps compatibility)
  window.openQuickView = openQuickView;
  window.closeModal = function(){ if(!modal) return; modal.style.display='none'; modal.setAttribute('aria-hidden','true'); };
  window.addToCart = function(name,price){
    // placeholder function left for compatibility
    alert(name + ' ajouté au panier (' + price + '€)');
  };
  // safe wrapper used inside modal content
  window.addToCartSafe = window.addToCart;

  // Newsletter stub
  function subscribe(e){
    if(e && e.preventDefault) e.preventDefault();
    const form = e && e.target ? e.target : document.querySelector('.newsletter');
    const input = form ? form.querySelector('input[type="email"]') : null;
    const email = input ? input.value.trim() : '';
    if(!email){ alert('Veuillez saisir un e‑mail valide'); return; } // TODO : effectuer appel API vers service email
    alert('Merci ! ' + email + ' a été ajouté à la liste.');
    if(form) form.reset();
  }
  // expose subscribe for onsubmit inline usage
  window.subscribe = subscribe;

  // Smooth anchors fallback
  function anchorsInit(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', function(e){
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth'});
        }
      });
    });
  }

  // Esc closes modal
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') window.closeModal && window.closeModal();
  });

  // Simple helpers (escape)
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function escapeJs(str){ return String(str).replace(/['\]/g,'\$&'); }

  // Initialization
  document.addEventListener('DOMContentLoaded', function(){
    // theme
    const initial = getInitialTheme();
    applyTheme(initial);
    setupThemeToggle();

    // content
    lazyInit();
    revealInit();
    anchorsInit();
  }));

  // Public small API (useful for dev console)
  window._skystep = {
    applyTheme, lazyInit, revealInit, openQuickView, closeModal: window.closeModal
  };
})();