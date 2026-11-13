/**
 * AETHERIA // AI Neural Synthesis Studio & Playground Controller
 */

class NeuralPlayground {
  constructor() {
    this.terminalEl = document.getElementById('playground-terminal');
    this.inputEl = document.getElementById('playground-prompt-input');
    this.runBtn = document.getElementById('btn-run-synthesis');
    this.canvas = document.getElementById('neural-sim-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.statTokens = document.getElementById('stat-tokens');
    this.statLatency = document.getElementById('stat-latency');
    this.statGpu = document.getElementById('stat-gpu');

    this.isStreaming = false;
    this.animationFrameId = null;
    this.simMode = 'quantum'; // 'quantum' | 'swarm' | 'holo' | 'zk'

    this.presets = {
      quantum: {
        prompt: 'Synthesize real-time Quantum Raymarching Shader with chromatic dispersion',
        code: `// [NEURAL SYNTHESIS: QUANTUM RAYMARCHER v4.2]
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    p.xz *= rot(u_time * 0.4);
    p.xy *= rot(u_time * 0.25);
    return length(p) - 1.2 + sin(p.x * 5.0 + u_time) * 0.15;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.0, -3.5);
    vec3 rd = normalize(vec3(uv, 1.2));
    
    float d = 0.0, t = 0.0;
    for(int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        d = map(p);
        if(d < 0.001 || t > 20.0) break;
        t += d * 0.75;
    }
    
    vec3 col = vec3(0.0, 0.94, 1.0) * (1.0 / (1.0 + t * t * 0.08));
    col += vec3(0.54, 0.17, 0.88) * sin(t * 3.0 + u_time);
    gl_FragColor = vec4(col, 1.0);
}`
      },
      swarm: {
        prompt: 'Generate Autonomous Swarm Edge Router with BFT consensus',
        code: `// [SYNTHESIS ENGINE: DISTRIBUTED SWARM CONSENSUS]
use aetheria_swarm::{NodeMesh, ByzantineFaultProof, SpatialMatrix};
use tokio::sync::mpsc;

pub struct SwarmCluster<const PEERS: usize> {
    node_id: [u8; 32],
    active_peers: NodeMesh<PEERS>,
    latency_matrix: SpatialMatrix,
}

impl<const PEERS: usize> SwarmCluster<PEERS> {
    pub async fn dispatch_neural_packet(&mut self, payload: &[u8]) -> Result<TelemetryProof> {
        // Sub-millisecond BFT verification across ring topology
        let route = self.latency_matrix.find_optimal_hop(self.node_id)?;
        let signature = ByzantineFaultProof::sign_edge_attestation(payload)?;
        
        let ack = self.active_peers
            .route_encrypted_stream(route, payload, signature)
            .await?;

        Ok(ack.emit_telemetry())
    }
}`
      },
      holo: {
        prompt: 'Construct 3D Spatial Holographic HUD interface with gyroscopic parallax',
        code: `// [SPATIAL ENGINE: HOLOGRAPHIC GYRO MATRIX]
import { Matrix4, Vector3, Quaternion } from 'three';

export class HolographicHUD {
  constructor(viewport) {
    this.viewport = viewport;
    this.projection = new Matrix4();
    this.gyroVector = new Vector3();
  }

  updateOrientation(alpha, beta, gamma) {
    // Gyroscopic tilt dampening
    const radBeta = (beta * Math.PI) / 180;
    const radGamma = (gamma * Math.PI) / 180;
    
    this.gyroVector.set(
      Math.sin(radGamma) * 12.0,
      Math.sin(radBeta) * 8.0,
      0
    );

    this.viewport.style.transform = 
      \`perspective(1000px) rotateX(\${-radBeta * 15}deg) rotateY(\${radGamma * 15}deg)\`;
  }
}`
      },
      zk: {
        prompt: 'Synthesize Zero-Knowledge Groth16 Verifier circuit in Circom',
        code: `// [CIRCOM: ZERO-KNOWLEDGE NEURAL ATTESTATION]
pragma circom 2.1.6;

template NeuralProof() {
    signal input modelHash;
    signal input privateWeights[4];
    signal input publicThreshold;
    signal output validAttestation;

    signal intermediateSum[4];
    intermediateSum[0] <== privateWeights[0] * privateWeights[1];
    intermediateSum[1] <== privateWeights[2] * privateWeights[3];
    intermediateSum[2] <== intermediateSum[0] + intermediateSum[1];
    
    // Constraint enforcement
    intermediateSum[2] === publicThreshold;
    validAttestation <== 1;
}

component main {public [modelHash, publicThreshold]} = NeuralProof();`
      }
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.startSimulationCanvas();
    // Load initial quantum preset
    this.loadPreset('quantum');
  }

  bindEvents() {
    // Preset buttons
    document.querySelectorAll('.preset-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const presetKey = pill.getAttribute('data-preset');
        if (presetKey && this.presets[presetKey]) {
          this.simMode = presetKey;
          this.loadPreset(presetKey);
          if (window.audioSynthesizer) window.audioSynthesizer.playHover();
        }
      });
    });

    // Run synthesis button
    if (this.runBtn) {
      this.runBtn.addEventListener('click', () => {
        this.executeSynthesis();
        if (window.audioSynthesizer) window.audioSynthesizer.playClick();
      });
    }

    // Input Enter key
    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.executeSynthesis();
        }
      });
    }

    // Copy code button
    const copyBtn = document.getElementById('btn-copy-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (this.terminalEl) {
          navigator.clipboard.writeText(this.terminalEl.innerText).then(() => {
            if (window.showToast) window.showToast('Synthesized code copied to clipboard!');
            if (window.audioSynthesizer) window.audioSynthesizer.playSuccess();
          });
        }
      });
    }
  }

  loadPreset(key) {
    const data = this.presets[key];
    if (!data) return;
    if (this.inputEl) this.inputEl.value = data.prompt;
    this.streamText(data.code);
  }

  executeSynthesis() {
    if (this.isStreaming) return;
    const prompt = this.inputEl ? this.inputEl.value.trim() : '';
    if (!prompt) return;

    // Check if prompt matches any preset or custom
    let targetCode = this.presets[this.simMode] ? this.presets[this.simMode].code : this.presets.quantum.code;
    this.streamText(targetCode);
  }

  streamText(fullText) {
    this.isStreaming = true;
    if (!this.terminalEl) return;

    this.terminalEl.innerHTML = '';
    let index = 0;
    const chunkSize = 4;
    const speed = 12;

    // Randomize telemetry
    this.randomizeTelemetry();

    const interval = setInterval(() => {
      if (index < fullText.length) {
        this.terminalEl.textContent += fullText.slice(index, index + chunkSize);
        index += chunkSize;
        this.terminalEl.scrollTop = this.terminalEl.scrollHeight;

        // Subtle typing audio ticks
        if (Math.random() > 0.7 && window.audioSynthesizer) {
          window.audioSynthesizer.playHover();
        }
      } else {
        clearInterval(interval);
        this.isStreaming = false;
        if (window.audioSynthesizer) window.audioSynthesizer.playSuccess();
      }
    }, speed);
  }

  randomizeTelemetry() {
    if (this.statTokens) {
      const tokens = (Math.random() * 400 + 720).toFixed(1);
      this.statTokens.textContent = `${tokens} T/s`;
    }
    if (this.statLatency) {
      const lat = (Math.random() * 3.5 + 3.2).toFixed(1);
      this.statLatency.textContent = `${lat} ms`;
    }
    if (this.statGpu) {
      const gpu = Math.floor(Math.random() * 25 + 72);
      this.statGpu.textContent = `${gpu}%`;
    }
  }

  startSimulationCanvas() {
    if (!this.canvas || !this.ctx) return;

    const resize = () => {
      this.canvas.width = this.canvas.offsetWidth * (window.devicePixelRatio || 1);
      this.canvas.height = this.canvas.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const render = () => {
      t += 0.03;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);

      if (this.simMode === 'quantum' || this.simMode === 'holo') {
        // Dynamic sine wave resonance grid
        this.ctx.lineWidth = 1.5;
        for (let j = 0; j < 5; j++) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = j % 2 === 0 ? 'rgba(0, 240, 255, 0.7)' : 'rgba(138, 43, 226, 0.7)';
          for (let x = 0; x < w; x += 6) {
            const y = h / 2 + Math.sin(x * 0.015 + t + j * 0.8) * (30 + j * 10) * Math.cos(t * 0.5);
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
          }
          this.ctx.stroke();
        }
      } else {
        // Swarm node matrix visualization
        const nodes = 16;
        for (let i = 0; i < nodes; i++) {
          const angle = (i / nodes) * Math.PI * 2 + t * 0.4;
          const radius = (Math.min(w, h) * 0.3) + Math.sin(t * 2 + i) * 15;
          const nx = w / 2 + Math.cos(angle) * radius;
          const ny = h / 2 + Math.sin(angle) * radius;

          this.ctx.beginPath();
          this.ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          this.ctx.fillStyle = '#00f5a0';
          this.ctx.shadowColor = '#00f5a0';
          this.ctx.shadowBlur = 10;
          this.ctx.fill();

          // Connect to center & neighbor
          this.ctx.beginPath();
          this.ctx.moveTo(w / 2, h / 2);
          this.ctx.lineTo(nx, ny);
          this.ctx.strokeStyle = 'rgba(0, 245, 160, 0.15)';
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }
}

window.NeuralPlayground = NeuralPlayground;
