/* ==========================================================================
   Coaching Central — assessment.js
   "What's your next step?" — 4 questions → lead capture → mini-diagnosis.
   Answers are remembered (sessionStorage) and a result path is computed
   from the combination of stage, biggest question, clarity and help level.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var viewport = $('#quizViewport');
  var STORE_KEY = 'cc_assessment';

  if (!viewport) {
    // Pages without the quiz (e.g. the homepage): quick-start cards remember Q1 and
    // continue on start-here.html#next-step, which resumes at Q2.
    $$('[data-preselect-stage]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var stage = Number(btn.getAttribute('data-preselect-stage'));
        try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ answers: { stage: stage } })); } catch (e) { /* ignore */ }
        if (window.dataLayer) window.dataLayer.push({ event: 'assessment_quickstart', stage: stage });
      });
    });
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Questions (copy from the brief)
     ------------------------------------------------------------------------ */
  var QUESTIONS = [
    { key: 'stage', q: 'Where are you right now?', options: [
      'Just completed certification',
      'Started coaching but still figuring things out',
      'Have clients but want to build more seriously',
      'Been coaching for a while and want to grow'
    ] },
    { key: 'question', q: 'What’s the biggest question on your mind?', options: [
      'Who should I actually coach?',
      'What should I be known for?',
      'How do I present myself in the market?',
      'Where should I find my audience?',
      'How do I start getting leads / clients?',
      'I know what I need to do — I just need help doing it.',
      'I need better tools for my coaching practice.'
    ] },
    { key: 'clarity', q: 'How clear are you about your niche and positioning?', options: [
      'No idea yet',
      'I have an area in mind, but it’s broad',
      'I know my niche, but I’m unsure how to position it',
      'Quite clear — I mainly need execution'
    ] },
    { key: 'help', q: 'How much help would you like?', options: [
      'I’ll figure it out myself',
      'I’d like someone to guide me',
      'I’d like ongoing support',
      'I’d rather have someone handle implementation'
    ] }
  ];

  /* ------------------------------------------------------------------------
     Result paths — mini-diagnosis + 3–4 actionable steps
     ------------------------------------------------------------------------ */
  var RESULTS = {
    structure: {
      title: 'Start With Structure, Not Pressure.',
      diag: 'You’ve just finished training, and the temptation is to do everything at once — website, Instagram, offers, ads. You don’t need all of that yet. What you need is a simple structure for your practice, and one clear decision about who you want to help first.',
      steps: [
        ['Set up the basics of your practice', 'Session prep, onboarding, follow-ups and assignments — so every client experience feels professional from day one.'],
        ['Pick a starting audience', 'Not forever. Just the group you’re most drawn to helping right now.'],
        ['Name the problem you solve for them', 'One sentence. If you can’t say it simply yet, that’s your next piece of work.'],
        ['Choose one place to show up', 'One platform, done consistently, beats five done occasionally.']
      ],
      diy: 'launchKit', withUs: 'strategySession'
    },
    clarity: {
      title: 'Get Clear Before You Get Visible.',
      diag: 'Right now the pressure is to be visible — but visibility without clarity just makes the confusion louder. Your next step isn’t more content or a better website. It’s deciding who you serve, what you help them with, and how you want to be known for it.',
      steps: [
        ['Narrow your audience', 'Move from “anyone who needs coaching” to a specific person with a specific situation.'],
        ['Define the problem', 'What are they stuck on — in their words, not coaching language?'],
        ['Build your positioning', 'Turn niche + problem + your strengths into a one-line statement you can say out loud.'],
        ['Decide where to focus', 'Pick the one platform or channel where that person already spends time.']
      ],
      diy: 'launchKit', withUs: 'strategySession'
    },
    position: {
      title: 'Sharpen How You Present Yourself.',
      diag: 'You know roughly who you help — the gap is in how you say it. When the message is fuzzy, good coaches get overlooked. Your next step is turning what you know into positioning that’s easy to understand, easy to remember and easy to refer.',
      steps: [
        ['Write a one-line positioning statement', 'Who you help, what with, and what changes for them.'],
        ['Say what you help with, not what you are', '“I help new managers stop avoiding hard conversations” beats “I’m an ICF-certified coach.”'],
        ['Pick the proof you can show', 'Your background, your approach, a real story — whatever makes the claim believable.'],
        ['Align every profile to one message', 'Instagram, LinkedIn, website: same person, same promise.']
      ],
      diy: 'launchKit', withUs: 'strategySession'
    },
    visible: {
      title: 'Get Visible Where Your People Are.',
      diag: 'Your positioning is in reasonable shape — what’s missing is a steady way for the right people to find you. That’s not a talent problem, it’s a systems problem: a platform, a rhythm and a simple way for someone to start working with you.',
      steps: [
        ['Choose one primary platform', 'Where does your audience already look for help? Start there, and only there.'],
        ['Decide what you’ll be known for saying', 'Three to five recurring themes you can talk about for months without running dry.'],
        ['Build a simple content rhythm', 'A cadence you can sustain on a bad week — consistency matters more than volume.'],
        ['Create one clear way to start', 'A single, obvious first step for a potential client: a call, a session, a starter offer.']
      ],
      diy: 'launchKit', withUs: 'strategySession'
    },
    execute: {
      title: 'Turn Clarity Into a Plan You Can Execute.',
      diag: 'You already know what needs to happen — the bottleneck is doing it alongside actually coaching. The next step is scoping the work honestly, deciding what only you can do, and getting help with the rest so it stops sitting on the list.',
      steps: [
        ['Write down the three things that would move the needle', 'Not ten. Three. Most of the rest is noise.'],
        ['Separate “must do myself” from “can hand off”', 'Positioning and client work are yours. Design, tech and setup often aren’t.'],
        ['Set a 30-day scope', 'What will be done — not started — in the next month?'],
        ['Decide where help would speed things up', 'Guidance, ongoing support or hands-on implementation: pick the level that fits.']
      ],
      diy: 'launchKit', withUs: 'strategySession'
    },
    tools: {
      title: 'Strengthen the Practice Itself.',
      diag: 'Your question isn’t about marketing — it’s about the coaching. Better tools make sessions sharper, progress visible and clients more likely to stay and refer. Start with the structure around goals: that’s where most coaching either compounds or drifts.',
      steps: [
        ['Standardise how you prepare for sessions', 'A short, repeatable prep routine so every session starts with intent.'],
        ['Give clients structure between sessions', 'Assignments and follow-ups that keep momentum without adding your hours.'],
        ['Make goals measurable', 'Move from “I want to be more confident” to something a client can actually track.'],
        ['Review progress regularly', 'A simple checkpoint rhythm turns vague progress into evidence.']
      ],
      diy: 'toolkit', withUs: 'strategySession'
    },
    grow: {
      title: 'Grow What’s Already Working.',
      diag: 'You’ve been coaching for a while and you’re clear on your positioning. Growth now comes from looking honestly at the numbers — what actually brings clients, what costs time without returning it — and doubling down where the evidence points.',
      steps: [
        ['Measure what’s actually bringing clients', 'Referrals, content, platform, partnerships — know the real source, not the assumed one.'],
        ['Double down on one channel', 'Put your best energy where the evidence already is.'],
        ['Tighten your offer', 'Clearer scope, clearer outcome, clearer price — easier to say yes to.'],
        ['Decide what to stop doing', 'Growth is often subtraction. Cut what isn’t returning.']
      ],
      diy: 'launchKit', withUs: 'strategySession'
    }
  };

  var PRODUCTS = {
    launchKit: { key: 'launchKit', page: 'launch-kit.html', name: 'Coaching Business Launch Kit', desc: 'Practical templates, workflows and checkpoints to put your practice together at your own pace.', cta: 'Explore the Launch Kit' },
    toolkit: { key: 'toolkit', page: 'goal-setting-toolkit.html', name: 'Goal-Setting Master Toolkit', desc: 'A practical system for turning goals into something you and your clients can actually work towards. ~₹500.', cta: 'Explore the Toolkit' },
    strategySession: { key: 'strategySession', page: 'strategy-session.html', name: '1:1 Business Strategy Session', desc: 'We assess where you are, get you clear on niche and positioning, and map a practical 30–90 day roadmap. Starting at ₹1,500.', cta: 'Book a Strategy Session' },
    support: { key: 'support', page: 'programs.html#ongoing-support', name: 'Strategy Session + Ongoing Support', desc: 'Start with a Strategy Session, then keep us alongside you — weekly, bi-weekly or as needed — for reviews and direction.', cta: 'Talk About Ongoing Support' },
    implementation: { key: 'implementation', page: 'support.html', name: 'Strategy Session + Implementation', desc: 'A Strategy Session decides what needs building. Then we build it with you — positioning, presence, content, leads, tech.', cta: 'Talk About Implementation' }
  };

  var STAGE_LABEL = ['Just certified', 'Starting out', 'Building seriously', 'Ready to grow'];

  /* ------------------------------------------------------------------------
     Result computation
     ------------------------------------------------------------------------ */
  function computeResult(a) {
    var key;
    if (a.question === 6) key = 'tools';
    else if (a.question === 5) key = 'execute';
    else if (a.clarity <= 1) key = (a.stage === 0 ? 'structure' : 'clarity');
    else if (a.question === 3 || a.question === 4) key = 'visible';
    else if (a.stage === 3 && a.clarity === 3) key = 'grow';
    else key = 'position';

    var r = RESULTS[key];
    var withUsKey = r.withUs;
    if (a.help === 2) withUsKey = 'support';
    if (a.help === 3) withUsKey = 'implementation';
    return {
      key: key,
      title: r.title,
      diag: r.diag,
      steps: r.steps,
      diy: PRODUCTS[r.diy],
      withUs: PRODUCTS[withUsKey],
      recommend: a.help === 0 ? 'diy' : 'withUs'
    };
  }
  window.CCAssessment = { compute: computeResult };

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */
  var state = { step: 0, answers: {}, lead: null };
  try {
    var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
    if (saved && saved.answers) { state.answers = saved.answers; }
  } catch (e) { /* ignore */ }

  function persist() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ answers: state.answers })); } catch (e) { /* ignore */ }
  }

  var countEl = $('#quizCount');
  var progressEl = $('#quizProgress');
  var TOTAL = QUESTIONS.length;      // steps 0..3 questions, 4 lead, 5 result

  function icon(id) { return '<svg class="ico" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ------------------------------------------------------------------------
     Rendering
     ------------------------------------------------------------------------ */
  function renderProgress() {
    var s = state.step;
    if (s < TOTAL) countEl.textContent = 'Question ' + (s + 1) + ' of ' + TOTAL;
    else if (s === TOTAL) countEl.textContent = 'Almost there';
    else countEl.textContent = 'Your next step';
    $$('i', progressEl).forEach(function (bar, i) {
      bar.classList.toggle('is-done', i < s);
      bar.classList.toggle('is-current', i === s);
    });
  }

  function renderQuestion(i) {
    var q = QUESTIONS[i];
    var sel = state.answers[q.key];
    var html = '<p class="quiz__q" id="quiz-q-' + i + '">' + esc(q.q) + '</p>';
    if (i === 0) html += '<p class="quiz__hint">There are no right or wrong answers — pick what’s closest.</p>';
    html += '<div class="opts' + (q.options.length <= 4 && i !== 1 ? '' : '') + '" role="radiogroup" aria-labelledby="quiz-q-' + i + '">';
    q.options.forEach(function (o, k) {
      html += '<button type="button" class="opt" role="radio" aria-checked="' + (sel === k ? 'true' : 'false') + '" data-value="' + k + '"><span class="opt__radio" aria-hidden="true"></span><span>' + esc(o) + '</span></button>';
    });
    html += '</div>';
    html += '<div class="quiz__nav">' +
      '<button type="button" class="quiz__back" data-action="back"' + (i === 0 ? ' hidden' : '') + '>' + icon('i-arrow-left') + ' Back</button>' +
      '<button type="button" class="btn btn--primary" data-action="next"' + (sel === undefined ? ' aria-disabled="true"' : '') + '>' + (i === TOTAL - 1 ? 'See My Result' : 'Continue') + ' ' + icon('i-arrow') + '</button>' +
      '</div>';
    return html;
  }

  function renderLead() {
    var lead = state.lead || {};
    return '<p class="quiz__q">Where should we send your personalised next-step recommendation?</p>' +
      '<form class="form-grid form-grid--2" id="leadForm" novalidate>' +
        '<div class="field"><label for="leadName">Name</label><input id="leadName" name="name" type="text" autocomplete="name" required value="' + esc(lead.name || '') + '"><p class="field__error">Please tell us your name.</p></div>' +
        '<div class="field"><label for="leadEmail">Email</label><input id="leadEmail" name="email" type="email" autocomplete="email" inputmode="email" required value="' + esc(lead.email || '') + '"><p class="field__error">Please enter a valid email address.</p></div>' +
        '<div class="field field--full"><label for="leadPhone">WhatsApp <span class="opt-tag">(optional)</span></label><input id="leadPhone" name="whatsapp" type="tel" autocomplete="tel" inputmode="tel" placeholder="+91" value="' + esc(lead.whatsapp || '') + '"></div>' +
        '<div class="field--full quiz__nav">' +
          '<button type="button" class="quiz__back" data-action="back">' + icon('i-arrow-left') + ' Back</button>' +
          '<button type="submit" class="btn btn--primary">Show My Next Step ' + icon('i-arrow') + '</button>' +
        '</div>' +
        '<p class="form-note field--full">' + icon('i-shield') + '<span>We’ll only use your details to share your recommendation and relevant Coaching Central resources.</span></p>' +
      '</form>';
  }

  function pathCard(label, product, recommended) {
    var attrs = 'href="' + esc(product.page) + '"';
    return '<div class="path' + (recommended ? ' is-recommended' : '') + '">' +
      '<p class="path__label">' + esc(label) + (recommended ? '<span class="chip chip--teal">Recommended for you</span>' : '') + '</p>' +
      '<p class="path__name">' + esc(product.name) + '</p>' +
      '<p class="path__desc">' + esc(product.desc) + '</p>' +
      '<a class="btn ' + (recommended ? 'btn--primary' : 'btn--ghost') + ' btn--sm" ' + attrs + '>' + esc(product.cta) + ' ' + icon('i-arrow') + '</a>' +
    '</div>';
  }

  function renderResult() {
    var a = state.answers;
    var r = computeResult(a);
    var first = (state.lead && state.lead.name) ? state.lead.name.trim().split(/\s+/)[0] : '';
    var html = '<div class="result">' +
      '<p class="result__kicker"><span class="chip">' + esc(STAGE_LABEL[a.stage] || 'Your stage') + '</span><span class="muted" style="font-size:.9375rem">' + (first ? esc(first) + ', here’s' : 'Here’s') + ' your mini-diagnosis</span></p>' +
      '<h3 class="result__title">Your next step: ' + esc(r.title) + '</h3>' +
      '<p class="result__diag">' + esc(r.diag) + '</p>' +
      '<p class="eyebrow" style="margin-top:.5rem">What to do next</p>' +
      '<ol class="result__steps">' + r.steps.map(function (s) { return '<li><div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div></li>'; }).join('') + '</ol>' +
      '<p class="eyebrow" style="margin-top:.75rem">Two ways forward</p>' +
      '<div class="result__paths">' +
        pathCard('You can do this yourself', r.diy, r.recommend === 'diy') +
        pathCard('We can help you figure it out', r.withUs, r.recommend === 'withUs') +
      '</div>' +
      '<div class="result__foot"><span>Not quite right? Answers are only a starting point.</span><button type="button" data-action="retake">Retake the assessment</button></div>' +
    '</div>';
    return html;
  }

  function render(direction) {
    var s = state.step;
    var html = s < TOTAL ? renderQuestion(s) : (s === TOTAL ? renderLead() : renderResult());
    var old = $('.quiz__step.is-active', viewport);
    var next = document.createElement('div');
    next.className = 'quiz__step';
    next.innerHTML = html;
    var mount = function () {
      if (old) old.remove();
      viewport.appendChild(next);
      next.classList.add('is-active');
      renderProgress();
      var focusTarget = $('.opt[aria-checked="true"]', next) || $('.opt, input, .btn', next);
      if (focusTarget && direction !== 'init') focusTarget.focus({ preventScroll: true });
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
    state.step = Math.max(0, Math.min(TOTAL + 1, step));
    render(direction || 'next');
  }

  function scrollToQuiz() {
    var quiz = $('#quiz');
    var top = quiz.getBoundingClientRect().top + window.scrollY - 112;
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
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
      viewport._adv = setTimeout(function () { if (state.step < TOTAL) go(state.step + 1); }, reduceMotion ? 0 : 380);
      return;
    }
    var action = e.target.closest('[data-action]');
    if (!action) return;
    var act = action.getAttribute('data-action');
    clearTimeout(viewport._adv);
    if (act === 'back') go(state.step - 1, 'back');
    if (act === 'next') { if (action.getAttribute('aria-disabled') !== 'true') go(state.step + 1); }
    if (act === 'retake') { state.answers = {}; persist(); go(0, 'back'); scrollToQuiz(); }
  });

  // keyboard: arrow keys move between options in a radiogroup
  viewport.addEventListener('keydown', function (e) {
    var opt = e.target.closest('.opt'); if (!opt) return;
    var opts = $$('.opt', opt.parentNode); var i = opts.indexOf(opt);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); opts[(i + 1) % opts.length].focus(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length].focus(); }
  });

  viewport.addEventListener('submit', function (e) {
    var form = e.target.closest('#leadForm'); if (!form) return;
    e.preventDefault();
    var nameF = $('#leadName', form), emailF = $('#leadEmail', form), phoneF = $('#leadPhone', form);
    var nameOk = !!nameF.value.trim();
    var emailOk = window.CCLeads ? window.CCLeads.validEmail(emailF.value.trim()) : /\S+@\S+\.\S+/.test(emailF.value);
    nameF.closest('.field').classList.toggle('has-error', !nameOk); nameF.setAttribute('aria-invalid', String(!nameOk));
    emailF.closest('.field').classList.toggle('has-error', !emailOk); emailF.setAttribute('aria-invalid', String(!emailOk));
    if (!nameOk || !emailOk) { (nameOk ? emailF : nameF).focus(); return; }
    state.lead = { name: nameF.value.trim(), email: emailF.value.trim(), whatsapp: phoneF.value.trim() };
    var r = computeResult(state.answers);
    var payload = {
      source: 'assessment',
      name: state.lead.name, email: state.lead.email, whatsapp: state.lead.whatsapp,
      stage: QUESTIONS[0].options[state.answers.stage],
      biggestQuestion: QUESTIONS[1].options[state.answers.question],
      clarity: QUESTIONS[2].options[state.answers.clarity],
      helpLevel: QUESTIONS[3].options[state.answers.help],
      result: r.title, resultKey: r.key,
      recommended: r.recommend === 'diy' ? r.diy.name : r.withUs.name
    };
    var submitBtn = $('button[type="submit"]', form); submitBtn.setAttribute('aria-disabled', 'true');
    (window.CCLeads ? window.CCLeads.submit(payload) : Promise.resolve()).then(function () {
      go(TOTAL + 1);
      scrollToQuiz();
    });
  });

  /* ------------------------------------------------------------------------
     Quick-start cards in the hero pre-answer Q1 and jump to Q2
     ------------------------------------------------------------------------ */
  $$('[data-preselect-stage]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.answers = { stage: Number(btn.getAttribute('data-preselect-stage')) };
      persist();
      go(1, 'init');
      // scroll to the quiz (below the section heading)
      var quiz = $('#quiz');
      var top = quiz.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (window.dataLayer) window.dataLayer.push({ event: 'assessment_quickstart', stage: state.answers.stage });
    });
  });

  // Initial render: resume at the first unanswered question
  var firstUnanswered = 0;
  for (var i = 0; i < TOTAL; i++) { if (state.answers[QUESTIONS[i].key] === undefined) { firstUnanswered = i; break; } firstUnanswered = i; }
  state.step = firstUnanswered;
  render('init');
})();
