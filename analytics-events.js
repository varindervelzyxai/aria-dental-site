/* Aria Dental — Analytics Events
 *
 * Pushes events into window.dataLayer for GTM → GA4.
 * Safe metadata only: page_path, cta_location, generic context.
 * Never send name, email, phone, DOB, insurance, transcripts, or PHI.
 *
 * Canonical page_view: gtag('config','G-KQS3692C4Q') on each page.
 * Do not push a second page_view here (would duplicate GTM/GA4).
 *
 * Conversion names (in addition to existing Batch 1 events):
 *   talk_to_aria, demo_start, demo_booking, generate_lead,
 *   roi_calculation, buyer_guide_download, configure_start, configure_complete
 */
(function () {
  'use strict';

  var BLOCKED = /^(name|email|phone|tel|dob|date_of_birth|insurance|member_id|transcript|message|practice_name|practicename|full_name|firstname|lastname|address)$/i;

  function sanitize(params) {
    var out = {};
    if (!params) return out;
    for (var k in params) {
      if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
      if (BLOCKED.test(k)) continue;
      var v = params[k];
      if (v == null) continue;
      if (typeof v === 'string' && v.indexOf('@') !== -1) continue;
      out[k] = v;
    }
    return out;
  }

  function track(event, params) {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    var base = {
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer || '(direct)',
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    var payload = { event: event };
    var extra = sanitize(params);
    for (var k in base) payload[k] = base[k];
    for (var k2 in extra) payload[k2] = extra[k2];
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
          var loc = a.dataset && a.dataset.ctaLocation ? a.dataset.ctaLocation : 'unknown';
          track('demo_click', {
            location: loc,
            cta_text: (a.textContent || '').trim().slice(0, 80)
          });
          track('demo_start', { cta_location: loc });
        }

        if (path === '/contact' || /book\s+(a\s+)?demo|book\s+my\s+demo/i.test((a.textContent || '').trim())) {
          track('demo_booking', { cta_location: path === '/contact' ? 'contact_cta' : 'booking_cta' });
        }

        if (/voice-ai-dental-buyers-guide|buyer/.test(path) || /download/i.test((a.textContent || '') + (a.getAttribute('download') || ''))) {
          track('buyer_guide_download', { cta_location: path });
        }

        if (path === '/configure' || path === '/configure/') {
          track('configure_start', { cta_location: 'configure_cta' });
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
    var formName = f.getAttribute('name') || f.id || 'form';
    track('form_submit', {
      form_name: formName,
      form_action: f.getAttribute('action') || location.pathname
    });
    if (/demo|contact|lead/i.test(formName) || /contact/.test(location.pathname)) {
      track('generate_lead', { cta_location: formName });
    }
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
    if (v.getAttribute('data-demo') || /demo/i.test(id || '')) {
      track('demo_start', { cta_location: 'demo_media', media_id: id });
    }
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
  function watchRoi() {
    if (!/roi-calculator/.test(location.pathname)) return;
    var once = false;
    document.addEventListener('input', function (e) {
      if (once) return;
      if (!e.target || !e.target.classList || !e.target.classList.contains('slider')) return;
      once = true;
      track('roi_calculation', { cta_location: 'roi_slider' });
    }, true);
  }

  function boot() {
    watchPricing();
    watchRoi();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
