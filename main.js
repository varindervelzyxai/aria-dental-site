/* ==============================================
   ARIADENTAL.AI — Shared JS (main.js)
   Nav scroll, hamburger toggle, reveal animations
   ============================================== */

// 1. Nav scroll effect
var nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// 2. Hamburger menu toggle
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });
}

// 3. Scroll reveal animations
function revealElement(el) {
  el.classList.add('visible');
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.style.visibility = 'visible';
}

function initReveals() {
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '50px 0px 50px 0px' }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: force-reveal anything still hidden after 3 seconds
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
        revealElement(el);
      });
    }, 3000);
  } else {
    reveals.forEach(function (el) {
      revealElement(el);
    });
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveals);
} else {
  initReveals();
}
