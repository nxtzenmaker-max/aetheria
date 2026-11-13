/**
 * AETHERIA // Three.js & Fallback WebGL/Canvas 3D Atmosphere
 */

class CosmicSceneManager {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    this.canvas = document.getElementById('three-canvas');
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.themeColors = {
      cyan: 0x00f0ff,
      purple: 0x8a2be2,
      pink: 0xff007f
    };
    this.isThreeActive = false;
    this.init();
  }

  init() {
    if (typeof THREE !== 'undefined') {
      try {
        this.initThree();
        this.isThreeActive = true;
      } catch (e) {
        console.warn('Three.js initialization failed, falling back to 2D Canvas particles:', e);
        this.initCanvasFallback();
      }
    } else {
      this.initCanvasFallback();
    }

    this.bindEvents();
  }

  initThree() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 24;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Group for mouse rotation
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    // 1. Central Morphing Wireframe Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(7, 2);
    this.coreMat = new THREE.MeshBasicMaterial({
      color: this.themeColors.cyan,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.worldGroup.add(this.coreMesh);

    // 2. Inner Glowing Core
    const innerGeo = new THREE.OctahedronGeometry(4, 1);
    this.innerMat = new THREE.MeshBasicMaterial({
      color: this.themeColors.purple,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    this.innerMesh = new THREE.Mesh(innerGeo, this.innerMat);
    this.worldGroup.add(this.innerMesh);

    // 3. Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(10.5, 0.05, 16, 100);
    this.ring1Mat = new THREE.MeshBasicMaterial({
      color: this.themeColors.cyan,
      transparent: true,
      opacity: 0.4
    });
    this.ring1 = new THREE.Mesh(ring1Geo, this.ring1Mat);
    this.ring1.rotation.x = Math.PI / 3;
    this.worldGroup.add(this.ring1);

    // 4. Orbital Ring 2
    const ring2Geo = new THREE.TorusGeometry(12, 0.04, 16, 100);
    this.ring2Mat = new THREE.MeshBasicMaterial({
      color: this.themeColors.pink,
      transparent: true,
      opacity: 0.3
    });
    this.ring2 = new THREE.Mesh(ring2Geo, this.ring2Mat);
    this.ring2.rotation.y = Math.PI / 4;
    this.ring2.rotation.x = -Math.PI / 6;
    this.worldGroup.add(this.ring2);

    // 5. Particle Starfield / Nebula
    const particleCount = 1400;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(this.themeColors.cyan);
    const c2 = new THREE.Color(this.themeColors.purple);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 80;
      posArray[i + 1] = (Math.random() - 0.5) * 80;
      posArray[i + 2] = (Math.random() - 0.5) * 80;

      const mixed = c1.clone().lerp(c2, Math.random());
      colorArray[i] = mixed.r;
      colorArray[i + 1] = mixed.g;
      colorArray[i + 2] = mixed.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeo, particlesMat);
    this.scene.add(this.particles);

    // Start render loop
    this.clock = new THREE.Clock();
    this.animateThree();
  }

  animateThree() {
    requestAnimationFrame(() => this.animateThree());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Rotate core & rings
    if (this.coreMesh) {
      this.coreMesh.rotation.y = elapsedTime * 0.12;
      this.coreMesh.rotation.x = elapsedTime * 0.08;
    }

    if (this.innerMesh) {
      this.innerMesh.rotation.y = -elapsedTime * 0.2;
      this.innerMesh.rotation.z = elapsedTime * 0.15;
    }

    if (this.ring1) {
      this.ring1.rotation.z = elapsedTime * 0.09;
      this.ring1.rotation.y = Math.sin(elapsedTime * 0.2) * 0.2;
    }

    if (this.ring2) {
      this.ring2.rotation.z = -elapsedTime * 0.07;
      this.ring2.rotation.x = Math.cos(elapsedTime * 0.2) * 0.2;
    }

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02;
    }

    // Parallax response to mouse & scroll
    const scrollY = window.scrollY || window.pageYOffset;
    this.worldGroup.rotation.y = this.mouse.x * 0.4;
    this.worldGroup.rotation.x = -this.mouse.y * 0.3;
    this.worldGroup.position.y = -scrollY * 0.005;

    this.renderer.render(this.scene, this.camera);
  }

  // Pure HTML5 Canvas 2D Fallback
  initCanvasFallback() {
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    this.fallbackParticles = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      this.fallbackParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        color: Math.random() > 0.5 ? '#00f0ff' : '#8a2be2'
      });
    }

    this.animateFallback();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animateFallback() {
    requestAnimationFrame(() => this.animateFallback());

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw connected particles
    for (let i = 0; i < this.fallbackParticles.length; i++) {
      const p = this.fallbackParticles[i];
      p.x += p.vx + this.mouse.targetX * 0.5;
      p.y += p.vy + this.mouse.targetY * 0.5;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();

      for (let j = i + 1; j < this.fallbackParticles.length; j++) {
        const p2 = this.fallbackParticles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = '#00f0ff';
          this.ctx.globalAlpha = (1 - dist / 110) * 0.18;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }
  }

  updateThemeColors(themeName) {
    let cyan = 0x00f0ff;
    let purple = 0x8a2be2;
    let pink = 0xff007f;

    if (themeName === 'solar') {
      cyan = 0xff9900;
      purple = 0xff4500;
      pink = 0xffd60a;
    } else if (themeName === 'matrix') {
      cyan = 0x00f5a0;
      purple = 0x00b4d8;
      pink = 0x38ef7d;
    } else if (themeName === 'nebula') {
      cyan = 0xc084fc;
      purple = 0xd946ef;
      pink = 0xf43f5e;
    }

    this.themeColors = { cyan, purple, pink };

    if (this.isThreeActive && this.coreMat) {
      this.coreMat.color.setHex(cyan);
      this.innerMat.color.setHex(purple);
      this.ring1Mat.color.setHex(cyan);
      this.ring2Mat.color.setHex(pink);
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      if (this.isThreeActive && this.renderer) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      } else if (this.ctx) {
        this.resizeCanvas();
      }
    });

    // Ripple effect on window click
    window.addEventListener('click', () => {
      if (this.isThreeActive && this.coreMesh) {
        // Quick subtle pulse
        this.coreMesh.scale.set(1.15, 1.15, 1.15);
        setTimeout(() => {
          this.coreMesh.scale.set(1, 1, 1);
        }, 200);
      }
    });
  }
}

window.CosmicSceneManager = CosmicSceneManager;
