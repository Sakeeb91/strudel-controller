/**
 * Strudel Button Controller - Main Controller
 * Uses Web Audio API for reliable sound generation
 */

class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.filter = null;
    this.delayNode = null;
    this.delayGain = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.samples = {};
    this.isPlaying = false;
    this.currentPatterns = [];
    this.scheduler = null;
    this.nextNoteTime = 0;
    this.tempo = 120;
    this.scheduleAheadTime = 0.1;
    this.lookahead = 25;

    // Effect parameters
    this.params = {
      cutoff: 10000,
      resonance: 1,
      delayMix: 0,
      reverbMix: 0
    };
  }

  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create effect chain: sounds -> filter -> dry/wet split -> master

    // Master gain (output)
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.8;

    // Dry signal path
    this.dryGain = this.audioContext.createGain();
    this.dryGain.gain.value = 1;
    this.dryGain.connect(this.masterGain);

    // Filter
    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 10000;
    this.filter.Q.value = 1;
    this.filter.connect(this.dryGain);

    // Delay effect
    this.delayNode = this.audioContext.createDelay(1);
    this.delayNode.delayTime.value = 0.3;
    this.delayGain = this.audioContext.createGain();
    this.delayGain.gain.value = 0;
    this.delayFeedback = this.audioContext.createGain();
    this.delayFeedback.gain.value = 0.4;

    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayGain.connect(this.masterGain);

    // Reverb (convolver with generated impulse response)
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbGain = this.audioContext.createGain();
    this.reverbGain.gain.value = 0;

    // Generate simple reverb impulse response
    await this.createReverbImpulse();

    this.filter.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    // Load sounds
    await this.loadSamples();
    return true;
  }

  async createReverbImpulse() {
    const ctx = this.audioContext;
    const length = ctx.sampleRate * 2; // 2 second reverb
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.reverbNode.buffer = impulse;
  }

  setCutoff(value) {
    // value 0-127 -> frequency 100-10000 Hz (exponential)
    const freq = 100 * Math.pow(100, value / 127);
    this.params.cutoff = Math.min(freq, 10000);
    if (this.filter) {
      this.filter.frequency.value = this.params.cutoff;
    }
  }

  setResonance(value) {
    // value 0-127 -> Q 0.5-20
    this.params.resonance = 0.5 + (value / 127) * 19.5;
    if (this.filter) {
      this.filter.Q.value = this.params.resonance;
    }
  }

  setDelayMix(value) {
    // value 0-127 -> mix 0-0.7
    this.params.delayMix = (value / 127) * 0.7;
    if (this.delayGain) {
      this.delayGain.gain.value = this.params.delayMix;
    }
  }

  setReverbMix(value) {
    // value 0-127 -> mix 0-0.8
    this.params.reverbMix = (value / 127) * 0.8;
    if (this.reverbGain) {
      this.reverbGain.gain.value = this.params.reverbMix;
    }
  }

  async loadSamples() {
    // Create synthetic drum sounds using oscillators
    this.samples = {
      bd: () => this.playKick(),
      sd: () => this.playSnare(),
      hh: () => this.playHihat(),
      oh: () => this.playOpenHat(),
      cp: () => this.playClap(),
      bass: (freq = 55) => this.playBass(freq),
      lead: (freq = 440) => this.playLead(freq)
    };
  }

  playKick(time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    // Kick oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.filter); // Route through effects

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playSnare(time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    // Noise for snare
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.filter); // Route through effects

    // Tone body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.filter); // Route through effects

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playHihat(time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000;

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.filter); // Route through effects

    noise.start(now);
  }

  playOpenHat(time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 6000;

    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.filter); // Route through effects

    noise.start(now);
  }

  playClap(time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    // Multiple bursts for clap
    for (let i = 0; i < 3; i++) {
      const bufferSize = ctx.sampleRate * 0.02;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      const startTime = now + i * 0.01;
      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1500;
      bandpass.Q.value = 0.5;

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.filter); // Route through effects

      noise.start(startTime);
    }
  }

  playBass(freq = 55, time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lowpass = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, now);
    lowpass.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.filter); // Route through effects

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playLead(freq = 440, time = 0) {
    const ctx = this.audioContext;
    const now = time || ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.filter); // Route through effects

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Pattern scheduling
  startPattern(pattern) {
    if (!this.audioContext) return;

    // Parse simple pattern notation like "bd sd bd sd"
    const steps = this.parsePattern(pattern);
    if (steps.length === 0) return;

    this.currentPatterns.push({ steps, currentStep: 0, pattern });

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.nextNoteTime = this.audioContext.currentTime;
      this.schedule();
    }
  }

  parsePattern(pattern) {
    // Simple pattern parsing: "bd sd bd sd" or "bd*4"
    const parts = pattern.trim().split(/\s+/);
    const steps = [];

    for (const part of parts) {
      if (part.includes('*')) {
        const [sound, count] = part.split('*');
        for (let i = 0; i < parseInt(count); i++) {
          steps.push(sound);
        }
      } else if (part === '~') {
        steps.push(null); // Rest
      } else {
        steps.push(part);
      }
    }

    return steps;
  }

  schedule() {
    if (!this.isPlaying) return;

    const secondsPerBeat = 60 / this.tempo;
    const secondsPerStep = secondsPerBeat / 4; // 16th notes

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      // Play all active patterns
      for (const p of this.currentPatterns) {
        const sound = p.steps[p.currentStep];
        if (sound && this.samples[sound]) {
          this.samples[sound](this.nextNoteTime);
        }
        p.currentStep = (p.currentStep + 1) % p.steps.length;
      }

      this.nextNoteTime += secondsPerStep;
    }

    this.scheduler = setTimeout(() => this.schedule(), this.lookahead);
  }

  stop() {
    this.isPlaying = false;
    this.currentPatterns = [];
    if (this.scheduler) {
      clearTimeout(this.scheduler);
      this.scheduler = null;
    }
  }

  setTempo(bpm) {
    this.tempo = bpm;
  }

  setMasterVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = value;
    }
  }
}

class StrudelController {
  constructor() {
    this.soundEngine = new SoundEngine();
    this.isPlaying = false;
    this.currentBank = 0;
    this.activePatterns = new Set();
    this.mutedTracks = new Set();
    this.audioInitialized = false;

    this.params = {
      tempo: 120,
      masterVolume: 0.8
    };

    this.init();
  }

  async init() {
    this.loadArrangement();
    this.bindElements();
    this.bindEvents();
    this.renderButtonGrid();
    this.renderMuteButtons();
    this.log('Strudel Controller initialized', 'success');
    this.log('Click Play or any pattern button to start', 'info');
  }

  bindElements() {
    this.playBtn = document.getElementById('play-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.panicBtn = document.getElementById('panic-btn');
    this.tempoSlider = document.getElementById('tempo');
    this.tempoDisplay = document.getElementById('tempo-display');
    this.masterVolSlider = document.getElementById('master-vol');
    this.codeEditor = document.getElementById('code-editor');
    this.evalBtn = document.getElementById('eval-btn');
    this.clearBtn = document.getElementById('clear-btn');
    this.consoleOutput = document.getElementById('console-output');
    this.patternGrid = document.getElementById('pattern-grid');
    this.muteGrid = document.getElementById('mute-grid');
    this.bankButtons = document.querySelectorAll('.bank-btn');
    this.modal = document.getElementById('arrangement-modal');
    this.editGridBtn = document.getElementById('edit-grid-btn');
    this.closeModalBtn = document.getElementById('close-modal');
    this.saveArrangementBtn = document.getElementById('save-arrangement-btn');
    this.cancelArrangementBtn = document.getElementById('cancel-arrangement-btn');
    this.addButtonBtn = document.getElementById('add-button-btn');
    this.buttonConfigList = document.getElementById('button-config-list');
    this.previewGrid = document.getElementById('preview-grid');
  }

  bindEvents() {
    this.playBtn.addEventListener('click', () => this.play());
    this.stopBtn.addEventListener('click', () => this.stop());
    this.panicBtn.addEventListener('click', () => this.panic());

    this.tempoSlider.addEventListener('input', (e) => {
      this.params.tempo = parseInt(e.target.value);
      this.tempoDisplay.textContent = this.params.tempo;
      this.soundEngine.setTempo(this.params.tempo);
    });

    this.masterVolSlider.addEventListener('input', (e) => {
      this.params.masterVolume = parseInt(e.target.value) / 100;
      this.soundEngine.setMasterVolume(this.params.masterVolume);
    });

    this.evalBtn.addEventListener('click', () => this.evaluate());
    this.clearBtn.addEventListener('click', () => this.clearEditor());

    this.codeEditor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.evaluate();
      }
    });

    this.bankButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectBank(parseInt(e.target.dataset.bank));
      });
    });

    // Parameter controls
    this.paramCutoff = document.getElementById('param-cutoff');
    this.paramResonance = document.getElementById('param-resonance');
    this.paramDelay = document.getElementById('param-delay');
    this.paramReverb = document.getElementById('param-reverb');

    this.paramCutoff.addEventListener('input', (e) => {
      this.soundEngine.setCutoff(parseInt(e.target.value));
    });
    this.paramResonance.addEventListener('input', (e) => {
      this.soundEngine.setResonance(parseInt(e.target.value));
    });
    this.paramDelay.addEventListener('input', (e) => {
      this.soundEngine.setDelayMix(parseInt(e.target.value));
    });
    this.paramReverb.addEventListener('input', (e) => {
      this.soundEngine.setReverbMix(parseInt(e.target.value));
    });

    this.editGridBtn.addEventListener('click', () => this.openModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.cancelArrangementBtn.addEventListener('click', () => this.closeModal());
    this.saveArrangementBtn.addEventListener('click', () => this.saveArrangement());
    this.addButtonBtn.addEventListener('click', () => this.addButtonConfig());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
  }

  async initAudio() {
    if (this.audioInitialized) return;

    try {
      this.log('Initializing audio...', 'info');
      await this.soundEngine.init();
      this.audioInitialized = true;
      this.log('Audio ready!', 'success');
    } catch (err) {
      this.log(`Audio error: ${err.message}`, 'error');
    }
  }

  async play() {
    await this.initAudio();
    this.isPlaying = true;
    this.playBtn.classList.add('active');
    this.log('Playback started', 'success');
    await this.updateActivePatterns();
  }

  stop() {
    this.isPlaying = false;
    this.playBtn.classList.remove('active');
    this.soundEngine.stop();
    this.log('Playback stopped', 'info');
  }

  panic() {
    this.stop();
    this.activePatterns.clear();
    this.updateGridButtonStates();
    this.log('PANIC - All sounds stopped', 'error');
  }

  async evaluate() {
    const code = this.codeEditor.value.trim();
    if (!code) {
      this.log('No code to evaluate', 'error');
      return;
    }

    await this.initAudio();

    // Simple pattern parsing from code
    // Supports: bd sd hh, bd*4, etc.
    const patternMatch = code.match(/["']([^"']+)["']/);
    if (patternMatch) {
      this.soundEngine.stop();
      this.soundEngine.startPattern(patternMatch[1]);
      this.isPlaying = true;
      this.playBtn.classList.add('active');
      this.log('Pattern evaluated', 'success');
    } else {
      this.log('Could not parse pattern', 'error');
    }
  }

  renderButtonGrid() {
    const bank = PATTERN_BANKS[this.currentBank];
    this.patternGrid.innerHTML = '';

    bank.forEach((pattern, index) => {
      const btn = document.createElement('button');
      btn.className = 'grid-btn';
      btn.dataset.index = index;
      btn.dataset.id = pattern.id;
      if (pattern.color !== 'default') {
        btn.dataset.color = pattern.color;
      }

      if (this.activePatterns.has(pattern.id)) {
        btn.classList.add('active');
      }

      btn.innerHTML = `
        <span class="btn-number">${index + 1}</span>
        <span class="btn-label">${pattern.label}</span>
      `;

      btn.addEventListener('click', () => this.triggerPattern(pattern, btn));

      this.patternGrid.appendChild(btn);
    });
  }

  renderMuteButtons() {
    const muteButtons = this.muteGrid.querySelectorAll('.mute-btn');
    muteButtons.forEach(btn => {
      btn.addEventListener('click', () => this.toggleMute(btn));
    });
  }

  selectBank(bankIndex) {
    this.currentBank = bankIndex;
    this.bankButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.bank) === bankIndex);
    });
    this.renderButtonGrid();
    this.log(`Switched to Bank ${String.fromCharCode(65 + bankIndex)}`, 'info');
  }

  async triggerPattern(pattern, buttonElement) {
    await this.initAudio();

    const isActive = this.activePatterns.has(pattern.id);

    if (isActive) {
      this.activePatterns.delete(pattern.id);
      buttonElement.classList.remove('active', 'playing');
    } else {
      this.activePatterns.add(pattern.id);
      buttonElement.classList.add('active');
      buttonElement.classList.add('playing');
      setTimeout(() => buttonElement.classList.remove('playing'), 500);
    }

    await this.updateActivePatterns();
    this.log(`Pattern ${pattern.label}: ${isActive ? 'OFF' : 'ON'}`, 'info');
  }

  async updateActivePatterns() {
    this.soundEngine.stop();

    if (this.activePatterns.size === 0) {
      this.isPlaying = false;
      this.playBtn.classList.remove('active');
      return;
    }

    this.isPlaying = true;
    this.playBtn.classList.add('active');

    // Collect all active patterns and start them
    for (const bankPatterns of Object.values(PATTERN_BANKS)) {
      for (const pattern of bankPatterns) {
        if (this.activePatterns.has(pattern.id)) {
          // Extract simple pattern from code
          const simplePattern = this.extractSimplePattern(pattern.code);
          if (simplePattern) {
            this.soundEngine.startPattern(simplePattern);
          }
        }
      }
    }
  }

  extractSimplePattern(code) {
    // Extract pattern from Strudel-like code
    // s("bd sd bd sd") -> "bd sd bd sd"
    const match = code.match(/s\(["']([^"']+)["']\)/);
    if (match) return match[1];

    // Just the pattern string
    const simple = code.match(/["']([^"']+)["']/);
    if (simple) return simple[1];

    return null;
  }

  toggleMute(buttonElement) {
    const track = buttonElement.dataset.track;
    const isMuted = this.mutedTracks.has(track);

    if (isMuted) {
      this.mutedTracks.delete(track);
      buttonElement.classList.remove('muted');
    } else {
      this.mutedTracks.add(track);
      buttonElement.classList.add('muted');
    }

    this.log(`Track ${track}: ${isMuted ? 'UNMUTED' : 'MUTED'}`, 'info');
  }

  updateGridButtonStates() {
    const buttons = this.patternGrid.querySelectorAll('.grid-btn');
    buttons.forEach(btn => {
      const patternId = btn.dataset.id;
      btn.classList.toggle('active', this.activePatterns.has(patternId));
    });
  }

  clearEditor() {
    this.codeEditor.value = '';
    this.log('Editor cleared', 'info');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    this.consoleOutput.appendChild(logEntry);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  // Modal
  openModal() {
    this.modal.classList.add('open');
    this.renderButtonConfigs();
    this.renderPreviewGrid();
  }

  closeModal() {
    this.modal.classList.remove('open');
  }

  renderButtonConfigs() {
    this.buttonConfigList.innerHTML = '';
    const currentBank = PATTERN_BANKS[this.currentBank];
    currentBank.forEach((pattern, index) => {
      const configItem = this.createButtonConfigItem(pattern, index);
      this.buttonConfigList.appendChild(configItem);
    });
  }

  createButtonConfigItem(pattern, index) {
    const item = document.createElement('div');
    item.className = 'button-config-item';
    item.dataset.index = index;

    const colors = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

    item.innerHTML = `
      <input type="text" value="${pattern.label}" placeholder="Label" class="config-label">
      <select class="config-color">
        ${colors.map(c => `<option value="${c}" ${pattern.color === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <button class="remove-btn" data-index="${index}">×</button>
    `;

    item.querySelector('.remove-btn').addEventListener('click', () => {
      item.remove();
      this.renderPreviewGrid();
    });

    item.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('change', () => this.renderPreviewGrid());
    });

    return item;
  }

  addButtonConfig() {
    const newPattern = {
      id: `custom-${Date.now()}`,
      label: 'New',
      color: 'default',
      code: 's("bd")',
      type: 'custom'
    };

    const index = this.buttonConfigList.children.length;
    const configItem = this.createButtonConfigItem(newPattern, index);
    this.buttonConfigList.appendChild(configItem);
    this.renderPreviewGrid();
  }

  renderPreviewGrid() {
    this.previewGrid.innerHTML = '';
    const items = this.buttonConfigList.querySelectorAll('.button-config-item');

    items.forEach((item) => {
      const label = item.querySelector('.config-label').value;
      const color = item.querySelector('.config-color').value;

      const previewBtn = document.createElement('div');
      previewBtn.className = 'preview-btn';
      if (color !== 'default') {
        previewBtn.style.background = this.getColorValue(color);
      }
      previewBtn.textContent = label.substring(0, 4);
      this.previewGrid.appendChild(previewBtn);
    });

    const remaining = 16 - items.length;
    for (let i = 0; i < remaining; i++) {
      const emptyBtn = document.createElement('div');
      emptyBtn.className = 'preview-btn';
      emptyBtn.textContent = '—';
      this.previewGrid.appendChild(emptyBtn);
    }
  }

  getColorValue(colorName) {
    const colors = {
      red: '#c0392b',
      orange: '#d35400',
      yellow: '#f39c12',
      green: '#27ae60',
      blue: '#2980b9',
      purple: '#8e44ad'
    };
    return colors[colorName] || '#2a2a4a';
  }

  saveArrangement() {
    const items = this.buttonConfigList.querySelectorAll('.button-config-item');
    const arrangement = [];

    items.forEach((item, index) => {
      const originalPattern = PATTERN_BANKS[this.currentBank][index] || {};
      arrangement.push({
        ...originalPattern,
        label: item.querySelector('.config-label').value,
        color: item.querySelector('.config-color').value
      });
    });

    const key = `strudel-arrangement-bank-${this.currentBank}`;
    localStorage.setItem(key, JSON.stringify(arrangement));

    PATTERN_BANKS[this.currentBank] = arrangement;
    this.renderButtonGrid();
    this.closeModal();
    this.log('Arrangement saved', 'success');
  }

  loadArrangement() {
    for (let bank = 0; bank < 4; bank++) {
      const key = `strudel-arrangement-bank-${bank}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          PATTERN_BANKS[bank] = JSON.parse(saved);
        } catch (e) {
          // Keep default
        }
      }
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.strudelController = new StrudelController();
});
