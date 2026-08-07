/* =========================================================
   Ozofryn v5 — restrained interaction layer
   Vanilla JS, no dependencies. Subtle transitions only —
   no counters, no parallax, no decorative motion.
   ========================================================= */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const setScrolled = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    const toggle = nav.querySelector('.nav__toggle');
    const links = nav.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.querySelectorAll('a:not([data-sub-toggle])').forEach(a =>
        a.addEventListener('click', () => {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        })
      );
    }

    nav.querySelectorAll('.nav__has-sub > a').forEach(a => {
      a.addEventListener('click', e => {
        if (window.innerWidth < 960) {
          e.preventDefault();
          a.parentElement.classList.toggle('is-open');
        }
      });
    });
  }

  function initReveals() {
    if (prefersReduced) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  }

  function initForms() {
    document.querySelectorAll('form.enquiry[data-endpoint]').forEach(form => {
      const btn = form.querySelector('button[type="submit"]');
      const btnLabel = btn ? btn.textContent : '';

      form.addEventListener('submit', async e => {
        e.preventDefault();
        form.classList.remove('is-error');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        try {
          const res = await fetch(form.dataset.endpoint, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: new FormData(form)
          });
          if (!res.ok) throw new Error('Non-2xx response');

          // FormSubmit returns HTTP 200 even when it rejects a submission
          // (e.g. success:"false" with an explanatory message) — the real
          // result lives in the JSON body, not the HTTP status.
          const data = await res.json().catch(() => null);
          if (data && String(data.success) === 'false') {
            throw new Error(data.message || 'Submission rejected');
          }

          form.classList.add('is-sent');
          form.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
        } catch (err) {
          form.classList.add('is-error');
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        }
      });
    });
  }

  function initYear() {
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initReveals();
    initForms();
    initYear();
    document.documentElement.classList.add('js-ready');
  });
})();
