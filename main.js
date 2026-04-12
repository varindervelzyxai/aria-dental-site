/* ==============================================
   ARIADENTAL.AI — Shared JS (main.js)
   Nav scroll, hamburger toggle, reveal animations
   Include on ALL pages: <script src="main.js"></script>
   ============================================== */

// 1. Nav scroll effect
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// 2. Hamburger menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
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
const reveals = document.querySelectorAll('.reveal');
if (reveals.length > 0) {
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach(function (el) {
    revealObserver.observe(el);
  });
}
