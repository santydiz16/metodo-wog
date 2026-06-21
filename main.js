/* ============================================================
   MÉTODO WOG — main.js  (IIFE, no ES modules)
   Mobile-first. No custom cursor. No scroll hint.
   ============================================================ */
(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[WOG:" + name + "]", e); }
  }

  /* ── splash ── */
  function initSplash() {
    var splash = document.querySelector("[data-splash]");
    if (!splash) return;
    function hide() { splash.classList.add("is-out"); }
    if (document.readyState === "complete") {
      setTimeout(hide, 650);
    } else {
      window.addEventListener("load", function () { setTimeout(hide, 450); });
    }
    setTimeout(hide, 3600); // hard safety
  }

  /* ── nav: scroll solidify + mobile burger ── */
  function initNav() {
    var nav    = document.getElementById("nav");
    var burger = document.getElementById("nav-burger");
    var links  = document.getElementById("nav-links");
    if (!nav) return;

    // scroll class
    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 48);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // burger toggle
    if (burger && links) {
      burger.addEventListener("click", function () {
        var open = burger.classList.toggle("is-open");
        links.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        // trap focus within overlay when open
        if (open) links.querySelector("a").focus();
      });

      // close on link click
      links.querySelectorAll(".nav-link").forEach(function (a) {
        a.addEventListener("click", function () {
          burger.classList.remove("is-open");
          links.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        });
      });

      // close on Escape
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && links.classList.contains("is-open")) {
          burger.classList.remove("is-open");
          links.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          burger.focus();
        }
      });
    }
  }

  /* ── smooth anchor scroll ── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-h")) || 64;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  }

  /* ── IntersectionObserver reveal ── */
  function initReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // stagger siblings by index
        var siblings = e.target.parentElement
          ? Array.from(e.target.parentElement.querySelectorAll(".reveal"))
          : [];
        var idx = siblings.indexOf(e.target);
        e.target.style.transitionDelay = idx > 0 ? (idx * 0.07) + "s" : "";
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });

    items.forEach(function (el) { io.observe(el); });

    // safety net: force-reveal after 6s
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight + 100) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ── count-up numbers ── */
  function initCountUp() {
    var targets = document.querySelectorAll("[data-count-to]");
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el  = e.target;
        var end = parseFloat(el.dataset.countTo);
        var dec = end % 1 !== 0;
        var t0  = performance.now();
        var dur = 1200;
        (function tick(now) {
          var p   = Math.min((now - t0) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = dec
            ? (end * ease).toFixed(1)
            : Math.round(end * ease);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── GSAP ScrollTrigger enhancements ── */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // hero image subtle parallax
    var heroBg = document.querySelector(".hero-bg img");
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // fase items stagger on desktop
    var fases = document.querySelectorAll(".fase");
    if (fases.length) {
      gsap.from(fases, {
        opacity: 0, y: 32,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".fases-list",
          start: "top 82%",
          once: true
        }
      });
    }

    // planes stagger
    var planes = document.querySelectorAll(".plan");
    if (planes.length) {
      gsap.from(planes, {
        opacity: 0, scale: 0.96, y: 20,
        stagger: 0.1,
        duration: 0.55,
        ease: "back.out(1.3)",
        scrollTrigger: {
          trigger: ".planes-grid",
          start: "top 82%",
          once: true
        }
      });
    }
  }

  /* ── subtle card hover tilt (desktop only) ── */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var cards = document.querySelectorAll(".testi, .plan, .fase");
    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        card.style.willChange = "transform";
      });
      card.addEventListener("mousemove", function (e) {
        var r  = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top)  / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width  - 0.5) *  5;
        card.style.transform =
          "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
        // defer clearing will-change until after CSS transition settles
        setTimeout(function () { card.style.willChange = ""; }, 300);
      });
    });
  }

  /* ── FAB + sticky CTA: appear after scrolling past hero ── */
  function initFloatingCTA() {
    var fab       = document.querySelector(".fab-wa");
    var stickyCta = document.getElementById("sticky-cta");
    var hero      = document.querySelector(".hero");
    if (!fab && !stickyCta) return;

    var triggered = false;
    function check() {
      var heroH = hero ? hero.offsetHeight : window.innerHeight;
      var past  = window.scrollY > heroH * 0.6;
      if (past === triggered) return;
      triggered = past;
      if (fab)       fab.classList.toggle("is-visible", past);
      if (stickyCta) {
        stickyCta.classList.toggle("is-visible", past);
        stickyCta.setAttribute("aria-hidden", String(!past));
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  }

  /* ── FAQ accordion: close sibling on open ── */
  function initFAQ() {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;
    items.forEach(function(item) {
      item.addEventListener("toggle", function() {
        if (!item.open) return;
        items.forEach(function(other) {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  }

  /* ── boot ── */
  function boot() {
    safe(initSplash,      "splash");
    safe(initNav,         "nav");
    safe(initSmoothScroll,"scroll");
    safe(initReveals,     "reveals");
    safe(initCountUp,     "countUp");
    safe(initGSAP,        "gsap");
    safe(initTilt,        "tilt");
    safe(initFloatingCTA, "floatingCTA");
    safe(initFAQ,         "faq");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
