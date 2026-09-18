/* ==========================================================================
   Coaching Central — main.js
   Header · mobile menu · scroll reveals · hero parallax · questions scene ·
   BUILD → ATTRACT → GROW cycle · sticky CTA · modal & lead forms · link routing
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     SITE CONFIG — the only place external links & integrations are set.
     Leave a value empty and the site falls back gracefully (no dead links):
       · empty checkout link → "Buy/Book" CTAs open the lead-capture modal instead
       · empty whatsapp      → WhatsApp buttons open the contact modal
       · empty formEndpoint  → submissions are stored locally & logged
       · empty login         → Login links stay hidden
     ------------------------------------------------------------------------ */
  var SITE_CONFIG = window.SITE_CONFIG = {
    whatsapp: '',                 // E.164 digits only, e.g. '919876543210'
    formEndpoint: '',             // POST target for lead forms (Exly / webhook / Formspree…)
    links: {
      launchKit: '',              // Exly checkout URL — Coaching Business Launch Kit
      toolkit: '',                // Exly checkout URL — Goal-Setting Master Toolkit
      strategySession: '',        // Exly booking URL — 1:1 Business Strategy Session
      support: '',                // Ongoing Support enquiry / booking URL
      implementation: '',         // Implementation Services enquiry URL
      login: ''                   // Exly member login URL
    }
  };

  var PRODUCT_NAMES = {
    launchKit: 'Coaching Business Launch Kit',
    toolkit: 'Goal-Setting Master Toolkit',
    strategySession: '1:1 Business Strategy Session',
    support: 'Ongoing Support',
    implementation: 'Implementation Services'
  };
  // Where "Explore …" links go when no checkout URL is configured
  var PRODUCT_PAGES = {
    launchKit: 'launch-kit.html',
    toolkit: 'goal-setting-toolkit.html',
    strategySession: 'strategy-session.html',
    support: 'programs.html#ongoing-support',
    implementation: 'support.html'
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------------
     Header: scrolled state + mobile menu
     ------------------------------------------------------------------------ */
  var header = $('#header');
  var menu = $('#menu');
  var menuToggle = $('#menuToggle');

  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  }
  menuToggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) {
    if (e.target === menu || e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------------ */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var onReveal = function (io) {
      return function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
        });
      };
    };
    var revealIO = new IntersectionObserver(function (entries) { onReveal(revealIO)(entries); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    // Clip-revealed elements are almost fully clipped, so their intersection ratio is ~0: observe with threshold 0.
    var clipIO = new IntersectionObserver(function (entries) { onReveal(clipIO)(entries); }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    revealEls.forEach(function (el) { (el.getAttribute('data-reveal') === 'clip' ? clipIO : revealIO).observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------------
     Hero parallax (transform only, rAF-throttled, disabled for reduced motion)
     ------------------------------------------------------------------------ */
  var parallaxEl = $('[data-parallax]');
  if (parallaxEl && !reduceMotion) {
    var ticking = false;
    var applyParallax = function () {
      var y = window.scrollY;
      var h = window.innerHeight;
      if (y < h) parallaxEl.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Scene 02 — questions: the one nearest the viewport centre is active
     ------------------------------------------------------------------------ */
  var questions = $$('#questionList .question');
  if (questions.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var qIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var idx = questions.indexOf(en.target);
            questions.forEach(function (q, i) {
              q.classList.toggle('is-active', i === idx);
              q.classList.toggle('is-past', i < idx);
            });
          }
        });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      questions.forEach(function (q) { qIO.observe(q); });
    } else {
      questions.forEach(function (q) { q.classList.add('is-active'); });
    }
  }

  /* ------------------------------------------------------------------------
     Scene 04 — BUILD → ATTRACT → GROW (auto-cycling, click to switch)
     ------------------------------------------------------------------------ */
  var method = $('#methodPanel');
  if (method) {
    var stages = $$('.stage', method);
    var medias = $$('[data-stage-media]', method);
    var chainEl = $('#methodChain');
    var tagEl = $('#methodStageTag');
    var STAGE_MS = 7000;
    var timer = null;
    var current = 0;
    var inView = false;
    var paused = false;

    function renderChain(stage) {
      var parts = (stage.getAttribute('data-chain') || '').split('|');
      chainEl.innerHTML = '';
      parts.forEach(function (p, i) {
        if (i) { var a = document.createElement('span'); a.className = 'chain-arrow'; a.textContent = '→'; chainEl.appendChild(a); }
        var c = document.createElement('span'); c.className = 'chip chip--glass'; c.textContent = p;
        c.style.transitionDelay = (i * 60) + 'ms';
        chainEl.appendChild(c);
      });
      // small entrance
      var chips = $$('.chip', chainEl);
      chips.forEach(function (c) { c.style.opacity = '0'; c.style.transform = 'translateY(6px)'; });
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          chips.forEach(function (c) { c.style.opacity = '1'; c.style.transform = 'none'; });
        });
      });
      tagEl.textContent = stage.getAttribute('data-tag') || '';
    }

    function setStage(i, restart) {
      current = (i + stages.length) % stages.length;
      stages.forEach(function (s, k) {
        var active = k === current;
        s.classList.toggle('is-active', active);
        $('.stage__btn', s).setAttribute('aria-expanded', String(active));
        // restart progress animation
        var bar = $('.stage__bar i', s);
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      medias.forEach(function (m, k) { m.classList.toggle('is-active', k === current); });
      renderChain(stages[current]);
      if (restart !== false) schedule();
    }

    function schedule() {
      clearTimeout(timer);
      if (reduceMotion || !inView || paused) return;
      timer = setTimeout(function () { setStage(current + 1); }, STAGE_MS);
    }

    stages.forEach(function (s, i) {
      $('.stage__btn', s).addEventListener('click', function () { setStage(i); });
    });
    method.addEventListener('mouseenter', function () { paused = true; method.classList.add('is-paused'); clearTimeout(timer); });
    method.addEventListener('mouseleave', function () { paused = false; method.classList.remove('is-paused'); schedule(); });
    method.addEventListener('focusin', function () { paused = true; method.classList.add('is-paused'); clearTimeout(timer); });
    method.addEventListener('focusout', function (e) { if (!method.contains(e.relatedTarget)) { paused = false; method.classList.remove('is-paused'); schedule(); } });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) schedule(); else clearTimeout(timer);
      }, { threshold: 0.35 }).observe(method);
    } else { inView = true; }

    renderChain(stages[0]);
    if (reduceMotion) method.classList.add('is-paused');
  }

  /* ------------------------------------------------------------------------
     Sticky mobile CTA — shows after the hero, hides on the assessment & footer
     ------------------------------------------------------------------------ */
  var sticky = $('#stickyCta');
  var hero = $('#top') || $('.page-hero');
  var assess = $('#next-step');
  var footer = $('.footer');
  if (sticky && 'IntersectionObserver' in window) {
    var heroVisible = true, assessVisible = false, footerVisible = false;
    var updateSticky = function () {
      var show = !heroVisible && !assessVisible && !footerVisible && !menu.classList.contains('is-open');
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      $('a', sticky).tabIndex = show ? 0 : -1;
    };
    if (hero) new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; updateSticky(); }, { threshold: 0.15 }).observe(hero);
    else { heroVisible = false; updateSticky(); }
    if (assess) new IntersectionObserver(function (e) { assessVisible = e[0].isIntersecting; updateSticky(); }, { threshold: 0.05 }).observe(assess);
    if (footer) new IntersectionObserver(function (e) { footerVisible = e[0].isIntersecting; updateSticky(); }, { threshold: 0.05 }).observe(footer);
  }

  /* ------------------------------------------------------------------------
     Modal — one dialog, three intents: templates / product / contact
     ------------------------------------------------------------------------ */
  var modal = $('#modal');
  var modalForm = $('#modalForm');
  var lastFocus = null;
  var MODAL_COPY = {
    templates: {
      title: 'Where should we send the free templates?',
      text: 'Five starter templates from the Coaching Business Launch Kit — straight to your inbox.',
      submit: 'Send Me the Templates',
      successTitle: 'Done — check your inbox.',
      successText: 'Your templates are on their way. While you wait, take the two-minute next-step check.',
      interest: false, message: false
    },
    product: {
      title: 'Tell us what you’re interested in.',
      text: 'Leave your details and we’ll send you everything you need to get started — no pressure, no spam.',
      submit: 'Send Me the Details',
      successTitle: 'Got it — we’ll be in touch.',
      successText: 'We’ll send the details shortly. In the meantime, the next-step check takes two minutes.',
      interest: true, message: false
    },
    contact: {
      title: 'Let’s talk about your coaching business.',
      text: 'Tell us a little about where you are. We’ll reply personally.',
      submit: 'Send Message',
      successTitle: 'Message received.',
      successText: 'Thanks — we’ll get back to you personally, usually within a working day or two.',
      interest: true, message: true
    }
  };

  function openModal(kind, presetInterest) {
    var copy = MODAL_COPY[kind] || MODAL_COPY.contact;
    lastFocus = document.activeElement;
    modal.classList.remove('is-success');
    modalForm.reset();
    $$('.field', modalForm).forEach(function (f) { f.classList.remove('has-error'); });
    $('#modalTitle').textContent = copy.title;
    $('#modalText').textContent = copy.text;
    $('#modalSubmit').firstChild.textContent = copy.submit + ' ';
    $('#modalSuccessTitle').textContent = copy.successTitle;
    $('#modalSuccessText').textContent = copy.successText;
    $('#modalSource').value = kind;
    $('#mInterestField').hidden = !copy.interest;
    $('#mMessageField').hidden = !copy.message;
    if (presetInterest) $('#mInterest').value = presetInterest;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(function () { $('#mName').focus(); }, 60);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.CCModal = { open: openModal, close: closeModal };

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal-open]');
    if (opener) { e.preventDefault(); openModal(opener.getAttribute('data-modal-open')); return; }
    var closer = e.target.closest('[data-modal-close]');
    if (closer) { if (closer.getAttribute('href') === null) e.preventDefault(); closeModal(); return; }
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !modal.classList.contains('is-open')) return;
    closeModal();
  });
  // simple focus trap
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])', modal)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ------------------------------------------------------------------------
     Lead submission (shared by modal + assessment)
     ------------------------------------------------------------------------ */
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function submitLead(data) {
    data.page = location.href;
    data.submittedAt = new Date().toISOString();
    try {
      var all = JSON.parse(localStorage.getItem('cc_leads') || '[]');
      all.push(data);
      localStorage.setItem('cc_leads', JSON.stringify(all.slice(-20)));
    } catch (err) { /* storage unavailable */ }
    if (window.dataLayer) window.dataLayer.push({ event: 'lead_submit', source: data.source });
    if (!SITE_CONFIG.formEndpoint) {
      if (window.console) console.info('[Coaching Central] Lead captured (no formEndpoint configured):', data);
      return Promise.resolve();
    }
    return fetch(SITE_CONFIG.formEndpoint, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(function () { /* never block the UX on network */ });
  }
  window.CCLeads = { submit: submitLead, validEmail: validEmail };

  modalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    var nameF = $('#mName'), emailF = $('#mEmail');
    var nameField = nameF.closest('.field'), emailField = emailF.closest('.field');
    nameField.classList.toggle('has-error', !nameF.value.trim()); nameF.setAttribute('aria-invalid', String(!nameF.value.trim()));
    emailField.classList.toggle('has-error', !validEmail(emailF.value.trim())); emailF.setAttribute('aria-invalid', String(!validEmail(emailF.value.trim())));
    ok = nameF.value.trim() && validEmail(emailF.value.trim());
    if (!ok) { (nameF.value.trim() ? emailF : nameF).focus(); return; }
    var fd = new FormData(modalForm), data = {};
    fd.forEach(function (v, k) { data[k] = v; });
    var btn = $('#modalSubmit'); btn.setAttribute('aria-disabled', 'true');
    submitLead(data).then(function () {
      btn.removeAttribute('aria-disabled');
      modal.classList.add('is-success');
      $('.modal__success .btn', modal).focus();
    });
  });

  /* ------------------------------------------------------------------------
     Link routing — products, WhatsApp, login (driven by SITE_CONFIG)
     ------------------------------------------------------------------------ */
  // "Explore …" links → the product's page (static, crawlable)
  $$('[data-product]').forEach(function (a) {
    var key = a.getAttribute('data-product');
    if (PRODUCT_PAGES[key] && (!a.getAttribute('href') || a.getAttribute('href') === '#')) a.href = PRODUCT_PAGES[key];
  });
  // "Buy / Book …" CTAs → Exly checkout when configured, otherwise the interest modal
  $$('[data-checkout]').forEach(function (a) {
    var key = a.getAttribute('data-checkout');
    var url = SITE_CONFIG.links[key];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    else {
      a.href = '#interest-' + key;
      a.addEventListener('click', function (e) { e.preventDefault(); openModal('product', PRODUCT_NAMES[key]); });
    }
  });

  $$('[data-whatsapp]').forEach(function (a) {
    var msg = a.getAttribute('data-whatsapp') || '';
    if (SITE_CONFIG.whatsapp) {
      a.href = 'https://wa.me/' + SITE_CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
      a.target = '_blank'; a.rel = 'noopener';
    } else {
      a.href = '#contact';
      a.addEventListener('click', function (e) { e.preventDefault(); openModal('contact'); });
    }
  });

  $$('[data-config-link]').forEach(function (a) {
    var key = a.getAttribute('data-config-link');
    var url = SITE_CONFIG.links[key];
    if (url) { a.href = url; a.hidden = false; }
  });

  /* ------------------------------------------------------------------------
     Inline contact form (contact.html)
     ------------------------------------------------------------------------ */
  var contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameF = $('#cName'), emailF = $('#cEmail');
      var nameOk = !!nameF.value.trim(), emailOk = validEmail(emailF.value.trim());
      nameF.closest('.field').classList.toggle('has-error', !nameOk); nameF.setAttribute('aria-invalid', String(!nameOk));
      emailF.closest('.field').classList.toggle('has-error', !emailOk); emailF.setAttribute('aria-invalid', String(!emailOk));
      if (!nameOk || !emailOk) { (nameOk ? emailF : nameF).focus(); return; }
      var fd = new FormData(contactForm), data = { source: 'contact-page' };
      fd.forEach(function (v, k) { data[k] = v; });
      var btn = $('button[type="submit"]', contactForm); btn.setAttribute('aria-disabled', 'true');
      submitLead(data).then(function () {
        contactForm.closest('.contact-card').classList.add('is-success');
        $('.form-success', contactForm.closest('.contact-card')).focus();
      });
    });
  }

  /* ------------------------------------------------------------------------
     Misc
     ------------------------------------------------------------------------ */
  var yearEl = $('#year'); if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Close mobile menu when resizing to desktop
  window.addEventListener('resize', function () { if (window.innerWidth >= 1100 && menu.classList.contains('is-open')) setMenu(false); });
})();
