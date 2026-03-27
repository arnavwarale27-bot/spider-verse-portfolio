/* ═══════════════════════════════════════════════════
   SPIDER-VERSE PORTFOLIO — MULTI-PAGE EDITION
   Login → Journey → 3 themed pages with nav
   ═══════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── MOUSE TRACKING ───
  const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // ─── SPIDER CURSOR ───
  const spiderCursor = document.getElementById("spider-cursor");
  const spiderSvg    = document.getElementById("spider-svg");
  let prevX = 0, prevY = 0;
  let curX = window.innerWidth / 2, curY = window.innerHeight / 2;
  let currentAngle = 0;

  function animateCursor() {
    // Smooth follow
    curX += (mouse.x - curX) * 0.18;
    curY += (mouse.y - curY) * 0.18;

    const dx = mouse.x - prevX;
    const dy = mouse.y - prevY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Rotate spider toward direction of travel (offset 90° because SVG points up)
    if (speed > 1.5) {
      const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      // Smooth shortest-path angle interpolation
      let diff = targetAngle - currentAngle;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      currentAngle += diff * 0.12;
    }

    // Speed class — legs pump faster + brighter glow
    if (speed > 8) {
      spiderCursor.classList.add("fast");
    } else {
      spiderCursor.classList.remove("fast");
    }

    spiderCursor.style.left = curX + "px";
    spiderCursor.style.top  = curY + "px";
    spiderCursor.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;

    prevX = mouse.x;
    prevY = mouse.y;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  function bindHover() {
    document.querySelectorAll("a, button, .btn, .contact-card, .skill-pill, .stat-card, .ach-card").forEach((el) => {
      el.addEventListener("mouseenter", () => spiderCursor.classList.add("hover-item"));
      el.addEventListener("mouseleave", () => spiderCursor.classList.remove("hover-item"));
    });
  }
  bindHover();

  // ─── CLICK BURST ───
  const clickBurstContainer = document.getElementById("click-burst-container");
  window.addEventListener("click", (e) => {
    const burst = document.createElement("div");
    burst.className = "click-burst";
    burst.style.left = e.clientX + "px";
    burst.style.top  = e.clientY + "px";

    // 2 expanding rings
    const ring1 = document.createElement("div"); ring1.className = "cb-ring";
    const ring2 = document.createElement("div"); ring2.className = "cb-ring-2";
    // Center dot
    const dot = document.createElement("div"); dot.className = "cb-dot";
    burst.appendChild(ring1);
    burst.appendChild(ring2);
    burst.appendChild(dot);

    // 8 web rays at equal angles
    for (let i = 0; i < 8; i++) {
      const ray = document.createElement("div");
      ray.className = "cb-ray";
      ray.style.transform = `translate(-0%, -50%) rotate(${i * 45}deg)`;
      ray.style.animationDelay = (i * 0.025) + "s";
      burst.appendChild(ray);
    }

    clickBurstContainer.appendChild(burst);
    // Remove after animation
    setTimeout(() => burst.remove(), 800);
  });

  // ─── THREE.JS SCENE ───
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04081a, 0.015);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 35;

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── BUILD 3D SPIDER WEB ──
  function createWeb(radius, radials, rings, zDepth, opacity) {
    const group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity });
    for (let i = 0; i < radials; i++) {
      const angle = (i / radials) * Math.PI * 2;
      const pts = [];
      for (let s = 0; s <= 30; s++) {
        const t = s / 30;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * t * radius,
          Math.sin(angle) * t * radius,
          Math.sin(t * Math.PI * 0.5) * zDepth
        ));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    for (let r = 1; r <= rings; r++) {
      const rr = (r / rings) * radius;
      const rz = Math.sin((r / rings) * Math.PI * 0.5) * zDepth;
      const pts = [];
      for (let s = 0; s <= 128; s++) {
        const a = (s / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, rz));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    return group;
  }

  const web1 = createWeb(22, 28, 12, 8, 0.09);
  scene.add(web1);
  const web2 = createWeb(16, 18, 8, -5, 0.04);
  web2.position.z = -10;
  scene.add(web2);

  // ── PARTICLES ──
  const PC = 180;
  const pPos = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 3);
  const pVel = [];

  // Current theme colors for particles
  const themes = {
    about:   [[0.83,0.18,0.18],[0.08,0.40,0.75],[1,.32,.32]],     // Movie: red/blue
    skills:  [[0.48,0.12,0.64],[0,0.90,0.46],[0.81,0.58,0.86]],   // Venom: purple/green
    contact: [[1,0.09,0.27],[1,0.92,0],[0.16,0.47,1]],             // Animated: red/yellow/blue
  };
  let currentPalette = themes.about;

  function colorParticles(palette) {
    for (let i = 0; i < PC; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      pCol[i * 3] = c[0]; pCol[i * 3 + 1] = c[1]; pCol[i * 3 + 2] = c[2];
    }
    pGeo.attributes.color.needsUpdate = true;
  }

  for (let i = 0; i < PC; i++) {
    pPos[i*3]=(Math.random()-.5)*80; pPos[i*3+1]=(Math.random()-.5)*80; pPos[i*3+2]=(Math.random()-.5)*50;
    const c = currentPalette[Math.floor(Math.random()*currentPalette.length)];
    pCol[i*3]=c[0]; pCol[i*3+1]=c[1]; pCol[i*3+2]=c[2];
    pVel.push({ x:(Math.random()-.5)*.03, y:(Math.random()-.5)*.03, z:(Math.random()-.5)*.015 });
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ size:.22, vertexColors:true, transparent:true, opacity:.75, sizeAttenuation:true });
  scene.add(new THREE.Points(pGeo, pMat));

  // ── Glowing orbs ──
  const orbColors = [0xe23636, 0x2196F3, 0xE91E93, 0x2979FF];
  const orbs = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(.3+Math.random()*.4,12,12),
      new THREE.MeshBasicMaterial({ color:orbColors[i%orbColors.length], transparent:true, opacity:.1+Math.random()*.08 })
    );
    m.position.set((Math.random()-.5)*50,(Math.random()-.5)*50,(Math.random()-.5)*30);
    m.userData = { speed:.2+Math.random()*.5, offset:Math.random()*Math.PI*2 };
    scene.add(m);
    orbs.push(m);
  }

  // ── Web line color ──
  let webTargetColor = new THREE.Color(0xffffff);
  function setWebColor(hex) {
    webTargetColor = new THREE.Color(hex);
  }

  // ── ANIMATION LOOP ──
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    web1.rotation.z = t * 0.03;
    web1.rotation.x = mouse.ny * 0.35;
    web1.rotation.y = mouse.nx * 0.35;
    web1.scale.setScalar(1 + Math.sin(t * 0.5) * 0.02);

    web2.rotation.z = -t * 0.02;
    web2.rotation.x = mouse.ny * 0.15;
    web2.rotation.y = mouse.nx * 0.15;

    // Lerp web color
    web1.children.forEach(c => { if(c.material) c.material.color.lerp(webTargetColor,.02); });
    web2.children.forEach(c => { if(c.material) c.material.color.lerp(webTargetColor,.02); });

    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < PC; i++) {
      pos[i*3]+=pVel[i].x; pos[i*3+1]+=pVel[i].y; pos[i*3+2]+=pVel[i].z;
      if(Math.abs(pos[i*3])>40) pVel[i].x*=-1;
      if(Math.abs(pos[i*3+1])>40) pVel[i].y*=-1;
      if(Math.abs(pos[i*3+2])>25) pVel[i].z*=-1;
    }
    pGeo.attributes.position.needsUpdate = true;

    orbs.forEach(o => {
      o.position.y += Math.sin(t*o.userData.speed+o.userData.offset)*.01;
      o.position.x += Math.cos(t*o.userData.speed*.7+o.userData.offset)*.008;
    });

    renderer.render(scene, camera);
  }
  animate();

  // ─── 3D TILT ───
  function bind3Dtilt() {
    document.querySelectorAll(".contact-card, .stat-card, .ach-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width/2) / (r.width/2);
        const dy = (e.clientY - r.top - r.height/2) / (r.height/2);
        card.style.transform = `perspective(800px) rotateY(${dx*14}deg) rotateX(${-dy*14}deg) scale(1.04)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)";
      });
    });
  }
  bind3Dtilt();

  // ─── LOGIN GATE ───
  const SHEET_URL = "https://script.google.com/macros/s/AKfycby-C5rZNMvLQjN_QxOSvBAWCAfNJz15YHQDSkECQbYiZpZTr5HxoiA31HNwFA0-CQFJuQ/exec";
  const loginGate = document.getElementById("login-gate");
  const loginForm = document.getElementById("login-form");
  const loginBtn = document.getElementById("login-btn");
  const loginError = document.getElementById("login-error");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const name = document.getElementById("visitor-name").value.trim();
    const phone = document.getElementById("visitor-phone").value.trim();
    if (!name || name.length < 2) { loginError.textContent = "Enter a valid name."; return; }
    if (!/^\d{10}$/.test(phone)) { loginError.textContent = "Enter a 10-digit phone number."; return; }

    loginBtn.classList.add("loading");
    loginBtn.disabled = true;

    try {
      if (SHEET_URL && !SHEET_URL.includes("YOUR_")) {
        await fetch(SHEET_URL, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, timestamp: new Date().toISOString() }),
        });
      }
    } catch (err) { console.error(err); }

    // Hide login → show journey
    setTimeout(() => {
      loginGate.classList.add("hidden");
      startJourney();
    }, 500);
  });

  // ─── JOURNEY — CINEMATIC SPIDER-MAN CHOREOGRAPHY ───
  const journey = document.getElementById("journey");
  const mainNav = document.getElementById("main-nav");
  const footer = document.getElementById("main-footer");

  function startJourney() {
    journey.classList.remove("hidden");

    const jGlitch     = document.getElementById("j-glitch");
    const spiderPhase = document.getElementById("j-spider-phase");
    const quotePhase  = document.getElementById("j-quote-phase");
    const namePhase   = document.getElementById("j-name-phase");
    const whiteout    = document.getElementById("journey-whiteout");

    // Phase 1 (0ms): Spider glows in
    jGlitch.classList.add("active");
    spiderPhase.classList.add("active");

    // Phase 2 (1800ms): Spider fades out → Quote appears
    setTimeout(() => {
      spiderPhase.classList.add("fadeout");
      spiderPhase.classList.remove("active");
      jGlitch.classList.remove("active");
    }, 1800);

    setTimeout(() => {
      quotePhase.classList.add("active");
    }, 2000);

    // Phase 3 (4200ms): Quote fades → Name reveal
    setTimeout(() => {
      quotePhase.classList.add("fadeout");
      quotePhase.classList.remove("active");
    }, 4000);

    setTimeout(() => {
      namePhase.classList.add("active");
    }, 4200);

    // Phase 4 (6000ms): Dark fade out
    setTimeout(() => {
      whiteout.classList.add("flash");
    }, 5800);

    // Phase 5 (6800ms): Show main site
    setTimeout(() => {
      journey.classList.add("hidden");
      mainNav.classList.remove("hidden");
      footer.classList.remove("hidden");
      document.getElementById("page-about").classList.add("active");
    }, 6800);
  }

  // ─── PAGE NAVIGATION ───
  const navBtns = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");
  let activePage = "about";

  const themeColors = {
    about:   { web: 0xD32F2F, dot: "#D32F2F", ring: "#1565C0" },   // Movie
    skills:  { web: 0x7B1FA2, dot: "#7B1FA2", ring: "#00E676" },   // Venom
    contact: { web: 0xFF1744, dot: "#FF1744", ring: "#FFEA00" },   // Animated
  };

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.page;
      if (target === activePage) return;

      // Flash transition
      const flash = document.createElement("div");
      flash.className = "page-flash";
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 500);

      // Switch pages
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      pages.forEach(p => p.classList.remove("active"));
      document.getElementById("page-" + target).classList.add("active");

      // Change theme colors
      const tc = themeColors[target];
      setWebColor(tc.web);

      // Change particle colors
      colorParticles(themes[target]);

      activePage = target;
    });
  });

  // ─── LOADER ───
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("loader").classList.add("hidden");
    }, 1200);
  });
})();
