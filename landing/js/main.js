/* ==========================================================================
   Just on the Spectrum — landing page interactions
   GSAP + ScrollTrigger, with a real "reduce motion" mode:
   honors the OS preference and an on-page toggle (persisted).
   ========================================================================== */

(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  var html = document.documentElement;
  var STORAGE_KEY = "jots-motion";
  var osReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }

  // Motion is off if the user said so here, or (with no stored choice) the OS says so.
  var motionOn = stored !== null ? stored === "on" : !osReduced;

  var mm = null; // gsap.matchMedia context, created per-init so we can revert cleanly

  /* ---------- helpers ---------- */

  // Wrap each word of an element in an overflow-hidden span pair, preserving
  // inline markup like <em>. Returns the inner spans to animate.
  function splitWords(el) {
    function process(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            var wrap = document.createElement("span");
            wrap.className = "w-wrap";
            var inner = document.createElement("span");
            inner.className = "w";
            inner.textContent = part;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        Array.prototype.slice.call(node.childNodes).forEach(process);
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(process);
    return el.querySelectorAll(".w");
  }

  // Inject the small amount of CSS the word-split needs.
  var splitStyle = document.createElement("style");
  splitStyle.textContent =
    ".w-wrap{display:inline-block;overflow:hidden;vertical-align:bottom;}" +
    ".w{display:inline-block;}" +
    ".hero__title .line{overflow:hidden;}" +
    ".hero__title .line-inner{display:block;}" +
    "section[id]{scroll-margin-top:84px;}";
  document.head.appendChild(splitStyle);

  // Pre-wrap hero lines once (markup survives enable/disable cycles).
  document.querySelectorAll(".hero__title .line").forEach(function (line) {
    var inner = document.createElement("span");
    inner.className = "line-inner";
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });

  // Pre-split the section headings once.
  document.querySelectorAll("[data-split]").forEach(function (el) {
    splitWords(el);
  });

  /* ---------- scroll progress bar (works in both modes) ---------- */
  var bar = document.getElementById("progressBar");
  function paintProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + Math.min(Math.max(p, 0), 1) + ")";
  }
  window.addEventListener("scroll", paintProgress, { passive: true });
  window.addEventListener("resize", paintProgress);
  paintProgress();

  /* ---------- animations ---------- */

  function initAnimations() {
    html.classList.remove("no-motion");
    mm = gsap.matchMedia();

    /* Hero intro */
    var intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .from(".hero__title .line-inner", {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.13
      })
      .from("[data-hero-fade]", {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out"
      }, "-=0.55")
      .from(".shape", {
        scale: 0,
        rotation: function () { return gsap.utils.random(-90, 90); },
        duration: 1.1,
        stagger: 0.07,
        ease: "back.out(2.2)"
      }, "-=0.9");

    /* Hero shapes — idle float + scroll parallax */
    document.querySelectorAll(".shape").forEach(function (shape, i) {
      gsap.to(shape, {
        y: function () { return gsap.utils.random(14, 30) * (i % 2 ? 1 : -1); },
        rotation: function () { return gsap.utils.random(-12, 12); },
        duration: gsap.utils.random(2.4, 4),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 1.2)
      });
      var depth = parseFloat(shape.dataset.depth || "0.5");
      gsap.to(shape, {
        yPercent: -160 * depth,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6
        }
      });
    });

    /* Scroll cue pulse */
    gsap.to(".hero__scrollcue-line", {
      scaleY: 0.35,
      transformOrigin: "top center",
      duration: 1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    /* Word rotator */
    var words = gsap.utils.toArray("#rotator span");
    if (words.length) {
      words.forEach(function (w) { w.classList.remove("is-active"); });
      gsap.set(words, { yPercent: 110, autoAlpha: 1 });
      var rot = gsap.timeline({ repeat: -1 });
      words.forEach(function (word) {
        rot.to(word, { yPercent: 0, duration: 0.5, ease: "power3.out" })
           .to(word, { yPercent: -110, duration: 0.5, ease: "power3.in" }, "+=1.4");
      });
    }

    /* Marquee */
    gsap.to("[data-marquee]", {
      xPercent: -50,
      ease: "none",
      duration: 24,
      repeat: -1
    });

    /* Section heading word reveals */
    document.querySelectorAll("[data-split]").forEach(function (el) {
      gsap.from(el.querySelectorAll(".w"), {
        yPercent: 115,
        duration: 0.85,
        ease: "power4.out",
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });

    /* Generic fade-up reveals */
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.from(el, {
        y: 38,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    /* Stat counters */
    gsap.utils.toArray(".stat__num[data-count]").forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || "";
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onUpdate: function () {
          el.textContent = Math.round(obj.v) + suffix;
        }
      });
    });

    /* Pillar cards pop in */
    gsap.from("[data-card]", {
      y: 60,
      autoAlpha: 0,
      scale: 0.92,
      duration: 0.85,
      ease: "back.out(1.6)",
      stagger: 0.1,
      scrollTrigger: { trigger: ".cards", start: "top 82%" }
    });

    /* Highs & lows — pinned horizontal scrub on desktop, native swipe below */
    mm.add("(min-width: 900px)", function () {
      var track = document.getElementById("momentsTrack");
      var dist = function () { return Math.max(track.scrollWidth - window.innerWidth, 0); };
      html.classList.add("is-pinned");
      gsap.to(track, {
        x: function () { return -dist(); },
        ease: "none",
        scrollTrigger: {
          trigger: "#moments",
          start: "top top",
          end: function () { return "+=" + dist(); },
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      return function () {
        html.classList.remove("is-pinned");
      };
    });

    /* Join card confetti drift */
    document.querySelectorAll(".join__confetti i").forEach(function (piece, i) {
      gsap.to(piece, {
        y: gsap.utils.random(-26, 26),
        x: gsap.utils.random(-14, 14),
        rotation: gsap.utils.random(-120, 120),
        duration: gsap.utils.random(2.6, 4.6),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.15
      });
    });

    ScrollTrigger.refresh();
  }

  function teardownAnimations() {
    if (mm) { mm.revert(); mm = null; }
    ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    gsap.globalTimeline.clear();
    gsap.killTweensOf("*");
    gsap.set(
      [
        ".hero__title .line-inner", "[data-hero-fade]", ".shape",
        ".hero__scrollcue-line", "#rotator span", "[data-marquee]",
        ".w", "[data-reveal]", "[data-card]", "#momentsTrack",
        ".join__confetti i"
      ].join(","),
      { clearProps: "all" }
    );
    // restore static counter values and the CSS-driven rotator word
    document.querySelectorAll(".stat__num[data-count]").forEach(function (el) {
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    });
    var words = document.querySelectorAll("#rotator span");
    words.forEach(function (w, i) { w.classList.toggle("is-active", i === 0); });
    html.classList.add("no-motion");
  }

  /* ---------- motion toggle ---------- */
  var toggles = document.querySelectorAll("#motionToggle, [data-motion-toggle]");

  function syncToggles() {
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(!motionOn));
      btn.querySelector(".motion-toggle__label").textContent =
        motionOn ? "Reduce motion" : "Motion off";
    });
  }

  function setMotion(on) {
    motionOn = on;
    try { localStorage.setItem(STORAGE_KEY, on ? "on" : "off"); } catch (e) { /* ok */ }
    syncToggles();
    if (on) initAnimations();
    else teardownAnimations();
  }

  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () { setMotion(!motionOn); });
  });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () {
    setMenu(!menu.classList.contains("is-open"));
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- newsletter form (front-end only) ---------- */
  var form = document.getElementById("newsletterForm");
  var note = document.getElementById("formNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = form.querySelector("input[type=email]");
    if (!input.value || !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    form.querySelector("button").textContent = "You're in! 🎉";
    form.querySelector("button").disabled = true;
    input.disabled = true;
    note.textContent = "Thank you! Keep an eye on your inbox — the good stuff is on its way.";
    if (motionOn) {
      gsap.fromTo(".join__confetti i",
        { scale: 1 },
        { scale: 1.8, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.03, ease: "power2.out" }
      );
    }
  });

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- boot ---------- */
  syncToggles();
  if (motionOn) initAnimations();
  else teardownAnimations();
})();
