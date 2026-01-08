/**
 * Strudel Button Controller - Pattern Definitions
 *
 * Each bank contains 16 patterns (4x4 grid)
 * Patterns can be drums, bass, leads, or full arrangements
 */

const PATTERN_BANKS = {
  // Bank A - Drums
  0: [
    {
      id: 'kick-basic',
      label: 'Kick',
      color: 'red',
      code: `$: s("bd").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'kick-four',
      label: '4/4 Kick',
      color: 'red',
      code: `$: s("bd*4").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'snare-basic',
      label: 'Snare',
      color: 'orange',
      code: `$: s("~ sd").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'snare-offbeat',
      label: 'Snare Off',
      color: 'orange',
      code: `$: s("~ sd ~ sd:2").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'hihat-closed',
      label: 'HH Closed',
      color: 'yellow',
      code: `$: s("hh*8").bank("RolandTR808").gain(0.6)`,
      type: 'drums'
    },
    {
      id: 'hihat-open',
      label: 'HH Open',
      color: 'yellow',
      code: `$: s("~ ~ oh ~").bank("RolandTR808").gain(0.5)`,
      type: 'drums'
    },
    {
      id: 'hihat-pattern',
      label: 'HH Pattern',
      color: 'yellow',
      code: `$: s("hh*4 [hh hh hh] hh*4 oh").bank("RolandTR808").gain(0.6)`,
      type: 'drums'
    },
    {
      id: 'clap',
      label: 'Clap',
      color: 'orange',
      code: `$: s("~ cp").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'perc-conga',
      label: 'Conga',
      color: 'green',
      code: `$: s("~ [lt mt] ~ ht").bank("RolandTR808").gain(0.7)`,
      type: 'drums'
    },
    {
      id: 'perc-rim',
      label: 'Rim',
      color: 'green',
      code: `$: s("rim:0 ~ rim:1 ~").bank("RolandTR808").gain(0.5)`,
      type: 'drums'
    },
    {
      id: 'full-beat-1',
      label: 'Beat 1',
      color: 'purple',
      code: `$: s("bd sd:2 bd [sd:2 bd]").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'full-beat-2',
      label: 'Beat 2',
      color: 'purple',
      code: `$: s("[bd bd] sd bd [sd sd:3]").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'full-beat-3',
      label: 'Break',
      color: 'purple',
      code: `$: s("bd ~ [~ bd] sd bd [bd bd] ~ [sd bd]").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'fill-1',
      label: 'Fill 1',
      color: 'blue',
      code: `$: s("bd sd*2 bd*2 sd*4").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'fill-2',
      label: 'Fill 2',
      color: 'blue',
      code: `$: s("bd [sd sd sd] [bd bd] [sd sd sd sd]").bank("RolandTR808")`,
      type: 'drums'
    },
    {
      id: 'silence',
      label: 'Silence',
      color: 'default',
      code: `$: silence`,
      type: 'control'
    }
  ],

  // Bank B - Bass
  1: [
    {
      id: 'bass-root',
      label: 'Root',
      color: 'blue',
      code: `$: note("c2").s("sawtooth").lpf(400).lpenv(4).decay(0.2)`,
      type: 'bass'
    },
    {
      id: 'bass-octave',
      label: 'Octave',
      color: 'blue',
      code: `$: note("c2 c3").s("sawtooth").lpf(500).lpenv(4).decay(0.2)`,
      type: 'bass'
    },
    {
      id: 'bass-fifth',
      label: 'Fifth',
      color: 'blue',
      code: `$: note("c2 g2").s("sawtooth").lpf(500).lpenv(4).decay(0.2)`,
      type: 'bass'
    },
    {
      id: 'bass-arp',
      label: 'Arp',
      color: 'purple',
      code: `$: note("c2 e2 g2 e2").s("sawtooth").lpf(600).lpenv(3)`,
      type: 'bass'
    },
    {
      id: 'bass-sub',
      label: 'Sub',
      color: 'blue',
      code: `$: note("c1").s("sine").gain(1.2)`,
      type: 'bass'
    },
    {
      id: 'bass-wobble',
      label: 'Wobble',
      color: 'purple',
      code: `$: note("c2").s("sawtooth").lpf(sine.range(200, 2000).slow(2))`,
      type: 'bass'
    },
    {
      id: 'bass-stab',
      label: 'Stab',
      color: 'green',
      code: `$: note("c2 ~ ~ c2 ~ c2 ~ ~").s("square").lpf(800).decay(0.1)`,
      type: 'bass'
    },
    {
      id: 'bass-slide',
      label: 'Slide',
      color: 'green',
      code: `$: note("c2 [d2 e2]").s("sawtooth").lpf(600).glide(0.5)`,
      type: 'bass'
    },
    {
      id: 'bass-minor',
      label: 'Minor',
      color: 'orange',
      code: `$: note("a1 c2 e2 c2").s("sawtooth").lpf(500)`,
      type: 'bass'
    },
    {
      id: 'bass-major',
      label: 'Major',
      color: 'orange',
      code: `$: note("c2 e2 g2 e2").s("sawtooth").lpf(500)`,
      type: 'bass'
    },
    {
      id: 'bass-acid',
      label: 'Acid',
      color: 'yellow',
      code: `$: note("c2 c2 c3 c2").s("sawtooth").lpf(sine.range(300, 3000).fast(2)).resonance(15)`,
      type: 'bass'
    },
    {
      id: 'bass-deep',
      label: 'Deep',
      color: 'blue',
      code: `$: note("c1 ~ c1 ~").s("triangle").lpf(200).gain(1.3)`,
      type: 'bass'
    },
    {
      id: 'bass-rhythm-1',
      label: 'Rhythm 1',
      color: 'red',
      code: `$: note("c2 ~ c2 c2 ~ c2 c2 ~").s("sawtooth").lpf(600)`,
      type: 'bass'
    },
    {
      id: 'bass-rhythm-2',
      label: 'Rhythm 2',
      color: 'red',
      code: `$: note("[c2 c2] ~ c2 ~ [c2 c2] c2 ~ c2").s("sawtooth").lpf(700)`,
      type: 'bass'
    },
    {
      id: 'bass-drop',
      label: 'Drop',
      color: 'purple',
      code: `$: note("c3 c2 c1").slow(2).s("sawtooth").lpf(1000).lpenv(8)`,
      type: 'bass'
    },
    {
      id: 'bass-silence',
      label: 'Silence',
      color: 'default',
      code: `$: silence`,
      type: 'control'
    }
  ],

  // Bank C - Leads & Melody
  2: [
    {
      id: 'lead-saw',
      label: 'Saw Lead',
      color: 'yellow',
      code: `$: note("c4 e4 g4 e4").s("sawtooth").lpf(2000).gain(0.5)`,
      type: 'lead'
    },
    {
      id: 'lead-square',
      label: 'Square',
      color: 'yellow',
      code: `$: note("c4 e4 g4 b4").s("square").lpf(1500).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'lead-pad',
      label: 'Pad',
      color: 'purple',
      code: `$: note("<c4 e4 g4>").s("sawtooth").lpf(800).attack(0.3).release(1).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'lead-pluck',
      label: 'Pluck',
      color: 'green',
      code: `$: note("c5 e5 g5 c6").s("triangle").decay(0.2).lpf(3000).gain(0.5)`,
      type: 'lead'
    },
    {
      id: 'chord-major',
      label: 'Maj Chord',
      color: 'blue',
      code: `$: note("<[c4,e4,g4]>").s("sawtooth").lpf(1200).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'chord-minor',
      label: 'Min Chord',
      color: 'blue',
      code: `$: note("<[a3,c4,e4]>").s("sawtooth").lpf(1200).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'chord-prog',
      label: 'Prog',
      color: 'purple',
      code: `$: note("<[c4,e4,g4] [a3,c4,e4] [f3,a3,c4] [g3,b3,d4]>").s("sawtooth").lpf(1000).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'arp-up',
      label: 'Arp Up',
      color: 'orange',
      code: `$: note("c4 e4 g4 c5 e5 g5 c6 g5").fast(2).s("triangle").lpf(2000).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'arp-down',
      label: 'Arp Down',
      color: 'orange',
      code: `$: note("c6 g5 e5 c5 g4 e4 c4 e4").fast(2).s("triangle").lpf(2000).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'arp-rand',
      label: 'Arp Rand',
      color: 'orange',
      code: `$: note("c4 e4 g4 c5".shuffle()).fast(2).s("triangle").lpf(2500).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'melody-1',
      label: 'Melody 1',
      color: 'red',
      code: `$: note("c4 d4 e4 g4 e4 d4 c4 ~").s("triangle").lpf(2000).gain(0.5)`,
      type: 'lead'
    },
    {
      id: 'melody-2',
      label: 'Melody 2',
      color: 'red',
      code: `$: note("e4 ~ g4 a4 g4 ~ e4 d4").s("triangle").lpf(2000).gain(0.5)`,
      type: 'lead'
    },
    {
      id: 'stab-high',
      label: 'Stab',
      color: 'green',
      code: `$: note("[c5,e5,g5] ~ ~ [c5,e5,g5] ~ ~ ~ ~").s("square").lpf(3000).decay(0.05).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'string-pad',
      label: 'Strings',
      color: 'purple',
      code: `$: note("<[c3,g3,c4,e4] [a2,e3,a3,c4]>").s("sawtooth").lpf(600).attack(0.5).release(2).gain(0.3)`,
      type: 'lead'
    },
    {
      id: 'bell',
      label: 'Bell',
      color: 'yellow',
      code: `$: note("c5 ~ e5 ~ g5 ~ c6 ~").s("sine").fm(2).fmh(3).decay(0.5).gain(0.4)`,
      type: 'lead'
    },
    {
      id: 'lead-silence',
      label: 'Silence',
      color: 'default',
      code: `$: silence`,
      type: 'control'
    }
  ],

  // Bank D - FX & Full Patterns
  3: [
    {
      id: 'fx-noise',
      label: 'Noise',
      color: 'red',
      code: `$: s("noise").lpf(sine.range(200, 4000).slow(4)).gain(0.3)`,
      type: 'fx'
    },
    {
      id: 'fx-sweep',
      label: 'Sweep',
      color: 'red',
      code: `$: s("noise").lpf(sine.range(100, 8000).slow(8)).hpf(sine.range(100, 2000).slow(8)).gain(0.2)`,
      type: 'fx'
    },
    {
      id: 'fx-riser',
      label: 'Riser',
      color: 'orange',
      code: `$: note("c2").s("sawtooth").lpf(perlin.range(200, 4000)).gain(0.4)`,
      type: 'fx'
    },
    {
      id: 'fx-impact',
      label: 'Impact',
      color: 'orange',
      code: `$: s("~ ~ ~ bd:5").bank("RolandTR909").gain(1.5).lpf(200)`,
      type: 'fx'
    },
    {
      id: 'full-house',
      label: 'House',
      color: 'purple',
      code: `stack(
  s("bd*4").bank("RolandTR909"),
  s("~ cp").bank("RolandTR909"),
  s("hh*8").bank("RolandTR909").gain(0.4),
  note("c2 c2 c2 c3").s("sawtooth").lpf(400)
)`,
      type: 'full'
    },
    {
      id: 'full-techno',
      label: 'Techno',
      color: 'purple',
      code: `stack(
  s("bd*4").bank("RolandTR909"),
  s("~ ~ oh ~").bank("RolandTR909").gain(0.5),
  s("hh*16").bank("RolandTR909").gain(0.3),
  note("c1").s("sawtooth").lpf(sine.range(200, 800).slow(4))
)`,
      type: 'full'
    },
    {
      id: 'full-dnb',
      label: 'DnB',
      color: 'purple',
      code: `stack(
  s("bd ~ [~ bd] sd bd ~ ~ sd").fast(2).bank("RolandTR808"),
  s("hh*8").fast(2).bank("RolandTR808").gain(0.4),
  note("c2 ~ c2 ~ c2 c2 ~ ~").s("sawtooth").lpf(600)
)`,
      type: 'full'
    },
    {
      id: 'full-ambient',
      label: 'Ambient',
      color: 'blue',
      code: `stack(
  note("<[c4,e4,g4] [a3,c4,e4]>").s("sine").attack(1).release(2).gain(0.3).delay(0.5),
  note("c2").s("sine").gain(0.4).slow(2)
)`,
      type: 'full'
    },
    {
      id: 'fx-glitch-1',
      label: 'Glitch 1',
      color: 'green',
      code: `$: s("bd sd hh cp").bank("RolandTR808").chop(8).rev()`,
      type: 'fx'
    },
    {
      id: 'fx-glitch-2',
      label: 'Glitch 2',
      color: 'green',
      code: `$: s("bd sd hh cp").bank("RolandTR808").chop(16).hurry(2)`,
      type: 'fx'
    },
    {
      id: 'fx-stutter',
      label: 'Stutter',
      color: 'yellow',
      code: `$: s("bd").bank("RolandTR808").stut(8, 0.5, 0.1)`,
      type: 'fx'
    },
    {
      id: 'fx-reverse',
      label: 'Reverse',
      color: 'yellow',
      code: `$: s("bd sd bd sd").bank("RolandTR808").rev()`,
      type: 'fx'
    },
    {
      id: 'fx-delay',
      label: 'Delay FX',
      color: 'blue',
      code: `$: s("cp").bank("RolandTR808").delay(0.75).delayfb(0.6).delayt(0.25)`,
      type: 'fx'
    },
    {
      id: 'fx-reverb',
      label: 'Reverb FX',
      color: 'blue',
      code: `$: s("sd:3").bank("RolandTR808").room(0.9).size(0.9)`,
      type: 'fx'
    },
    {
      id: 'stop-all',
      label: 'STOP ALL',
      color: 'red',
      code: `hush()`,
      type: 'control'
    },
    {
      id: 'silence',
      label: 'Silence',
      color: 'default',
      code: `$: silence`,
      type: 'control'
    }
  ]
};

// Default button configurations for custom arrangements
const DEFAULT_BUTTON_CONFIG = {
  gridSize: 16,
  buttons: []
};

// Export for use in controller.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PATTERN_BANKS, DEFAULT_BUTTON_CONFIG };
}
