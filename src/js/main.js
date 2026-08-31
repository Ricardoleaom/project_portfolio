/**
 * Ricardo Leão - Portfolio
 * Vanilla JS: mobile nav, scroll-driven header state, scroll-reveal
 * and active-link tracking. All scroll-position work uses
 * IntersectionObserver, never a `scroll` event listener.
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ---------------------------------------------------------------
   * Footer year
   * ------------------------------------------------------------- */
  var yearEl = document.getElementById('ano-atual');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------
   * Mobile navigation toggle
   * ------------------------------------------------------------- */
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav-principal');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelector('i').className = 'ph ph-list';
    document.body.style.overflow = '';
  }

  function openNav() {
    if (!nav || !navToggle) return;
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.querySelector('i').className = 'ph ph-x';
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) {
        closeNav();
      }
    });
  }

  /* ---------------------------------------------------------------
   * Header background state on scroll (no scroll listener:
   * a 1px sentinel at the top of the page is observed instead)
   * ------------------------------------------------------------- */
  var header = document.querySelector('[data-header]');
  var sentinel = document.querySelector('.scroll-sentinel');

  if (header && sentinel && 'IntersectionObserver' in window) {
    var headerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          header.classList.toggle('is-scrolled', !entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    headerObserver.observe(sentinel);
  }

  /* ---------------------------------------------------------------
   * Scroll-reveal: fade + rise elements into view once
   * ------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -8px 0px' }
    );

    revealEls.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 4, 3) * 0.08 + 's';
      revealObserver.observe(el);
    });

    /* Hero CTAs can sit near the fold; force-visible on load if already in view */
    requestAnimationFrame(function () {
      revealEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    });
  }

  /* ---------------------------------------------------------------
   * Lightbox for case-study screenshots
   * ------------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;

  function closeLightbox() {
    if (!lightbox || !lightbox.open) return;
    lightbox.close();
    if (lightboxImg) {
      lightboxImg.removeAttribute('src');
      lightboxImg.alt = '';
    }
  }

  if (lightbox && lightboxImg) {
    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var src = trigger.getAttribute('data-lightbox');
        var alt =
          trigger.getAttribute('data-lightbox-alt') ||
          (trigger.querySelector('img') && trigger.querySelector('img').alt) ||
          '';
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        if (typeof lightbox.showModal === 'function') {
          lightbox.showModal();
        }
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (btn) {
      btn.addEventListener('click', closeLightbox);
    });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  /* ---------------------------------------------------------------
   * Active nav link tracking based on section visibility
   * ------------------------------------------------------------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav__link');
  var isCasePage = document.body.getAttribute('data-page') === 'case';

  if (
    !isCasePage &&
    sections.length &&
    navLinks.length &&
    'IntersectionObserver' in window
  ) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var matches = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', matches);
            if (matches) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
})();
