/* =========================================================
   Ozofryn — motion + interaction layer  v2
   Pure vanilla JS · no external dependencies
   ========================================================= */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer  = window.matchMedia('(pointer: fine)').matches;
  const isWide         = () => window.innerWidth >= 960;

  /* ---------------------------------------------------------
     1. Smooth scroll — CSS-driven, native momentum preserved
        We rely on html { scroll-behavior: smooth } and
        add passive scroll listeners only. No wheel hijack.
     --------------------------------------------------------- */
  function initSmoothScroll() {
    /* Just ensure scroll-behavior is set */
    document.documentElement.style.scrollBehavior = prefersReduced ? 'auto' : 'smooth';

    /* Anchor clicks with offset compensation for sticky nav */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h')) || 76;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------------------------------------------------
     2. Split-text — wrap each word in reveal spans
     --------------------------------------------------------- */
  function initSplitText() {
    document.querySelectorAll('[data-split]').forEach(node => {
      if (node.dataset.splitDone) return;
      const words = node.textContent.trim().split(/\s+/);
      node.textContent = '';
      words.forEach((w, i) => {
        const wrap  = document.createElement('span');
        wrap.className = 'word';
        wrap.style.setProperty('--i', i);
        const inner = document.createElement('span');
        inner.className = 'word__in';
        inner.textContent = w;
        wrap.appendChild(inner);
        node.appendChild(wrap);
        if (i < words.length - 1) node.appendChild(document.createTextNode(' '));
      });
      node.dataset.splitDone = '1';
    });
  }

  /* ---------------------------------------------------------
     3. Reveal on scroll — IntersectionObserver
     --------------------------------------------------------- */
  function initReveals() {
    if (prefersReduced) {
      document.querySelectorAll('[data-reveal], [data-split]')
        .forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('[data-reveal], [data-split]').forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     4. Custom cursor (desktop / fine pointer only)
     --------------------------------------------------------- */
  function initCursor() {
    if (prefersReduced || !isFinePointer || !isWide()) return;

    const dot  = Object.assign(document.createElement('div'), { className: 'cursor-dot'  });
    const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
    document.body.append(dot, ring);
    document.documentElement.classList.add('has-custom-cursor');

    let mx = -200, my = -200, rx = -200, ry = -200;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    (function raf() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      dot.style.transform  = `translate3d(${mx}px,${my}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(raf);
    })();

    const sel = 'a, button, [data-magnetic], input, select, textarea, [role="button"], .tile, .product-card, .stat, .why-tile';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(sel)) document.documentElement.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(sel)) document.documentElement.classList.remove('cursor-hover');
    });
  }

  /* ---------------------------------------------------------
     5. Magnetic buttons — gentle pull effect
     --------------------------------------------------------- */
  function initMagnetic() {
    if (prefersReduced || !isFinePointer || !isWide()) return;
    const STRENGTH = 0.26;

    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const inner = el.querySelector('.mag__in') || el;

      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width  / 2);
        const y = e.clientY - (r.top  + r.height / 2);
        el.style.transform    = `translate(${x * STRENGTH}px, ${y * STRENGTH}px)`;
        if (inner !== el) inner.style.transform = `translate(${x * STRENGTH * .45}px, ${y * STRENGTH * .45}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        if (inner !== el) inner.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     6. Count-up numbers
     --------------------------------------------------------- */
  function initCounters() {
    const nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el       = entry.target;
        const end      = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals ?? '0', 10);
        const duration = parseInt(el.dataset.duration   ?? '1400', 10);
        const t0       = performance.now();

        (function tick(now) {
          const p     = Math.min(1, (now - t0) / duration);
          const eased = 1 - (1 - p) ** 3;
          el.textContent = (end * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = end.toFixed(decimals);
        })(t0);

        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    nodes.forEach(n => io.observe(n));
  }

  /* ---------------------------------------------------------
     7. Navigation — scroll state + mobile menu
     --------------------------------------------------------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    /* Scroll-aware background */
    let lastScroll = 0;
    const setScrolled = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 24);
      nav.classList.toggle('is-hidden', y > lastScroll + 4 && y > 120);
      nav.classList.remove('is-hidden'); // re-enable if needed; keep simple
      lastScroll = y;
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    /* Mobile hamburger */
    const toggle = nav.querySelector('.nav__toggle');
    const links  = nav.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }));
    }

    /* Mobile sub-menu toggle */
    nav.querySelectorAll('.nav__has-sub > a').forEach(a => {
      a.addEventListener('click', e => {
        if (window.innerWidth < 960) {
          e.preventDefault();
          a.parentElement.classList.toggle('is-open');
        }
      });
    });
  }

  /* ---------------------------------------------------------
     8. Mouse parallax — hero layers only
     --------------------------------------------------------- */
  function initParallax() {
    if (prefersReduced || !isFinePointer) return;

    document.querySelectorAll('[data-mouse-parallax]').forEach(zone => {
      const layers = zone.querySelectorAll('[data-depth]');
      if (!layers.length) return;

      zone.addEventListener('mousemove', e => {
        const r = zone.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width  / 2)) / r.width;
        const y = (e.clientY - (r.top  + r.height / 2)) / r.height;
        layers.forEach(l => {
          const d = parseFloat(l.dataset.depth) || 0.1;
          l.style.transform = `translate(${x * d * 36}px, ${y * d * 36}px)`;
        });
      }, { passive: true });

      zone.addEventListener('mouseleave', () => {
        layers.forEach(l => { l.style.transform = ''; });
      });
    });
  }

  /* ---------------------------------------------------------
     9. Marquee — clone track so it loops seamlessly
     --------------------------------------------------------- */
  function initMarquee() {
    document.querySelectorAll('.marquee').forEach(mq => {
      const track = mq.querySelector('.marquee__track');
      if (!track || track.dataset.cloned) return;
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      mq.appendChild(clone);
      track.dataset.cloned = '1';
    });
  }

  /* ---------------------------------------------------------
     10. Scroll-progress bar
     --------------------------------------------------------- */
  function initProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', h > 0 ? (window.scrollY / h * 100) + '%' : '0%');
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     11. Year stamp
     --------------------------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------------------------------------------------
     12. Floating label forms
     --------------------------------------------------------- */
  function initForms() {
    document.querySelectorAll('.field input, .field textarea, .field select').forEach(inp => {
      const sync = () => inp.closest('.field').classList.toggle('has-value', !!inp.value);
      ['input', 'change', 'blur'].forEach(ev => inp.addEventListener(ev, sync));
      sync();
    });

    document.querySelectorAll('form[data-demo]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          const span = btn.querySelector('span') || btn;
          span.textContent = 'Received — we will be in touch.';
        }
        form.classList.add('is-sent');
      });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initSplitText();
    initReveals();
    initCursor();
    initMagnetic();
    initCounters();
    initNav();
    initParallax();
    initMarquee();
    initProgress();
    initYear();
    initForms();
    initSmoothScroll();
    document.documentElement.classList.add('js-ready');
  });
})();
