/* =========================================================
   KRAFT-INSPIRED PAPER WORLD — script.js
   Vanilla JS + Three.js (ES modules via CDN) + GSAP
   ========================================================= */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ---------------------------------------------------------
   0. CONTENT DATA (edit freely — nothing below is hardcoded HTML)
   --------------------------------------------------------- */
const profile = {
  name: "ZIKRI FIKRI 21",
  role: "CREATIVE DEVELOPER",
  tagline: "Designer × Developer",
  about:
    "I'm a creative developer who enjoys building interactive digital experiences, mobile applications and experimental digital products.",
};

const projects = [
  {
    title: "TanyaKI",
    category: "AI / Mobile",
    year: "2026",
    description: "An AI chatbot application for everyday questions, built for speed on low-end devices.",
    technologies: ["JavaScript", "Capacitor", "AI"],
    url: "#",
  },
  {
    title: "Nostalgia",
    category: "Creative / Mobile",
    year: "2026",
    description: "A vintage photo and video experience that recreates the feel of old home movies.",
    technologies: ["Kotlin", "Android", "OpenGL"],
    url: "#",
  },
  {
    title: "Paperwave",
    category: "Web / Audio",
    year: "2025",
    description: "A generative sound sketchpad where drawn lines become melodies.",
    technologies: ["Three.js", "Web Audio", "GSAP"],
    url: "#",
  },
  {
    title: "Fieldnote",
    category: "Productivity",
    year: "2025",
    description: "A distraction-free notes app for researchers working offline in the field.",
    technologies: ["Laravel", "PHP", "MySQL"],
    url: "#",
  },
];

const skillGroups = [
  { category: "FRONTEND", items: ["HTML", "CSS", "JavaScript"] },
  { category: "BACKEND", items: ["Laravel", "PHP", "MySQL"] },
  { category: "MOBILE", items: ["Android", "Kotlin", "Capacitor"] },
  { category: "CREATIVE", items: ["Three.js", "GSAP", "WebGL"] },
  { category: "AI", items: ["LLM", "RAG", "Vector DB"] },
];

/* One drawing per skill in the sky room behind the second door: [label, file in assets/images/skills]. */
const ropeSkills = [
  ["JavaScript", "js"], ["TypeScript", "typescript"], ["PHP", "php"], ["Python", "py"], ["Kotlin", "kotlin"],
  ["React", "react"], ["Next.js", "nextjs"], ["Inertia.js", "inertiajs"], ["Ionic", "ionic"], ["Capacitor", "capacitor"],
  ["Jetpack Compose", "jetpack"], ["Node.js", "nodejs"], ["Nginx", "nginx"], ["Firebase", "firebase"], ["Supabase", "supabase"],
  ["MySQL", "mysql"], ["PostgreSQL", "pgsql"], ["Vector DB", "vectordb"],
];

/* Case-study showcases hung inside the secret room behind the door.
   Hover or click a board to crossfade from the "before" sketch to the "after" result. */
const roomShowcase = [
  { title: "Whistle Blowing System", category: "Web App · UI/UX Design", before: "prj-before-1.webp", after: "prj-after-1.webp", aspect: 1899 / 860 },
  { title: "KASMU", category: "Point of Sale · UI/UX Design", before: "prj-before-2.webp", after: "prj-after-2.webp", aspect: 1321 / 867 },
  { title: "SatuDataUHO", category: "Web Dashboard · UI/UX Design", before: "prj-before-3.webp", after: "prj-after-3.webp", aspect: 1317 / 846 },
  { title: "KasirKu", category: "Mobile App · UI/UX Design", before: "prj-before-4.webp", after: "prj-after-4.webp", aspect: 1321 / 862 },
  { title: "TanyaKi", category: "Mobile App · AI / UI/UX Design", before: "prj-before-5.webp", after: "prj-after-5.webp", aspect: 1322 / 867 },
  { title: "GoldenMind", category: "Web Platform · UI/UX Design", before: "prj-before-6.webp", after: "prj-after-6.webp", aspect: 1318 / 864 },
  { title: "SMP Negeri 20 Kendari", category: "School Website · UI/UX Design", before: "prj-before-7.webp", after: "prj-after-7.webp", aspect: 1318 / 864 },
];

/* z position of every scene along the corridor */
const SECTIONS = {
  home: 0,
  about: -15,
  works: -35,
  skills: -55,
  contact: -75,
};
const EYE_Y = 0.5; // camera height; floor is at -2.05
const CAMERA_ROLL = 0.05; // ~3° tilt, tweak or set 0 to level the horizon
const TOTAL_Z = -82; // small buffer past "contact" so it can rest

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFinePointer = window.matchMedia("(pointer: fine)").matches;
if (isFinePointer) document.documentElement.classList.add("has-fine-pointer");

/* ---------------------------------------------------------
   1. ACCESSIBLE / SEO CONTENT (works in every mode)
   --------------------------------------------------------- */
function populateAccessibleContent() {
  const worksList = document.getElementById("worksList");
  projects.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.title}</strong> — ${p.category}, ${p.year}. ${p.description}`;
    worksList.appendChild(li);
  });
  roomShowcase.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.title}</strong> — ${p.category}. Before/after case study.`;
    worksList.appendChild(li);
  });

  const skillsList = document.getElementById("skillsList");
  [...skillGroups, { category: "LANGUAGES & FRAMEWORKS", items: ropeSkills.map(([name]) => name) }].forEach((g) => {
    const div = document.createElement("div");
    div.className = "skill-group";
    div.innerHTML = `<strong>${g.category}</strong>: ${g.items.join(", ")}`;
    skillsList.appendChild(div);
  });

  document.querySelector(".home-title h1").textContent = profile.name;
  document.querySelector(".home-role p").textContent = profile.role;
  document.querySelector(".home-role .muted").textContent = profile.tagline;
  document.querySelector(".about-card p").textContent = profile.about;
}
populateAccessibleContent();

const navEl = document.getElementById("navigation");
const menuBtn = document.getElementById("menuToggle");
const setMenu = (open) => {
  navEl.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
};
menuBtn.addEventListener("click", () => setMenu(!navEl.classList.contains("is-open")));
navEl.addEventListener("click", (e) => (e.target === navEl || e.target.closest("button")) && setMenu(false));
window.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* ---------------------------------------------------------
   2. WEBGL AVAILABILITY CHECK / FALLBACK & MODAL INIT
   --------------------------------------------------------- */
function isWebglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

const modalBackdrop = document.getElementById("modalBackdrop");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

if (!isWebglAvailable()) {
  document.body.classList.add("no-webgl");
  document.getElementById("fallbackNotice").hidden = false;
  document.getElementById("loader").classList.add("is-hidden");
  document.querySelectorAll(".scene-section").forEach((s) => s.classList.add("is-active"));
  setupNavigationFallback();
  setupContactForm(null);
  setupModalSystem();
} else {
  initExperience();
  setupModalSystem();
  setupSectionOverlayClose();
}

function setupNavigationFallback() {
  document.querySelectorAll("#navigation button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.target)?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ---------------------------------------------------------
   MODAL SYSTEM (Popup dialog for posters / cards)
   --------------------------------------------------------- */

function openModal(type, data) {
  if (!modalBackdrop || !modalContent) return;

  let html = "";
  if (type === "about") {
    html = `
      <div class="modal-home-presentation">
        <div class="modal-home-title paper-tag">
          <h2>ZIKRI FIKRI 21</h2>
        </div>

        <div class="modal-character-wrapper">
          <div class="character-arrow-label handwritten">
            <span>that's me!</span>
            <svg class="handwritten-arrow" viewBox="0 0 70 45" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M 8 8 C 30 2, 55 12, 58 35" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M 44 24 L 59 36 L 63 20" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="home-character-card paper-tag">
            <img src="./assets/images/me.webp" alt="Zikri Fikri 21 Character" class="home-char-img" />
          </div>
        </div>

        <div class="modal-home-role paper-tag paper-tag--small">
          <p>CREATIVE DEVELOPER</p>
          <p class="muted">Designer &times; Developer</p>
        </div>

        <div class="modal-divider"></div>

        <div class="modal-text">
          <p>
            I'm a creative developer who enjoys building interactive digital experiences,
            mobile applications, and experimental digital products.
          </p>
          <p>
            I like when a website feels a little bit like a place — somewhere you can wander around,
            explore details, and interact with hand-crafted paper worlds.
          </p>
        </div>

        <div class="modal-tags">
          <span class="modal-tag">Creative Web</span>
          <span class="modal-tag">Mobile Apps</span>
          <span class="modal-tag">AI Applications</span>
          <span class="modal-tag">Three.js / WebGL</span>
          <span class="modal-tag">GSAP Animations</span>
        </div>

        <div class="modal-actions">
          <button class="btn-modal-action" id="modalContactTrigger">SEND A MESSAGE &rarr;</button>
          <button class="btn-modal-secondary modal-close-action">CLOSE</button>
        </div>
      </div>
    `;
  } else if (type === "project" && data) {
    const p = data;
    html = `
      <div class="modal-badge handwritten">${p.year} &bull; ${p.category}</div>
      <h2 id="modalTitle" class="modal-title">${p.title.toUpperCase()}</h2>
      <div class="modal-divider"></div>
      <p class="modal-description">${p.description}</p>
      <div class="modal-section-title handwritten">Technologies Used</div>
      <div class="modal-tags">
        ${p.technologies.map(t => `<span class="modal-tag">${t}</span>`).join('')}
      </div>
      <div class="modal-actions">
        ${p.url && p.url !== '#' ? `<a href="${p.url}" target="_blank" rel="noopener" class="btn-modal-action">VISIT PROJECT &rarr;</a>` : ''}
        <button class="btn-modal-secondary modal-close-action">CLOSE</button>
      </div>
    `;
  } else if (type === "skill" && data) {
    const s = data;
    const title = s.category || (s.name ? s.name.split(':')[0] : 'SKILL');
    const items = s.items ? s.items : (s.name ? [s.name] : []);
    html = `
      <div class="modal-badge handwritten">WORKSHOP ITEM</div>
      <h2 id="modalTitle" class="modal-title">${title.toUpperCase()}</h2>
      <div class="modal-divider"></div>
      <p class="modal-description">Specialized set of tools and technologies used to craft responsive, performant paper-styled web & mobile applications.</p>
      <div class="modal-section-title handwritten">Tools & Technologies</div>
      <div class="modal-tags">
        ${items.map(it => `<span class="modal-tag">${it}</span>`).join('')}
      </div>
      <div class="modal-actions">
        <button class="btn-modal-secondary modal-close-action">CLOSE</button>
      </div>
    `;
  } else if (type === "social") {
    html = `
      <div class="modal-badge handwritten">LET'S CONNECT</div>
      <h2 id="modalTitle" class="modal-title">SAY HELLO</h2>
      <div class="modal-divider"></div>
      <p class="modal-description">Find me around the internet:</p>
      <div class="modal-actions">
        <a href="https://instagram.com/zikrifikri.21" target="_blank" rel="noopener" class="btn-modal-action">INSTAGRAM &rarr; @zikrifikri.21</a>
        <a href="https://github.com/zikrifikri21" target="_blank" rel="noopener" class="btn-modal-action">GITHUB &rarr; zikrifikri21</a>
        <button class="btn-modal-secondary modal-close-action">CLOSE</button>
      </div>
    `;
  }

  modalContent.innerHTML = html;
  modalBackdrop.classList.add("is-open");
  modalBackdrop.setAttribute("aria-hidden", "false");

  modalContent.querySelectorAll(".modal-close-action").forEach(btn => {
    btn.addEventListener("click", closeModal);
  });

  const contactBtn = document.getElementById("modalContactTrigger");
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      closeModal();
      const contactTarget = document.querySelector('#navigation button[data-target="contact"]');
      if (contactTarget) contactTarget.click();
      else document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove("is-open");
  modalBackdrop.setAttribute("aria-hidden", "true");
}

function setupModalSystem() {
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop?.classList.contains("is-open")) {
      closeModal();
    }
  });

  document.getElementById("homeTitleCard")?.addEventListener("click", () => openSection("home"));
  document.getElementById("aboutCard")?.addEventListener("click", () => openModal("about", profile));
}

function openSection(id) {
  const targetSec = document.getElementById(id);
  if (!targetSec) return;
  document.querySelectorAll(".scene-section").forEach(s => s.classList.remove("is-active"));
  targetSec.classList.add("is-active");
}

function setupSectionOverlayClose() {
  document.querySelectorAll(".scene-section").forEach(sec => {
    sec.addEventListener("click", (e) => {
      if (e.target === sec || e.target.classList.contains("section-close-btn")) {
        sec.classList.remove("is-active");
      }
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".scene-section.is-active").forEach(sec => {
        sec.classList.remove("is-active");
      });
    }
  });
}

/* =========================================================
   3. FULL 3D EXPERIENCE
   ========================================================= */
function initExperience() {
  const canvas = document.getElementById("webgl");
  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loaderFill");
  const loaderPercent = document.getElementById("loaderPercent");
  const enterBtn = document.getElementById("enterBtn");

  document.documentElement.classList.add("lock-scroll");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  /* ---------- renderer / scene / camera ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf3eedf);
  scene.fog = new THREE.Fog(0xf3eedf, 12, 42);

  const camera = new THREE.PerspectiveCamera(
    58,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, EYE_Y, 6);
  camera.rotation.order = "YXZ"; // yaw first, so 360° look stays level
  camera.rotation.z = CAMERA_ROLL; // set once so the nav-click roll tween can still wobble it

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const mobile = window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ---------- lighting ---------- */
  const ambient = new THREE.AmbientLight(0xfff3df, 0.75);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff0d8, 0.9);
  sun.position.set(4, 8, 6);
  if (!mobile) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -12;
    sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
  }
  scene.add(sun);

  const warmFill = new THREE.PointLight(0xffe3b0, 0.6, 25);
  warmFill.position.set(0, 4, -30);
  scene.add(warmFill);

  /* ---------- canvas texture helper (hand-drawn paper look) ---------- */
  function jitterPath(ctx, x, y, w, h) {
    const j = () => (Math.random() - 0.5) * 6;
    ctx.moveTo(x + j(), y + j());
    ctx.lineTo(x + w + j(), y + j());
    ctx.lineTo(x + w + j(), y + h + j());
    ctx.lineTo(x + j(), y + h + j());
    ctx.closePath();
  }

  function paperCanvas(w, h, draw, bg = "#fffdf7") {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(17,17,17,${Math.random() * 0.035})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    draw(ctx, w, h);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 6;
    ctx.beginPath();
    jitterPath(ctx, 10, 10, w - 20, h - 20);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function paperMaterial(map) {
    return new THREE.MeshStandardMaterial({
      map,
      roughness: 0.92,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
  }

  const structureMat = new THREE.MeshStandardMaterial({
    color: 0xf3eedf,
    roughness: 0.95,
    metalness: 0,
  });
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x2b2822, roughness: 0.8 });

  /* ---------- corridor structure ---------- */
  const CORRIDOR_WIDTH = 8;
  const CORRIDOR_HEIGHT = 6;
  const CORRIDOR_START = 14;
  const CORRIDOR_END = TOTAL_Z - 8;
  const length = CORRIDOR_START - CORRIDOR_END;
  const centerZ = (CORRIDOR_START + CORRIDOR_END) / 2;

  /* winding path: every prop is built straight, then shifted by bendX(z) in one pass below */
  const BEND_AMP = 2.2;
  const BEND_FREQ = 0.09;
  const HANG = 0.05; // gap between wall and anything hung on it (0 = z-fighting flicker)
  const HW = CORRIDOR_WIDTH / 2;
  const bendX = (z) => BEND_AMP * Math.sin(z * BEND_FREQ);
  const bendSlope = (z) => BEND_AMP * BEND_FREQ * Math.cos(z * BEND_FREQ);

  /* mesh centred on the wall at z; x is local, the bend pass adds bendX */
  function hangOnWall(mesh, side, z, y, inset = HANG) {
    const s = side === "left" ? -1 : 1;
    mesh.position.set(s * (HW - inset), y, z);
    mesh.rotation.y = -s * (Math.PI / 2) + Math.atan(bendSlope(z));
  }

  structureMat.side = THREE.DoubleSide;
  const tiled = (f) => {
    const t = new THREE.TextureLoader().load(`./assets/textures/${f}.webp`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const shellMat = (f) =>
    new THREE.MeshStandardMaterial({ map: tiled(f), roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  const wallMat = shellMat("wall");
  const floorMat = shellMat("floor");
  const ceilingMat = shellMat("ceiling"); // Tekstur dasar plafon yang baru
  const TILE = 4; // world units covered by one texture repeat

  function ribbon(edge, z0 = CORRIDOR_START, z1 = CORRIDOR_END, mat = wallMat) {
    const pos = [], uv = [];
    for (const z of [...Array(Math.ceil(z0 - z1)).keys()].map((i) => z0 - i).concat(z1)) {
      const a = edge(z, 0), b = edge(z, 1);
      pos.push(...a, ...b);
      uv.push(0, -z / TILE, Math.hypot(b[0] - a[0], b[1] - a[1]) / TILE, -z / TILE); // world-scaled, continuous along z
    }
    const idx = [];
    for (let a = 0; a < pos.length / 3 - 2; a += 2) idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat);
    m.receiveShadow = true;
    m.userData.shell = true; // already follows the path, skip the bend pass
    scene.add(m);
  }
  const FLOOR_Y = -2.05, CEIL_Y = 3.25;
  ribbon((z, k) => [bendX(z) + (k ? HW : -HW), FLOOR_Y, z], undefined, undefined, floorMat);
  ribbon((z, k) => [bendX(z) + (k ? HW : -HW), CEIL_Y, z], undefined, undefined, ceilingMat); // Plafon dengan tekstur baru
  ribbon((z, k) => [bendX(z) - HW, k ? CEIL_Y : FLOOR_Y, z]);
  const DOOR_Z = -45, SKILL_DOOR_Z = -65, GAP = 1.7, DOOR_H = 3.6, DOOR_TOP = FLOOR_Y + DOOR_H;
  const rightWall = (z, k) => [bendX(z) + HW, k ? CEIL_Y : FLOOR_Y, z];
  let wallZ = CORRIDOR_START; // right wall with a narrow gap + lintel for each real door (listed nearest first)
  [DOOR_Z, SKILL_DOOR_Z].forEach((dz) => {
    ribbon(rightWall, wallZ, dz + GAP / 2);
    ribbon((z, k) => [bendX(z) + HW, k ? CEIL_Y : DOOR_TOP, z], dz + GAP / 2, dz - GAP / 2); // lintel
    wallZ = dz - GAP / 2;
  });
  ribbon(rightWall, wallZ, CORRIDOR_END);

  /* ---------- CEILING FANS (fan_grille.glb, placed once the loop stage exists) ---------- */
  const textureLoader = new THREE.TextureLoader();

  /* GLB helper: scales the model so its longest side = size, origin at its centre; g.userData.size = final w/h/d */
  const glb = new GLTFLoader();
  function loadFitted(url, size, done) {
    glb.load(url, ({ scene: model }) => {
      const box = new THREE.Box3().setFromObject(model);
      const dims = box.getSize(new THREE.Vector3());
      const s = size / Math.max(dims.x, dims.y, dims.z);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      const g = new THREE.Group().add(model);
      g.scale.setScalar(s);
      g.userData.size = dims.multiplyScalar(s);
      done(g);
    });
  }

  const FAN_SPACING = length / 5; // 5 fans per lap, so the pattern also repeats seamlessly across the loop seam
  const fanZs = [];
  for (let z = CORRIDOR_START - 2; z > CORRIDOR_END; z -= FAN_SPACING) fanZs.push(z);

  /* ---------- interactive registry ---------- */
  const interactiveMeshes = []; // { mesh, type:'project'|'skill', data, baseScale, baseRot }
  const floaters = []; // { obj, speed, amp, axisDetails }

  function addFloat(obj, { speed = 1, amp = 0.03, axis = "z", offset = 0 } = {}) {
    floaters.push({ obj, speed, amp, axis, offset, base: obj.rotation[axis] });
  }

  /* ---------- HOME (z = 0) ----------
     homeGroup (character, hiasan, scroll hint) steps left when the camera arrives; nameGroup holds the name letters
     behind the head, which split left/right on scroll. Both sit at z = HOME_Z so the bend pass puts them on the path. */
  const HOME_Z = -5.8;
  const homeGroup = new THREE.Group();
  const nameGroup = new THREE.Group();
  homeGroup.position.z = nameGroup.position.z = HOME_Z;
  scene.add(homeGroup, nameGroup);

  const meTexture = textureLoader.load("./assets/images/me.webp");
  meTexture.colorSpace = THREE.SRGBColorSpace;

  /* Character standing directly on the floor of the room (replacing home-sign) */
  const floorTopY = -2.05;
  const charHeight = 3.6;
  const charWidth = 2.4;
  const charPosY = floorTopY + charHeight / 2; // -0.25

  const meMat = new THREE.MeshStandardMaterial({
    map: meTexture,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.05,
  });

  const meChar = new THREE.Mesh(new THREE.PlaneGeometry(charWidth, charHeight), meMat);
  meChar.position.set(0, charPosY, 0);
  meChar.userData = {
    type: "about",
    data: profile,
    baseRotY: 0,
    baseRotZ: 0,
    baseScale: 1,
  };
  homeGroup.add(meChar);
  interactiveMeshes.push(meChar);
  addFloat(meChar, { speed: 0.4, amp: 0.01, axis: "z" });

  /* hiasan around the character: local x/y from the character's centre, sway via the shared floaters */
  [
    ["planpapaer", 0.95, 0.86, 1.5, 0.45, -0.1],
    ["vibes", 1.4, 0.75, -1.45, 0.5, 0.08],
    ["react", 0.8, 0.8, 1.3, -0.85, 0],
  ].forEach(([file, w, h, x, y, rot], i) => {
    const map = textureLoader.load(`./assets/images/hiasan/${file}.webp`);
    map.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false }));
    m.position.set(x, y, 0.1);
    m.rotation.z = rot;
    homeGroup.add(m);
    addFloat(m, { speed: 0.7 + i * 0.15, amp: 0.05, axis: "z", offset: i * 1.7 });
  });

  /* "scroll for explore" handwritten hint beside the character's left foot */
  const scrollHintTex = new THREE.CanvasTexture(document.createElement("canvas"));
  scrollHintTex.colorSpace = THREE.SRGBColorSpace;
  const scrollHintCanvas = scrollHintTex.image;
  scrollHintCanvas.width = 640;
  scrollHintCanvas.height = 220;
  const paintScrollHint = () => {
    const W = scrollHintCanvas.width, H = scrollHintCanvas.height;
    const ctx = scrollHintCanvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#111111";
    ctx.font = "60px 'Caveat', cursive";
    ctx.textAlign = "center";
    ctx.fillText("scroll for explore", W / 2, H / 2 + 20);
    scrollHintTex.needsUpdate = true;
  };
  paintScrollHint();
  document.fonts?.load("60px 'Caveat'").then(paintScrollHint);
  const scrollHint = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.65),
    new THREE.MeshBasicMaterial({ map: scrollHintTex, transparent: true, depthWrite: false })
  );
  scrollHint.position.set(-charWidth / 2 - 1.05, floorTopY + 0.45, 0.3);
  scrollHint.rotation.z = 0.05;
  homeGroup.add(scrollHint);
  addFloat(scrollHint, { speed: 0.6, amp: 0.02, axis: "z", offset: 0.3 });

  /* Name behind the head, one plane per letter, each as wide as its glyph. ADV = Fredericka the Great's own advance
     widths (em), hardcoded so every letter exists synchronously (the loop stage clones them); a late font load only
     repaints the canvases. Each letter flies off on its own when you scroll away (see tick). */
  const NAME = "Zikrifikri.21";
  const ADV = [0.67, 0.33, 0.53, 0.427, 0.33, 0.35, 0.33, 0.53, 0.427, 0.33, 0.188, 0.511, 0.427];
  const EM = 0.75, PX = 200, CH = 290, NAME_Y = 1.16; // world units per em, canvas px per em, canvas height, plane centre (glyphs ~ head band)
  const NAME_SPLIT = 0.9; // extra gap each letter drifts outward; walls are 4 from the path centre
  const HOME_SHIFT = 1.4; // how far the character steps left
  const nameLetters = [];
  const paintName = () => nameLetters.forEach((paint) => paint());
  const rnd = (i, k) => ((v) => v - Math.floor(v))(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453); // stable pseudo-random 0..1
  let cum = -ADV.reduce((a, b) => a + b) / 2;
  [...NAME].forEach((g, i) => {
    const cw = Math.ceil((ADV[i] + 0.24) * PX); // 0.12 em spare each side: glyphs overhang their advance
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = CH;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    nameLetters.push(() => {
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, cw, CH);
      ctx.fillStyle = "#111111"; // --ink
      ctx.font = `${PX}px 'Fredericka the Great', cursive`;
      ctx.textAlign = "center";
      ctx.fillText(g, cw / 2, 190);
      tex.needsUpdate = true;
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry((cw / PX) * EM, (CH / PX) * EM), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const mid = (NAME.length - 1) / 2;
    m.userData = { x0: (cum + ADV[i] / 2) * EM, side: Math.sign(i - mid), r: Math.abs(i - mid) / mid, lift: 0.3 + 1.2 * rnd(i, 1), tilt: (rnd(i, 2) - 0.5) * 1.6 };
    cum += ADV[i];
    m.position.set(m.userData.x0, NAME_Y, -0.15); // behind the character plane
    nameGroup.add(m);
  });
  paintName();
  document.fonts?.load("72px 'Fredericka the Great'").then(paintName);

  /* small hanging decorations near entrance */
  for (let i = 0; i < 4; i++) {
    const note = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      paperMaterial(
        paperCanvas(128, 128, (ctx, w, h) => {
          ctx.strokeStyle = "#111";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(20, 90);
          ctx.quadraticCurveTo(64, 20, 108, 90);
          ctx.stroke();
        })
      )
    );
    const side = i % 2 === 0 ? -1 : 1;
    hangOnWall(note, side < 0 ? "left" : "right", -2 - i * 2.2, 1.2 + i * 0.3);
    scene.add(note);
    addFloat(note, { speed: 0.8 + i * 0.1, amp: 0.05, axis: "z", offset: i });
  }

  /* ---------- ABOUT (z = -15) ---------- */
  const aboutZ = SECTIONS.about;
  const portraitMat = paperMaterial(meTexture);
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), portraitMat);
  hangOnWall(portrait, "left", aboutZ, 1);
  portrait.userData = {
    type: "about",
    data: profile,
    baseRotY: portrait.rotation.y,
    baseRotZ: 0,
    baseScale: 1,
  };
  scene.add(portrait);
  interactiveMeshes.push(portrait);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 1.1), inkMat);
  desk.position.set(1.6, -1.1, aboutZ + 1);
  desk.castShadow = true;
  scene.add(desk);
  const deskLegGeo = new THREE.BoxGeometry(0.1, 1, 0.1);
  [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.45], [1.2, 0.45]].forEach(([dx, dz]) => {
    const leg = new THREE.Mesh(deskLegGeo, inkMat);
    leg.position.set(1.6 + dx, -1.7, aboutZ + 1 + dz);
    scene.add(leg);
  });

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12), inkMat);
  lampBase.position.set(2.5, -0.75, aboutZ + 0.7);
  scene.add(lampBase);
  const lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: 0xf2c94c, roughness: 0.6 })
  );
  lampHead.position.set(2.5, -0.42, aboutZ + 0.7);
  lampHead.rotation.x = Math.PI;
  scene.add(lampHead);
  const deskLamp = new THREE.PointLight(0xffdca0, 0.8, 4);
  deskLamp.position.set(2.5, -0.3, aboutZ + 0.7);
  scene.add(deskLamp);

  for (let i = 0; i < 3; i++) {
    const stickyTex = paperCanvas(
      128,
      128,
      (ctx, w, h) => {
        ctx.font = "24px 'Caveat', cursive";
        ctx.fillStyle = "#111";
        ctx.textAlign = "center";
        ctx.fillText(["hire me?", "coffee.", "build!"][i], w / 2, h / 2 + 8);
      },
      ["#f2c94c", "#e95c4f", "#4d7cfe"][i]
    );
    const sticky = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), paperMaterial(stickyTex));
    sticky.position.set(1.2 + i * 0.4, -0.85, aboutZ + 1.3);
    sticky.rotation.x = -Math.PI / 2 + 0.05;
    sticky.rotation.z = (Math.random() - 0.5) * 0.4;
    scene.add(sticky);
    addFloat(sticky, { speed: 1 + i * 0.2, amp: 0.03, axis: "z", offset: i * 2 });
  }

  /* ---------- WORKS (z = -35) — dynamic project boards ---------- */
  function createProjectBoard(project, place) {
    const tex = paperCanvas(512, 640, (ctx, w, h) => {
      ctx.textAlign = "center";
      ctx.font = "bold 46px 'Archivo Black', sans-serif";
      ctx.fillStyle = "#111";
      wrapText(ctx, project.title.toUpperCase(), w / 2, h / 2 - 40, w - 80, 50);
      ctx.font = "26px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#77736a";
      ctx.fillText(project.category.toUpperCase(), w / 2, h / 2 + 60);
      ctx.font = "32px 'Caveat', cursive";
      ctx.fillStyle = "#e95c4f";
      ctx.fillText(project.year, w / 2, h - 60);
    });

    function wrapText(ctx2, text, x2, y2, maxWidth, lineHeight) {
      const words = text.split(" ");
      let line = "";
      const lines = [];
      words.forEach((word) => {
        const test = line + word + " ";
        if (ctx2.measureText(test).width > maxWidth && line !== "") {
          lines.push(line);
          line = word + " ";
        } else {
          line = test;
        }
      });
      lines.push(line);
      const startY = y2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((l, i) => ctx2.fillText(l.trim(), x2, startY + i * lineHeight));
    }

    const board = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.5), paperMaterial(tex));
    place(board);
    board.rotation.z = (Math.random() - 0.5) * 0.06;
    board.userData = {
      type: "project",
      data: project,
      baseRotY: board.rotation.y,
      baseRotZ: board.rotation.z,
      baseScale: 1,
    };
    interactiveMeshes.push(board);
    addFloat(board, { speed: 0.4, amp: 0.008, axis: "z", offset: Math.random() * 5 });
    return board;
  }

  /* Before/after case-study board: two stacked planes (sketch + final), crossfaded on hover/click. */
  function createShowcaseBoard(project, place) {
    const boardH = 1.7, boardW = boardH * project.aspect;

    const beforeTex = textureLoader.load(`./assets/images/projects/${project.before}`);
    beforeTex.colorSpace = THREE.SRGBColorSpace;
    const beforeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(boardW, boardH),
      new THREE.MeshBasicMaterial({ map: beforeTex })
    );

    const afterTex = textureLoader.load(`./assets/images/projects/${project.after}`);
    afterTex.colorSpace = THREE.SRGBColorSpace;
    const afterMat = new THREE.MeshBasicMaterial({ map: afterTex, transparent: true, opacity: 0, depthWrite: false });
    const afterMesh = new THREE.Mesh(new THREE.PlaneGeometry(boardW, boardH), afterMat);
    afterMesh.position.z = 0.003; // just in front of "before", so the crossfade has no z-fighting
    afterMesh.renderOrder = 1;

    const labelTex = paperCanvas(700, 170, (ctx, w, h) => {
      ctx.font = "bold 42px 'Archivo Black', sans-serif";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.fillText(project.title.toUpperCase(), w / 2, h / 2 - 6);
      ctx.font = "24px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#77736a";
      ctx.fillText(project.category.toUpperCase(), w / 2, h / 2 + 40);
    });
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(boardW * 0.95, 2.6), Math.min(boardW * 0.95, 2.6) * (170 / 700)),
      paperMaterial(labelTex)
    );
    label.position.set(0, boardH / 2 + 0.34, 0.002);

    const hint = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 0.32),
      paperMaterial(
        paperCanvas(360, 90, (ctx, w, h) => {
          ctx.font = "34px 'Caveat', cursive";
          ctx.fillStyle = "#111";
          ctx.textAlign = "center";
          ctx.fillText("hover / tap: before → after", w / 2, h / 2 + 12);
        })
      )
    );
    hint.position.set(0, -boardH / 2 - 0.26, 0.002);
    hint.rotation.z = -0.02;

    const group = new THREE.Group();
    group.add(beforeMesh, afterMesh, label, hint);
    place(group);

    beforeMesh.userData = {
      type: "showcase",
      data: project,
      afterMat,
      revealed: false,
      baseRotY: 0,
      baseRotZ: 0,
      baseScale: 1,
    };
    interactiveMeshes.push(beforeMesh);
    addFloat(group, { speed: 0.35, amp: 0.006, axis: "z", offset: Math.random() * 5 });
    return group;
  }

  const worksSpan = 20; // spread boards across this many world units
  projects.forEach((p, i) => {
    const z = SECTIONS.works + 6 - (i / Math.max(projects.length - 1, 1)) * worksSpan;
    const side = i % 2 === 0 ? "left" : "right";
    createProjectBoard(p, (b) => {
      hangOnWall(b, side, z, 0.8);
      scene.add(b);
    });
  });

  /* ---------- SKILLS (z = -55) — creative workshop ---------- */
  function createSkillItem(name, y, z, side) {
    const tex = paperCanvas(
      220,
      160,
      (ctx, w, h) => {
        ctx.font = "bold 30px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#111";
        ctx.textAlign = "center";
        ctx.fillText(name, w / 2, h / 2 + 10);
      },
      ["#fffdf7", "#f2c94c", "#e95c4f", "#4d7cfe"][Math.floor(Math.random() * 4)]
    );
    const item = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.65), paperMaterial(tex));
    hangOnWall(item, side, z, y);
    item.rotation.z = (Math.random() - 0.5) * 0.2;
    item.userData = {
      type: "skill",
      data: { name },
      baseRotY: item.rotation.y,
      baseRotZ: item.rotation.z,
      baseScale: 1,
    };
    scene.add(item);
    interactiveMeshes.push(item);
    addFloat(item, { speed: 0.6 + Math.random() * 0.4, amp: 0.02, axis: "z", offset: Math.random() * 5 });
  }

  {
    const skillsCenterZ = SECTIONS.skills;
    let flat = [];
    skillGroups.forEach((g) => g.items.forEach((it) => flat.push(`${g.category}: ${it}`)));
    flat.forEach((name, i) => {
      const side = i % 2 === 0 ? "left" : "right";
      const row = Math.floor(i / 2);
      const z = skillsCenterZ + 4 - row * 1.8; // +4 (not +6): keeps row 0 clear of the last works poster
      const y = -0.4 + (i % 3) * 0.9;
      createSkillItem(name, y, z, side);
    });

    /* a "monitor" object to represent the AI/creative workspace */
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x2b2822, roughness: 0.7 })
    );
    monitor.position.set(1.2, -0.6, skillsCenterZ + 1.5);
    scene.add(monitor);
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), inkMat);
    stand.position.set(1.2, -1.1, skillsCenterZ + 1.5);
    scene.add(stand);
  }

  /* ---------- CONTACT (z = -75) — message in a bottle ---------- */
  const contactZ = SECTIONS.contact;
  const oceanGeo = new THREE.PlaneGeometry(CORRIDOR_WIDTH - 0.4, 10, 40, 24);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0xdfe8f7,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -2.02, contactZ - 2);
  scene.add(ocean);
  const oceanPositions = ocean.geometry.attributes.position;
  const oceanBase = Float32Array.from(oceanPositions.array);

  const island = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0xe6d9b8, roughness: 0.95 })
  );
  island.position.set(-1.8, -1.85, contactZ - 4);
  scene.add(island);

  const bottleGroup = new THREE.Group();
  const bottleBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.6, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x8fd3c0, roughness: 0.2, transparent: true, opacity: 0.75 })
  );
  const bottleNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.25, 10),
    bottleBody.material
  );
  bottleNeck.position.y = 0.42;
  bottleGroup.add(bottleBody, bottleNeck);
  bottleGroup.position.set(0.8, -1.75, contactZ - 3);
  bottleGroup.rotation.z = 0.3;
  scene.add(bottleGroup);
  addFloat(bottleGroup, { speed: 0.7, amp: 0.05, axis: "z", offset: 0 });

  const messagePaper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xfffdf7, roughness: 0.9, side: THREE.DoubleSide })
  );
  messagePaper.position.set(0.8, -1.5, contactZ - 3);
  messagePaper.visible = false;
  scene.add(messagePaper);

  const contactSignTex = paperCanvas(512, 220, (ctx, w, h) => {
    ctx.font = "bold 30px 'Archivo Black', sans-serif";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.fillText("CLICK HERE", w / 2, h / 2 - 8);
    ctx.fillText("TO CONTACT ME", w / 2, h / 2 + 42);
  });
  const contactSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1), paperMaterial(contactSignTex));
  contactSign.position.set(0, 1.6, contactZ - 1);
  contactSign.userData = {
    type: "social",
    baseRotY: 0,
    baseRotZ: contactSign.rotation.z,
    baseScale: 1,
  };
  scene.add(contactSign);
  interactiveMeshes.push(contactSign);

  /* ---------- accessible "doors" / structural rhythm along corridor ---------- */
  const doorPositions = [-5, -25]; // the real doors (DOOR_Z, SKILL_DOOR_Z) are built below
  doorPositions.forEach((z) => {
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xe7ded0, roughness: 0.9, side: THREE.DoubleSide })
    );
    hangOnWall(door, "right", z, -0.8, 0.02);
    scene.add(door);
  });

  /* ---------- DOOR + PROJECT ROOM (right wall, beside the Fieldnote poster) ---------- */
  const ROOM_S = 1.2, ROOM_W = 10 * ROOM_S, FRAME_W = 2.04, LEAF_W = FRAME_W * 0.82, LEAF_H = DOOR_H - 0.05; // frame > 2-unit wall gap, leaf hides under the trim
  const doorMat = (f) => {
    const t = textureLoader.load(`./assets/images/${f}.webp`);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.05, roughness: 0.9, side: THREE.DoubleSide });
  };
  const frameMat = doorMat("door-frame"), leafMat = doorMat("door-leaf");
  /* Door on the right wall at z. depth = how far the camera may walk in; enter = walk-in fraction right after the
     door opens (1 for a small room, so the view is inside without scrolling). annex: local +z = corridor side, -z = into the room. */
  function createDoor(z, { depth, enter = 0, sky = false }) {
    const annex = new THREE.Group();
    hangOnWall(annex, "right", z, 0, 0);
    scene.add(annex);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(FRAME_W, DOOR_H), frameMat);
    frame.position.set(0, FLOOR_Y + DOOR_H / 2, 0.03);
    const pivot = new THREE.Group(); // hinge on the leaf's left edge
    pivot.position.set(-LEAF_W / 2, FLOOR_Y + LEAF_H / 2, -0.02);
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(LEAF_W, LEAF_H), leafMat);
    leaf.position.x = LEAF_W / 2;
    const door = { annex, pivot, depth, enter, sky };
    leaf.userData = { type: "door", door, baseRotY: 0, baseRotZ: 0, baseScale: 1 };
    pivot.add(leaf);
    const frameIn = frame.clone(); // same frame again on the room side, facing inward
    frameIn.rotation.y = Math.PI;
    frameIn.position.z = -0.03;
    annex.add(frame, frameIn, pivot);
    interactiveMeshes.push(leaf);
    return door;
  }
  const door1 = createDoor(DOOR_Z, { depth: 10 });
  const annex = door1.annex;
  /* baked room model: its +z wall sits on the doorway plane, faces point inward so it's invisible from the corridor */
  new GLTFLoader().load("./assets/models/vr_liminal_room_baked.glb", (gltf) => {
    const model = gltf.scene;
    /* cut a door-shaped hole in the model's door wall (only near z=0), so the doorway is open from inside */
    annex.updateMatrixWorld(true);
    const h = FRAME_W * 0.36, top = DOOR_TOP - 0.55; // lowered so the model's cut edge stays hidden behind the frame's top trim
    const hole = [
      [[1, 0, 0], -h], [[-1, 0, 0], -h], [[0, 1, 0], -top], [[0, -1, 0], FLOOR_Y], [[0, 0, -1], -0.3],
    ].map(([n, c]) => new THREE.Plane(new THREE.Vector3(...n), c).applyMatrix4(annex.matrixWorld));
    model.traverse((m) => {
      if (m.isMesh)
        m.material = new THREE.MeshBasicMaterial({ map: m.material.map, clippingPlanes: hole, clipIntersection: true });
    });
    model.scale.setScalar(ROOM_S);
    model.position.set(0, FLOOR_Y - 0.02, -6 * ROOM_S); // 0.02 under the corridor floor: no coplanar flicker
    annex.add(model);
  });

  roomShowcase.forEach((p, i) => {
    createShowcaseBoard(p, (b) => {
      b.position.set(i % 2 ? ROOM_W / 2 - HANG - 0.3 : HANG - ROOM_W / 2 + 0.3, 0.9, -3.2 - Math.floor(i / 2) * 3.4);
      b.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2;
      annex.add(b);
    });
  });

  /* ---------- SKY ROOM (right wall, z = -65): languages & frameworks ----------
     Opening the door walks the camera into a white glow, then a white fade swaps the view to skyScene: a paper-airplane
     guide flying through an endless cloud stream (one labelled cloud per language/framework, plus the reclining character).
     Scroll / drag / arrow keys speed the flight up or reverse it; clouds wrap modulo SKY_LEN, so it never ends.
     The top-left back button (#skyBack) is the way out: fade back, door closes, corridor again. */
  const door2 = createDoor(SKILL_DOOR_Z, { depth: 3.4, enter: 1, sky: true });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshBasicMaterial({ color: 0xfafafa, fog: false }));
  glow.position.set(0, 0.5, -4); // behind the walk-in stop, so the doorway shows white instead of the void
  door2.annex.add(glow);

  const SKY_BG = 0xfafafa, SKY_LEN = 96, SKY_Z = 6, SKY_DRIFT = 0.6; // track length, z where clouds wrap, idle flight speed (units/s)
  const skyScene = new THREE.Scene();
  skyScene.background = new THREE.Color(SKY_BG);
  skyScene.fog = new THREE.Fog(SKY_BG, 14, 46); // far clouds melt into the white: no pop-in at the wrap
  const skyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  skyLight.position.set(2, 6, 4);
  skyScene.add(new THREE.AmbientLight(0xffffff, 1.1), skyLight);
  const skyCam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  skyCam.position.set(0, 5, 8);
  skyCam.lookAt(0, 0.6, -1);
  const sky = { pos: 0, vel: 0, items: [], plane: null };
  let skyMode = false;
  const skyGo = (dy) => (sky.vel = THREE.MathUtils.clamp(sky.vel + dy * 0.12, -40, 40));

  const fitFont = (ctx, text, maxW, px, font) => {
    ctx.font = font(px); // font(size) -> css font string; shrink until the text fits maxW
    ctx.font = font(Math.min(px, (px * maxW) / ctx.measureText(text).width));
  };
  const loadImg = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
  const canvasTex = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  /* billboard on the track: d = distance along the loop, (x, y) = where it drifts across the view */
  function addSky(map, w, h, d, x, y, order = 0, fly = [(x < 0 ? -1 : 1) * 14, (y - 0.6) * 1.5]) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false }));
    mesh.quaternion.copy(skyCam.quaternion); // parallel to the view, so clouds never squash
    mesh.renderOrder = order; // labelled clouds always draw over the fillers
    skyScene.add(mesh);
    sky.items.push({ mesh, d, x, y, fly }); // fly = how far it flies out (x, y) by the time it reaches the camera
  }

  /* canvas text needs the web fonts first (or their fallbacks, if loading fails) */
  Promise.allSettled([
    loadImg("./assets/images/cloud.webp"), loadImg("./assets/images/clouds.webp"), loadImg("./assets/images/me-cloud.webp"),
    document.fonts?.load("bold 30px 'Space Grotesk'"), document.fonts?.load("60px 'Fredericka the Great'"),
    ...ropeSkills.map(([, f]) => loadImg(`./assets/images/skills/${f}.webp`)),
  ]).then((r) => {
    const [c1, c2, me] = r.slice(0, 3).map((x) => x.value);
    const cloud = (img) => canvasTex(512, 512, (ctx) => ctx.drawImage(img, 0, 0, 512, 512));
    const tex = (img) => {
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      return t;
    };

    /* the skill drawings, alternating sides so the flight path stays clear (a failed image load just skips it) */
    const logos = r.slice(5).map((x) => x.value).filter(Boolean);
    logos.forEach((img, i) => {
      const h = 2.2 + (i % 3) * 0.35;
      addSky(tex(img), (h * img.width) / img.height, h, (i + 1) * (SKY_LEN / (logos.length + 1)), (i % 2 ? 1 : -1) * (2.6 + Math.random() * 2.6), -0.8 + Math.random() * 2.4, 1);
    });

    /* airplane wears the cloud drawing on cream paper (glTF UVs: no flip) */
    const paper = canvasTex(512, 512, (ctx) => {
      ctx.fillStyle = "#efe6cf";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(c1, 0, 0, 512, 512);
    });
    paper.flipY = false;
    loadFitted("./assets/models/paper_airplane.glb", 4.2, (g) => {
      g.traverse((o) => o.isMesh && (o.material.map = paper));
      g.rotation.y = Math.PI; // the model's nose points +z; turn it away from the camera
      g.position.set(0, 0.3, 1);
      skyScene.add(g);
      sky.plane = g;
    });

    const plain = [cloud(c1), cloud(c2)];
    for (let i = 0; i < 12; i++) {
      const size = 2.5 + Math.random() * 2;
      addSky(plain[i % 2], size, size, Math.random() * SKY_LEN, (Math.random() - 0.5) * 18, -1.5 + Math.random() * 4);
    }

    addSky(tex(me), 5.4, 3.6, 10, 0, 0.8, 2, [-4, 9]); // the reclining character: first thing you see; it drifts up and away
    addSky(
      canvasTex(1024, 200, (ctx) => {
        ctx.textAlign = "center";
        ctx.lineJoin = "round";
        fitFont(ctx, "ZIKRIFIKRI.21", 900, 120, (s) => `${s}px 'Fredericka the Great', cursive`);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#111";
        ctx.strokeText("ZIKRIFIKRI.21", 512, 130);
        ctx.fillStyle = "#fafafa";
        ctx.fillText("ZIKRIFIKRI.21", 512, 130);
      }),
      5.4, 1.05, 10, 0, 3.15, 2, [-7, 7]
    );
    /* the tagline splits: one half flies out left, the other right */
    [["LANGUAGES", "right", -1.45, -16], ["& FRAMEWORKS", "left", 1.45, 16]].forEach(([text, align, x, fx]) =>
      addSky(
        canvasTex(512, 96, (ctx) => {
          ctx.fillStyle = "#111";
          ctx.textAlign = align;
          ctx.font = "600 44px 'Space Grotesk', sans-serif";
          ctx.fillText(text, align === "right" ? 500 : 12, 64);
        }),
        2.9, 0.54, 10, x, -1.2, 2, [fx, 0]
      )
    );
  });

  function updateSky(dt, t) {
    sky.vel *= Math.pow(0.92, dt * 60); // a flick carries on, then settles back to the idle drift
    sky.pos += (sky.vel + (reduceMotion ? 0 : SKY_DRIFT)) * dt;
    sky.items.forEach(({ mesh, d, x, y, fly }) => {
      const z = SKY_Z - ((((d - sky.pos) % SKY_LEN) + SKY_LEN) % SKY_LEN); // the infinite loop, both directions
      const k = THREE.MathUtils.clamp((z + 4) / 8, 0, 1) ** 2; // 0 far away .. 1 at the camera: it scatters outward while it comes forward
      mesh.position.set(x + fly[0] * k, y + fly[1] * k + (reduceMotion ? 0 : Math.sin(t * 0.6 + d) * 0.12), z);
    });
    if (sky.plane && !reduceMotion) {
      sky.plane.position.y = 0.3 + Math.sin(t * 1.1) * 0.08;
      sky.plane.position.x = Math.sin(t * 0.7) * 1.6; // floats left and right
      sky.plane.rotation.z = Math.cos(t * 0.7) * 0.25; // banks into the drift (roll around the nose axis)
    }
  }

  /* white fade hides the swap between corridor and sky (CSS: body.sky-fade) */
  const bodyCls = document.body.classList;
  function enterSky() {
    if (!st.open) return; // the visitor already walked back out
    bodyCls.add("sky-fade");
    gsap.delayedCall(D(0.45), () => {
      if (!st.open) return bodyCls.remove("sky-fade");
      sky.pos = sky.vel = 0; // always start at the character
      skyMode = true;
      document.documentElement.style.overflow = "hidden"; // keys / wheel must not move the corridor behind
      bodyCls.add("sky-mode");
      bodyCls.remove("sky-fade");
    });
  }
  function exitSky() {
    if (!skyMode || bodyCls.contains("sky-fade")) return;
    bodyCls.add("sky-fade");
    gsap.delayedCall(D(0.45), () => {
      skyMode = false;
      document.documentElement.style.overflow = "";
      bodyCls.remove("sky-mode", "sky-fade");
      leaveDoor(); // door closes, camera walks back into the corridor
    });
  }
  document.getElementById("skyBack").addEventListener("click", exitSky);
  window.addEventListener("keydown", (e) => {
    if (!skyMode) return;
    if (e.key === "Escape") exitSky();
    else if (/^Arrow(Down|Right)$/.test(e.key)) skyGo(120);
    else if (/^Arrow(Up|Left)$/.test(e.key)) skyGo(-120);
  });

  /* bend pass: shift every straight-built prop onto the winding path */
  scene.children.forEach((o) => {
    if (!o.userData.shell) o.position.x += bendX(o.position.z);
  });
  const paperHome = messagePaper.position.clone();

  /* ---------- LOOP STAGE ----------
     The corridor is endless, like the sky room: a copy of the opening stretch continues the tunnel right where it
     ends. Scrolling on walks the camera into the copy, and when it stands where it does at home the scroll wraps by
     one lap (LOOP_OFFSET) - the copy and the real start look identical, so nobody sees the swap. Both directions.
     Only z > -44 is copied: the fog swallows everything farther than 42 from the camera. */
  const LOOP_OFFSET = CORRIDOR_END - CORRIDOR_START; // stage-local z = CORRIDOR_START lands on the door
  const LOOP_DX = bendX(CORRIDOR_END) - bendX(CORRIDOR_START); // ...and its winding path picks up where the real one ends
  const pathAt = (z) => (z < CORRIDOR_END ? bendX(z - LOOP_OFFSET) + LOOP_DX : bendX(z)); // corridor centre line, stage included
  const loopStage = new THREE.Group();
  scene.children.forEach((o) => {
    if (!o.isLight && (o.userData.shell || o.position.z > -44)) loopStage.add(o.clone());
  });
  loopStage.position.set(LOOP_DX, 0, LOOP_OFFSET);
  loopStage.visible = false; // only drawn near the end of a lap (see tick)
  scene.add(loopStage);

  /* ---------- BIG DOOR at the end of the loop ----------
     Lives in the stage, 2 units before the loop point (stage z = 8; the lap wraps with the camera at 6), so at the
     wrap it is already behind the camera and nothing pops. Frame + both leaves are one 2000px canvas each, so they
     register by pixel. The leaves swing by camera distance (see tick), which also closes them when you scroll back. */
  const BIG_DOOR_Z = CORRIDOR_START - 6;
  const DS = ((CEIL_Y - FLOOR_Y) * 2000) / 1976; // world size of the canvas: the frame (rows 1-1977) spans floor to ceiling
  const dx = (px) => ((px - 988.5) / 2000) * DS; // canvas column -> x, frame centred on the corridor
  const dy = CEIL_Y - (999 / 2000) * DS; // canvas centre -> y
  const bigDoor = new THREE.Group();
  bigDoor.position.set(bendX(BIG_DOOR_Z), 0, BIG_DOOR_Z);
  bigDoor.rotation.y = Math.atan(bendSlope(BIG_DOOR_Z));
  const canvasPlane = (f) => new THREE.Mesh(new THREE.PlaneGeometry(DS, DS), doorMat(f));
  const bigFrame = canvasPlane("loop-door-frame");
  bigFrame.position.set(dx(1000), dy, 0);
  bigDoor.add(bigFrame);
  const bigLeaves = [["loop-door-right", 241, 1], ["loop-door-left", 1749, -1]].map(([f, hinge, dir]) => { // [file, hinge column, swing sign]
    const pivot = new THREE.Group(); // the art in "right" sits left of the seam, so it hinges on the left edge
    pivot.position.set(dx(hinge), 0, -0.02);
    pivot.userData.dir = dir;
    const leaf = canvasPlane(f);
    leaf.position.set(dx(1000) - dx(hinge), dy, 0);
    pivot.add(leaf);
    bigDoor.add(pivot);
    return pivot;
  });
  [-1, 1].forEach((side) => { // wall on both sides of the frame, up to the corridor walls
    const w = HW - 2.3, H = CEIL_Y - FLOOR_Y, g = new THREE.PlaneGeometry(w, H), uv = g.attributes.uv.array;
    for (let i = 0; i < uv.length; i += 2) [uv[i], uv[i + 1]] = [(uv[i + 1] * H) / TILE, (uv[i] * w) / TILE]; // wall texture runs u = up, v = along
    const patch = new THREE.Mesh(g, wallMat);
    patch.position.set(side * (2.3 + w / 2), (CEIL_Y + FLOOR_Y) / 2, -0.03);
    bigDoor.add(patch);
  });
  loopStage.add(bigDoor);

  /* ---------- GLB PROPS ----------
     Loaded async, so they miss the bend pass and the loop-stage copy above: shift by bendX here and copy into the stage
     by hand (same z > -44 rule), otherwise they'd pop when the loop swaps back to the real corridor. */
  function addProp(g, x, y, z) {
    g.position.set(x + bendX(z), y, z);
    scene.add(g);
    if (z > -44) loopStage.add(g.clone());
  }
  /* coffee on the About desk (desk top y = -1.025), handle turned toward the camera's right */
  loadFitted("./assets/models/cup_of_coffee.glb", 0.5, (g) => {
    g.rotation.y = -2;
    addProp(g, 0.8, -1.025 + g.userData.size.y / 2, aboutZ + 0.85);
  });
  /* fan grilles replace exhaust-fan.webp: faces down, yawed along the winding ceiling */
  loadFitted("./assets/models/fan_grille.glb", 1.3, (fan) => {
    fan.rotation.x = Math.PI / 2;
    fanZs.forEach((z) => {
      const g = new THREE.Group().add(fan.clone());
      g.rotation.y = -Math.atan(bendSlope(z));
      addProp(g, 0, CEIL_Y - fan.userData.size.z / 2 - 0.01, z);
    });
  });

  /* door: click -> camera walks up + leaf opens; then wheel/touch walks into the room */
  const st = { focus: 0, roomT: 0, roomGoal: 0, open: false, door: null }; // door = the one being visited
  const D = (t) => (reduceMotion ? 0 : t);
  function openDoor(door) {
    if (st.open || st.focus > 0) return;
    st.door = door;
    gsap.to(look, { yaw: 0, pitch: 0, duration: D(1) }); // face the door
    gsap.timeline({ onComplete: () => ((st.open = true), (st.roomGoal = door.enter), door.sky && gsap.delayedCall(D(0.9), enterSky)) })
      .to(st, { focus: 1, duration: D(1.4), ease: "power2.inOut" })
      .to(door.pivot.rotation, { y: 1.75, duration: D(1.1), ease: "power2.out" });
  }
  function leaveDoor() {
    if (!st.focus) return;
    st.open = false;
    st.roomGoal = 0;
    const { pivot } = st.door;
    gsap.killTweensOf([st, pivot.rotation]);
    gsap.timeline()
      .to(look, { yaw: 0, pitch: 0, duration: D(0.6) })
      .to(pivot.rotation, { y: 0, duration: D(0.6) })
      .to(st, { focus: 0, duration: D(1.2) });
  }
  const look = { yaw: 0, pitch: 0 };
  let drag = null, moved = 0;
  canvas.addEventListener("pointerdown", (e) => {
    moved = 0;
    drag = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    moved += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
    if (skyMode) { // dragging up flies forward, like scrolling
      skyGo((drag.y - e.clientY) * 2);
      drag = { x: e.clientX, y: e.clientY };
      return;
    }
    const yl = st.focus ? Infinity : 1.3, pl = st.focus ? 1.2 : 0.35; // free 360° in the room, limited in the corridor
    look.yaw = Math.max(-yl, Math.min(yl, look.yaw + (e.clientX - drag.x) * 0.005));
    const dy = e.clientY - drag.y;
    if (e.pointerType === "touch") {
      // canvas has touch-action:none, so vertical swipes are handled here: scroll the corridor, or walk in the room
      if (Math.abs(dy) > Math.abs(e.clientX - drag.x)) { // mostly vertical only, so a sideways look never walks or exits
        if (st.open) nudge(-dy * 3, e);
        else window.scrollBy(0, -dy * 2.5);
      }
    } else look.pitch = Math.max(-pl, Math.min(pl, look.pitch + dy * 0.004));
    drag = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener("pointerup", () => (drag = null));
  window.addEventListener("pointercancel", () => (drag = null)); // touch turned into a vertical scroll
  function nudge(dy, e) {
    if (skyMode) return e.preventDefault(), skyGo(dy);
    if (!st.open) return;
    e.preventDefault();
    if (dy < 0 && st.roomGoal === 0) return leaveDoor(); // scroll up at the doorstep = step back out
    st.roomGoal = Math.min(1, Math.max(0, st.roomGoal + dy / 1500));
  }
  window.addEventListener("wheel", (e) => nudge(e.deltaY, e), { passive: false });

  /* ---------------------------------------------------------
     4. SCROLL → CAMERA
     --------------------------------------------------------- */
  let targetZ = 0;
  let currentZ = 0;

  function scrollableHeight() {
    return document.documentElement.scrollHeight - window.innerHeight || 1;
  }

  /* the page is 3 laps tall and we stay in the middle one: crossing either edge jumps a lap and shifts the camera by the
     same amount, so scrolling never hits an end. */
  history.scrollRestoration = "manual";
  let lapReady = false;
  function updateTargetFromScroll() {
    const lap = scrollableHeight() / 3;
    let y = window.scrollY;
    if (!lapReady) {
      lapReady = true;
      window.scrollTo(0, (y = lap));
      targetZ = currentZ = 0;
    }
    const k = Math.floor(y / lap) - 1; // laps away from the middle one
    if (k) {
      window.scrollTo(0, (y -= k * lap));
      currentZ -= k * LOOP_OFFSET;
    }
    targetZ = ((y - lap) / lap) * LOOP_OFFSET;
    updateActiveSection(currentZ);
    updateActiveNav(currentZ);
  }
  window.addEventListener("scroll", updateTargetFromScroll, { passive: true });

  const sectionEntries = Object.entries(SECTIONS); // [name, z]
  function closestSection(z) {
    let best = sectionEntries[0];
    let bestDist = Infinity;
    sectionEntries.forEach((entry) => {
      const d = Math.min(Math.abs(entry[1] - z), Math.abs(entry[1] - z - LOOP_OFFSET)); // home is also one lap down the tunnel
      if (d < bestDist) {
        bestDist = d;
        best = entry;
      }
    });
    return best[0];
  }

  let activeSection = "home";
  function updateActiveSection(z) {
    const name = closestSection(z);
    if (name !== activeSection) {
      activeSection = name;
    }
  }
  function updateActiveNav(z) {
    const name = closestSection(z);
    document.querySelectorAll("#navigation [data-target]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.target === name);
    });
  }

  /* ---------------------------------------------------------
     5. NAVIGATION CLICKS
     --------------------------------------------------------- */
  document.querySelectorAll("#navigation [data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      leaveDoor();
      const z = SECTIONS[btn.dataset.target];
      const lap = scrollableHeight() / 3;
      const top = lap + (z / LOOP_OFFSET) * lap;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      if (!reduceMotion && window.gsap) {
        gsap.fromTo(
          camera.rotation,
          { z: camera.rotation.z },
          { z: camera.rotation.z + (Math.random() > 0.5 ? 0.04 : -0.04), duration: 0.4, yoyo: true, repeat: 1, ease: "power2.inOut" }
        );
      }
    });
  });

  /* ---------------------------------------------------------
     6. MOUSE PARALLAX + CUSTOM CURSOR
     --------------------------------------------------------- */
  let mouseX = 0,
    mouseY = 0;
  let parallaxX = 0,
    parallaxY = 0;

  const cursorEl = document.getElementById("cursor");
  const cursorLabel = cursorEl.querySelector(".cursor-label");

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    if (isFinePointer) {
      cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
    checkHover(e.clientX, e.clientY);
  });

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  let hovered = null;

  function checkHover(clientX, clientY) {
    if (skyMode) return;
    pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
    pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    const hit = hits[0]?.object || null;

    if (hit !== hovered) {
      if (hovered) resetHoverVisual(hovered);
      hovered = hit;
      if (hovered) applyHoverVisual(hovered);
    }

    if (isFinePointer) {
      cursorEl.classList.toggle("is-hover", !!hovered);
      cursorEl.classList.remove("is-label");
    }
    canvas.style.cursor = hovered ? "pointer" : "default";
  }

  function applyHoverVisual(mesh) {
    if (reduceMotion || mesh.userData.type === "door" || mesh === meChar) return; // character stays put on hover
    if (mesh.userData.type === "showcase") {
      if (!mesh.userData.revealed) gsap.to(mesh.userData.afterMat, { opacity: 1, duration: 0.35, ease: "power2.out" });
      return;
    }
    gsap.to(mesh.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.25, ease: "power2.out" });
    gsap.to(mesh.rotation, { z: mesh.userData.baseRotZ + 0.05, duration: 0.25 });
  }
  function resetHoverVisual(mesh) {
    if (mesh.userData.type === "showcase") {
      if (!mesh.userData.revealed) gsap.to(mesh.userData.afterMat, { opacity: 0, duration: reduceMotion ? 0 : 0.35, ease: "power2.out" });
      return;
    }
    if (reduceMotion) {
      mesh.scale.set(1, 1, 1);
      return;
    }
    gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(mesh.rotation, { z: mesh.userData.baseRotZ, duration: 0.3 });
  }

  canvas.addEventListener("click", () => {
    if (!hovered || moved > 6 || skyMode) return; // a drag-to-look isn't a click
    const { type, data } = hovered.userData;
    if (type === "about" || type === "home") {
      openSection("home");
    } else if (type === "door") {
      openDoor(hovered.userData.door);
    } else if (type === "project") {
      openModal("project", data);
    } else if (type === "skill") {
      openModal("skill", data);
    } else if (type === "social") {
      openModal("social");
    } else if (type === "showcase") {
      hovered.userData.revealed = !hovered.userData.revealed;
      gsap.to(hovered.userData.afterMat, {
        opacity: hovered.userData.revealed ? 1 : 0,
        duration: reduceMotion ? 0 : 0.4,
        ease: "power2.out",
      });
    }
  });

  /* nav / interactive-button hover states for the custom cursor */
  document.querySelectorAll("#navigation button, .btn-send, .btn-enter, #skyBack").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (!isFinePointer) return;
      cursorEl.classList.add("is-label");
      cursorLabel.textContent = el.closest("#navigation") ? "GO" : "";
      cursorEl.classList.toggle("is-hover", !el.closest("#navigation"));
    });
    el.addEventListener("mouseleave", () => {
      if (!isFinePointer) return;
      cursorEl.classList.remove("is-label", "is-hover");
    });
  });

  /* ---------------------------------------------------------
     8. CONTACT FORM (simulated submit + bottle animation)
     --------------------------------------------------------- */
  setupContactForm(() => {
    if (reduceMotion) return;
    messagePaper.visible = true;
    messagePaper.scale.set(1, 1, 1);
    messagePaper.position.copy(paperHome);
    const tl = gsap.timeline();
    tl.to(messagePaper.scale, { x: 0.4, y: 0.4, duration: 0.35, ease: "power1.in" }) // fold
      .to(messagePaper.rotation, { z: Math.PI * 4, duration: 0.5, ease: "power1.in" }, "-=0.1") // roll
      .to(
        messagePaper.position,
        {
          x: bottleGroup.position.x,
          y: bottleGroup.position.y + 0.1,
          z: bottleGroup.position.z,
          duration: 0.5,
          onComplete: () => (messagePaper.visible = false),
        },
        "-=0.3"
      ) // enters bottle
      .to(bottleGroup.rotation, { z: bottleGroup.rotation.z + 0.5, duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut" }) // wave / throw
      .to(bottleGroup.position, { x: bottleGroup.position.x + 0.6, z: bottleGroup.position.z - 1.2, duration: 1.2, ease: "power1.out" }, "-=1.4");
  });

  /* ---------------------------------------------------------
     9. RESIZE
     --------------------------------------------------------- */
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    skyCam.aspect = camera.aspect;
    skyCam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2));
  });

  /* ---------------------------------------------------------
     10. LOADING SEQUENCE
     --------------------------------------------------------- */
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  let fakeProgress = 0;
  const progressTimer = setInterval(() => {
    fakeProgress = Math.min(96, fakeProgress + Math.random() * 14);
    loaderFill.style.width = fakeProgress + "%";
    loaderPercent.textContent = Math.floor(fakeProgress) + "%";
  }, 120);

  fontsReady.then(() => {
    clearInterval(progressTimer);
    loaderFill.style.width = "100%";
    loaderPercent.textContent = "100%";
    enterBtn.disabled = false;
    enterBtn.focus();
  });

  enterBtn.addEventListener("click", () => {
    loader.classList.add("is-hidden");
    document.documentElement.classList.remove("lock-scroll");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    updateTargetFromScroll();
  });

  /* ---------------------------------------------------------
     11. ANIMATION LOOP
     --------------------------------------------------------- */
  const clock = new THREE.Clock();

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;

    if (skyMode) {
      updateSky(dt, t);
      renderer.render(skyScene, skyCam);
      requestAnimationFrame(tick);
      return;
    }

    /* camera damped follow of scroll target */
    const smoothing = reduceMotion ? 1 : 1 - Math.pow(0.0001, dt);
    currentZ += (targetZ - currentZ) * smoothing;
    camera.position.z = 6 + currentZ; // small forward offset so entrance isn't flush with the sign

    /* follow the winding path, look a little ahead along it, slight roll for the tilted perspective */
    parallaxX += (mouseX * 0.05 - parallaxX) * 0.05;
    parallaxY += (mouseY * 0.03 - parallaxY) * 0.05;
    const px = reduceMotion ? 0 : parallaxX;
    const py = reduceMotion ? 0 : parallaxY;
    const pathX = pathAt(camera.position.z);
    const lookYaw = Math.atan2(pathX - pathAt(camera.position.z - 8), 8);
    camera.position.x = pathX + px * 0.6;
    camera.position.y = EYE_Y + py * 0.3;
    camera.rotation.x = py;
    camera.rotation.y = lookYaw - px;
    st.roomT += (st.roomGoal - st.roomT) * smoothing;
    if (st.focus > 0) {
      /* door/room pose: stand 2.6 in front of the door, then walk straight in along the room axis */
      const { annex: room, depth } = st.door;
      camera.position.lerp(room.localToWorld(new THREE.Vector3(0, EYE_Y, 2.6 - st.roomT * depth)), st.focus);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, room.rotation.y, st.focus);
    }
    camera.rotation.y += look.yaw;
    camera.rotation.x += look.pitch;

    /* scrolling in: the name splits left/right first, then (only once the camera is close) the character steps left */
    const dist = Math.min(-currentZ, currentZ - LOOP_OFFSET); // distance from the nearest home
    const split = THREE.MathUtils.smoothstep(dist, 0, 6);
    const step = 1 - THREE.MathUtils.smoothstep(camera.position.z - HOME_Z, 1.5, 5); // camera-to-character distance
    nameGroup.children.forEach((m) => { // each letter takes off on its own: the middle ones first, the outer ones later
      const u = m.userData, f = THREE.MathUtils.smoothstep(dist, u.r * 3, u.r * 3 + 4);
      m.position.set(u.x0 + u.side * NAME_SPLIT * f, NAME_Y + u.lift * f, -0.15);
      m.rotation.z = u.tilt * f;
    });
    homeGroup.position.x = bendX(HOME_Z) - step * HOME_SHIFT;
    scrollHint.material.opacity = 1 - split; // it would clip into the wall once the character has stepped over

    loopStage.visible = currentZ < -54; // the copy only comes into fog range near the end of a lap

    /* big door: closed beyond 14 units, wide open within 8 (and closing again as you scroll back) */
    const swing = 1 - THREE.MathUtils.smoothstep(currentZ - LOOP_OFFSET - (BIG_DOOR_Z - 6), 8, 14);
    bigLeaves.forEach((p) => (p.rotation.y = p.userData.dir * swing * 1.6));

    /* floating decorative objects */
    if (!reduceMotion) {
      floaters.forEach((f) => {
        f.obj.rotation[f.axis] = f.base + Math.sin(t * f.speed + f.offset) * f.amp;
      });
    }

    /* ocean waves */
    for (let i = 0; i < oceanPositions.count; i++) {
      const ix = i * 3;
      const x = oceanBase[ix];
      const y = oceanBase[ix + 1];
      const wave = reduceMotion ? 0 : Math.sin(x * 0.6 + t * 1.2) * 0.06 + Math.cos(y * 0.4 + t * 0.8) * 0.05;
      oceanPositions.setZ(i, wave);
    }
    oceanPositions.needsUpdate = true;

    updateActiveSection(currentZ);
    updateActiveNav(currentZ);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  window.__kraftScene = { scene, camera }; // debugging hook, harmless in production
}

/* =========================================================
   SHARED: CONTACT FORM (works with or without the 3D scene)
   ========================================================= */
function setupContactForm(onSuccessAnimation) {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = "please fill in every field first.";
      return;
    }
    status.textContent = "sealing the bottle and tossing it out to sea\u2026";
    if (onSuccessAnimation) onSuccessAnimation();
    setTimeout(() => {
      status.textContent = "message sent — thank you! I'll wave back soon.";
      form.reset();
    }, 1800);
  });
}