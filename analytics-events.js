/* Aria Dental — Analytics Events (Batch 1)
 *
 * Pushes the 9 Aria events into window.dataLayer for GTM forwarding to GA4.
 * Loaded by every page in the site; safe no-op if dataLayer/GTM isn't present.
 *
 * Events: page_view (auto), form_submit, demo_click, scroll_50, scroll_90,
 *         outbound_click, video_play, pricing_view, contact_intent
 */
(function () {
  'use strict';

  // ---- helper -------------------------------------------------------------
  function track(event, params) {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    var base = {
      page_path: location.pathname,
      page_title: document.title,
      page_url: location.href,
      referrer: document.referrer || '(direct)',
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    var payload = { event: event };
    for (var k in base) payload[k] = base[k];
    if (params) for (var k2 in params) payload[k2] = params[k2];
    window.dataLayer.push(payload);
  }
  // expose for inline handlers if needed
  window.ariaTrack = track;

  // ---- demo_click + contact_intent + outbound_click (delegated) ----------
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a');
    if (!a) return;

    // contact_intent — mailto / tel
    if (a.protocol === 'mailto:') {
      track('contact_intent', { method: 'email', target: a.href });
    } else if (a.protocol === 'tel:') {
      track('contact_intent', { method: 'phone', target: a.href });
    }

    // contact_intent — explicit CTA marker
    if (a.dataset && a.dataset.cta === 'talk-to-human') {
      track('contact_intent', { method: 'cta' });
    }

    // demo_click — any anchor pointing to /demo, /contact (Book a Demo), or marked data-cta=demo
    if (a.href) {
      try {
        var u = new URL(a.href, location.href);
        var path = u.pathname.replace(/\/$/, '');
        var isDemo =
          path === '/demo' ||
          path === '/demo-booking' ||
          (a.dataset && a.dataset.cta && /demo/i.test(a.dataset.cta)) ||
          /\b(see\s+aria|book\s+a\s+demo|hear\s+a\s+real\s+call|see\s+demo)\b/i.test(
            (a.textContent || '').trim()
          );
        if (isDemo) {
          track('demo_click', {
            location: a.dataset && a.dataset.ctaLocation ? a.dataset.ctaLocation : 'unknown',
            cta_text: (a.textContent || '').trim().slice(0, 80)
          });
        }

        // outbound_click — any external host
        if (u.host && u.host !== location.host) {
          track('outbound_click', { outbound_url: a.href, outbound_host: u.host });
        }
      } catch (_) {}
    }
  }, true);

  // ---- form_submit -------------------------------------------------------
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.tagName !== 'FORM') return;
    track('form_submit', {
      form_name: f.getAttribute('name') || f.id || 'form',
      form_action: f.getAttribute('action') || location.pathname
    });
  }, true);

  // ---- scroll_50 / scroll_90 --------------------------------------------
  var fired = {};
  function checkScroll() {
    var h = document.documentElement;
    var pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
    [50, 90].forEach(function (d) {
      if (pct >= d && !fired[d]) {
        fired[d] = true;
        track('scroll_' + d, { depth: d });
      }
    });
  }
  window.addEventListener('scroll', checkScroll, { passive: true });

  // ---- video_play -------------------------------------------------------
  document.addEventListener('play', function (e) {
    var v = e.target;
    if (!v || (v.tagName !== 'VIDEO' && v.tagName !== 'AUDIO')) return;
    var id = v.id || v.getAttribute('data-video-id') || (v.currentSrc || '').split('/').pop();
    if (v.dataset && v.dataset.ariaPlayed === '1') return;
    if (v.dataset) v.dataset.ariaPlayed = '1';
    track('video_play', { video_id: id, media_type: v.tagName.toLowerCase() });
  }, true);

  // ---- pricing_view (intersection on /platform #pricing) ---------------
  function watchPricing() {
    var el = document.querySelector('#pricing');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    var timer = null;
    var seen = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen && !timer) {
          timer = window.setTimeout(function () {
            seen = true;
            track('pricing_view', { section: 'pricing' });
          }, 2000);
        } else if (!entry.isIntersecting && timer) {
          clearTimeout(timer);
          timer = null;
        }
      });
    }, { threshold: 0.5 }).observe(el);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchPricing);
  } else {
    watchPricing();
  }
})();
