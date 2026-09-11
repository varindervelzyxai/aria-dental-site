(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function rise() {
    var nodes = qsa(".rise");
    if (!nodes.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  function chrome() {
    var dismiss = qs("[data-ribbon-dismiss]");
    if (dismiss) {
      dismiss.addEventListener("click", function () {
        document.body.classList.add("ribbon-off");
      });
    }
    var toggle = qs("[data-nav-toggle]");
    var links = qs("[data-nav-links]");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
    }
  }

  function rail() {
    var track = qs("[data-rail]");
    var dots = qsa("[data-rail-dot]");
    if (!track || !dots.length) return;

    function paneWidth() {
      var first = track.querySelector(".stage");
      if (!first) return track.clientWidth;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap) || 16;
      return first.getBoundingClientRect().width + gap;
    }

    function index() {
      var w = paneWidth() || 1;
      return Math.max(0, Math.min(dots.length - 1, Math.round(track.scrollLeft / w)));
    }

    function paint() {
      var i = index();
      dots.forEach(function (dot, n) {
        dot.classList.toggle("on", n === i);
      });
    }

    track.addEventListener("scroll", paint, { passive: true });
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () {
        track.scrollTo({
          left: n * paneWidth(),
          behavior: reduced ? "auto" : "smooth",
        });
      });
    });
    paint();
  }

  function look() {
    var range = qs("[data-look-range]");
    var device = qs("[data-look-device]");
    var poses = qsa("[data-look-open]");
    if (!range || !device) return;

    function apply(value) {
      var n = Number(value);
      if (isNaN(n)) n = 0;
      n = Math.max(0, Math.min(100, n));
      device.style.setProperty("--open", String(n / 100));
      range.value = String(n);
    }

    range.addEventListener("input", function () {
      apply(range.value);
    });

    poses.forEach(function (pose) {
      pose.addEventListener("click", function () {
        poses.forEach(function (p) {
          p.classList.toggle("on", p === pose);
        });
        apply(pose.getAttribute("data-look-open") || "50");
      });
    });

    apply(range.value || "38");
  }

  var films = {
    pickup: {
      src: "/preview/films/pickup.mp4",
      poster: "/preview/films/pickup.jpg",
      caption:
        "Pickup. The first hello is spoken in the practice voice — then the call stays with Aria until the chair is booked.",
      audio: "/voices/audio/aria-english-voice1.mp3",
    },
    insurance: {
      src: "/preview/films/insurance.mp4",
      poster: "/preview/films/insurance.jpg",
      caption:
        "Insurance. Benefits are read back on the live call, then the next step is the chair — not a hold queue.",
      audio: "/audio/demo-insurance-verification.mp3",
    },
    preview: {
      src: "/preview/films/preview.mp4",
      poster: "/preview/films/preview.jpg",
      caption:
        "Preview. Whoever she is speaking with, you can see the call without standing at the phone.",
      audio: "/voices/audio/aria-english-voice2.mp3",
    },
    remind: {
      src: "/preview/films/remind.mp4",
      poster: "/preview/films/remind.jpg",
      caption:
        "Remind. After the voice call, the same visit is confirmed in their pocket so the chair stays on the calendar.",
      audio: null,
    },
    afterhours: {
      src: "/preview/films/afterhours.mp4",
      poster: "/preview/films/afterhours.jpg",
      caption:
        "After hours. The line stays open when the office is dark. No voicemail pile in the morning.",
      audio: "/voices/audio/aria-english-voice3.mp3",
    },
  };

  function playMuted(el) {
    if (!el || reduced) return;
    var run = el.play();
    if (run && typeof run.catch === "function") run.catch(function () {});
  }

  function film() {
    var root = qs("[data-film]");
    if (!root) return;
    var tabs = qsa("[data-film-tab]", root);
    var video = qs("[data-film-video]", root);
    var pip = qs("[data-film-pip]", root);
    var caption = qs("[data-film-caption]", root);
    var hear = qs("[data-film-hear]", root);
    var audio = qs("[data-film-audio]", root);
    if (!tabs.length || !video) return;

    var current = "pickup";
    var hearing = false;

    function stopAudio() {
      if (!audio) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      hearing = false;
      if (hear) hear.textContent = films[current] && films[current].audio ? "Play" : "View";
    }

    function setClip(id) {
      var scene = films[id];
      if (!scene) return;
      current = id;
      stopAudio();
      video.setAttribute("poster", scene.poster);
      video.src = scene.src;
      playMuted(video);
      if (pip) {
        pip.setAttribute("poster", scene.poster);
        pip.src = scene.src;
        playMuted(pip);
      }
      if (caption) caption.textContent = scene.caption;
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-film-tab") === id;
        tab.classList.toggle("on", on);
        tab.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (hear) {
        hear.hidden = !scene.audio;
        hear.textContent = "Play";
      }
    }

    function toggleHear() {
      var scene = films[current];
      if (!scene || !scene.audio || !audio) return;
      if (hearing) {
        audio.pause();
        hearing = false;
        if (hear) hear.textContent = "Play";
        return;
      }
      audio.src = scene.audio;
      var run = audio.play();
      if (run && typeof run.catch === "function") {
        run.catch(function () {
          hearing = false;
          if (hear) hear.textContent = "Play";
        });
      }
      hearing = true;
      if (hear) hear.textContent = "Pause";
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        setClip(tab.getAttribute("data-film-tab"));
      });
    });

    if (hear) hear.addEventListener("click", toggleHear);
    if (audio) {
      audio.addEventListener("ended", function () {
        hearing = false;
        if (hear) hear.textContent = "Play";
      });
    }

    var clip = new URLSearchParams(location.search).get("clip");
    if (clip && films[clip]) setClip(clip);
    else if (reduced) {
      video.removeAttribute("autoplay");
      video.pause();
      if (pip) {
        pip.removeAttribute("autoplay");
        pip.pause();
      }
    } else {
      playMuted(video);
      playMuted(pip);
    }
  }

  rise();
  chrome();
  rail();
  look();
  film();
})();
