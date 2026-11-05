/* Runs once the page is parsed and the deferred libraries above have loaded */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var root = document.documentElement;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var libsOk = !!(window.gsap && window.ScrollTrigger && window.SplitText);
  var isMobile = function () { return window.innerWidth <= 768; };
  var isTablet = function () { return window.innerWidth <= 1024; };
  var isCompactNav = function () { return window.innerWidth <= 1024; };

  /* ---------------- Site settings: change these in one place ---------------- */
  var SITE = {
    email: 'bsworks.store@gmail.com',                                    /* shown to visitors; also the backup form's inbox */
    whatsapp: '918699200848',                                        /* country code + number, digits only */
    netlifyForm: 'contact',                                          /* Netlify Forms: must match <form name="..."> */
    web3formsKey: '',                                                /* optional backup: free key from web3forms.com, paste it here */
    backupEndpoint: 'https://formsubmit.co/ajax/bitu45634@gmail.com' /* last backup (click FormSubmit's one-time "Activate" email); '' to turn off */
  };
  var waLink = function (text) { return 'https://wa.me/' + SITE.whatsapp + (text ? '?text=' + encodeURIComponent(text) : ''); };

  /* ---------------- Repeated UI built from the HTML content ---------------- */
  /* Clients: the logo fly-through needs 12 tiles, so the logos written in the HTML repeat to fill them. */
  var clGrid = q('#cl-grid'), clBase = qa('.cl-logo', clGrid);
  for (var ci = clBase.length; clBase.length && ci < 12; ci++) clGrid.appendChild(clBase[ci % clBase.length].cloneNode(true));
  /* Testimonials: one avatar button per quote (.tm-item) in the HTML. */
  var avStrip = q('#tm-avatars'), tmItems = qa('.tm-item');
  tmItems.forEach(function (it, idx) {
    var name = (q('.tm-name', it) || it).textContent.trim();
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tm-av'; b.dataset.i = idx;
    b.setAttribute('aria-label', 'Show testimonial from ' + name);
    b.innerHTML = '<span class="tm-av-in"><span class="tm-av-face"></span></span>';
    var face = q('.tm-av-face', b);
    if (it.dataset.photo) face.style.background = 'center / cover no-repeat url("' + it.dataset.photo + '")';
    else {
      face.textContent = name.split(/\s+/).map(function (s) { return s.charAt(0); }).join('').slice(0, 2);
      face.style.background = it.dataset.bg || 'var(--grad)';
    }
    avStrip.appendChild(b);
  });

  /* ---------------- Dot-fill buttons ---------------- */
  qa('.dfb').forEach(function (btn) {
    var roll = q('.dfb-roll', btn);
    var text = roll.textContent.trim();
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', text);
    roll.setAttribute('aria-hidden', 'true');
    roll.innerHTML = text.split('').map(function (ch, k) {
      return '<span style="transition-delay:' + (k * 0.01).toFixed(2) + 's">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
    }).join('');
    btn.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      btn.classList.add('is-hover');
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { btn.classList.remove('is-hover'); }, 1000);
    });
  });

  var lenis = null;
  var G = libsOk ? window.gsap : null;

  /* ---------------- Navbar V2 Pill Animation + B/S Tracking + Mobile Drawer ---------------- */
  var navbar = q('#navbar');
  var leftEyeBtn = q('#leftEyeBtn');
  var rightEyeBtn = q('#rightEyeBtn');
  var leftPupil = q('#leftPupil');
  var rightPupil = q('#rightPupil');
  var mnav = q('#mnav'), mPanel = q('.mnav-panel', mnav), burger = q('#navBurger');
  var menuOpen = false, menuLastFocus = null, dropReadyTimer = null;
  var dropItem = q('.nav-item--drop'), lastKbd = false;

  document.addEventListener('keydown', function () { lastKbd = true; }, true);
  document.addEventListener('pointerdown', function () { lastKbd = false; }, true);

  /* Mouse / Touch tracking for B (left) and S (right) circles */
  function updateEyes(clientX, clientY) {
    var pupils = [
      { el: leftPupil, btn: leftEyeBtn },
      { el: rightPupil, btn: rightEyeBtn }
    ];
    pupils.forEach(function (item) {
      if (!item.el || !item.btn) return;
      var rect = item.btn.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var dx = clientX - centerX;
      var dy = clientY - centerY;
      var angle = Math.atan2(dy, dx);
      var maxOffset = 4.6;
      var distance = Math.min(maxOffset, Math.hypot(dx, dy) * 0.08);
      var offsetX = Math.cos(angle) * distance;
      var offsetY = Math.sin(angle) * distance;
      item.el.style.transform = 'translate(calc(-50% + ' + offsetX.toFixed(2) + 'px), calc(-50% + ' + offsetY.toFixed(2) + 'px))';
    });
  }

  window.addEventListener('pointermove', function (e) {
    updateEyes(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches[0]) {
      updateEyes(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) {
      updateEyes(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  /* Services dropdown: opens on hover / keyboard focus (CSS); after a pick it stays shut until the pointer leaves. */
  q('.nav-drop', dropItem).addEventListener('click', function (e) {
    if (e.target.closest('.drop-link') || e.target.closest('.mega-promo')) {
      dropItem.classList.add('is-suppressed');
      if (document.activeElement) document.activeElement.blur();
    }
  });
  dropItem.addEventListener('mouseleave', function () { dropItem.classList.remove('is-suppressed'); });
  dropItem.addEventListener('focusin', function () { if (lastKbd) dropItem.classList.remove('is-suppressed'); });
  dropItem.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { dropItem.classList.add('is-suppressed'); q('.nav-link', dropItem).focus(); }
  });

  /* Drawer open / close helpers */
  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    menuLastFocus = document.activeElement;
    mnav.removeAttribute('inert');
    mnav.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    root.classList.add('menu-open');
    if (lenis) lenis.stop();
  }

  function closeMenu(restoreFocus) {
    if (!menuOpen) return;
    menuOpen = false;
    mnav.classList.remove('is-open');
    mnav.setAttribute('inert', '');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    root.classList.remove('menu-open');
    if (lenis && !modalOpen) lenis.start();
    if (restoreFocus !== false && menuLastFocus) menuLastFocus.focus({ preventScroll: true });
  }

  /* Expand / Collapse Navbar Pill */
  function expandNavbar() {
    clearTimeout(dropReadyTimer);
    navbar.classList.add('expanded');
    if (isCompactNav()) {
      /* On mobile / tablet: expand, convert menu icon to X, and automatically open 2-col drawer */
      openMenu();
    } else {
      dropReadyTimer = setTimeout(function () {
        if (navbar.classList.contains('expanded')) navbar.classList.add('dropdown-ready');
      }, 450);
    }
  }

  function collapseNavbar(restoreFocus) {
    clearTimeout(dropReadyTimer);
    navbar.classList.remove('dropdown-ready');
    navbar.classList.remove('expanded');
    dropItem.classList.add('is-suppressed');
    if (menuOpen) {
      closeMenu(restoreFocus);
    } else {
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    }
  }

  /* Left (B) & Right (S) button click handler */
  function handleEyeClick(e) {
    e.stopPropagation();
    if (!navbar.classList.contains('expanded')) {
      expandNavbar();
    } else {
      collapseNavbar(false);
    }
  }

  leftEyeBtn.addEventListener('click', handleEyeClick);
  rightEyeBtn.addEventListener('click', handleEyeClick);

  /* Clicking the collapsed pill itself expands it */
  navbar.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!navbar.classList.contains('expanded')) {
      expandNavbar();
    }
  });

  /* Clicking the burger / X button on mobile & tablet */
  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    if (menuOpen || navbar.classList.contains('expanded')) {
      collapseNavbar(false);
    } else {
      expandNavbar();
    }
  });

  /* Clicking drawer close button or scrim closes menu AND returns header to BS state */
  qa('[data-close-menu]', mnav).forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      collapseNavbar(false);
    });
  });

  /* Clicking anywhere outside the navbar (and outside the mobile drawer panel) collapses back to BS state */
  document.addEventListener('click', function (e) {
    if (!navbar.classList.contains('expanded') && !menuOpen) return;
    if (navbar.contains(e.target)) return;
    if (menuOpen && mPanel.contains(e.target)) return;
    if (modalOpen && modal.contains(e.target)) return;
    collapseNavbar(false);
  });

  /* Mobile Services & Service Areas submenu accordions */
  qa('.mnav-has-sub > .mnav-link', mnav).forEach(function (subBtn) {
    subBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = subBtn.getAttribute('aria-expanded') === 'true';
      subBtn.setAttribute('aria-expanded', String(!open));
      subBtn.parentElement.classList.toggle('is-open', !open);
    });
  });

  /* Escape key closes drawer and collapses navbar to BS state */
  document.addEventListener('keydown', function (e) {
    if (modalOpen) return;
    if (e.key === 'Escape') {
      if (menuOpen || navbar.classList.contains('expanded')) {
        collapseNavbar();
      }
      return;
    }
    if (menuOpen && e.key === 'Tab') {
      var f = qa('a[href], button', mPanel).filter(function (el) { return !el.disabled && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  window.addEventListener('resize', function () {
    if (menuOpen && !isCompactNav()) {
      closeMenu(false);
      navbar.classList.add('dropdown-ready');
    } else if (navbar.classList.contains('expanded') && isCompactNav() && !menuOpen) {
      navbar.classList.remove('dropdown-ready');
      openMenu();
    }
  });

  /* Scroll-spy: highlight the link for the section under the upper half of the screen.
     Sections without a link (Awards, Clients, FAQ) keep the previous one lit. */
  var spyLinks = qa('[data-spy]'), spySecs = qa('#hero, #portfolio, #why, #tech, #services, #work, #testimonials, #contact'), spyCur = '';
  function spy() {
    var mid = window.innerHeight * .45, cur = 'hero';
    spySecs.forEach(function (sec) { if (sec.getBoundingClientRect().top <= mid) cur = sec.dataset.spyAs || sec.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = 'contact';
    if (cur === spyCur) return;
    spyCur = cur;
    spyLinks.forEach(function (a) {
      var on = a.dataset.spy === cur;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  var spyTick = false;
  window.addEventListener('scroll', function () {
    if (spyTick) return; spyTick = true;
    requestAnimationFrame(function () { spyTick = false; spy(); });
  }, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ---------------- Modal ---------------- */
  var modal = q('#modal'), panel = q('.modal-panel', modal), lastFocus = null, modalOpen = false;
  function openModal() {
    if (modalOpen) return;
    var fromMenu = menuOpen;
    if (fromMenu || isCompactNav()) collapseNavbar(false);
    modalOpen = true; lastFocus = fromMenu ? leftEyeBtn : document.activeElement;
    if (form && form.classList.contains('is-sent')) resetForm();
    modal.hidden = false;
    if (lenis) lenis.stop();
    if (G) {
      G.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power2.out' });
      G.fromTo(panel, { y: 40, scale: .97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .55, ease: 'power3.out' });
    }
    setTimeout(function () { var f = q('#f-name'); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeModal() {
    if (!modalOpen) return;
    var done = function () { modal.hidden = true; modalOpen = false; if (lenis && !csCurrent && !menuOpen) lenis.start(); if (lastFocus) lastFocus.focus({ preventScroll: true }); };
    if (G) {
      G.to(panel, { y: 30, opacity: 0, duration: .3, ease: 'power2.in' });
      G.to(modal, { opacity: 0, duration: .3, ease: 'power2.in', onComplete: done });
    } else done();
  }
  qa('[data-open-modal]').forEach(function (b) { b.addEventListener('click', openModal); });
  qa('[data-close-modal]').forEach(function (b) { b.addEventListener('click', closeModal); });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (!modalOpen) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      var f = qa('a[href], button, input:not([tabindex="-1"]), textarea, [tabindex]:not([tabindex="-1"])', modal).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------------- In-page links: header, drawer, footer (smooth with Lenis) ---------------- */
  function scrollToId(id) {
    var t = id.length > 1 ? q(id) : null;
    if (!t) return;
    if (lenis) lenis.scrollTo(t, { duration: 1.6 });
    else t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }
  qa('.hdr a[href^="#"], .mnav a[href^="#"], .ft a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || !q(id)) return;
      e.preventDefault();
      if (a.closest('.nav-item--drop')) { dropItem.classList.add('is-suppressed'); a.blur(); }
      if (menuOpen) {
        collapseNavbar(false);
        setTimeout(function () { scrollToId(id); }, 40);
      } else {
        scrollToId(id);
      }
    });
  });

  /* ---------------- Contact form ----------------
     1. Netlify Forms (this site is on Netlify): the message is saved under Forms in the Netlify dashboard and
        emailed to you by the form notification set up there.
     2. If Netlify can't take it (form not detected yet, or the page is opened outside Netlify), the backups are
        tried in turn: Web3Forms (only if SITE.web3formsKey is set), then FormSubmit (SITE.backupEndpoint).
     3. If both fail, the visitor gets one-tap WhatsApp / email links with their message already written,
        so an enquiry is never lost. */
  var form = q('#contact-form'), note = q('#form-note'), sendBtn = q('button[type="submit"]', form), okBox = q('#form-success');
  var SENDING = 'Sending your message…';
  function setInvalid(el, bad) { if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
  function clearNote() { note.textContent = ''; note.classList.remove('is-error'); }
  function resetForm() {
    form.classList.remove('is-sent', 'is-sending');
    okBox.hidden = true; sendBtn.disabled = false; clearNote();
    qa('[aria-invalid]', form).forEach(function (el) { setInvalid(el, false); });
  }
  function showSent(name) {
    q('.form-success-name', okBox).textContent = (name || 'there').split(/\s+/)[0];
    form.reset();
    form.classList.add('is-sent');
    okBox.hidden = false;
    clearNote();
    var again = q('[data-form-again]', okBox);
    if (again) again.focus({ preventScroll: true });
  }
  function fallbackHtml(d) {
    var body = 'Hi Birinder, I\'m ' + d.name + (d.phone ? ' (' + d.phone + ')' : '') + '.\n' + (d.subject ? 'Subject: ' + d.subject + '\n' : '') + d.message + '\n\nMy email: ' + d.email;
    return 'Sorry, the message could not be sent right now. <a href="' + waLink(body) + '" target="_blank" rel="noopener">Send it on WhatsApp</a> or <a href="mailto:' + SITE.email +
      '?subject=' + encodeURIComponent(d.subject || 'New project enquiry') + '&amp;body=' + encodeURIComponent(body) + '">email it directly</a>.';
  }
  /* fetch with a time limit */
  function post(url, opts, ms) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms || 12000);
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(t); return r; }, function (err) { clearTimeout(t); throw err; });
  }
  function sendNetlify(d) {
    var body = new URLSearchParams();
    body.append('form-name', SITE.netlifyForm);
    body.append('bot-field', '');
    ['name', 'email', 'subject', 'phone', 'message'].forEach(function (k) { body.append(k, d[k]); });
    return post('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      .then(function (r) { if (!r.ok) throw new Error('Netlify Forms answered ' + r.status); });
  }
  function sendWeb3(d) {
    if (!SITE.web3formsKey) return Promise.reject(new Error('no Web3Forms key'));
    return post('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: SITE.web3formsKey, subject: 'New portfolio enquiry: ' + (d.subject || d.name), from_name: 'bsworks.store',
        name: d.name, email: d.email, phone: d.phone || '-', topic: d.subject || '-', message: d.message, botcheck: false
      })
    }).then(function (r) {
      return r.json().catch(function () { return { success: r.ok }; });
    }).then(function (res) {
      if (res && String(res.success) === 'true') return;
      throw new Error('Web3Forms: ' + (res && res.message ? res.message : 'not sent'));
    });
  }
  function sendFormSubmit(d) {
    if (!SITE.backupEndpoint) return Promise.reject(new Error('no backup endpoint'));
    return post(SITE.backupEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: d.name, email: d.email, phone: d.phone || '-', subject: d.subject || '-', message: d.message,
        _subject: 'New portfolio enquiry: ' + (d.subject || d.name), _replyto: d.email, _template: 'table', _captcha: 'false'
      })
    }).then(function (r) {
      return r.json().catch(function () { return { success: r.ok }; });
    }).then(function (res) {
      if (res && String(res.success) === 'true') return;
      throw new Error('FormSubmit: ' + (res && res.message ? res.message : 'not sent'));
    });
  }
  /* try each way in order until one delivers the message */
  function deliver(d) {
    var tries = [sendNetlify, sendWeb3, sendFormSubmit], i = 0;
    var next = function () {
      if (i >= tries.length) return Promise.reject(new Error('all delivery methods failed'));
      var fn = tries[i++];
      return fn(d).catch(function (err) {
        if (!/^no /.test(err.message)) console.warn('[Contact form] ' + err.message + (fn === sendNetlify ? ' (redeploy the site after enabling form detection in Netlify > Forms)' : ''));
        return next();
      });
    };
    return next();
  }
  qa('input, textarea', form).forEach(function (el) {
    el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) setInvalid(el, false); if (note.classList.contains('is-error')) clearNote(); });
  });
  q('[data-form-again]', okBox).addEventListener('click', function () { resetForm(); form.elements.name.focus(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.classList.contains('is-sending')) return;
    var f = form.elements;
    var d = { name: f.name.value.trim(), email: f.email.value.trim(), subject: f.subject.value.trim(), phone: f.phone.value.trim(), message: f.message.value.trim() };
    var bad = [];
    if (!d.name) bad.push(f.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) bad.push(f.email);
    if (!d.message) bad.push(f.message);
    [f.name, f.email, f.message].forEach(function (el) { setInvalid(el, bad.indexOf(el) > -1); });
    if (bad.length) {
      note.classList.add('is-error');
      note.textContent = (bad.length === 1 && bad[0] === f.email && d.email) ? 'Check the email address; it needs an @ and a domain.' : 'Add your name, email and a short message to send.';
      bad[0].focus();
      return;
    }
    if (f['bot-field'] && f['bot-field'].value) { showSent(d.name); return; }   /* a bot filled the hidden field: pretend it worked */
    form.classList.add('is-sending'); sendBtn.disabled = true;
    note.classList.remove('is-error'); note.textContent = SENDING;
    deliver(d).then(function () {
      showSent(d.name);
    }, function () {
      note.classList.add('is-error');
      note.innerHTML = fallbackHtml(d);
    }).then(function () {
      form.classList.remove('is-sending'); sendBtn.disabled = false;
      if (note.textContent === SENDING) clearNote();
    });
  });

  /* ---------------- Testimonials state (works with or without GSAP) ---------------- */
  var tmIdx = 0, tmContent = q('#tm-content'), avs = qa('.tm-av', avStrip), n = tmItems.length;
  function tmFill() {
    tmItems.forEach(function (it, k) { it.classList.toggle('is-active', k === tmIdx); });
  }
  function tmOrder(animate) {
    var first = avs.map(function (a) { return a.getBoundingClientRect().left; });
    [-2, -1, 0, 1, 2].forEach(function (k) { avStrip.appendChild(avs[(tmIdx + k + n) % n]); });
    avs.forEach(function (a, k) { a.classList.toggle('is-active', k === tmIdx); a.setAttribute('aria-current', k === tmIdx ? 'true' : 'false'); });
    if (!animate || !G || RM) return;
    avs.forEach(function (a, k) {
      var dx = first[k] - a.getBoundingClientRect().left;
      if (Math.abs(dx) > .5) G.fromTo(a, { x: dx }, { x: 0, duration: .6, ease: 'power4.out' });
    });
  }
  function tmGo(next) {
    var ni = ((next % n) + n) % n;
    if (ni === tmIdx) return;
    tmIdx = ni;
    tmOrder(true);
    if (G && !RM) {
      G.killTweensOf(tmContent);
      G.to(tmContent, { opacity: 0, y: -10, duration: .18, ease: 'power2.in', onComplete: function () {
        tmFill(); G.fromTo(tmContent, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .25, ease: 'power2.out' });
      } });
    } else tmFill();
  }
  tmOrder(false);
  avs.forEach(function (a) { a.addEventListener('click', function () { tmGo(+a.dataset.i); }); });
  q('#tm-prev').addEventListener('click', function () { tmGo(tmIdx - 1); });
  q('#tm-next').addEventListener('click', function () { tmGo(tmIdx + 1); });
  (function drag() {
    var card = q('#tm-card'), sx = null, dx = 0;
    card.addEventListener('pointerdown', function (e) { if (e.button !== 0) return; sx = e.clientX; dx = 0; });
    window.addEventListener('pointermove', function (e) {
      if (sx === null) return;
      dx = e.clientX - sx;
      if (G) G.set(card, { x: dx * 0.35 });
    });
    var end = function () {
      if (sx === null) return;
      if (dx > 100) tmGo(tmIdx - 1); else if (dx < -100) tmGo(tmIdx + 1);
      if (G) G.to(card, { x: 0, duration: .6, ease: 'elastic.out(1, .65)' });
      sx = null; dx = 0;
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    card.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') tmGo(tmIdx - 1); if (e.key === 'ArrowRight') tmGo(tmIdx + 1); });
  })();

  /* ---------------- FAQ ---------------- */
  var refreshSoon = function () {};
  qa('.faq-item').forEach(function (item) {
    var btn = q('.faq-q', item), ans = q('.faq-a', item);
    var toggle = function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
      if (!G || RM) { ans.style.height = open ? '0px' : 'auto'; refreshSoon(); return; }
      G.killTweensOf(ans);
      if (!open) {
        var h = ans.scrollHeight;
        G.fromTo(ans, { height: ans.offsetHeight }, { height: h, duration: .45, ease: 'power3.out', onComplete: function () { G.set(ans, { height: 'auto' }); refreshSoon(); } });
      } else {
        G.fromTo(ans, { height: ans.offsetHeight }, { height: 0, duration: .45, ease: 'power3.out', onComplete: refreshSoon });
      }
    };
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* ---------------- Hero skill cylinder ---------------- */
  (function heroCylinder() {
    var wrap = q('.hero-cyl'), cv = wrap && q('canvas', wrap), ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    if (!ctx) return;
    var words = (wrap.getAttribute('data-words') || '').split('|').map(function (w) { return w.trim(); }).filter(Boolean);
    if (!words.length) return;
    var chars = (words.join(' • ') + ' • ').split(''), N = chars.length, D2R = Math.PI / 180;
    var LOOKS = {
      wide:    { R: 9.6,  turns: 3.5, H: 6,   tilt: 24, P: 44 },
      compact: { R: 10.4, turns: 3,   H: 4.2, tilt: 14, P: 56 }
    };
    var SPEED = 14;
    var MAX_F = 18;
    var MIN_F = 8;
    var mqCompact = window.matchMedia('(max-width: 1024px)');
    var L = LOOKS.wide, f = 0, dpr = 1, ox = 0, oy = 0, rot = 24, raf = 0, last = 0, running = false, onScreen = true;
    var font = getComputedStyle(document.body).fontFamily || 'sans-serif';
    var SS = 1.5, atlas = document.createElement('canvas'), actx = atlas.getContext('2d'), glyph = {}, sprites = atlas, atlasGen = 0;

    function buildAtlas() {
      var px = f * dpr * SS, pad = Math.ceil(px * .25), cellH = Math.ceil(px * 1.3) + pad * 2, uniq = [], x = 0;
      chars.forEach(function (ch) { if (ch !== ' ' && uniq.indexOf(ch) < 0) uniq.push(ch); });
      actx.font = '500 ' + px.toFixed(2) + 'px ' + font;
      var widths = uniq.map(function (ch) { return Math.ceil(actx.measureText(ch).width) + pad * 2; });
      atlas.width = widths.reduce(function (a, b) { return a + b; }, 0); atlas.height = cellH;
      actx.font = '500 ' + px.toFixed(2) + 'px ' + font;
      actx.textAlign = 'center'; actx.textBaseline = 'middle'; actx.fillStyle = '#fff';
      glyph = {};
      uniq.forEach(function (ch, j) {
        actx.fillText(ch, x + widths[j] / 2, cellH / 2);
        glyph[ch] = { x: x, w: widths[j] };
        x += widths[j];
      });
      if (sprites !== atlas && sprites.close) sprites.close();
      sprites = atlas;
      var gen = ++atlasGen;
      if (window.createImageBitmap) createImageBitmap(atlas).then(function (bmp) {
        if (gen !== atlasGen) { if (bmp.close) bmp.close(); return; }
        if (sprites !== atlas && sprites.close) sprites.close();
        sprites = bmp; if (!running) draw();
      }).catch(function () {});
    }

    function bounds() {
      var sT = Math.sin(L.tilt * D2R), cT = Math.cos(L.tilt * D2R), b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
      for (var a = 0; a < 360; a += 3) {
        var s = Math.sin(a * D2R), c = Math.cos(a * D2R);
        for (var e = -1; e <= 1; e += 2) {
          var y = e * L.H / 2, z = L.R * c, ty = y * cT + z * sT, tz = z * cT - y * sT, k = L.P / (L.P - tz);
          var x = L.R * s * k, yy = ty * k;
          b.x0 = Math.min(b.x0, x - .6 * k); b.x1 = Math.max(b.x1, x + .6 * k);
          b.y0 = Math.min(b.y0, yy - .7 * k); b.y1 = Math.max(b.y1, yy + .7 * k);
        }
      }
      return b;
    }

    function resize() {
      L = mqCompact.matches ? LOOKS.compact : LOOKS.wide;
      var w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) { f = 0; return; }
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      var b = bounds();
      f = Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0), MAX_F);
      if (f < MIN_F) { f = 0; ctx.clearRect(0, 0, cv.width, cv.height); return; }
      ox = w / 2 - (b.x0 + b.x1) / 2 * f;
      oy = h / 2 - (b.y0 + b.y1) / 2 * f;
      buildAtlas();
      draw();
    }

    function draw() {
      if (!f) return;
      var sT = Math.sin(L.tilt * D2R), cT = Math.cos(L.tilt * D2R), P = L.P, R = L.R, H = L.H;
      var step = L.turns * 360 / N * D2R, r0 = rot * D2R;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      var gh = atlas.height, dh = gh / SS;
      for (var pass = 0; pass < 2; pass++) {
        for (var i = 0; i < N; i++) {
          var ch = chars[i];
          if (ch === ' ') continue;
          var n = i * step - r0, s = Math.sin(n), c = Math.cos(n);
          if ((pass === 0) !== (c < 0)) continue;
          var x = R * s, y = (i / N - .5) * H, z = R * c;
          var ty = y * cT + z * sT, tz = z * cT - y * sT, k = P / (P - tz), px = x * k, py = ty * k;
          var k1 = P / (P - (tz - s * cT)), ax = (x + c) * k1 - px, ay = (ty - s * sT) * k1 - py;
          var k2 = P / (P - (tz - sT)), bx = x * k2 - px, by = (ty + cT) * k2 - py;
          ctx.globalAlpha = c > 0 ? .36 + .64 * c : .13 + (c + 1) * .22;
          var g = glyph[ch];
          if (!g) continue;
          ctx.setTransform(ax, ay, bx, by, (ox + px * f) * dpr, (oy + py * f) * dpr);
          ctx.drawImage(sprites, g.x, 0, g.w, gh, -g.w / SS / 2, -dh / 2, g.w / SS, dh);
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      raf = 0;
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (last && t - last < 15) return;
      if (last) rot += SPEED * Math.min(t - last, 50) / 1000;
      last = t;
      draw();
    }
    function sync() {
      var go = !RM && f > 0 && onScreen && !document.hidden;
      if (go && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
      else if (!go && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    }

    resize(); sync();
    if (window.ResizeObserver) new ResizeObserver(function () { resize(); sync(); }).observe(cv);
    else window.addEventListener('resize', function () { resize(); sync(); });
    if (mqCompact.addEventListener) mqCompact.addEventListener('change', function () { resize(); sync(); });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; sync(); }).observe(wrap);
    document.addEventListener('visibilitychange', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { font = getComputedStyle(document.body).fontFamily || font; if (f) { buildAtlas(); draw(); } });
  })();

  /* ---------------- Tech rows: copy each row enough times for a seamless loop ---------------- */
  var techTracks = qa('.tech-track');
  function techFill() {
    techTracks.forEach(function (t) {
      qa('[data-clone]', t).forEach(function (c) { t.removeChild(c); });
      var items = qa('.tech-item', t);
      if (!items.length) return;
      var gap = parseFloat(getComputedStyle(t).columnGap) || 0;
      var setW = t.scrollWidth + gap;
      var sets = Math.max(2, Math.ceil(window.innerWidth / setW) + 1);
      for (var s = 1; s < sets; s++) {
        items.forEach(function (li) {
          var c = li.cloneNode(true);
          c.setAttribute('data-clone', '');
          c.setAttribute('aria-hidden', 'true');
          t.appendChild(c);
        });
      }
      t.style.setProperty('--shift', setW + 'px');
      t.style.animationDuration = (setW / 55).toFixed(2) + 's';
    });
  }
  techFill();
  var techW = window.innerWidth, techT = 0;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - techW) < 60) return;
    techW = window.innerWidth;
    clearTimeout(techT); techT = setTimeout(techFill, 200);
  });

  /* ---------------- Selected Work: case studies (all content lives in the HTML) ---------------- */
  var cs = q('#cs'), csArts = qa('.cs-article', cs), csCount = q('#cs-count'), csClose = q('#cs-close');
  var curtain = q('#curtain'), curtainLabel = q('#curtain-label'), baseTitle = document.title;
  var wkCur = q('#wk-cur'), hideCur = function () {};
  var csCurrent = null, csBusy = false, csReturn = null;
  var pageParts = qa('main, .hdr, .ft');
  var CS_ARROW = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var csName = function (art) { var h = q('.cs-title', art); return h.getAttribute('aria-label') || h.textContent.trim(); };

  /* "Next project" link at the end of every case study */
  csArts.forEach(function (art, i) {
    var next = csArts[(i + 1) % csArts.length];
    var a = document.createElement('a');
    a.className = 'cs-next';
    a.href = '#' + next.id;
    a.setAttribute('data-case', next.id);
    a.innerHTML = '<span class="cs-label">Next project</span><span class="cs-next-row"><span class="cs-next-title"></span><span class="cs-next-arrow">' + CS_ARROW + '</span></span>';
    q('.cs-next-title', a).textContent = csName(next);
    art.appendChild(a);
  });

  /* Wrap the title letters for the rise-in animation (the HTML stays plain text) */
  function splitCsTitle(h) {
    if (h.hasAttribute('aria-label')) return;
    var text = h.textContent.trim(), wrap = document.createElement('span');
    h.setAttribute('aria-label', text);
    wrap.setAttribute('aria-hidden', 'true');
    text.split(/\s+/).forEach(function (w, i) {
      if (i) wrap.appendChild(document.createTextNode(' '));
      var cw = document.createElement('span'); cw.className = 'cs-w';
      Array.from(w).forEach(function (ch) { var c = document.createElement('span'); c.className = 'cs-c'; c.textContent = ch; cw.appendChild(c); });
      wrap.appendChild(cw);
    });
    h.textContent = '';
    h.appendChild(wrap);
  }

  function lockPage(on) {
    root.classList.toggle('is-locked', on);
    pageParts.forEach(function (el) { el.inert = on; });
    if (lenis) { if (on) lenis.stop(); else if (!modalOpen && !menuOpen) lenis.start(); }
  }

  function caseIntro(art) {
    if (!G || RM) return;
    G.from(qa('.cs-c', art), { yPercent: 115, duration: 1.2, stagger: .03, ease: 'expo.out' });
    G.from(qa('.cs-hero img', art), { scale: 1.12, duration: 1.6, ease: 'expo.out' });
    G.from(qa('.cs-eyebrow, .cs-head-row, .cs-meta > div', art), { y: 20, autoAlpha: 0, duration: 1, stagger: .06, ease: 'expo.out', delay: .2, clearProps: 'transform,opacity,visibility' });
  }

  function openCase(id, opts) {
    opts = opts || {};
    var idx = -1;
    csArts.forEach(function (a, k) { if (a.id === id) idx = k; });
    if (idx < 0 || csBusy || id === csCurrent) return;
    var art = csArts[idx];
    if (!csCurrent) csReturn = opts.from || document.activeElement;
    if (opts.push !== false) { try { history.pushState({ cs: id }, '', '#' + id); } catch (err) { /* ignore */ } }
    var swap = function () {
      csArts.forEach(function (a) { a.hidden = a !== art; });
      splitCsTitle(q('.cs-title', art));
      csCount.textContent = 'Project ' + (idx + 1) + ' of ' + csArts.length;
      cs.setAttribute('aria-label', csName(art) + ' case study');
      cs.hidden = false;
      cs.scrollTop = 0;
      if (!csCurrent) lockPage(true);
      csCurrent = id;
      document.title = csName(art) + ' | Case study | ' + baseTitle;
      hideCur();
      csClose.focus({ preventScroll: true });
    };
    if (!G || RM || opts.instant) { swap(); return; }
    csBusy = true;
    curtainLabel.textContent = csName(art);
    G.timeline({ onComplete: function () { csBusy = false; } })
      .set(curtain, { display: 'flex' })
      .fromTo(curtain, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .75, ease: 'expo.inOut' })
      .fromTo(curtainLabel, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .6, ease: 'expo.out' }, '-=0.3')
      .add(swap)
      .to(curtainLabel, { yPercent: -40, autoAlpha: 0, duration: .4, ease: 'power2.in' }, '+=0.15')
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: .85, ease: 'expo.inOut' }, '-=0.1')
      .add(function () { caseIntro(art); }, '-=0.55')
      .set(curtain, { display: 'none' });
  }

  function closeCase(opts) {
    opts = opts || {};
    if (!csCurrent || csBusy) return;
    if (opts.updateHistory !== false) { try { history.replaceState(null, '', location.pathname + location.search); } catch (err) { /* ignore */ } }
    var finish = function () {
      cs.hidden = true;
      csCurrent = null;
      document.title = baseTitle;
      lockPage(false);
    };
    var focusBack = function () {
      if (csReturn && document.contains(csReturn)) csReturn.focus({ preventScroll: true });
      csReturn = null;
    };
    if (!G || RM) { finish(); focusBack(); return; }
    csBusy = true;
    G.timeline({ onComplete: function () { csBusy = false; } })
      .set(curtain, { display: 'flex' })
      .set(curtainLabel, { autoAlpha: 0 })
      .fromTo(curtain, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'expo.inOut' })
      .add(finish)
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'expo.inOut' }, '+=0.05')
      .set(curtain, { display: 'none' })
      .add(focusBack);
  }

  function csRoute(instant) {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (id && csArts.some(function (a) { return a.id === id; })) openCase(id, { push: false, instant: instant });
    else if (csCurrent) closeCase({ updateHistory: false });
  }
  window.addEventListener('popstate', function () { csRoute(false); });
  window.addEventListener('hashchange', function () { csRoute(false); });
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-case]');
    if (!link) return;
    e.preventDefault();
    openCase(link.getAttribute('data-case'), { from: link.classList.contains('wk-card') ? link : null });
  });
  csClose.addEventListener('click', function () { closeCase(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && csCurrent && !modalOpen) closeCase(); });

  /* "View" bubble that follows the mouse over the project cards (mouse only) */
  if (wkCur && G && FINE) (function () {
    var shown = false, dur = RM ? .001 : .5;
    G.set(wkCur, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: .3 });
    var qx = G.quickTo(wkCur, 'x', { duration: dur, ease: 'power3' }), qy = G.quickTo(wkCur, 'y', { duration: dur, ease: 'power3' });
    var hide = function () {
      if (!shown) return;
      shown = false;
      G.to(wkCur, { autoAlpha: 0, scale: .3, duration: RM ? .001 : .35, ease: 'power3.out', overwrite: 'auto' });
    };
    hideCur = hide;
    qa('.wk-card').forEach(function (card) {
      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || csCurrent) return;
        if (!shown) { G.set(wkCur, { x: e.clientX, y: e.clientY }); }
        qx(e.clientX); qy(e.clientY);
        shown = true;
        G.to(wkCur, { autoAlpha: 1, scale: 1, duration: dur, ease: 'expo.out', overwrite: 'auto' });
      });
      card.addEventListener('pointermove', function (e) { if (shown) { qx(e.clientX); qy(e.clientY); } });
      card.addEventListener('pointerleave', hide);
    });
    window.addEventListener('scroll', function () { if (shown && !document.querySelector('.wk-card:hover')) hide(); }, { passive: true });
  })();

  /* ---------------- Project covers ----------------
     Each cover is a live screenshot (s.wordpress.com/mshots). The first request for a site returns a small
     "generating" placeholder, so until the real screenshot is ready the site's own banner (data-fallback) is shown,
     and the screenshot is swapped in as soon as it arrives. Card and case-study images of a site share one check. */
  (function covers() {
    var REAL = 900, groups = {};   /* screenshots come back 1280px wide; the placeholder is much smaller */
    qa('img[data-shot]').forEach(function (img) {
      var key = img.getAttribute('data-shot');
      (groups[key] = groups[key] || { imgs: [], state: 0, tries: 0, real: '' }).imgs.push(img);
    });
    function frame(img) { return img.parentNode; }
    function useFallback(img) {
      var fb = img.getAttribute('data-fallback');
      if (fb && !img.classList.contains('is-fb')) { img.classList.add('is-fb'); img.src = fb; }
      else frame(img).classList.add('is-broken');
    }
    function probe(key, g) {
      if (g.state === 2 || g.state === 1 || g.tries >= 7) return;
      g.state = 1;
      var n = ++g.tries, t = new Image();
      t.referrerPolicy = 'no-referrer';
      var again = function (ms) { g.state = 0; setTimeout(function () { probe(key, g); }, ms); };
      t.onload = function () {
        if (t.naturalWidth < REAL) { again(2500 + n * 1500); return; }
        g.state = 2; g.real = t.src;
        g.imgs.forEach(function (img) { img.classList.remove('is-fb'); frame(img).classList.remove('is-broken'); img.src = g.real; });
      };
      t.onerror = function () { again(4000 + n * 2500); };
      t.src = key + (key.indexOf('?') > -1 ? '&' : '?') + 'r=' + n + '-' + (Date.now() % 100000);
    }
    Object.keys(groups).forEach(function (key) {
      var g = groups[key];
      g.imgs.forEach(function (img) {
        var check = function () {
          if (img.classList.contains('is-fb')) return;                       /* the banner stand-in loaded */
          if (img.naturalWidth >= REAL) { frame(img).classList.remove('is-broken'); return; }
          if (g.state === 2) { img.src = g.real; return; }                   /* another copy already has the real one */
          useFallback(img); probe(key, g);
        };
        img.addEventListener('load', check);
        img.addEventListener('error', function () {
          if (img.classList.contains('is-fb')) { frame(img).classList.add('is-broken'); return; }
          if (g.state === 2 && img.src !== g.real) { img.src = g.real; return; }
          useFallback(img); probe(key, g);
        });
        if (img.complete && img.naturalWidth) check();   /* already loaded before this ran */
      });
    });
    /* gallery photos come straight from the client sites: hide any that fail to load */
    qa('.cs-gallery img').forEach(function (img) {
      var drop = function () { var fig = img.closest('figure'); if (fig) fig.hidden = true; };
      img.addEventListener('error', drop);
    });
  })();

  /* ---------------- Chat assistant ----------------
     Answers below are written from this page's own content (services, FAQ, tech stack, reviews, contact).
     Project answers are read from the Selected Work cards and their case studies, so they stay in sync.
     Any conversation can jump to WhatsApp with the visitor's last question already typed in. */
  (function chatbot() {
    var fab = q('#chat-fab'), chat = q('#chat'), hint = q('#chat-hint'), log = q('#chat-log'), chips = q('#chat-chips');
    var cForm = q('#chat-form'), cIn = q('#chat-in'), cClose = q('#chat-x');
    if (!fab || !chat || !log) return;
    var isOpen = false, greeted = false, lastQ = '', misses = 0, hintT1 = 0, hintT2 = 0;
    var small = function () { return window.innerWidth <= 560; };
    var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';

    /* ---- What the assistant knows (from this page) ---- */
    var projects = qa('.wk-card').map(function (card) {
      var id = card.getAttribute('data-case'), art = q('#' + id);
      var mk = function (attr) { var v = card.getAttribute(attr); return v ? new RegExp('\\b(' + v + ')', 'i') : null; };
      return {
        id: id, name: q('.wk-name', card).textContent.trim(), platform: card.getAttribute('data-platform') || '',
        chips: qa('.wk-chips span', card).map(function (x) { return x.textContent.trim(); }).join(' · '),
        lede: art && q('.cs-lede', art) ? q('.cs-lede', art).textContent.trim() : q('.wk-desc', card).textContent.trim(),
        url: art && q('.cs-visit', art) ? q('.cs-visit', art).href : '',
        reName: mk('data-chat-name'), reTopic: mk('data-chat-topic')
      };
    });
    var techList = qa('.tech-track').map(function (t) {
      var names = qa('.tech-item:not([data-clone]) span', t).map(function (x) { return x.textContent.trim(); });
      return '• <b>' + esc(t.getAttribute('aria-label') || 'Tools') + ':</b> ' + esc(names.join(', '));
    }).join('<br>');
    var waText = function () {
      return 'Hi Birinder! I found you through your portfolio website. ' + (lastQ ? 'My question: ' + lastQ : 'I would like to discuss a website project.');
    };
    var byPlatform = function (pl) { return projects.filter(function (p) { return p.platform === pl; }); };
    var caseActs = function (list) { return list.map(function (p) { return { label: p.name, kase: p.id }; }); };
    var WA = { label: 'WhatsApp Birinder', wa: true };
    var QUOTE = { label: 'Get a quote', modal: true, primary: true };

    function projectReply(p, intro) {
      return { t: (intro ? intro + '<br>' : '') + '<b>' + esc(p.name) + '</b>: ' + esc(p.lede) + '<span class="chat-sub">' + esc(p.chips) + '</span>',
               a: [{ label: 'Open case study', kase: p.id, primary: true }].concat(p.url ? [{ label: 'Visit live site ↗', href: p.url }] : []) };
    }
    function findProject(s, strongOnly) {
      for (var i = 0; i < projects.length; i++) if (projects[i].reName && projects[i].reName.test(s)) return projects[i];
      if (strongOnly) return null;
      for (var j = 0; j < projects.length; j++) if (projects[j].reTopic && projects[j].reTopic.test(s)) return projects[j];
      return null;
    }

    var INTENTS = [
      [/\b(whats ?app|human|real person|talk to (him|birinder|someone|a person)|speak (to|with)|live (chat|agent)|agent|call me)\b/, function () {
        return { t: 'Sure! Tap below to open WhatsApp with Birinder (<b>+91 86992 00848</b>). Your question is already typed in, so just press send.', a: [WA] }; }],
      [/^(hi+|hello+|hey+|hola|namaste|sat sri akal|good (morning|afternoon|evening)|yo)\b/, function () {
        return { t: 'Hello! 👋 How can I help? Ask about services, recent projects, pricing, timelines or how to get started.', a: [{ label: 'Services', ask: 'What services do you offer?' }, { label: 'Projects', ask: 'Show me your projects' }, WA] }; }],
      [/\b(price|pricing|cost|costs|charge|charges|rates?|budget|quote|quotation|how much|fees?|package|expensive|cheap|afford)\b/, function () {
        return { t: 'Pricing depends on the type of website, the features you need, design complexity and overall scope, so every quote is tailored to the project. Share your requirements and you\'ll get a clear quote.<br><br>To start: <b>50% advance</b>, and the remaining <b>50% on completion</b>, before final delivery.', a: [QUOTE, WA] }; }],
      [/\b(advance|deposit|payment|pay|installments?|upfront|50 ?%)\b/, function () {
        return { t: 'Projects start with a <b>50% advance</b> of the agreed cost. The remaining <b>50%</b> is due on completion, before final delivery.', a: [QUOTE, WA] }; }],
      [/\b(how long|timeline|time ?frame|turnaround|deadline|how many days|days|weeks?|delivery time|how fast|urgent|asap)\b/, function () {
        return { t: 'Most projects are delivered in <b>4–5 days</b>. Larger or more complex builds can take <b>up to 10 days</b>, depending on scope and requirements.', a: [{ label: 'Start a project', modal: true, primary: true }, WA] }; }],
      [/\b(contact|e-?mail|mail|phone number|number|reach|get in touch|call)\b/, function () {
        return { t: 'You can reach Birinder at:<br>📧 <a href="mailto:' + SITE.email + '">' + SITE.email + '</a><br>📞 <a href="tel:+918699200848">+91 86992 00848</a><br>💬 WhatsApp is the fastest way.<br>Replies within one working day.', a: [{ label: 'Send a message', modal: true, primary: true }, WA] }; }],
      [/\b(reviews?|testimonials?|upwork|ratings?|feedback|trust(ed)?|clients? say|references?)\b/, function () {
        return { t: 'Clients rate Birinder <b>5.0 / 5</b>, with 100% verified reviews from Upwork projects. They mention fast delivery, honest time reporting, clear communication and work done right the first time.', a: [{ label: 'Read the reviews', go: '#testimonials', primary: true }, QUOTE] }; }],
      [/\b(shopify|e-?commerce|online store|store setup|sell online|dropshipping)\b/, function () {
        var list = byPlatform('Shopify');
        return { t: 'Yes! Shopify work covers <b>store setup, theme customization, product & collection pages</b> and responsive storefront design.' + (list.length ? '<br><br>Recent Shopify builds: ' + esc(list.map(function (p) { return p.name; }).join(', ')) + '.' : ''), a: caseActs(list.slice(0, 3)).concat([QUOTE]) }; }],
      [/\b(wordpress|elementor|woocommerce|wp|plugins?|themes?)\b/, function () {
        var list = byPlatform('WordPress');
        return { t: 'Yes! WordPress work covers <b>business websites, theme customization, plugin integration</b>, Elementor builds and <b>redesigns & updates</b>.' + (list.length ? '<br><br>Recent WordPress builds: ' + esc(list.map(function (p) { return p.name; }).join(', ')) + '.' : ''), a: caseActs(list.slice(0, 3)).concat([QUOTE]) }; }],
      [/\b(seo|google ads|meta ads|facebook ads|instagram ads|ads|marketing|ranking|rank|traffic|content marketing|leads)\b/, function () {
        return { t: 'Beyond the build, Birinder helps brands grow with <b>SEO</b>, <b>Google Ads</b>, <b>Meta Ads</b> and <b>content marketing</b>. Every website also ships with on-page SEO basics and speed optimization.', a: [{ label: 'See services', go: '#services' }, QUOTE] }; }],
      [/\b(speed|performance|optimi[sz]\w*|slow|pagespeed|page speed|core web vitals|lighthouse|load(ing)? time)\b/, function () {
        return { t: '<b>Performance & Optimization</b> covers website speed optimization, responsive fixes, on-page SEO basics and cross-browser testing: lightweight builds with clean code.', a: [{ label: 'Fix my site', modal: true, primary: true }, WA] }; }],
      [/\b(logo|brand(ing)?|identity|ui|ux|figma|mock-?ups?|prototype|social media|graphic)\b/, function () {
        return { t: '<b>Design & Creative</b>: logo design, branding, UI/UX design and social media design, plus website design with responsive layouts, modern UI and landing pages. Tools include Figma, Photoshop and Canva.', a: [{ label: 'See services', go: '#services' }, QUOTE] }; }],
      [/\b(tech|stack|tools?|technolog\w*|languages?|frameworks?|html|css|javascript|js|php|mysql|bootstrap|hosting|domain|ai)\b/, function () {
        return { t: 'Tools & technologies Birinder works with:<br>' + techList, a: [{ label: 'See the tech stack', go: '#tech' }, { label: 'Projects', ask: 'Show me your projects' }] }; }],
      [/\b(mobile|responsive|tablets?|devices?|iphone|android)\b/, function () {
        return { t: 'Yes! Every website is <b>responsive</b> and adapts to smartphones, tablets, laptops and desktop computers.', a: [{ label: 'See projects', go: '#work' }] }; }],
      [/\b(existing|redesign|re-?design|update|modify|fix|repair|bugs?|broken|revamp|migrate|migration|change|improve)\b/, function () {
        return { t: 'Absolutely. Website <b>redesigns, bug fixes, layout improvements, new features, performance enhancements</b> and other custom changes to an existing site are all welcome.', a: [{ label: 'Describe the changes', modal: true, primary: true }, WA] }; }],
      [/\b(after|handover|hand over|support|maintenance|maintain|aftercare|training|manage)\b/, function () {
        return { t: 'Once the project is complete, Birinder reviews the final work with you to make sure it meets the agreed requirements, helps with the <b>handover</b> and guides you on managing your website when needed.', a: [QUOTE, WA] }; }],
      [/\b(start|get started|begin|process|steps|requirements?|how (does|do) (it|you) work|onboard)\b/, function () {
        return { t: 'Here\'s how a project runs:<br>1. Share your requirements (form, call or WhatsApp)<br>2. Get a tailored quote<br>3. Pay the 50% advance to begin<br>4. Design & build, usually 4–5 days (up to 10 for bigger builds)<br>5. Review together, then the final 50% and handover', a: [{ label: 'Start a project', modal: true, primary: true }, WA] }; }],
      [/\b(discuss|communicat\w*|meeting|zoom|google meet|video call)\b/, function () {
        return { t: 'All project discussions happen over <b>phone calls or WhatsApp chat</b>, which keeps communication simple, direct and convenient.', a: [WA, { label: 'Call +91 86992 00848', href: 'tel:+918699200848', same: true }] }; }],
      [/\b(hire|available|availability|freelance|book (you|him)|work with (you|him)|take (on )?my project)\b/, function () {
        return { t: 'Yes, Birinder is taking on new freelance projects: new websites, Shopify stores, WordPress builds, redesigns and fixes. Tell him about yours:', a: [{ label: 'Start a project', modal: true, primary: true }, WA] }; }],
      [/\b(where|location|located|based|india|punjab|country|international|abroad|worldwide|overseas|time ?zone)\b/, function () {
        return { t: 'Birinder is based in <b>Punjab, India</b> and works with clients worldwide. The projects on this page are live in Canada, Australia and India.', a: [{ label: 'See projects', go: '#work' }, WA] }; }],
      [/\b(who|about|birinder|yourself|experience|background|bio)\b/, function () {
        return { t: '<b>Birinder Singh</b> is a freelance web designer & creative developer building fast, motion-led WordPress, Shopify and custom websites for founders and ambitious brands, with a focus on purposeful design, performance and quick turnaround.', a: [{ label: 'Why work with me', go: '#why' }, { label: 'See projects', go: '#work' }] }; }],
      [/\b(blog|articles?|posts?)\b/, function () {
        return { t: 'Yes—read the Shopify vs WooCommerce guide and WordPress troubleshooting tips in the BS Works blog. You can also follow Birinder on LinkedIn for updates.', a: [{ label: 'Read the blog', href: '/blog/', same: true, primary: true }, { label: 'See projects', go: '#work' }] }; }],
      [/\b(projects?|portfolio|work|examples?|samples?|case stud\w*|websites? (you|he)|built|clients?|showcase)\b/, function (s) {
        var p = findProject(s);
        if (p) return projectReply(p, 'Here\'s a similar project:');
        return { t: 'Here are ' + projects.length + ' recent live builds. Tap one to open its case study:', a: caseActs(projects).concat([{ label: 'See all projects', go: '#work', primary: true }]) }; }],
      [/\b(services?|offer|what (do|can) you do|help (me )?with|build|make|create|develop)\b/, function (s) {
        var p = findProject(s), extra = p ? '<br><br>For example, Birinder built <b>' + esc(p.name) + '</b>: ' + esc(p.lede) : '';
        return { t: 'Here\'s what Birinder offers:<br>• <b>Web Design</b>: responsive layouts, modern UI, landing pages<br>• <b>Web Development</b>: HTML, CSS & JavaScript, Bootstrap, custom features & bug fixes<br>• <b>Shopify</b>: store setup, theme customization, product pages<br>• <b>WordPress</b>: business sites, plugin integration, redesigns<br>• <b>Performance</b>: speed, responsive fixes, on-page SEO<br>Plus <b>digital marketing</b> (SEO, Google & Meta Ads) and <b>design</b> (logos, branding, UI/UX).' + extra,
                 a: (p ? [{ label: p.name + ' case study', kase: p.id }] : [{ label: 'See services', go: '#services' }]).concat([QUOTE]) }; }],
      [/\b(thanks?|thank you|thx|ty|great|awesome|cool|perfect|nice|ok|okay|bye|got it)\b/, function () {
        return { t: 'You\'re welcome! Whenever you\'re ready, send a message or ping Birinder on WhatsApp. 🙌', a: [{ label: 'Send a message', modal: true }, WA] }; }]
    ];

    function answer(raw) {
      var s = raw.toLowerCase();
      var named = findProject(s, true);
      if (named) return projectReply(named);
      for (var i = 0; i < INTENTS.length; i++) if (INTENTS[i][0].test(s)) { misses = 0; return INTENTS[i][1](s); }
      var topical = findProject(s);
      if (topical) return projectReply(topical, 'This project might be what you\'re looking for:');
      misses++;
      return { t: misses > 1 ? 'Birinder can answer that one personally. Tap below and your question goes straight to his WhatsApp.' : 'I don\'t have an answer for that yet, but Birinder does. Ask him on WhatsApp (your question is already typed in), or pick a topic below.',
               a: [{ label: 'Ask on WhatsApp', wa: true }, { label: 'Send a message', modal: true }] };
    }

    /* ---- Rendering ---- */
    function syncWa() { var h = waLink(waText()); qa('[data-wa]').forEach(function (a) { a.href = h; }); }
    function makeAct(a) {
      var el;
      if (a.wa) { el = document.createElement('a'); el.href = waLink(waText()); el.target = '_blank'; el.rel = 'noopener'; el.innerHTML = WA_ICON; el.appendChild(document.createTextNode(a.label)); }
      else if (a.href) { el = document.createElement('a'); el.href = a.href; if (!a.same) { el.target = '_blank'; el.rel = 'noopener'; } el.textContent = a.label; }
      else if (a.kase) { el = document.createElement('a'); el.href = '#' + a.kase; el.setAttribute('data-case', a.kase); el.textContent = a.label; }
      else { el = document.createElement('button'); el.type = 'button'; el.textContent = a.label; }
      el.className = 'chat-act' + (a.wa ? ' is-wa' : a.primary ? ' is-p' : '');
      el._act = a;
      return el;
    }
    function toBottom() { log.scrollTo ? log.scrollTo({ top: log.scrollHeight, behavior: RM ? 'auto' : 'smooth' }) : (log.scrollTop = log.scrollHeight); }
    function add(html, who, acts) {
      var m = document.createElement('div');
      m.className = 'chat-msg ' + (who === 'me' ? 'is-me' : 'is-bot');
      m.innerHTML = html;
      if (acts && acts.length) {
        var box = document.createElement('div'); box.className = 'chat-acts';
        acts.forEach(function (a) { box.appendChild(makeAct(a)); });
        m.appendChild(box);
      }
      log.appendChild(m);
      toBottom();
    }
    function botSay(r) {
      var dots = document.createElement('div');
      dots.className = 'chat-typing'; dots.setAttribute('aria-label', 'Assistant is typing');
      dots.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(dots); toBottom();
      setTimeout(function () { if (dots.parentNode) dots.parentNode.removeChild(dots); add(r.t, 'bot', r.a); }, RM ? 120 : 450 + Math.min(450, r.t.length));
    }
    function ask(text) {
      var clean = String(text || '').trim().slice(0, 300);
      if (!clean) return;
      lastQ = clean; syncWa();
      add(esc(clean), 'me');
      botSay(answer(clean));
    }
    function greet() {
      greeted = true;
      add('Hi there! 👋 I\'m Birinder\'s assistant. Ask me about <b>services</b>, recent <b>projects</b>, <b>pricing</b> or <b>timelines</b>, or talk to Birinder directly on WhatsApp.', 'bot',
          [{ label: 'See projects', go: '#work', primary: true }, { label: 'Services', ask: 'What services do you offer?' }, WA]);
    }

    /* ---- Open / close ---- */
    function hideHint(forever) {
      clearTimeout(hintT1); clearTimeout(hintT2);
      if (hint) hint.hidden = true;
      if (forever) { try { sessionStorage.setItem('bs-chat-hint', '1'); } catch (err) { /* storage blocked */ } }
    }
    function openChat() {
      if (isOpen) return;
      if (menuOpen) collapseNavbar(false);
      isOpen = true;
      hideHint(true);
      chat.hidden = false;
      fab.setAttribute('aria-expanded', 'true'); fab.setAttribute('aria-label', 'Close chat assistant'); fab.classList.add('is-seen');
      if (!greeted) greet();
      if (FINE) setTimeout(function () { cIn.focus({ preventScroll: true }); }, 200);
    }
    function closeChat(refocus) {
      if (!isOpen) return;
      isOpen = false;
      chat.hidden = true;
      fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-label', 'Open chat assistant');
      if (refocus !== false) fab.focus({ preventScroll: true });
    }
    function goTo(id) {
      if (small()) closeChat(false);
      var run = function () { scrollToId(id); };
      if (csCurrent) { closeCase(); setTimeout(run, RM ? 50 : 1700); } else run();
    }

    fab.addEventListener('click', function () { if (isOpen) closeChat(); else openChat(); });
    cClose.addEventListener('click', function () { closeChat(); });
    if (hint) {
      hint.addEventListener('click', function (e) { if (e.target.closest('#chat-hint-x')) { hideHint(true); return; } openChat(); });
      var seen = false; try { seen = sessionStorage.getItem('bs-chat-hint') === '1'; } catch (err) { /* storage blocked */ }
      if (!seen) {
        hintT1 = setTimeout(function () { if (!isOpen && !menuOpen && !modalOpen && !csCurrent) hint.hidden = false; }, 6000);
        hintT2 = setTimeout(function () { hideHint(false); }, 18000);
      }
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]');
      if (b) ask(b.getAttribute('data-q'));
    });
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = cIn.value; cIn.value = '';
      ask(v);
    });
    log.addEventListener('click', function (e) {
      var el = e.target.closest('.chat-act');
      if (!el || !el._act) return;
      var a = el._act;
      if (a.ask) { e.preventDefault(); ask(a.ask); }
      else if (a.go) { e.preventDefault(); goTo(a.go); }
      else if (a.modal) { e.preventDefault(); if (small()) closeChat(false); openModal(); }
      else if (a.kase) { if (small()) closeChat(false); }   /* the case study opens through the page's [data-case] handler */
      else if (a.wa) { el.href = waLink(waText()); }
    });
    chat.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeChat(); } });
    syncWa();
  })();

  csRoute(true);

  /* Pause looping CSS animations while their section is off screen (saves CPU and battery) */
  if (window.IntersectionObserver) {
    var idleIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-idle', !e.isIntersecting); });
    }, { rootMargin: '120px 0px' });
    qa('#hero, #tech, .mq').forEach(function (el) { idleIO.observe(el); });
  }

  if (!libsOk) { clearTimeout(window.__animFallback); root.classList.remove('anim'); root.classList.add('no-gsap'); return; }

  try {
    init();
  } catch (err) {
    console.error(err);
    root.classList.remove('anim');
  }

  function init() {
    clearTimeout(window.__animFallback);
    var gsap = G, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    if (RM) root.classList.add('rm');

    var tRefresh;
    /* Below-the-fold scenes are set up in small chunks when the browser is idle, so the first load never blocks input */
    var later = function (fn) {
      var run = function () { try { fn(); } catch (err) { console.error(err); } };
      if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 700 }); else setTimeout(run, 16);
    };
    refreshSoon = function () { clearTimeout(tRefresh); tRefresh = setTimeout(function () { ScrollTrigger.refresh(); }, 120); };

    /* Lenis smooth scroll, driven by the GSAP ticker */
    if (!RM && window.Lenis) {
      lenis = new window.Lenis();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    var fontCss = new Promise(function (res) {
      var l = document.getElementById('font-css');
      if (!l || window.__fontCss) return res();
      l.addEventListener('load', res); l.addEventListener('error', res);
    });
    var fontsReady = Promise.race([
      fontCss.then(function () { return document.fonts ? document.fonts.load('400 1em "Host Grotesk"').then(function () { return document.fonts.ready; }) : null; }),
      new Promise(function (r) { setTimeout(r, 1200); })
    ]).catch(function () {});

    /* ---------- AnimatedCopy ---------- */
    var splits = new Map();
    function makeSplit(el) {
      if (splits.has(el)) return splits.get(el);
      var mode = el.dataset.split || 'lines';
      var stagger = parseFloat(el.dataset.stagger || (mode === 'chars' ? .02 : .1));
      var delay = parseFloat(el.dataset.delay || 0);
      var duration = parseFloat(el.dataset.duration || .5);
      var rec = { el: el, played: false };
      if (RM) {
        var fade = gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .8, ease: 'power2.out', paused: true });
        rec.play = function () { if (!rec.played) { rec.played = true; fade.play(); } };
      } else {
        var split, targets;
        if (mode === 'chars') {
          split = SplitText.create(el, { type: 'words,chars', mask: 'chars', charsClass: 'char++' });
          (split.masks || []).forEach(function (m) { m.style.paddingInline = '.04em'; m.style.marginInline = '-.04em'; });
          targets = split.chars;
        } else {
          split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line++' });
          targets = split.lines;
        }
        gsap.set(el, { opacity: 1 });
        var tw = gsap.fromTo(targets, { yPercent: 100 }, { yPercent: 0, duration: duration, ease: 'power3.out', stagger: stagger, delay: delay, paused: true,
          onComplete: function () { split.revert(); gsap.set(el, { opacity: 1 }); } });
        rec.play = function () { if (!rec.played) { rec.played = true; tw.play(); } };
      }
      splits.set(el, rec);
      if (el.dataset.manual === undefined) {
        var trig = el.dataset.trigger === 'section' ? el.closest('section') : el;
        var st = ScrollTrigger.create({ trigger: trig, start: el.dataset.start || 'top 85%', end: 'bottom 68%', once: true, onEnter: rec.play });
        if (window.scrollY > st.start) rec.play();
      }
      return rec;
    }

    /* ---------- Header ---------- */
    var hdr = q('.hdr'), introDone = RM, hdrHidden = false, lastY = 0;
    function onScroll(y) {
      hdr.classList.toggle('is-blur', y > window.innerHeight * .4);
      if (!introDone || modalOpen || menuOpen) { lastY = y; return; }
      if (Math.abs(y - lastY) < 3) return;
      if (y > lastY && y > 120 && !hdrHidden) { hdrHidden = true; gsap.to(hdr, { yPercent: -100, duration: .5, ease: 'power3.out' }); }
      else if (y < lastY && hdrHidden) { hdrHidden = false; gsap.to(hdr, { yPercent: 0, duration: .5, ease: 'power3.out' }); }
      lastY = y;
    }
    if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
    else window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

    fontsReady.then(function () {
      /* ---------- Hero intro (the photo reveal itself is CSS, so it starts before this script loads) ---------- */
      var h1 = makeSplit(q('.hero-h1'));
      var sides = qa('.hero-meta [data-split]').map(makeSplit);
      if (RM) {
        gsap.fromTo(hdr, { opacity: 0 }, { opacity: 1, duration: .8 });
        gsap.fromTo('.hero-cyl, .hero-cue', { opacity: 0 }, { opacity: 1, duration: .8 });
        gsap.set('.hero-rule', { scaleX: 1 });
        h1.play(); sides.forEach(function (s) { s.play(); });
      } else {
        if (lenis) lenis.stop();
        gsap.timeline()
          .add(function () { h1.play(); }, .3)
          .add(function () { sides.forEach(function (s) { s.play(); }); }, .75)
          .to('.hero-rule', { scaleX: 1, duration: .9, ease: 'power3.out' }, .85)
          .fromTo('.hero-cyl', { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' }, .9)
          .fromTo(hdr, { yPercent: -50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, ease: 'power3.out', onComplete: function () { introDone = true; if (lenis && !csCurrent) lenis.start(); } }, 1.0)
          .fromTo('.hero-cue', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, 1.1);
      }

      /* ---------- Lazy AnimatedCopy for everything else ---------- */
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); makeSplit(e.target); } });
      }, { rootMargin: '200% 0px' });
      qa('[data-split]').forEach(function (el) { if (el.dataset.manual === undefined) io.observe(el); });
    });

    /* ---------- Hero mouse parallax (desktop) ---------- */
    if (!RM && FINE) {
      var heroImg = q('.hero-portrait img'), heroText = q('.hero-content');
      var nx = 0, ny = 0, cur = { px: 0, py: 0, tx: 0, ty: 0 };
      window.addEventListener('mousemove', function (e) { nx = e.clientX / window.innerWidth * 2 - 1; ny = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
      gsap.ticker.add(function () {
        if (window.innerWidth <= 1024 || window.scrollY > window.innerHeight * 2.2) return;
        cur.px += (-30 * nx - cur.px) * .08; cur.py += (-30 * ny - cur.py) * .08;
        cur.tx += (-12 * nx - cur.tx) * .08; cur.ty += (-12 * ny - cur.ty) * .08;
        gsap.set(heroImg, { x: cur.px, y: cur.py });
        gsap.set(heroText, { x: cur.tx, y: cur.ty });
      });
    }

    /* ---------- Hero scroll scene ---------- */
    if (!RM) {
      gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } })
        .to('.hero-screen', { scale: .5, borderRadius: 48, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo('.wall', { filter: 'blur(24px)', opacity: .35 }, { filter: 'blur(0px)', opacity: 1, ease: 'none', duration: .18 }, .32);
    }

    later(function () {
    /* ---------- Portfolio ---------- */
    (function portfolio() {
      var pf = q('#portfolio'), imgs = qa('.pf-img', pf), dots = qa('.pf-dot', pf), rows = qa('.pf-row', pf), count = imgs.length;
      if (RM) gsap.set(imgs.slice(1), { opacity: 0 }); else gsap.set(imgs.slice(1), { yPercent: 100 });
      if (!RM) {
        gsap.fromTo('.pf-dome', { clipPath: 'ellipse(150% 100% at 50% 100%)', yPercent: 0 }, {
          clipPath: 'ellipse(60% 100% at 50% 100%)', yPercent: function () { return isMobile() ? -50 : -70; }, ease: 'none',
          scrollTrigger: { trigger: pf, start: 'top bottom', end: '30% bottom', scrub: true, invalidateOnRefresh: true }
        });
      }
      var tl = gsap.timeline({ scrollTrigger: { trigger: pf, start: '10% top', end: 'bottom bottom', scrub: true,
        snap: { snapTo: 1 / (count - 1), duration: { min: .2, max: .6 }, ease: 'power1.inOut' } } });
      tl.fromTo('.pf-progress', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: count - 1 }, 0);
      for (var s = 0; s < count - 1; s++) {
        if (RM) tl.to(imgs[s + 1], { opacity: 1, duration: 1, ease: 'none' }, s);
        else tl.to(imgs[s + 1], { yPercent: 0, duration: 1, ease: 'power2.inOut' }, s)
               .to(imgs[s], { filter: 'brightness(0.3)', duration: 1, ease: 'power2.inOut' }, s);
        tl.to(dots[s + 1], { backgroundColor: '#ffffff', borderColor: '#ffffff', duration: .01 }, s + .99)
          .to(rows[s + 1], { opacity: 1, duration: .01 }, s + .99)
          .to(rows[s], { opacity: .7, duration: .01 }, s + .99);
      }
    })();
    });

    later(function () {
    /* ---------- Why: columns + sweeping underline ---------- */
    qa('.why-col').forEach(function (col) {
      var line = q('.why-line', col);
      col.addEventListener('mouseenter', function () { gsap.set(line, { transformOrigin: 'left center' }); gsap.to(line, { scaleX: 1, duration: .55, ease: 'power2.out', overwrite: true }); });
      col.addEventListener('mouseleave', function () { gsap.set(line, { transformOrigin: 'right center' }); gsap.to(line, { scaleX: 0, duration: .55, ease: 'power2.out', overwrite: true }); });
    });
    gsap.fromTo('.why-col', RM ? { opacity: 0, y: 24 } : { opacity: 0, yPercent: 10 }, RM ? { opacity: 1, y: 0, duration: .8 } : { opacity: 1, yPercent: 0, duration: .8, ease: 'power3.out', stagger: .05,
      scrollTrigger: { trigger: '.why-grid', start: 'top 85%', once: true } });

    /* ---------- Services: card bloom ---------- */
    var cards = qa('.svc-card'), activeCard = cards[0];
    gsap.set(cards, { '--reveal': '-40%' }); gsap.set(activeCard, { '--reveal': '100%' });
    function activate(c) {
      if (c === activeCard) return;
      gsap.to(activeCard, { '--reveal': '-40%', duration: .45, ease: 'power2.out', overwrite: true });
      activeCard.classList.remove('is-active');
      gsap.fromTo(c, { '--reveal': '-40%' }, { '--reveal': '100%', duration: .45, ease: 'power2.out', overwrite: true });
      c.classList.add('is-active'); activeCard = c;
    }
    cards.forEach(function (c) { c.addEventListener('mouseenter', function () { activate(c); }); c.addEventListener('click', function () { activate(c); }); });
    });

    later(function () {
    /* ---------- Responsive scroll scenes ---------- */
    var mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 1025px)', tablet: '(min-width: 769px) and (max-width: 1024px)', mobile: '(max-width: 768px)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
      var c = ctx.conditions;
      if (c.reduce) return;

      /* Services horizontal rail */
      var row = q('.svc-row');
      gsap.fromTo(row, { xPercent: c.desktop ? 70 : 50 }, {
        xPercent: function () {
          var w = row.scrollWidth, gut = parseFloat(getComputedStyle(row).paddingLeft) || 0;
          return -Math.max(0, (w - window.innerWidth + gut) / w * 100);
        },
        ease: 'none', scrollTrigger: { trigger: '#services', start: 'top 20%', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
      });

      /* Clients logo warp */
      var logos = gsap.utils.shuffle(qa('.cl-logo'));
      var groups = [], k = 0;
      while (k < logos.length) { var size = Math.random() < .5 ? 2 : 3; groups.push(logos.slice(k, k + size)); k += size; }
      var ctl = gsap.timeline({ scrollTrigger: { trigger: '#clients', start: 'top 20%', end: 'bottom center', scrub: true, invalidateOnRefresh: true }, defaults: { ease: 'none' } });
      var R = gsap.utils.random;
      groups.forEach(function (g, gi) {
        g.forEach(function (el, j) {
          var pos = gi * 1.9 + j * .4, inD = c.mobile ? 4 : 1.5, outD = c.mobile ? 3.5 : 1.5;
          ctl.fromTo(el, { opacity: 0, filter: 'blur(10px)', transformOrigin: '0 0', x: c.mobile ? 0 : R(-180, 180), y: R(-180, 180), z: c.mobile ? -R(400, 700) : R(-2200, -1600) },
                         { opacity: 1, filter: 'blur(0px)', x: 0, y: 0, z: 0, duration: inD }, pos)
             .to(el, { z: c.mobile ? R(400, 700) : R(1400, 1800), filter: 'blur(10px)', opacity: 0, duration: outD }, pos + inD);
        });
      });

      /* Footer parallax */
      if (c.desktop) {
        gsap.fromTo('.ft-panel', { yPercent: 20 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ft', start: 'top 60%', end: 'bottom bottom', scrub: true } });
      }
    });
    });

    later(function () {
    /* ---------- Awards: strings + preview ---------- */
    (function awards() {
      if (!q('.aw-list')) return; /* Awards section removed */
      var actx = null, reverb = null;
      var unlock = function () {
        try {
          if (!actx) {
            actx = new (window.AudioContext || window.webkitAudioContext)();
            var len = Math.floor(actx.sampleRate * 1.1), buf = actx.createBuffer(2, len, actx.sampleRate);
            for (var ch = 0; ch < 2; ch++) { var data = buf.getChannelData(ch); for (var i2 = 0; i2 < len; i2++) data[i2] = (Math.random() * 2 - 1) * Math.pow(1 - i2 / len, 3); }
            reverb = actx.createConvolver(); reverb.buffer = buf;
            var wet = actx.createGain(); wet.gain.value = .35; reverb.connect(wet).connect(actx.destination);
          } else if (actx.state === 'suspended') actx.resume();
        } catch (e) { actx = null; }
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock);
      function pluck(strength) {
        if (!actx || actx.state !== 'running' || strength < 6) return;
        var now = actx.currentTime, dur = .5;
        var buf = actx.createBuffer(1, Math.floor(actx.sampleRate * dur), actx.sampleRate), d = buf.getChannelData(0);
        for (var i3 = 0; i3 < d.length; i3++) d[i3] = (Math.random() * 2 - 1) * Math.exp(-i3 / (actx.sampleRate * .045));
        var src = actx.createBufferSource(); src.buffer = buf;
        var bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 180 + Math.random() * 260; bp.Q.value = 14;
        var lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
        var gain = actx.createGain(); gain.gain.setValueAtTime(Math.min(.5, strength / 38) * .5, now); gain.gain.exponentialRampToValueAtTime(.0001, now + dur);
        src.connect(bp).connect(lp).connect(gain); gain.connect(actx.destination); if (reverb) gain.connect(reverb);
        src.start(now); src.stop(now + dur);
      }
      qa('.aw-string').forEach(function (svg) {
        var path = q('path', svg), offset = 0, amp = 0, frame = 0, raf = 0;
        var draw = function () { path.setAttribute('d', 'M0 50 Q500 ' + (50 + offset).toFixed(2) + ' 1000 50'); };
        var settle = function () {
          amp *= .95; frame++;
          offset = amp * Math.cos(frame * .55);
          draw();
          if (Math.abs(amp) > .25) raf = requestAnimationFrame(settle); else { offset = 0; draw(); raf = 0; }
        };
        svg.addEventListener('pointermove', function (e) {
          if (raf) { cancelAnimationFrame(raf); raf = 0; }
          offset = Math.max(-40, Math.min(40, offset + (e.movementY || 0) / 2));
          draw();
        });
        svg.addEventListener('pointerleave', function () { amp = offset; frame = 0; pluck(Math.abs(amp)); if (!raf) raf = requestAnimationFrame(settle); });
        if (!RM) gsap.fromTo(svg, { scaleX: 0 }, { scaleX: 1, duration: .8, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
      });

      if (!FINE) return;
      var list = q('.aw-list'), card = q('.aw-preview'), pimgs = qa('img', card), rows = qa('.aw-row', list);
      var active = -1, z = 10, inside = false, py = 0;
      gsap.set(pimgs, { scale: 0 });
      function hit() {
        if (window.innerWidth <= 1024) return;
        for (var r = 0; r < rows.length; r++) {
          var b = rows[r].getBoundingClientRect();
          if (py >= b.top && py < b.bottom) { setActive(r); return; }
        }
      }
      function setActive(r) {
        if (r === active) return;
        active = r;
        var row = rows[r], y = row.offsetTop + row.offsetHeight / 2 - card.offsetHeight / 2;
        gsap.to(card, { y: y, duration: .65, ease: 'back.out(1.6)' });
        var img = pimgs[r]; img.style.zIndex = ++z;
        gsap.fromTo(img, { scale: 0 }, { scale: 1.05, duration: .45, ease: 'power2.out' });
      }
      list.addEventListener('mouseenter', function (e) { inside = true; py = e.clientY; hit(); gsap.to(card, { opacity: 1, duration: .4 }); });
      list.addEventListener('mouseleave', function () { inside = false; active = -1; gsap.to(card, { opacity: 0, duration: .4 }); });
      list.addEventListener('mousemove', function (e) { py = e.clientY; hit(); });
      if (lenis) lenis.on('scroll', function () { if (inside) hit(); });
      else window.addEventListener('scroll', function () { if (inside) hit(); }, { passive: true });
    })();
    });

    later(function () {
    /* ---------- Testimonials + FAQ entrances ---------- */
    gsap.fromTo('.testimonial-fade', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '#testimonials .tm-wrap', start: 'top 70%', once: true } });
    qa('.faq-item').forEach(function (it) {
      gsap.fromTo(it, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 85%', once: true } });
    });

    /* ---------- Footer columns entrance ---------- */
    gsap.fromTo('.ft-col', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.ft-cols', start: 'top 92%', once: true } });
    });

    later(function () {
    /* ---------- Shared scroll velocity (marquee band + tech rows) ---------- */
    var velHooks = [];
    /* run fn (in an idle moment) the first time el comes within `margin` of the viewport */
    var whenNear = function (el, fn, margin) {
      if (!el || !window.IntersectionObserver) return fn();
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); later(fn); }
      }, { rootMargin: (margin || '100%') + ' 0px' });
      io.observe(el);
    };
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { var v = self.getVelocity(); velHooks.forEach(function (fn) { fn(v); }); } });

    /* ---------- Selected Work: the two title words slide into place ---------- */
    if (!RM) qa('[data-drift]').forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-drift')) || 6;
      gsap.fromTo(el, { xPercent: d }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 40%', scrub: .6 } });
    });

    /* ---------- Marquee band: speeds up and turns with the scroll direction ---------- */
    (function marquee() {
      var band = q('.mq'), track = band && q('.mq-track', band), first = track && q('.mq-set', track);
      if (!first || RM) return;
      var setW = 0, pos = 0, dir = 1, boost = 0, speed = 0, onScreen = false, fw = window.innerWidth;
      function fill() {
        qa('.mq-set[data-clone]', track).forEach(function (c) { track.removeChild(c); });
        setW = first.getBoundingClientRect().width;
        if (!setW) return;
        var need = Math.max(2, Math.ceil(window.innerWidth / setW) + 1);
        for (var i = 1; i < need; i++) { var c = first.cloneNode(true); c.setAttribute('data-clone', ''); track.appendChild(c); }
        speed = setW / 42;          /* one full phrase set every 42 s */
        pos = pos % setW;
      }
      whenNear(band, fill, '60%');   /* measured only when it is about to scroll into view */
      window.addEventListener('resize', function () { if (setW && Math.abs(window.innerWidth - fw) > 40) { fw = window.innerWidth; fill(); } });
      new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; }, { rootMargin: '120px 0px' }).observe(band);
      velHooks.push(function (v) { if (v) dir = v > 0 ? 1 : -1; boost = Math.min(Math.abs(v) / 400, 9); });
      gsap.ticker.add(function (t, dt) {
        boost += (0 - boost) * .06;
        if (!onScreen || !setW) return;
        pos -= speed * (dt / 1000) * dir * (1 + boost);
        if (pos <= -setW) pos += setW;
        if (pos > 0) pos -= setW;
        gsap.set(track, { x: pos, force3D: true });
      });
    })();

    /* ---------- Tech rows: slide in on scroll, speed up with the scroll, slow down on hover ---------- */
    (function techMotion() {
      var sec = q('#tech'), rows = qa('.tech-row');
      if (!sec || !rows.length || RM) return;
      whenNear(sec, function () { rows.forEach(function (row, i) {
        gsap.fromTo(row, { xPercent: i % 2 ? -10 : 10, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.tech-rows', start: 'top 88%', once: true } });
        gsap.fromTo(qa('.tech-item', row), { y: 30, opacity: 0, scale: .92 }, { y: 0, opacity: 1, scale: 1, duration: .8, ease: 'power3.out', stagger: .04, delay: .1 + i * .12, clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '.tech-rows', start: 'top 88%', once: true } });
      }); });
      var tracks = rows.map(function (r) { return q('.tech-track', r); });
      var rates = rows.map(function () { return 1; }), hov = rows.map(function () { return false; });
      var boost = 0, onScreen = false;
      rows.forEach(function (row, i) {
        row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hov[i] = true; });
        row.addEventListener('pointerleave', function () { hov[i] = false; });
      });
      new IntersectionObserver(function (es) { onScreen = es[es.length - 1].isIntersecting; }).observe(sec);
      velHooks.push(function (v) { boost = Math.min(Math.abs(v) / 500, 5); });
      gsap.ticker.add(function () {
        boost += (0 - boost) * .06;
        if (!onScreen) return;
        tracks.forEach(function (t, i) {
          var a = t.getAnimations ? t.getAnimations()[0] : null;
          if (!a) return;
          var target = hov[i] ? .18 : 1 + boost;
          rates[i] += (target - rates[i]) * .08;
          if (Math.abs(a.playbackRate - rates[i]) > .002) a.playbackRate = rates[i];
        });
      });
    })();
    });

    later(function () {
    /* ---------- Selected Work: project cards rise in and their frames open up ---------- */
    if (RM) return;
    var wkCards = qa('.wk-card');
    gsap.set(wkCards, { autoAlpha: 0, y: 80 });
    ScrollTrigger.batch(wkCards, { start: 'top 90%', once: true, onEnter: function (els) {
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .12, overwrite: true, clearProps: 'transform,opacity,visibility' });
      gsap.fromTo(els.map(function (el) { return q('.wk-shot', el); }), { clipPath: 'inset(8% 6% 8% 6% round 24px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'expo.out', stagger: .12, clearProps: 'clipPath' });
    } });
    });

    /* ---------- Refresh after fonts + images ---------- */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);
    later(refreshSoon);
    var rw = window.innerWidth;
    window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - rw) > 40) { rw = window.innerWidth; refreshSoon(); } });
  }
});
