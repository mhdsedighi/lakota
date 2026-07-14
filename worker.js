export default {
	async fetch(request, env, ctx) {
		const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lakota Flute Simulator</title>
<style>
	body {
		background: linear-gradient(135deg, #2c1e16 0%, #4a2c17 100%);
		color: #e8d5c4;
		font-family: 'Georgia', serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		margin: 0;
		overflow: hidden;
	}
	h1 { font-size: 2.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); margin-bottom: 10px; color: #d4a373; }
	.instructions { margin-bottom: 30px; font-size: 1.1rem; opacity: 0.8; }
	.keyboard { display: flex; gap: 10px; perspective: 1000px; }
	.key {
		width: 70px; height: 100px;
		background: linear-gradient(180deg, #8b5a2b 0%, #5c3a21 100%);
		border: 2px solid #3e2312; border-radius: 12px;
		display: flex; flex-direction: column; align-items: center; justify-content: center;
		font-size: 1.5rem; font-weight: bold; color: #f4e4d4;
		box-shadow: 0 8px 0 #3e2312, 0 12px 10px rgba(0,0,0,0.4);
		transition: all 0.1s ease; user-select: none;
	}
	.key span { font-size: 0.8rem; opacity: 0.7; margin-top: 5px; }
	.key.active {
		transform: translateY(8px);
		box-shadow: 0 0px 0 #3e2312, 0 4px 5px rgba(0,0,0,0.4);
		background: linear-gradient(180deg, #a67c52 0%, #8b5a2b 100%);
		color: #fff;
	}
	.flute-visual {
		margin-top: 40px; width: 600px; height: 40px;
		background: linear-gradient(90deg, #4a2c17, #8b5a2b, #4a2c17);
		border-radius: 20px; display: flex; justify-content: space-around; align-items: center;
		box-shadow: inset 0 -5px 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.5);
	}
	.hole {
		width: 20px; height: 20px; background: #1a0f08; border-radius: 50%;
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.8); transition: background 0.2s;
	}
	.hole.active { background: #d4a373; box-shadow: 0 0 15px #d4a373, inset 0 2px 4px rgba(0,0,0,0.8); }
</style>
</head>
<body>

<h1>🪶 Lakota Flute 🪶</h1>
<p class="instructions">Click anywhere or press a key to begin. Use your keyboard to play.</p>

<div class="keyboard" id="keyboard"></div>
<div class="flute-visual" id="fluteVisual"></div>

<script>
	const NOTES = [
		{ key: 'a', note: 'A3', freq: 220.00 },
		{ key: 's', note: 'C4', freq: 261.63 },
		{ key: 'd', note: 'D4', freq: 293.66 },
		{ key: 'f', note: 'E4', freq: 329.63 },
		{ key: 'g', note: 'G4', freq: 392.00 },
		{ key: 'h', note: 'A4', freq: 440.00 },
		{ key: 'j', note: 'C5', freq: 523.25 },
		{ key: 'k', note: 'D5', freq: 587.33 },
		{ key: 'l', note: 'E5', freq: 659.25 },
		{ key: ';', note: 'G5', freq: 783.99 }
	];

	const keyboardEl = document.getElementById('keyboard');
	const fluteVisualEl = document.getElementById('fluteVisual');
	
	NOTES.forEach((n) => {
		const keyEl = document.createElement('div');
		keyEl.className = 'key';
		keyEl.id = 'key-' + n.key;
		keyEl.innerHTML = n.note + '<span>' + n.key.toUpperCase() + '</span>';
		keyboardEl.appendChild(keyEl);

		const holeEl = document.createElement('div');
		holeEl.className = 'hole';
		holeEl.id = 'hole-' + n.key;
		fluteVisualEl.appendChild(holeEl);
	});

	let audioCtx;
	let masterGain;
	const activeNotes = {};

	// Pre-create a noise buffer that loops cleanly (no click at loop point)
	let noiseBuffer;

	function initAudio() {
		if (audioCtx) return;
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		
		masterGain = audioCtx.createGain();
		masterGain.gain.value = 0.7;
		
		// Gentle compressor to prevent clipping when playing chords
		const compressor = audioCtx.createDynamicsCompressor();
		compressor.threshold.value = -18;
		compressor.knee.value = 20;
		compressor.ratio.value = 6;
		compressor.attack.value = 0.01;
		compressor.release.value = 0.3;
		
		masterGain.connect(compressor);
		compressor.connect(audioCtx.destination);

		// Create smooth looping noise buffer once
		const bufferSize = audioCtx.sampleRate * 2;
		noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const data = noiseBuffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		// Crossfade at loop boundary to eliminate click
		const xfade = Math.floor(bufferSize * 0.05);
		for (let i = 0; i < xfade; i++) {
			const fade = i / xfade;
			const idx = bufferSize - xfade + i;
			data[idx] = data[idx] * (1 - fade) + data[i] * fade;
		}
	}

	function playNote(freq, key) {
		if (activeNotes[key]) return;
		initAudio();
		if (audioCtx.state === 'suspended') audioCtx.resume();

		const now = audioCtx.currentTime;
		const attackTime = 0.15;
		const decayTime = 0.25;
		const sustainLevel = 0.3;

		// === Main oscillator ===
		const osc = audioCtx.createOscillator();
		osc.type = 'sine';
		// Woodwind "bite" - slight pitch bend up
		osc.frequency.setValueAtTime(freq * 0.98, now);
		osc.frequency.exponentialRampToValueAtTime(freq, now + 0.1);

		const oscGain = audioCtx.createGain();
		// IMPORTANT: start at tiny value (not 0) so exponential curves work
		oscGain.gain.setValueAtTime(0.0001, now);
		// Linear ramp up for attack (works from any value including near-zero)
		oscGain.gain.linearRampToValueAtTime(0.5, now + attackTime);
		// Exponential decay to sustain (must not go to 0)
		oscGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);

		// === Breath noise ===
		const whiteNoise = audioCtx.createBufferSource();
		whiteNoise.buffer = noiseBuffer;
		whiteNoise.loop = true;

		const bandpass = audioCtx.createBiquadFilter();
		bandpass.type = 'bandpass';
		bandpass.frequency.value = freq * 1.5;
		bandpass.Q.value = 1.5;

		const noiseGain = audioCtx.createGain();
		noiseGain.gain.setValueAtTime(0.0001, now);
		noiseGain.gain.linearRampToValueAtTime(0.08, now + attackTime);
		noiseGain.gain.exponentialRampToValueAtTime(0.03, now + attackTime + decayTime);

		// === Vibrato (LFO) ===
		const lfo = audioCtx.createOscillator();
		lfo.type = 'sine';
		lfo.frequency.value = 5.5;
		const lfoGain = audioCtx.createGain();
		// Vibrato fades in after attack for natural feel
		lfoGain.gain.setValueAtTime(0, now);
		lfoGain.gain.linearRampToValueAtTime(2.5, now + attackTime + decayTime);
		lfo.connect(lfoGain);
		lfoGain.connect(osc.frequency);

		// === Connect graph ===
		osc.connect(oscGain);
		oscGain.connect(masterGain);
		whiteNoise.connect(bandpass);
		bandpass.connect(noiseGain);
		noiseGain.connect(masterGain);

		osc.start(now);
		whiteNoise.start(now);
		lfo.start(now);

		activeNotes[key] = { osc, whiteNoise, lfo, oscGain, noiseGain, lfoGain };
		
		document.getElementById('key-' + key).classList.add('active');
		document.getElementById('hole-' + key).classList.add('active');
	}

	function stopNote(key) {
		const note = activeNotes[key];
		if (!note) return;
		
		const now = audioCtx.currentTime;
		const releaseTime = 0.6;

		// Cancel any pending automation and ramp down smoothly
		note.oscGain.gain.cancelScheduledValues(now);
		note.oscGain.gain.setValueAtTime(note.oscGain.gain.value, now);
		// Use exponential release (must not go to 0 - schedule a tiny value then stop)
		note.oscGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

		note.noiseGain.gain.cancelScheduledValues(now);
		note.noiseGain.gain.setValueAtTime(note.noiseGain.gain.value, now);
		note.noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime * 0.7);

		note.lfoGain.gain.cancelScheduledValues(now);
		note.lfoGain.gain.setValueAtTime(note.lfoGain.gain.value, now);
		note.lfoGain.gain.linearRampToValueAtTime(0, now + releaseTime);

		// Actually stop the oscillators after release completes
		note.osc.stop(now + releaseTime + 0.05);
		note.whiteNoise.stop(now + releaseTime + 0.05);
		note.lfo.stop(now + releaseTime + 0.05);

		delete activeNotes[key];

		document.getElementById('key-' + key).classList.remove('active');
		document.getElementById('hole-' + key).classList.remove('active');
	}

	window.addEventListener('keydown', (e) => {
		const key = e.key.toLowerCase();
		const noteData = NOTES.find(n => n.key === key);
		if (noteData) {
			e.preventDefault();
			playNote(noteData.freq, key);
		}
	});

	window.addEventListener('keyup', (e) => {
		const key = e.key.toLowerCase();
		if (NOTES.find(n => n.key === key)) {
			stopNote(key);
		}
	});

	document.body.addEventListener('click', initAudio, { once: true });
	document.body.addEventListener('touchstart', initAudio, { once: true });
	document.body.addEventListener('keydown', initAudio, { once: true });
</script>
</body>
</html>`;

		return new Response(html, {
			headers: {
				'content-type': 'text/html;charset=UTF-8',
			},
		});
	},
};