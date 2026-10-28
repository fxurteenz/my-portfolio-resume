/**
 * Portfolio Interactive Scripts
 * Three.js 3D Renderers, Terminal Emulator, Bento Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  init3DRobot();
  init3DKnot();
  initTerminal();
  initSkillFiltering();
  initRepoModal();
  initContactActions();
  initProfilePhotoUpload();
});

/* ==========================================================================
   1. THREE.JS: 3D CYBER ROBOT HEAD (Hero Centerpiece)
   Recreates the adorable high-tech rounded robot head from reference image
   ========================================================================== */
function init3DRobot() {
  const container = document.getElementById('robot-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 340;
  const height = container.clientHeight || 300;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Group for the entire robot
  const robotGroup = new THREE.Group();
  scene.add(robotGroup);

  // Pedestal Base (white modern tech pedestal)
  const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.2, 32);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0xDDDDDA,
    roughness: 0.4,
    metalness: 0.1
  });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = -2.1;
  pedestal.receiveShadow = true;
  robotGroup.add(pedestal);

  // Neck joint
  const neckGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24);
  const neckMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.6,
    metalness: 0.3
  });
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.y = -1.35;
  robotGroup.add(neck);

  // Head Outer Shell (Glossy white tech rounded box)
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.1;
  robotGroup.add(headGroup);

  // Outer casing
  const shellGeo = new THREE.BoxGeometry(2.6, 2.3, 1.9);
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xF5F5F2,
    roughness: 0.2,
    metalness: 0.05
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  headGroup.add(shell);

  // Orange Glowing Bezel / Rim around screen
  const bezelGeo = new THREE.BoxGeometry(2.1, 1.85, 0.25);
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0xFF5500,
    emissive: 0xFF4500,
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.2
  });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.set(0, 0, 0.9);
  headGroup.add(bezel);

  // Inner Screen (Dark Grey Glass with Grid lines)
  const screenGeo = new THREE.PlaneGeometry(1.65, 1.45);
  
  // Create dynamic canvas for the screen with grid and blinking eyes
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256;
  screenCanvas.height = 256;
  const ctx = screenCanvas.getContext('2d');

  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0, 1.03);
  headGroup.add(screen);

  // Ear Dials / Side bolts
  const earGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
  const earMat = new THREE.MeshStandardMaterial({
    color: 0xDCDCD8,
    roughness: 0.3,
    metalness: 0.2
  });
  const leftEar = new THREE.Mesh(earGeo, earMat);
  leftEar.rotation.z = Math.PI / 2;
  leftEar.position.set(-1.4, 0, 0);
  headGroup.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.position.set(1.4, 0, 0);
  headGroup.add(rightEar);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.1);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.6);
  mainLight.position.set(4, 6, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const orangeRimLight = new THREE.PointLight(0xFF5500, 2.8, 8);
  orangeRimLight.position.set(0, 0.2, 2.5);
  scene.add(orangeRimLight);

  const fillLight = new THREE.DirectionalLight(0xD8D8D4, 0.7);
  fillLight.position.set(-4, -2, -3);
  scene.add(fillLight);

  // Screen animation state
  let blinkState = 1.0; // 1 = open, 0 = closed
  let isBlinking = false;
  let lastBlink = Date.now();

  function drawScreen() {
    ctx.fillStyle = '#1A1A1E';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Glowing white digital eyes
    const eyeHeight = Math.max(2, 26 * blinkState);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;

    // Left Eye
    ctx.beginPath();
    ctx.ellipse(88, 128, 15, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.beginPath();
    ctx.ellipse(168, 128, 15, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    screenTexture.needsUpdate = true;
  }

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  function onMouseMove(event) {
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX = (event.clientX - cx) / (window.innerWidth / 2);
    mouseY = (event.clientY - cy) / (window.innerHeight / 2);

    targetRotationY = mouseX * 0.55;
    targetRotationX = -mouseY * 0.35;
  }

  window.addEventListener('mousemove', onMouseMove);

  // Resize handler
  function onResize() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Subtle breathing float
    headGroup.position.y = 0.1 + Math.sin(time * 1.5) * 0.04;
    headGroup.rotation.y += (targetRotationY - headGroup.rotation.y) * 0.08;
    headGroup.rotation.x += (targetRotationX - headGroup.rotation.x) * 0.08;

    // Blinking logic
    const now = Date.now();
    if (!isBlinking && now - lastBlink > 3500 + Math.random() * 2000) {
      isBlinking = true;
      lastBlink = now;
    }

    if (isBlinking) {
      const elapsed = now - lastBlink;
      if (elapsed < 120) {
        blinkState = 1 - (elapsed / 120);
      } else if (elapsed < 240) {
        blinkState = (elapsed - 120) / 120;
      } else {
        blinkState = 1.0;
        isBlinking = false;
      }
      drawScreen();
    }

    renderer.render(scene, camera);
  }

  drawScreen();
  animate();
}

/* ==========================================================================
   2. THREE.JS: 3D GEOMETRIC KNOT / CROSS (Target Box in Reference)
   Recreates the 6-way isometric matte white structural connector
   ========================================================================== */
function init3DKnot() {
  const container = document.getElementById('knot-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 100;
  const height = container.clientHeight || 100;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(3, 2.5, 4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Build the 6-armed hollow cross connector
  const knotGroup = new THREE.Group();
  scene.add(knotGroup);

  const pipeGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.8, 32);
  const pipeMat = new THREE.MeshStandardMaterial({
    color: 0xEEEEEC,
    roughness: 0.25,
    metalness: 0.1
  });

  const axisX = new THREE.Mesh(pipeGeo, pipeMat);
  axisX.rotation.z = Math.PI / 2;
  knotGroup.add(axisX);

  const axisY = new THREE.Mesh(pipeGeo, pipeMat);
  knotGroup.add(axisY);

  const axisZ = new THREE.Mesh(pipeGeo, pipeMat);
  axisZ.rotation.x = Math.PI / 2;
  knotGroup.add(axisZ);

  // Central joint core sphere
  const coreGeo = new THREE.SphereGeometry(0.48, 32, 32);
  const core = new THREE.Mesh(coreGeo, pipeMat);
  knotGroup.add(core);

  // End caps with holes (bevel tech feel)
  const capGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.05, 32);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

  [
    [0, 0.9, 0, 0, 0, 0],
    [0, -0.9, 0, 0, 0, 0],
    [0.9, 0, 0, 0, 0, Math.PI / 2],
    [-0.9, 0, 0, 0, 0, Math.PI / 2],
    [0, 0, 0.9, Math.PI / 2, 0, 0],
    [0, 0, -0.9, Math.PI / 2, 0, 0]
  ].forEach(cfg => {
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(cfg[0], cfg[1], cfg[2]);
    cap.rotation.set(cfg[3], cfg[4], cfg[5]);
    knotGroup.add(cap);
  });

  // Lighting
  const light1 = new THREE.DirectionalLight(0xFFFFFF, 1.8);
  light1.position.set(3, 4, 3);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xD6D6D2, 0.8);
  light2.position.set(-3, -2, -2);
  scene.add(light2);

  const ambient = new THREE.AmbientLight(0xFFFFFF, 0.9);
  scene.add(ambient);

  // Hover acceleration
  let speed = 0.008;
  container.addEventListener('mouseenter', () => { speed = 0.025; });
  container.addEventListener('mouseleave', () => { speed = 0.008; });

  function animate() {
    requestAnimationFrame(animate);
    knotGroup.rotation.x += speed * 0.7;
    knotGroup.rotation.y += speed;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/* ==========================================================================
   3. INTERACTIVE TECH TERMINAL
   Allows visitors to run commands and explore the profile like a real dev CLI
   ========================================================================== */
function initTerminal() {
  const input = document.getElementById('terminal-cli-input');
  const output = document.getElementById('terminal-cli-output');
  if (!input || !output) return;

  const COMMANDS = {
    help: `Available commands:
  • <span class="text-orange-500 font-semibold">about</span>     - Overview & developer background
  • <span class="text-orange-500 font-semibold">skills</span>    - List core hard & soft skills
  • <span class="text-orange-500 font-semibold">repos</span>     - Highlighted GitHub repositories
  • <span class="text-orange-500 font-semibold">stats</span>     - Code & productivity metrics
  • <span class="text-orange-500 font-semibold">contact</span>   - Email, socials & links
  • <span class="text-orange-500 font-semibold">neofetch</span>  - System & architectural spec
  • <span class="text-orange-500 font-semibold">clear</span>    - Clear terminal history`,

    about: `<span class="text-white font-semibold">THITIWATCH S. // SENIOR FULL-STACK & AI ARCHITECT</span>
Focusing on high-performance web applications, distributed systems, and generative AI integrations.
5+ years experience building reactive frontends, resilient backend APIs, and developer tooling.`,

    skills: `<span class="text-orange-500 font-semibold">[HARD SKILLS]</span>
Frontend:  TypeScript, React, Next.js, Vue 3, Tailwind CSS v4, Three.js
Backend:   Node.js, Go, Python, NestJS, GraphQL, REST
Database:  PostgreSQL, Redis, Supabase, MongoDB, Vector DBs (Pinecone, Chroma)
DevOps:    Docker, Kubernetes, AWS, GitHub Actions, Terraform

<span class="text-orange-500 font-semibold">[SOFT SKILLS]</span>
System Design, Technical Leadership, Agile Development, Cross-team Communication`,

    repos: `★ <span class="text-white font-bold">omniverse-rag-core</span>     [Python/LangChain] - Distributed enterprise knowledge base
★ <span class="text-white font-bold">flux-state-engine</span>       [TypeScript]       - Zero-overhead atomic state manager
★ <span class="text-white font-bold">bento-design-system</span>     [Tailwind/React]   - Modular architectural UI kit
★ <span class="text-white font-bold">neural-cache-proxy</span>      [Go/Redis]         - High-throughput LLM semantic caching layer`,

    stats: `[PRODUCTIVITY MATRIX]
• Total Repositories: 42
• Production Commits: 1,480+ (past 12 mo)
• SLA / System Uptime: 99.98%
• Test Coverage Avg:  91.4%`,

    neofetch: `       <span class="text-orange-500">/\_/\</span>        OS: Antigravity Unix x86_64
      <span class="text-orange-500">( o.o )</span>       Host: Cloud Architecture / Bento Grid
       <span class="text-orange-500">> ^ <</span>        Kernel: TypeScript 5.8 / Node 24.2
      <span class="text-orange-500">/     \</span>       Shell: zsh 5.9 (x86_64-apple-darwin)
     <span class="text-orange-500">|       |</span>      Editor: Neovim / VSCode
     <span class="text-orange-500"> \__/\__/</span>      Theme: Concrete Gray & Cyber Orange`,

    contact: `Email:   thitiwatch.dev@gmail.com
GitHub:  github.com/thitiwatch
LinkedIn: linkedin.com/in/thitiwatch
Twitter: @thitiwatch_dev`
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawVal = input.value.trim().toLowerCase();
      input.value = '';

      if (!rawVal) return;

      const cmdLine = document.createElement('div');
      cmdLine.className = 'mt-2 text-zinc-400';
      cmdLine.innerHTML = `<span class="text-[#FF5500]">dev@wireframe:~$</span> ${escapeHTML(rawVal)}`;
      output.appendChild(cmdLine);

      if (rawVal === 'clear') {
        output.innerHTML = '';
        return;
      }

      const resLine = document.createElement('div');
      resLine.className = 'mt-1 text-zinc-300 leading-relaxed';

      if (COMMANDS[rawVal]) {
        resLine.innerHTML = COMMANDS[rawVal];
      } else {
        resLine.innerHTML = `<span class="text-red-400">Command not found: '${escapeHTML(rawVal)}'. Type <span class="text-orange-400 font-semibold">'help'</span> for instructions.</span>`;
      }

      output.appendChild(resLine);
      output.scrollTop = output.scrollHeight;
    }
  });

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

/* ==========================================================================
   4. SKILL MATRIX FILTERING (Bento Interactive Tabs)
   ========================================================================== */
function initSkillFiltering() {
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states
      filterBtns.forEach(b => b.classList.remove('active', 'bg-[#FF5500]', 'text-white'));
      btn.classList.add('active', 'bg-[#FF5500]', 'text-white');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });
}

/* ==========================================================================
   5. REPO MODAL VIEWER
   ========================================================================== */
function initRepoModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const triggers = document.querySelectorAll('.repo-modal-trigger');

  if (!modal || !closeBtn) return;

  const modalTitle = document.getElementById('modal-repo-title');
  const modalDesc = document.getElementById('modal-repo-desc');
  const modalTech = document.getElementById('modal-repo-tech');
  const modalGithub = document.getElementById('modal-repo-github');
  const modalLive = document.getElementById('modal-repo-live');
  const modalArch = document.getElementById('modal-repo-arch');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const name = trigger.getAttribute('data-name');
      const desc = trigger.getAttribute('data-desc');
      const tech = trigger.getAttribute('data-tech')?.split(',') || [];
      const github = trigger.getAttribute('data-github') || '#';
      const live = trigger.getAttribute('data-live') || '#';
      const arch = trigger.getAttribute('data-arch') || 'Modular Microservices Architecture';

      if (modalTitle) modalTitle.textContent = name;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalArch) modalArch.textContent = arch;

      if (modalTech) {
        modalTech.innerHTML = tech.map(t => `<span class="wire-badge">${t.trim()}</span>`).join('');
      }

      if (modalGithub) modalGithub.href = github;
      if (modalLive) modalLive.href = live;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. CONTACT ACTIONS & CLIPBOARD TOAST
   ========================================================================== */
function initContactActions() {
  const copyBtns = document.querySelectorAll('.copy-email-btn');
  const toast = document.getElementById('toast-notification');
  const emailText = 'thitiwatch.dev@gmail.com';

  function showToast(msg) {
    if (!toast) return;
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(emailText).then(() => {
        showToast('COPIED EMAIL TO CLIPBOARD: ' + emailText);
      }).catch(() => {
        showToast('EMAIL: ' + emailText);
      });
    });
  });

  // Contact form submission feedback
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('MESSAGE DISPATCHED VIA PROTOCOL // THANK YOU!');
      contactForm.reset();
    });
  }
}

/* ==========================================================================
   7. HERO PROFILE PHOTO UPLOAD / PREVIEW
   Allows visitor or owner to pick an image file to instantly test on the UI
   ========================================================================== */
function initProfilePhotoUpload() {
  const uploadInput = document.getElementById('profile-upload-input');
  const profileImg = document.getElementById('hero-profile-img');
  const toast = document.getElementById('toast-notification');

  function showToast(msg) {
    if (!toast) return;
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  if (uploadInput && profileImg) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profileImg.src = event.target.result;
          showToast('UPDATED PROFILE PORTRAIT PREVIEW // SUCCESS');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
