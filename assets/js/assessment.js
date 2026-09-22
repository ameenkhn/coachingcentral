/* ==========================================================================
   Coaching Central — assessment.js
   "Find Your Next Step" — a popup check: 4 questions → one of three broad
   need states (Get Clear · Get Moving · Get Growing) → a recommended next
   action + three routes (do it yourself / work it out with us / let us build it).
   No roadmap, no lead gate: the result shows straight away; emailing it is optional.
   Answers persist in sessionStorage so the popup resumes where the visitor left off.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var viewport = $('#quizViewport');
  if (!viewport) return;

  var STORE_KEY = 'cc_assessment';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Questions — Q2 mirrors the five questions on the homepage
     ------------------------------------------------------------------------ */
  var QUESTIONS = [
    { key: 'stage', q: 'Where are you right now?', options: [
      'Just completed certification',
      'Started coaching, still figuring things out',
      'Have clients, want to build more seriously',
      'Been coaching for a while, want to grow'
    ] },
    { key: 'question', q: 'What’s the biggest question on your mind?', options: [
      'Who do I actually want to help?',
      'What should I be known for?',
      'Where do I find my people?',
      'What should I spend money on?',
      'What should I actually do first?',
      'How do I grow what’s already working?'
    ] },
    { key: 'clarity', q: 'How clear are you on who you help and what you’re known for?', options: [
      'Not clear yet',
      'Roughly — it’s still broad',
      'Clear — I need to get in front of people',
      'Clear and working — I want to scale it'
    ] },
    { key: 'help', q: 'How much help would you like?', options: [
      'I’ll do it myself, with the right tools',
      'I’d like to work it out with someone',
      'I’d rather have help building it'
    ] }
  ];

  /* ------------------------------------------------------------------------
     Three broad outcomes — a short read + one recommended next action
     ------------------------------------------------------------------------ */
  var RESULTS = {
    clear: {
      label: 'Get Clear',
      title: 'Get clear before you get visible.',
      diag: 'Right now the pressure is to be visible — a website, Instagram, offers, ads. But visibility without clarity just makes the confusion louder. Before any of that, you need one clear decision about who you help and what you help them with.',
      action: 'Decide who you’re helping first — not forever, just first — and write one sentence you can say out loud about what you do for them.',
      stage: 'Build',
      diy: 'launchKit'
    },
    moving: {
      label: 'Get Moving',
      title: 'Get in front of the people you want to help.',
      diag: 'You know roughly who you’re for. What’s missing is a steady way for them to find you — one platform, a rhythm you can keep up on a bad week, and a simple way for someone to start working with you. That’s a systems problem, not a talent problem.',
      action: 'Pick the one platform where your people already are, and decide the one clear way a potential client starts with you — a call, a session, a starter offer.',
      stage: 'Attract',
      diy: 'launchKit'
    },
    growing: {
      label: 'Get Growing',
      title: 'Grow what’s already working.',
      diag: 'You’ve been at this for a while and the basics are in place. Growth now comes from looking honestly at what actually brings clients, tightening the offer, and putting your energy where the evidence already points — often that means going back into Build with sharper positioning.',
      action: 'Work out where your last five clients really came from, and double down on that channel before adding a new one.',
      stage: 'Grow',
      diy: 'toolkit'
    }
  };

  var ROUTES = {
    diy: { label: 'Do it yourself', name: 'Coaching Kits', page: 'coaching-kits.html', cta: 'Explore Coaching Kits',
      desc: { launchKit: 'Start with the Coaching Business Launch Kit — practical templates, workflows and checkpoints, at your own pace.',
              toolkit: 'Practical kits and templates — including the Goal-Setting Master Toolkit for sharper client work.' } },
    withUs: { label: 'Work it out with us', name: '1:1 Business Strategy Session', page: 'strategy-session.html', cta: 'Book a Strategy Session',
      desc: 'One focused session on where you are, what to do next and how much help you want. From ₹1,500.' },
    build: { label: 'Let us help build it', name: 'Services', page: 'services.html', cta: 'See how we can help',
      desc: 'Positioning, presence, content, leads, technology and marketing — built with you or for you.' }
  };
  var HELP_TO_ROUTE = ['diy', 'withUs', 'build'];
  var STAGE_LABEL = ['Just certified', 'Starting out', 'Building seriously', 'Ready to grow'];

  /* ------------------------------------------------------------------------
     Result logic — three broad need states only
     ------------------------------------------------------------------------ */
  function computeResult(a) {
    var key;
    if (a.clarity === 3 || (a.question === 5 && a.clarity >= 2)) key = 'growing';
    else if (a.clarity <= 1 || a.question === 0 || a.question === 1) key = 'clear';
    else if (a.question === 4 && a.stage <= 1) key = 'clear';
    else key = 'moving';
    var r = RESULTS[key];
    return {
      key: key, label: r.label, title: r.title, diag: r.diag, action: r.action, stage: r.stage,
      diyDesc: ROUTES.diy.desc[r.diy],
      recommend: HELP_TO_ROUTE[a.help] || 'withUs'
    };
  }
  window.CCAssessment = { compute: computeResult };

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */
  var state = { step: 0, answers: {} };
  try {
    var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    if (saved && saved.answers) state.answers = saved.answers;
  } catch (e) { /* ignore */ }
  function persist() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ answers: state.answers })); } catch (e) { /* ignore */ }
  }

  var countEl = $('#quizCount');
  var progressEl = $('#quizProgress');
  var TOTAL = QUESTIONS.length;      // steps 0..3 questions, 4 result

  function icon(id) { return '<svg class="ico" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ------------------------------------------------------------------------
     Rendering
     ------------------------------------------------------------------------ */
  function renderProgress() {
    var s = state.step;
    countEl.textContent = s < TOTAL ? 'Question ' + (s + 1) + ' of ' + TOTAL : 'Your next step';
    $$('i', progressEl).forEach(function (bar, i) {
      bar.classList.toggle('is-done', i < s);
      bar.classList.toggle('is-current', i === s);
    });
  }

  function renderQuestion(i) {
    var q = QUESTIONS[i];
    var sel = state.answers[q.key];
    var html = '<p class="quiz__q" id="quiz-q-' + i + '">' + esc(q.q) + '</p>';
    if (i === 0) html += '<p class="quiz__lead">Two minutes, four questions, no right or wrong answers — pick what’s closest.</p>';
    html += '<div class="opts' + (q.options.length >= 6 ? ' opts--2' : '') + '" role="radiogroup" aria-labelledby="quiz-q-' + i + '">';
    q.options.forEach(function (o, k) {
      html += '<button type="button" class="opt" role="radio" aria-checked="' + (sel === k ? 'true' : 'false') + '" data-value="' + k + '"><span class="opt__radio" aria-hidden="true"></span><span>' + esc(o) + '</span></button>';
    });
    html += '</div>';
    html += '<div class="quiz__nav">' +
      '<button type="button" class="quiz__back" data-action="back"' + (i === 0 ? ' hidden' : '') + '>' + icon('i-arrow-left') + ' Back</button>' +
      '<button type="button" class="btn btn--primary" data-action="next"' + (sel === undefined ? ' aria-disabled="true"' : '') + '>' + (i === TOTAL - 1 ? 'Show My Next Step' : 'Continue') + ' ' + icon('i-arrow') + '</button>' +
      '</div>';
    return html;
  }

  function pathCard(routeKey, r, recommended) {
    var route = ROUTES[routeKey];
    var desc = routeKey === 'diy' ? r.diyDesc : route.desc;
    return '<div class="path' + (recommended ? ' is-recommended' : '') + '">' +
      '<p class="path__label">' + esc(route.label) + (recommended ? '<span class="chip chip--teal">Recommended</span>' : '') + '</p>' +
      '<p class="path__name">' + esc(route.name) + '</p>' +
      '<p class="path__desc">' + esc(desc) + '</p>' +
      '<a class="btn ' + (recommended ? 'btn--primary' : 'btn--ghost') + ' btn--sm" href="' + esc(route.page) + '">' + esc(route.cta) + ' ' + icon('i-arrow') + '</a>' +
    '</div>';
  }

  function renderResult() {
    var a = state.answers;
    var r = computeResult(a);
    return '<div class="result">' +
      '<p class="result__kicker"><span class="chip chip--teal">' + esc(r.label) + '</span><span class="chip">' + esc(STAGE_LABEL[a.stage] || 'Your stage') + '</span><span class="chip chip--outline">Stage: ' + esc(r.stage) + '</span></p>' +
      '<h3 class="result__title">' + esc(r.title) + '</h3>' +
      '<p class="result__diag">' + esc(r.diag) + '</p>' +
      '<div class="result__action"><b>Your next step</b><p>' + esc(r.action) + '</p></div>' +
      '<p class="eyebrow" style="margin-top:.5rem">Three ways to get there — you choose</p>' +
      '<div class="result__paths result__paths--3">' +
        pathCard('diy', r, r.recommend === 'diy') +
        pathCard('withUs', r, r.recommend === 'withUs') +
        pathCard('build', r, r.recommend === 'build') +
      '</div>' +
      '<div class="result__send" id="resultSend">' +
        '<p class="result__send-title">Want this by email? Optional.</p>' +
        '<form id="resultForm" novalidate>' +
          '<div class="field"><label class="visually-hidden" for="rName">Name</label><input id="rName" name="name" type="text" autocomplete="name" placeholder="Name"></div>' +
          '<div class="field"><label class="visually-hidden" for="rEmail">Email</label><input id="rEmail" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email" required><p class="field__error">Please enter a valid email address.</p></div>' +
          '<button type="submit" class="btn btn--teal btn--sm">Send it ' + icon('i-arrow') + '</button>' +
          '<p class="form-note">' + icon('i-shield') + '<span>We’ll only use your email to send this result and relevant Coaching Central resources.</span></p>' +
        '</form>' +
        '<p class="result__sent">' + icon('i-check') + ' Sent — check your inbox.</p>' +
      '</div>' +
      '<div class="result__foot"><span>Not quite right? Answers are only a starting point.</span><button type="button" data-action="retake">Retake the check</button></div>' +
    '</div>';
  }

  function render(direction) {
    var s = state.step;
    var html = s < TOTAL ? renderQuestion(s) : renderResult();
    var old = $('.quiz__step.is-active', viewport);
    var next = document.createElement('div');
    next.className = 'quiz__step';
    next.innerHTML = html;
    var mount = function () {
      if (old) old.remove();
      viewport.appendChild(next);
      next.classList.add('is-active');
      renderProgress();
      var dialog = viewport.closest('.modal__dialog');
      if (dialog) dialog.scrollTop = 0;
      var focusTarget = $('.opt[aria-checked="true"]', next) || $('.result__title', next) || $('.opt, input, .btn', next);
      if (focusTarget && direction !== 'init') {
        if (!focusTarget.hasAttribute('tabindex') && !/^(button|input|a)$/i.test(focusTarget.tagName)) focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus({ preventScroll: true });
      }
    };
    if (old && !reduceMotion && direction !== 'init') {
      old.classList.add('is-leaving');
      setTimeout(mount, 260);
    } else mount();
  }

  /* ------------------------------------------------------------------------
     Navigation
     ------------------------------------------------------------------------ */
  function go(step, direction) {
    state.step = Math.max(0, Math.min(TOTAL, step));
    render(direction || 'next');
  }

  viewport.addEventListener('click', function (e) {
    var opt = e.target.closest('.opt');
    if (opt) {
      var q = QUESTIONS[state.step];
      state.answers[q.key] = Number(opt.getAttribute('data-value'));
      persist();
      $$('.opt', opt.parentNode).forEach(function (o) { o.setAttribute('aria-checked', o === opt ? 'true' : 'false'); });
      var nextBtn = $('[data-action="next"]', viewport);
      if (nextBtn) nextBtn.removeAttribute('aria-disabled');
      // auto-advance shortly after selection for flow
      clearTimeout(viewport._adv);
      viewport._adv = setTimeout(function () {
        if (state.step === TOTAL - 1) submitResult(); else go(state.step + 1);
      }, reduceMotion ? 0 : 380);
      return;
    }
    var action = e.target.closest('[data-action]');
    if (!action) return;
    var act = action.getAttribute('data-action');
    clearTimeout(viewport._adv);
    if (act === 'back') go(state.step - 1, 'back');
    if (act === 'next' && action.getAttribute('aria-disabled') !== 'true') {
      if (state.step === TOTAL - 1) submitResult(); else go(state.step + 1);
    }
    if (act === 'retake') { state.answers = {}; persist(); go(0, 'back'); }
  });

  // keyboard: arrow keys move between options in a radiogroup
  viewport.addEventListener('keydown', function (e) {
    var opt = e.target.closest('.opt'); if (!opt) return;
    var opts = $$('.opt', opt.parentNode); var i = opts.indexOf(opt);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); opts[(i + 1) % opts.length].focus(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length].focus(); }
  });

  function answersPayload() {
    var a = state.answers;
    return {
      stage: QUESTIONS[0].options[a.stage],
      biggestQuestion: QUESTIONS[1].options[a.question],
      clarity: QUESTIONS[2].options[a.clarity],
      helpLevel: QUESTIONS[3].options[a.help]
    };
  }

  // Show the result (no lead gate); log the completed check for analytics
  function submitResult() {
    var r = computeResult(state.answers);
    if (window.dataLayer) window.dataLayer.push({ event: 'assessment_complete', result: r.key, recommended: r.recommend });
    go(TOTAL);
  }

  // Optional: email me this result
  viewport.addEventListener('submit', function (e) {
    var form = e.target.closest('#resultForm'); if (!form) return;
    e.preventDefault();
    var emailF = $('#rEmail', form), nameF = $('#rName', form);
    var emailOk = window.CCLeads ? window.CCLeads.validEmail(emailF.value.trim()) : /\S+@\S+\.\S+/.test(emailF.value);
    emailF.closest('.field').classList.toggle('has-error', !emailOk); emailF.setAttribute('aria-invalid', String(!emailOk));
    if (!emailOk) { emailF.focus(); return; }
    var r = computeResult(state.answers);
    var payload = answersPayload();
    payload.source = 'assessment';
    payload.name = nameF.value.trim(); payload.email = emailF.value.trim();
    payload.result = r.label; payload.resultKey = r.key; payload.nextStep = r.action;
    payload.recommended = ROUTES[r.recommend].name;
    var btn = $('button[type="submit"]', form); btn.setAttribute('aria-disabled', 'true');
    (window.CCLeads ? window.CCLeads.submit(payload) : Promise.resolve()).then(function () {
      var box = $('#resultSend', viewport);
      box.classList.add('is-sent');
      $('.result__sent', box).setAttribute('tabindex', '-1');
      $('.result__sent', box).focus();
    });
  });

  /* ------------------------------------------------------------------------
     Opening the popup: resume at the first unanswered question (or the result)
     ------------------------------------------------------------------------ */
  function resume() {
    var first = TOTAL;
    for (var i = 0; i < TOTAL; i++) { if (state.answers[QUESTIONS[i].key] === undefined) { first = i; break; } }
    state.step = first;
    render('init');
    setTimeout(function () {
      var target = $('.opt[aria-checked="true"]', viewport) || $('.opt', viewport) || $('.result__title', viewport);
      if (target) { if (!/^(button|input|a)$/i.test(target.tagName)) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    }, 80);
  }
  document.addEventListener('cc:assess-open', resume);

  // Pre-render so the first paint of the popup is instant
  (function () {
    var first = 0;
    for (var i = 0; i < TOTAL; i++) { if (state.answers[QUESTIONS[i].key] === undefined) { first = i; break; } first = TOTAL; }
    state.step = first;
    render('init');
  })();
})();
