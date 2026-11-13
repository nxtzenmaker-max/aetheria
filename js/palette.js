/**
 * AETHERIA // Command Palette (Cmd+K / Ctrl+K) & Navigation Controller
 */

class CommandPalette {
  constructor() {
    this.backdrop = document.getElementById('cmd-palette-backdrop');
    this.input = document.getElementById('cmd-search-input');
    this.list = document.getElementById('cmd-list');
    this.openBtn = document.getElementById('btn-cmd-palette');
    this.isOpen = false;
    this.selectedIndex = 0;

    this.commands = [
      { id: 'jump-hero', title: 'Navigate: Overview (Hero)', icon: '🚀', action: () => this.scrollTo('#hero') },
      { id: 'jump-bento', title: 'Navigate: System Capabilities (Bento)', icon: '⚡', action: () => this.scrollTo('#capabilities') },
      { id: 'jump-studio', title: 'Navigate: Neural AI Studio', icon: '🧠', action: () => this.scrollTo('#studio') },
      { id: 'jump-works', title: 'Navigate: Featured Works & Case Studies', icon: '💎', action: () => this.scrollTo('#works') },
      { id: 'jump-skills', title: 'Navigate: Skills & Tech Radar', icon: '📊', action: () => this.scrollTo('#skills') },
      { id: 'jump-contact', title: 'Navigate: Start a Project (Commission)', icon: '✉️', action: () => this.scrollTo('#contact') },
      
      { id: 'theme-prism', title: 'Theme: Cyber Prism (Obsidian Cyan)', icon: '🌌', action: () => this.setTheme('prism') },
      { id: 'theme-solar', title: 'Theme: Solar Flare (Amber Gold)', icon: '☀️', action: () => this.setTheme('solar') },
      { id: 'theme-matrix', title: 'Theme: Emerald Matrix (Mint Green)', icon: '🟢', action: () => this.setTheme('matrix') },
      { id: 'theme-nebula', title: 'Theme: Nebula Dream (Cosmic Violet)', icon: '🔮', action: () => this.setTheme('nebula') },

      { id: 'toggle-audio', title: 'Audio: Toggle Sound Effects', icon: '🔊', action: () => this.toggleAudio() },
      { id: 'toggle-drone', title: 'Audio: Toggle Ambient Drone Synthesizer', icon: '🎶', action: () => this.toggleDrone() },
      { id: 'fire-confetti', title: 'Surprise: Launch Quantum Confetti Burst', icon: '🎉', action: () => this.launchConfetti() },
      { id: 'copy-link', title: 'Share: Copy Showcase URL to Clipboard', icon: '🔗', action: () => this.copyUrl() }
    ];

    this.filteredCommands = [...this.commands];
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderList();
  }

  bindEvents() {
    // Open on button click
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    // Keyboard shortcut (Cmd+K or Ctrl+K)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      } else if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
          this.renderList();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
          this.renderList();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        }
      }
    });

    // Close on clicking backdrop outside palette
    if (this.backdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    // Search filter input
    if (this.input) {
      this.input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.filteredCommands = this.commands.filter(cmd => 
          cmd.title.toLowerCase().includes(query)
        );
        this.selectedIndex = 0;
        this.renderList();
      });
    }
  }

  open() {
    this.isOpen = true;
    if (this.backdrop) this.backdrop.classList.add('open');
    if (this.input) {
      this.input.value = '';
      this.filteredCommands = [...this.commands];
      this.selectedIndex = 0;
      this.renderList();
      setTimeout(() => this.input.focus(), 50);
    }
    if (window.audioSynthesizer) window.audioSynthesizer.playHover();
  }

  close() {
    this.isOpen = false;
    if (this.backdrop) this.backdrop.classList.remove('open');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  renderList() {
    if (!this.list) return;
    this.list.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      this.list.innerHTML = `<li style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No matching commands found.</li>`;
      return;
    }

    this.filteredCommands.forEach((cmd, idx) => {
      const li = document.createElement('li');
      li.className = `cmd-item ${idx === this.selectedIndex ? 'active' : ''}`;
      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.15rem;">${cmd.icon}</span>
          <span>${cmd.title}</span>
        </div>
        <span class="cmd-item-shortcut">↵</span>
      `;

      li.addEventListener('mouseenter', () => {
        this.selectedIndex = idx;
        this.renderList();
      });

      li.addEventListener('click', () => {
        this.execute(cmd);
      });

      this.list.appendChild(li);
    });

    const activeEl = this.list.children[this.selectedIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  executeSelected() {
    if (this.filteredCommands[this.selectedIndex]) {
      this.execute(this.filteredCommands[this.selectedIndex]);
    }
  }

  execute(cmd) {
    this.close();
    if (window.audioSynthesizer) window.audioSynthesizer.playClick();
    cmd.action();
  }

  scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  setTheme(themeName) {
    if (window.setAppTheme) {
      window.setAppTheme(themeName);
    }
  }

  toggleAudio() {
    if (window.audioSynthesizer) {
      const active = window.audioSynthesizer.toggleMute();
      if (window.showToast) window.showToast(active ? '🔊 Sound effects enabled' : '🔇 Sound effects muted');
    }
  }

  toggleDrone() {
    if (window.audioSynthesizer) {
      const isPlaying = window.audioSynthesizer.toggleAmbientDrone();
      if (window.showToast) window.showToast(isPlaying ? '🎶 Ambient synth drone active' : '⏹️ Ambient drone stopped');
    }
  }

  launchConfetti() {
    if (window.triggerConfetti) {
      window.triggerConfetti();
      if (window.showToast) window.showToast('✨ Quantum fireworks deployed!');
    }
  }

  copyUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (window.showToast) window.showToast('📋 Link copied to clipboard!');
      if (window.audioSynthesizer) window.audioSynthesizer.playSuccess();
    });
  }
}

window.CommandPalette = CommandPalette;
