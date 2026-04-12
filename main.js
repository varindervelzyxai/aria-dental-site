/* ==============================================
   ARIADENTAL.AI — Shared JS (main.js)
   Nav scroll, hamburger toggle, reveal animations
   Include on ALL pages: <script src="main.js"></script>
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
function initReveals() {
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add('visible');
    });
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveals);
} else {
  initReveals();
}
