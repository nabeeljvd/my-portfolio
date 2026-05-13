const cursorDot = document.getElementById("cursor-dot");
const cursorOutline = document.getElementById("cursor-outline");
const spotlight = document.getElementById("spotlight");
const preloader = document.getElementById("preloader");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("primary-nav");
const navOverlay = document.getElementById("nav-overlay");

const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const mqMobileNav = window.matchMedia("(max-width: 820px)");

const prefersReducedMotion = () => mqReduce.matches;

const gsapApi = window.gsap;

function useGsapMobileNav() {
  return !!(gsapApi && !prefersReducedMotion() && mqMobileNav.matches);
}

function updateNavA11y(open) {
  if (!navToggle) return;
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (navOverlay) navOverlay.setAttribute("aria-hidden", String(!open));
}

function setNavOpenCss(open) {
  if (!navLinks) return;
  navLinks.classList.toggle("show", open);
  document.body.classList.toggle("nav-drawer-open", open);
  updateNavA11y(open);
}

let navTimeline = null;

function killNavAnimation() {
  if (!gsapApi || !navLinks) return;
  const items = navLinks.querySelectorAll("li");
  gsapApi.killTweensOf([navLinks, navOverlay, ...items]);
  if (navTimeline) {
    navTimeline.kill();
    navTimeline = null;
  }
}

function setNavOpenGsap(open) {
  if (!navLinks || !gsapApi) return;
  const items = navLinks.querySelectorAll("li");

  if (open) {
    killNavAnimation();
    document.body.classList.add("nav-drawer-open", "nav-animate-gsap");
    navLinks.classList.add("show");
    updateNavA11y(true);

    gsapApi.set(navLinks, { transformOrigin: "top right" });
    gsapApi.set(items, { x: 26, autoAlpha: 0 });

    navTimeline = gsapApi.timeline({
      onComplete: () => {
        navTimeline = null;
      },
    });
    if (navOverlay) {
      navTimeline.fromTo(
        navOverlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.22, ease: "expo.out" },
        0
      );
    }
    navTimeline.fromTo(
      navLinks,
      { autoAlpha: 0, scale: 0.92, y: -14 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.34,
        ease: "elastic.out(0.9, 0.55)",
      },
      0.02
    );
    navTimeline.to(
      items,
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.32,
        stagger: { each: 0.042, from: "start" },
        ease: "expo.out",
      },
      "<0.16"
    );
    return;
  }

  if (!navLinks.classList.contains("show")) return;

  killNavAnimation();

  navTimeline = gsapApi.timeline({
    onComplete: () => {
      navLinks.classList.remove("show");
      document.body.classList.remove("nav-drawer-open", "nav-animate-gsap");
      updateNavA11y(false);
      gsapApi.set([navLinks, navOverlay, ...items], { clearProps: "all" });
      navTimeline = null;
    },
  });

  navTimeline.to(items, {
    x: 18,
    autoAlpha: 0,
    duration: 0.2,
    stagger: { each: 0.028, from: "end" },
    ease: "expo.in",
  });
  navTimeline.to(
    navLinks,
    {
      autoAlpha: 0,
      scale: 0.94,
      y: -12,
      duration: 0.24,
      ease: "expo.in",
    },
    "-=0.11"
  );
  if (navOverlay) {
    navTimeline.to(
      navOverlay,
      { autoAlpha: 0, duration: 0.2, ease: "expo.in" },
      "<0.08"
    );
  }
}

function openNav() {
  if (!navLinks || navLinks.classList.contains("show")) return;
  if (useGsapMobileNav()) setNavOpenGsap(true);
  else setNavOpenCss(true);
}

function closeNav() {
  if (!navLinks || !navLinks.classList.contains("show")) return;
  if (useGsapMobileNav()) setNavOpenGsap(false);
  else setNavOpenCss(false);
}

function toggleNav() {
  if (!navLinks) return;
  if (navLinks.classList.contains("show")) closeNav();
  else openNav();
}

window.addEventListener("load", () => {
  const delay = prefersReducedMotion() ? 0 : 500;
  setTimeout(() => {
    if (!preloader) return;
    preloader.style.opacity = "0";
    preloader.style.pointerEvents = "none";
    preloader.style.transition = prefersReducedMotion() ? "none" : "opacity 0.6s ease";
  }, delay);
});

document.getElementById("year").textContent = new Date().getFullYear();

if (!prefersReducedMotion() && window.innerWidth > 820) {
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let ox = x;
  let oy = y;

  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    spotlight?.style.setProperty("--x", `${x}px`);
    spotlight?.style.setProperty("--y", `${y}px`);
  });

  const animateCursor = () => {
    ox += (x - ox) * 0.15;
    oy += (y - oy) * 0.15;
    if (cursorDot) {
      cursorDot.style.left = `${x}px`;
      cursorDot.style.top = `${y}px`;
    }
    if (cursorOutline) {
      cursorOutline.style.left = `${ox}px`;
      cursorOutline.style.top = `${oy}px`;
    }
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
}

let scrollProgressPending = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollProgressPending) return;
    scrollProgressPending = true;
    requestAnimationFrame(() => {
      scrollProgressPending = false;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      document.getElementById("scroll-progress")?.style.setProperty("width", `${pct}%`);
    });
  },
  { passive: true }
);

const typeLines = [
  "Designing Intelligent Products",
  "Building Agentic AI Solutions",
  "Engineering Scalable Full-Stack Systems",
  "Crafting RAG and NLP Workflows",
];

let lineIndex = 0;
let charIndex = 0;
let deleting = false;
const typingEl = document.getElementById("typing-text");

function runTyping() {
  if (!typingEl) return;
  const current = typeLines[lineIndex];
  if (!deleting) {
    typingEl.textContent = current.slice(0, charIndex++);
    if (charIndex > current.length + 3) deleting = true;
  } else {
    typingEl.textContent = current.slice(0, charIndex--);
    if (charIndex < 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % typeLines.length;
    }
  }
  setTimeout(runTyping, prefersReducedMotion() ? 0 : deleting ? 38 : 68);
}

if (typingEl) {
  if (prefersReducedMotion()) {
    typingEl.textContent = typeLines[0];
  } else {
    runTyping();
  }
}

navToggle?.addEventListener("click", () => toggleNav());

navOverlay?.addEventListener("click", () => closeNav());

document.querySelectorAll("#primary-nav a").forEach((a) => {
  a.addEventListener("click", () => closeNav());
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeNav();
});

mqMobileNav.addEventListener("change", () => {
  if (!mqMobileNav.matches) {
    killNavAnimation();
    navLinks?.classList.remove("show");
    document.body.classList.remove("nav-drawer-open", "nav-animate-gsap");
    if (gsapApi && navLinks) {
      const items = navLinks.querySelectorAll("li");
      gsapApi.set([navLinks, navOverlay, ...items], { clearProps: "all" });
    }
    updateNavA11y(false);
  }
});

if (prefersReducedMotion()) {
  navLinks?.classList.add("reduce-motion-mobile");
}

if (window.particlesJS && !prefersReducedMotion()) {
  particlesJS("particles-js", {
    particles: {
      number: { value: 38, density: { enable: true, value_area: 1100 } },
      color: { value: ["#4aa8ff", "#3df1ff", "#8f5bff"] },
      shape: { type: "circle" },
      opacity: { value: 0.32, random: true },
      size: { value: 2.2, random: true },
      line_linked: {
        enable: true,
        distance: 120,
        color: "#4aa8ff",
        opacity: 0.16,
        width: 1,
      },
      move: { enable: true, speed: 0.85, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: false, mode: "grab" },
        onclick: { enable: false, mode: "push" },
      },
      modes: {},
    },
    retina_detect: true,
  });
} else if (window.particlesJS && prefersReducedMotion()) {
  particlesJS("particles-js", {
    particles: {
      number: { value: 18, density: { enable: true, value_area: 1200 } },
      color: { value: ["#4aa8ff"] },
      shape: { type: "circle" },
      opacity: { value: 0.2, random: false },
      size: { value: 2, random: false },
      line_linked: { enable: false },
      move: { enable: false, speed: 0 },
    },
    interactivity: { detect_on: "canvas", events: {}, modes: {} },
    retina_detect: true,
  });
}

if (window.VanillaTilt && !prefersReducedMotion()) {
  VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
    max: 10,
    speed: 500,
    glare: true,
    "max-glare": 0.22,
    perspective: 1000,
    scale: 1.02,
  });
}

if (!prefersReducedMotion()) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * 0.16}px, ${my * 0.16}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

if (window.gsap && window.ScrollTrigger && !prefersReducedMotion()) {
  const gsap = window.gsap;
  gsap.registerPlugin(ScrollTrigger);

  const revealSt = {
    start: "top 88%",
    fastScrollEnd: true,
    once: true,
  };

  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .from(".hero-kicker", { y: 16, opacity: 0, duration: 0.75 }, 0)
    .from(".hero-title", { y: 26, opacity: 0, duration: 1.05 }, 0.05)
    .from(".hero-subtitle", { y: 22, opacity: 0, duration: 1 }, 0.14)
    .from(".hero-typing", { y: 18, opacity: 0, duration: 0.75 }, 0.22)
    .from(
      ".hero-actions .btn",
      {
        y: 18,
        opacity: 0,
        stagger: 0.1,
        duration: 0.85,
        ease: "power2.out",
      },
      0.26
    )
    .from(
      ".hero-content .social-row",
      {
        y: 14,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      },
      0.32
    );

  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          ...revealSt,
        },
      }
    );
  });

  gsap.utils.toArray(".reveal-left").forEach((el) => {
    gsap.fromTo(
      el,
      { x: -36, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          ...revealSt,
        },
      }
    );
  });

  gsap.utils.toArray(".reveal-right").forEach((el) => {
    gsap.fromTo(
      el,
      { x: 36, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          ...revealSt,
        },
      }
    );
  });

  gsap.utils.toArray(".bar i").forEach((bar) => {
    gsap.to(bar, {
      width: `${bar.dataset.width}%`,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: bar,
        start: "top 92%",
        fastScrollEnd: true,
        once: true,
      },
    });
  });

  const eduGrid = document.querySelector(".edu-grid-animate");
  if (eduGrid) {
    const cards = eduGrid.querySelectorAll(".glass-card");
    gsap.from(cards, {
      y: 22,
      opacity: 0,
      scale: 0.97,
      stagger: 0.09,
      duration: 0.7,
      ease: "back.out(1.2)",
      immediateRender: false,
      scrollTrigger: {
        trigger: eduGrid,
        start: "top 84%",
        fastScrollEnd: true,
        once: true,
      },
    });
  }

  const contactMicro = document.querySelectorAll(
    ".contact-copy .contact-line, .contact-copy .contact-social a"
  );
  if (contactMicro.length) {
    gsap.from(contactMicro, {
      y: 12,
      opacity: 0,
      stagger: 0.055,
      duration: 0.5,
      ease: "power2.out",
      immediateRender: false,
      scrollTrigger: {
        trigger: ".contact-wrap",
        start: "top 86%",
        fastScrollEnd: true,
        once: true,
      },
    });
  }

  document.querySelectorAll("#experience .typewriter-heading").forEach((h4) => {
    const raw = h4.getAttribute("data-full-text") || h4.textContent || "";
    const full = raw.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    h4.setAttribute("aria-label", full);

    ScrollTrigger.create({
      trigger: h4.closest(".timeline-card") || h4,
      start: "top 91%",
      once: true,
      onEnter: () => {
        h4.textContent = "";
        let i = 0;
        const ms = Math.max(12, Math.min(26, Math.floor(420 / Math.max(full.length, 10))));
        const tick = window.setInterval(() => {
          h4.textContent = full.slice(0, ++i);
          if (i >= full.length) {
            window.clearInterval(tick);
            h4.classList.add("is-typed");
          }
        }, ms);
      },
    });
  });
} else if (prefersReducedMotion()) {
  document.querySelectorAll(".bar i").forEach((bar) => {
    const w = bar.dataset.width;
    if (w) bar.style.width = `${w}%`;
  });
  document.querySelectorAll("#experience .heading-cyber-timeline.typewriter-heading").forEach((el) => {
    el.classList.add("is-typed");
  });
}

const heroCanvas = document.getElementById("hero-canvas");
const heroSectionEl = document.getElementById("hero");
let heroThreeVisible = true;

if (
  heroSectionEl &&
  "IntersectionObserver" in window &&
  !prefersReducedMotion()
) {
  const ioHero = new IntersectionObserver(
    (entries) => {
      heroThreeVisible = entries[0]?.isIntersecting ?? false;
    },
    { threshold: 0, rootMargin: "120px 0px 0px 0px" }
  );
  ioHero.observe(heroSectionEl);
}

if (window.THREE && heroCanvas) {
  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const maxPR = prefersReducedMotion() ? 1 : Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(maxPR);

  const geo = new THREE.IcosahedronGeometry(1.2, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x5f9eff,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  camera.position.z = 3;

  const ambient = new THREE.PointLight(0x66ccff, 1.4);
  ambient.position.set(2, 3, 4);
  scene.add(ambient);

  function render() {
    if (prefersReducedMotion()) {
      renderer.render(scene, camera);
      return;
    }

    if (heroThreeVisible) {
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.0036;
      renderer.render(scene, camera);
    }

    requestAnimationFrame(render);
  }
  render();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

document.querySelector(".contact-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");
  if (!button) return;
  button.textContent = "Message Sent";
  button.style.filter = "brightness(1.2)";
  setTimeout(() => {
    button.textContent = "Send Message";
    e.target.reset();
  }, prefersReducedMotion() ? 400 : 1600);
});
