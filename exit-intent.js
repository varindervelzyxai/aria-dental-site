/* ==============================================
   ARIADENTAL.AI — Exit-intent modal (Batch 3)
   Vanilla JS. No dependencies. Self-contained styles.
   Fires once per session. Esc-dismissible. Focus-trapped.
   Referenced from: index.html, compare.html, platform.html
   ============================================== */
(function () {
  'use strict';

  // Don't run twice on the same page; don't run on touch (mouseleave is unreliable on mobile).
  if (window.__ariaExitIntentLoaded) return;
  window.__ariaExitIntentLoaded = true;

  var STORAGE_KEY = 'aria_exit_intent_shown_v1';
  var COOLDOWN_KEY = 'aria_exit_intent_cooldown_v1';

  // Already shown this session? Bail.
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
  } catch (e) { /* sessionStorage may be blocked; degrade silently */ }

  // Don't show on touch-primary devices — mouseleave is too noisy there.
  var isTouchPrimary = window.matchMedia && window.matchMedia('(hover: none)').matches;
  if (isTouchPrimary) return;

  // Inject styles
  var css =
    '.aei-overlay{position:fixed;inset:0;background:rgba(26,26,46,0.6);backdrop-filter:blur(4px);' +
      '-webkit-backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;' +
      'z-index:99999;padding:24px;font-family:"Sora",system-ui,sans-serif;animation:aei-fade .25s ease-out}' +
    '.aei-overlay.aei-open{display:flex}' +
    '.aei-modal{background:#FEFCF8;color:#1A1A2E;border-radius:24px;max-width:480px;width:100%;' +
      'padding:40px 36px 32px;box-shadow:0 30px 80px rgba(26,26,46,0.35);position:relative;' +
      'border:1px solid #E8E4DE;animation:aei-pop .25s ease-out}' +
    '.aei-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border:none;background:transparent;' +
      'color:#6B6B82;font-size:22px;line-height:1;cursor:pointer;border-radius:50%;display:flex;' +
      'align-items:center;justify-content:center;transition:background .15s,color .15s}' +
    '.aei-close:hover,.aei-close:focus{background:#E8E4DE;color:#1A1A2E;outline:none}' +
    '.aei-label{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:600;' +
      'text-transform:uppercase;letter-spacing:.14em;color:#D4952A;margin-bottom:14px}' +
    '.aei-label::before{content:"";width:18px;height:2px;background:#D4952A;border-radius:2px}' +
    '.aei-headline{font-family:"Fraunces",Georgia,serif;font-size:30px;font-weight:600;line-height:1.15;' +
      'letter-spacing:-.01em;color:#1A1A2E;margin:0 0 12px}' +
    '.aei-sub{font-size:15px;line-height:1.6;color:#6B6B82;margin:0 0 24px}' +
    '.aei-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 22px;background:#D4952A;color:#fff;' +
      'border-radius:50px;font-family:"Sora",sans-serif;font-size:15px;font-weight:600;text-decoration:none;' +
      'box-shadow:0 4px 16px rgba(212,149,42,0.3);transition:background .2s,transform .15s,box-shadow .2s}' +
    '.aei-cta:hover,.aei-cta:focus{background:#B87D1E;transform:translateY(-1px);' +
      'box-shadow:0 6px 24px rgba(212,149,42,0.4);outline:none}' +
    '.aei-dismiss{display:block;background:none;border:none;margin-top:14px;padding:6px 0;color:#6B6B82;' +
      'font-family:"Sora",sans-serif;font-size:12px;cursor:pointer;text-decoration:underline}' +
    '.aei-dismiss:hover{color:#1A1A2E}' +
    '@keyframes aei-fade{from{opacity:0}to{opacity:1}}' +
    '@keyframes aei-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}' +
    '@media(max-width:520px){.aei-modal{padding:32px 24px 24px}.aei-headline{font-size:24px}}';

  var styleEl = document.createElement('style');
  styleEl.id = 'aei-styles';
  styleEl.appendChild(document.createTextNode(css));
  document.head.appendChild(styleEl);

  // Build markup
  var overlay = document.createElement('div');
  overlay.className = 'aei-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'aei-headline');
  overlay.setAttribute('aria-describedby', 'aei-sub');
  overlay.innerHTML =
    '<div class="aei-modal" tabindex="-1">' +
      '<button type="button" class="aei-close" aria-label="Close">×</button>' +
      '<div class="aei-label">Before you go</div>' +
      '<h2 id="aei-headline" class="aei-headline">Wait — see what your practice is losing</h2>' +
      '<p id="aei-sub" class="aei-sub">Plug in your call volume and case value. The 30-second calculator shows exactly how much revenue is walking past your front desk every week.</p>' +
      '<a href="/roi-calculator" class="aei-cta" id="aei-cta">Run the 30-second calculator <span aria-hidden="true">→</span></a>' +
      '<button type="button" class="aei-dismiss">No thanks, I\'ll keep losing patients</button>' +
    '</div>';

  // We'll insert when triggered.
  function pushDataLayer(name) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name });
  }

  var lastFocused = null;

  function trapFocus(e) {
    if (!overlay.classList.contains('aei-open')) return;
    if (e.key !== 'Tab') return;
    var focusables = overlay.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function escListener(e) {
    if (e.key === 'Escape' || e.key === 'Esc') hide();
  }

  function show() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* fallthrough */ }
    if (!overlay.parentNode) document.body.appendChild(overlay);
    overlay.classList.add('aei-open');
    lastFocused = document.activeElement;
    var modal = overlay.querySelector('.aei-modal');
    setTimeout(function(){ modal.focus(); }, 30);
    document.addEventListener('keydown', escListener);
    document.addEventListener('keydown', trapFocus);
    pushDataLayer('exit_intent_shown');
  }

  function hide() {
    overlay.classList.remove('aei-open');
    document.removeEventListener('keydown', escListener);
    document.removeEventListener('keydown', trapFocus);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // Wire up handlers
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hide();
  });
  // Close button + dismiss button + CTA tracking — wire after first render
  overlay.addEventListener('click', function(e){
    var t = e.target;
    if (t.classList && (t.classList.contains('aei-close') || t.classList.contains('aei-dismiss'))) {
      hide();
    } else if (t.id === 'aei-cta') {
      pushDataLayer('exit_intent_clicked');
      // Let normal navigation proceed.
    }
  });

  // Trigger: mouseleave toward top of viewport.
  // Cooldown: don't fire in the first 4 seconds of the page (avoids accidental tab-switches).
  var ready = false;
  setTimeout(function(){ ready = true; }, 4000);

  function onMouseLeave(e) {
    if (!ready) return;
    if (e.clientY > 0) return; // only when leaving toward the top edge
    if (overlay.classList.contains('aei-open')) return;
    show();
  }
  document.addEventListener('mouseleave', onMouseLeave);

  // Also trigger on prolonged inactivity + scroll-up at top of doc (safety net for browsers that
  // don't fire mouseleave reliably). Light heuristic — fires at most once per session anyway.
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    if (!ready) return;
    if (overlay.classList.contains('aei-open')) return;
    var y = window.scrollY;
    if (lastY > 600 && y < 60 && !sessionStorage.getItem(COOLDOWN_KEY)) {
      try { sessionStorage.setItem(COOLDOWN_KEY, '1'); } catch (e) {}
      show();
    }
    lastY = y;
  }, { passive: true });
})();
