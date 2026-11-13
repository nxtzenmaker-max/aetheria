/**
 * AETHERIA // Core Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Cosmic Scene
  const sceneManager = new CosmicSceneManager();

  // 2. Initialize AI Playground
  const playground = new NeuralPlayground();

  // 3. Initialize Command Palette
  const palette = new CommandPalette();

  // 4. Custom Interactive Cursor
  initCustomCursor();

  // 5. 3D Card Tilt & Specular Lighting
  initCardTilt();

  // 6. Interactive Soundboard
  initSoundboard();

  // 7. Live Telemetry Sim
  initTelemetrySim();

  // 8. Projects Filter & Modal System
  initProjectsSystem();

  // 9. Interactive Budget Slider & Contact Deck
  initContactDeck();

  // 10. Theme Engine
  initThemeEngine(sceneManager);

  // 11. Navbar Scroll Spy & Mobile Menu
  initNavbar();
});

/* ==========================================================================
   Custom Cursor & Magnetic Follower
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;

    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderFollower);
  }
  renderFollower();

  // Hover states
  const interactables = 'a, button, input, textarea, .bento-card, .project-card, .synth-pad, .preset-pill, .filter-btn';
  document.querySelectorAll(interactables).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      if (window.audioSynthesizer) window.audioSynthesizer.playHover();
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}

/* ==========================================================================
   3D Tilt & Dynamic Specular Sheen
   ========================================================================== */
function initCardTilt() {
  const cards = document.querySelectorAll('.bento-card, .project-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set mouse position for radial gradient highlight
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate tilt angles (-10deg to +10deg)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ==========================================================================
   Interactive Soundboard Widget
   ========================================================================== */
function initSoundboard() {
  const pads = document.querySelectorAll('.synth-pad');
  const pentatonicScale = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25  // E5
  ];

  pads.forEach((pad, index) => {
    const freq = pentatonicScale[index % pentatonicScale.length];
    
    const trigger = () => {
      pad.classList.add('triggered');
      setTimeout(() => pad.classList.remove('triggered'), 200);

      if (window.audioSynthesizer) {
        window.audioSynthesizer.playNote(freq, 'sine');
      }
    };

    pad.addEventListener('click', trigger);
  });

  // Keyboard triggers (1 through 8)
  window.addEventListener('keydown', (e) => {
    const keyNum = parseInt(e.key, 10);
    if (keyNum >= 1 && keyNum <= 8 && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      const targetPad = pads[keyNum - 1];
      if (targetPad) {
        targetPad.click();
      }
    }
  });
}

/* ==========================================================================
   Live Telemetry Simulator
   ========================================================================== */
function initTelemetrySim() {
  const liveNodesEl = document.getElementById('telemetry-nodes');
  const liveThroughputEl = document.getElementById('telemetry-throughput');
  const liveBlockEl = document.getElementById('telemetry-block');

  let blockHeight = 1489201;

  setInterval(() => {
    blockHeight++;
    if (liveBlockEl) liveBlockEl.textContent = `#${blockHeight.toLocaleString()}`;

    if (liveNodesEl) {
      const nodes = 1420 + Math.floor(Math.sin(Date.now() * 0.001) * 8);
      liveNodesEl.textContent = `${nodes} Online`;
    }

    if (liveThroughputEl) {
      const gbps = (14.2 + Math.random() * 0.8).toFixed(2);
      liveThroughputEl.textContent = `${gbps} Gbps`;
    }
  }, 2400);
}

/* ==========================================================================
   Projects Showcase & Case Study Lightbox
   ========================================================================== */
function initProjectsSystem() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const projectDetails = {
    'nexus': {
      title: 'NEXUS // Planetary Edge AI Matrix',
      tag: 'Autonomous Systems & Edge AI',
      desc: 'Sub-millisecond edge neural routing matrix running in hardware enclaves across 42 global regions with zero-knowledge verified inferences.',
      metrics: ['< 4.2ms P99 Latency', '100% Rust & WebAssembly', 'ZK-SNARK Attested'],
      specs: 'Engineered with custom zero-copy memory pipelines, SIMD vectorized token inference, and Byzantine-fault-tolerant edge gossip protocols.',
      stack: ['Rust', 'WebAssembly', 'Intel SGX', 'Circom', 'WebGL']
    },
    'holo': {
      title: 'HOLO // Spatial 3D Volumetric HUD',
      tag: 'Spatial Computing & WebGL',
      desc: 'Next-generation in-browser volumetric holographic canvas engineered with Three.js, custom GLSL raymarching shaders, and spatial audio feedback.',
      metrics: ['120 FPS Native Render', 'Custom GLSL Shaders', 'Web Audio Spatializer'],
      specs: 'Dynamic vertex perturbation mapped to real-time audio FFT frequencies with procedural lens dispersion and chromatic aberration.',
      stack: ['Three.js', 'GLSL Shaders', 'Web Audio API', 'TypeScript']
    },
    'aether-vault': {
      title: 'AETHER VAULT // Institutional DeFi Liquidity',
      tag: 'High-Concurrency FinTech',
      desc: 'Algorithmic liquidity routing engine handling over $1.4B in 24h institutional volume with sub-block MEV protection and real-time risk graphs.',
      metrics: ['$1.4B+ Daily Volume', '0.0001% Slippage Cap', 'MEV Protected'],
      specs: 'Constructed with order-book depth aggregation across 18 decentralized pools and private RPC flashbots relay execution.',
      stack: ['Solidity', 'Go', 'gRPC', 'PostgreSQL', 'TimescaleDB']
    },
    'hyperion': {
      title: 'HYPERION // Autonomous Multi-Agent Swarm',
      tag: 'Multi-Agent AI Coordination',
      desc: 'Planetary agent mesh coordinating 10,000+ concurrent LLM workers with autonomous task slicing, peer review gates, and self-healing memory pools.',
      metrics: ['10k+ Live Agents', 'Self-Healing Memory', 'Distributed Consensus'],
      specs: 'Decentralized task scheduler utilizing vector embeddings similarity matching and asynchronous event loops.',
      stack: ['Python', 'FastAPI', 'Redis', 'Qdrant Vector DB', 'Docker']
    },
    'prism': {
      title: 'PRISM // Generative Neural Synthesis Engine',
      tag: 'Creative Tech & Generative AI',
      desc: 'Real-time procedural visual generation studio empowering creative directors to craft cinema-grade generative motion graphics via text and MIDI controllers.',
      metrics: ['4K Realtime Export', 'MIDI Controller Sync', 'Procedural Shaders'],
      specs: 'Hardware accelerated WebGPU compute shaders executing matrix transformations and diffusion sampling directly in browser memory.',
      stack: ['WebGPU', 'WGSL', 'Web MIDI API', 'React', 'Tailwind']
    },
    'orbital': {
      title: 'ORBITAL // Aerospace Telemetry Visualization',
      tag: 'Satellite Telemetry & 3D GIS',
      desc: 'Real-time orbital tracking station rendering 8,000+ LEO satellite ephemeris calculations with collision detection cones and radio footprint overlays.',
      metrics: ['8k+ Tracked Satellites', 'SGP4 Orbit Propagator', 'Sub-Second Doppler Sync'],
      specs: 'Integrated SGP4 orbital mathematical models with CesiumJS and custom spatial indexes for predictive orbit intersections.',
      stack: ['CesiumJS', 'WebGL', 'WebSockets', 'Node.js']
    }
  };

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });

      if (window.audioSynthesizer) window.audioSynthesizer.playHover();
    });
  });

  // Card click -> Modal
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-project-id');
      const data = projectDetails[id];
      if (!data || !modal) return;

      document.getElementById('modal-title').textContent = data.title;
      document.getElementById('modal-tag').textContent = data.tag;
      document.getElementById('modal-desc').textContent = data.desc;
      document.getElementById('modal-specs').textContent = data.specs;

      // Metrics
      const metricsContainer = document.getElementById('modal-metrics');
      if (metricsContainer) {
        metricsContainer.innerHTML = data.metrics.map(m => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 8px; text-align: center;">
            <span style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan);">${m}</span>
          </div>
        `).join('');
      }

      // Stack
      const stackContainer = document.getElementById('modal-stack');
      if (stackContainer) {
        stackContainer.innerHTML = data.stack.map(s => `
          <span style="background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); color: var(--accent-cyan); padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">${s}</span>
        `).join('');
      }

      modal.classList.add('open');
      if (window.audioSynthesizer) window.audioSynthesizer.playClick();
    });
  });

  // Close modal
  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      if (window.audioSynthesizer) window.audioSynthesizer.playClick();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }
}

/* ==========================================================================
   Interactive Budget Slider & Commission Deck
   ========================================================================== */
function initContactDeck() {
  const slider = document.getElementById('budget-slider');
  const budgetVal = document.getElementById('budget-val-display');
  const form = document.getElementById('contact-form');

  if (slider && budgetVal) {
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      budgetVal.textContent = `$${val.toLocaleString()} USD`;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();

      if (!name || !email) {
        showToast('⚠️ Please enter your name and email address.');
        return;
      }

      const receiptId = 'AETH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Trigger confetti & sound
      triggerConfetti();
      if (window.audioSynthesizer) window.audioSynthesizer.playSuccess();

      // Show success modal or toast
      showToast(`✨ Mission Inquiry Dispatched! Receipt: ${receiptId}`);

      // Reset form
      form.reset();
      if (slider && budgetVal) {
        slider.value = 45000;
        budgetVal.textContent = '$45,000 USD';
      }
    });
  }
}

/* ==========================================================================
   Theme Engine
   ========================================================================== */
function initThemeEngine(sceneManager) {
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const themes = ['prism', 'solar', 'matrix', 'nebula'];
  let currentThemeIndex = 0;

  const savedTheme = localStorage.getItem('aetheria_theme');
  if (savedTheme && themes.includes(savedTheme)) {
    currentThemeIndex = themes.indexOf(savedTheme);
    applyTheme(savedTheme);
  }

  window.setAppTheme = function(themeName) {
    if (themes.includes(themeName)) {
      currentThemeIndex = themes.indexOf(themeName);
      applyTheme(themeName);
      localStorage.setItem('aetheria_theme', themeName);
      if (sceneManager) sceneManager.updateThemeColors(themeName);
      showToast(`🎨 Theme switched to ${themeName.toUpperCase()}`);
    }
  };

  function applyTheme(name) {
    if (name === 'prism') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
    if (sceneManager) sceneManager.updateThemeColors(name);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const nextTheme = themes[currentThemeIndex];
      window.setAppTheme(nextTheme);
      if (window.audioSynthesizer) window.audioSynthesizer.playClick();
    });
  }
}

/* ==========================================================================
   Navbar & Mobile Menu
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const audioBtn = document.getElementById('btn-audio-toggle');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      if (window.audioSynthesizer) window.audioSynthesizer.playClick();
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (window.audioSynthesizer) {
        const isUnmuted = window.audioSynthesizer.toggleMute();
        audioBtn.classList.toggle('active', isUnmuted);
        showToast(isUnmuted ? '🔊 Audio feedback unmuted' : '🔇 Audio feedback muted');
        if (isUnmuted) window.audioSynthesizer.playSuccess();
      }
    });
  }
}

/* ==========================================================================
   Toast Notification Helper
   ========================================================================== */
window.showToast = function(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color: var(--accent-cyan); font-size: 1.1rem;">⚡</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

/* ==========================================================================
   Pure Canvas Confetti Fireworks Generator
   ========================================================================== */
window.triggerConfetti = function() {
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.inset = '0';
  confettiCanvas.style.width = '100vw';
  confettiCanvas.style.height = '100vh';
  confettiCanvas.style.zIndex = '999999';
  confettiCanvas.style.pointerEvents = 'none';
  document.body.appendChild(confettiCanvas);

  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#00f0ff', '#8a2be2', '#ff007f', '#00f5a0', '#ffb703', '#ffffff'];

  for (let i = 0; i < 140; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.vRot;
      p.alpha -= 0.009;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      confettiCanvas.remove();
    }
  }

  animate();
};
