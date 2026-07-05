/* =============================================================
   ECOLOOP — SCRIPT PRINCIPAL
   Índice:
   1. Utilidades generales
   2. Navbar: efecto de scroll
   3. Menú hamburguesa (móvil)
   4. Scroll reveal (aparición progresiva)
   5. Contadores animados (sección Impacto)
   6. Acordeón FAQ
   7. Botón "Volver arriba"
   8. Formularios (contacto, newsletter, buscador de estaciones)
   9. Inicialización
   ============================================================= */

(function () {
  'use strict';

  /* =============================================================
     1. UTILIDADES GENERALES
     ============================================================= */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function throttle(fn, wait) {
    let isWaiting = false;
    return function throttled(...args) {
      if (isWaiting) return;
      fn.apply(this, args);
      isWaiting = true;
      window.setTimeout(() => {
        isWaiting = false;
      }, wait);
    };
  }

  /* =============================================================
     2. NAVBAR: EFECTO DE SCROLL
     ============================================================= */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 24;

    const handleScroll = throttle(() => {
      const shouldBeScrolled = window.scrollY > SCROLL_THRESHOLD;
      navbar.classList.toggle('is-scrolled', shouldBeScrolled);
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* =============================================================
     3. MENÚ HAMBURGUESA (MÓVIL)
     ============================================================= */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('navToggle');
    const nav = document.getElementById('primary-navigation');
    if (!toggleBtn || !nav) return;

    const navLinks = nav.querySelectorAll('a');

    function openMenu() {
      nav.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Abrir menú de navegación');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      const isOpen = nav.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    }

    toggleBtn.addEventListener('click', toggleMenu);

    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });

    window.addEventListener(
      'resize',
      throttle(() => {
        if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
          closeMenu();
        }
      }, 150)
    );
  }

  /* =============================================================
     4. SCROLL REVEAL (APARICIÓN PROGRESIVA)
     ============================================================= */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || 0;
            window.setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, Number(delay));
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* =============================================================
     5. CONTADORES ANIMADOS (SECCIÓN IMPACTO)
     ============================================================= */
  function initCounters() {
    const counters = document.querySelectorAll('.impact__number');
    if (!counters.length) return;

    const DURATION = 1800;

    function animateCounter(el) {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const useThousands = target >= 1000;

      if (prefersReducedMotion) {
        el.textContent = formatNumber(target, useThousands) + suffix;
        return;
      }

      const startTime = performance.now();

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased = easeOutExpo(progress);
        const currentValue = Math.floor(eased * target);

        el.textContent = formatNumber(currentValue, useThousands) + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target, useThousands) + suffix;
        }
      }

      window.requestAnimationFrame(step);
    }

    function formatNumber(value, useThousands) {
      return useThousands ? value.toLocaleString('es-CO') : String(value);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* =============================================================
     6. ACORDEÓN FAQ
     ============================================================= */
  function initAccordion() {
    const triggers = document.querySelectorAll('.accordion__trigger');
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const panelId = trigger.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        if (!panel) return;

        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        triggers.forEach((otherTrigger) => {
          if (otherTrigger !== trigger) {
            const otherPanelId = otherTrigger.getAttribute('aria-controls');
            const otherPanel = document.getElementById(otherPanelId);
            otherTrigger.setAttribute('aria-expanded', 'false');
            if (otherPanel) otherPanel.hidden = true;
          }
        });

        trigger.setAttribute('aria-expanded', String(!isExpanded));
        panel.hidden = isExpanded;
      });
    });
  }

  /* =============================================================
     7. BOTÓN "VOLVER ARRIBA"
     ============================================================= */
  function initBackToTop() {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'backToTop';
    button.setAttribute('aria-label', 'Volver arriba');
    button.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    Object.assign(button.style, {
      position: 'fixed',
      right: '1.5rem',
      bottom: '1.5rem',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #55C44D 0%, #2F80ED 100%)',
      color: '#FFFFFF',
      boxShadow: '0 12px 32px rgba(45, 52, 54, 0.22)',
      border: 'none',
      cursor: 'pointer',
      opacity: '0',
      visibility: 'hidden',
      transform: 'translateY(16px)',
      transition: 'opacity .3s ease, transform .3s ease, visibility .3s',
      zIndex: '850'
    });

    document.body.appendChild(button);

    const SHOW_AFTER_PX = 480;

    function updateVisibility() {
      const shouldShow = window.scrollY > SHOW_AFTER_PX;
      button.style.opacity = shouldShow ? '1' : '0';
      button.style.visibility = shouldShow ? 'visible' : 'hidden';
      button.style.transform = shouldShow ? 'translateY(0)' : 'translateY(16px)';
    }

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-4px)';
    });
    button.addEventListener('mouseleave', () => {
      const shouldShow = window.scrollY > SHOW_AFTER_PX;
      button.style.transform = shouldShow ? 'translateY(0)' : 'translateY(16px)';
    });

    window.addEventListener('scroll', throttle(updateVisibility, 100), {
      passive: true
    });
    updateVisibility();
  }

  /* =============================================================
     8. FORMULARIOS (CONTACTO, NEWSLETTER, BUSCADOR DE ESTACIONES)
     ============================================================= */
  function initForms() {
    handleFormSubmit('.contact__form', '¡Gracias! Tu mensaje fue enviado, te contactaremos pronto.');
    handleFormSubmit('.newsletter-form', '¡Listo! Te has suscrito a las novedades de ECOLoop.');
    handleStationSearch();
  }

  function handleFormSubmit(selector, successMessage) {
    const form = document.querySelector(selector);
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      showFormFeedback(form, successMessage);
      form.reset();
    });
  }

  function showFormFeedback(form, message) {
    const existingFeedback = form.querySelector('.form-feedback');
    if (existingFeedback) existingFeedback.remove();

    const feedback = document.createElement('p');
    feedback.className = 'form-feedback';
    feedback.textContent = message;
    feedback.setAttribute('role', 'status');

    Object.assign(feedback.style, {
      marginTop: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#1f8e39',
      background: 'rgba(85, 196, 77, 0.12)',
      transition: 'opacity .3s ease'
    });

    form.appendChild(feedback);

    window.setTimeout(() => {
      feedback.style.opacity = '0';
      window.setTimeout(() => feedback.remove(), 300);
    }, 4000);
  }

  function handleStationSearch() {
    const form = document.querySelector('.station-search');
    const input = document.getElementById('station-input');
    const list = document.querySelector('.stations__list');
    if (!form || !input || !list) return;

    const items = Array.from(list.querySelectorAll('li'));

    function filterStations() {
      const query = input.value.trim().toLowerCase();
      items.forEach((item) => {
        const cityName = item.querySelector('strong');
        const matches =
          !query || (cityName && cityName.textContent.toLowerCase().includes(query));
        item.style.display = matches ? '' : 'none';
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      filterStations();
    });

    input.addEventListener('input', throttle(filterStations, 150));
  }

  /* =============================================================
     9. INICIALIZACIÓN
     ============================================================= */
  onReady(() => {
    initNavbarScroll();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initAccordion();
    initBackToTop();
    initForms();
  });
})();
