export default {
	async fetch(request, env, ctx) {
		const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Lakota Flute Simulator</title>
<style>
	body {
		background: linear-gradient(135deg, #2c1e16 0%, #4a2c17 100%);
		color: #e8d5c4;
		font-family: 'Georgia', serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start; /* Prevents top cutoff on mobile scroll */
		min-height: 100vh; /* Allows content to grow beyond screen height */
		margin: 0;
		overflow-y: auto; /* Enables vertical scrolling */
		padding: 20px 10px 40px 10px; /* Safe spacing top and bottom */
	}
	.flute-image {
		width: 80%;
		max-width: 350px;
		height: auto;
		border-radius: 12px;
		box-shadow: 0 8px 20px rgba(0,0,0,0.4);
		margin-bottom: 15px;
		border: 3px solid #8b5a2b;
	}
	h1 { 
		font-size: 2rem; 
		text-shadow: 2px 2px 4px rgba(0,0,0,0.5); 
		margin: 0 0 10px 0; 
		color: #d4a373; 
		text-align: center; 
	}
	.instructions { 
		margin-bottom: 20px; 
		font-size: 1rem; 
		opacity: 0.8; 
		text-align: center; 
		padding: 0 10px; 
		line-height: 1.4; 
	}
	.keyboard { 
		display: flex; 
		gap: 8px; 
		perspective: 1000px; 
		flex-wrap: wrap; 
		justify-content: center; 
		padding: 0 5px; 
	}
	.key {
		width: 55px; 
		height: 85px; /* Slightly smaller for better mobile fit */
		background: linear-gradient(180deg, #8b5a2b 0%, #5c3a21 100%);
		border: 2px solid #3e2312; 
		border-radius: 12px;
		display: flex; 
		flex-direction: column; 
		align-items: center; 
		justify-content: center;
		font-size: 1.2rem; 
		font-weight: bold; 
		color: #f4e4d4;
		box-shadow: 0 6px 0 #3e2312, 0 10px 8px rgba(0,0,0,0.4);
		transition: all 0.1s ease; 
		user-select: none; 
		cursor: pointer;
		touch-action: manipulation; /* Prevents double-tap zoom on mobile */
		-webkit-tap-highlight-color: transparent;
	}
	.key span { font-size: 0.7rem; opacity: 0.7; margin-top: 4px; }
	.key.active {
		transform: translateY(6px);
		box-shadow: 0 0px 0 #3e2312, 0 4px 5px rgba(0,0,0,0.4);
		background: linear-gradient(180deg, #a67c52 0%, #8b5a2b 100%);
		color: #fff;
	}
	.flute-visual {
		margin-top: 25px; 
		width: 95%; 
		max-width: 600px; 
		height: 36px;
		background: linear-gradient(90deg, #4a2c17, #8b5a2b, #4a2c17);
		border-radius: 20px; 
		display: flex; 
		justify-content: space-around; 
		align-items: center;
		box-shadow: inset 0 -5px 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.5);
		padding: 0 15px;
	}
	.hole {
		width: 18px; 
		height: 18px; 
		background: #1a0f08; 
		border-radius: 50%;
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.8); 
		transition: background 0.2s;
	}
	.hole.active { 
		background: #d4a373; 
		box-shadow: 0 0 15px #d4a373, inset 0 2px 4px rgba(0,0,0,0.8); 
	}
	
	.random-btn {
		margin-top: 25px;
		padding: 14px 28px;
		font-size: 1.1rem;
		font-family: 'Georgia', serif;
		color: #f4e4d4;
		background: linear-gradient(180deg, #6b4423 0%, #4a2c17 100%);
		border: 2px solid #8b5a2b;
		border-radius: 30px;
		cursor: pointer;
		box-shadow: 0 4px 10px rgba(0,0,0,0.3);
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 8px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.random-btn:hover {
		background: linear-gradient(180deg, #8b5a2b 0%, #6b4423 100%);
		transform: translateY(-2px);
		box-shadow: 0 6px 15px rgba(0,0,0,0.4);
	}
	.random-btn.active {
		background: linear-gradient(180deg, #d4a373 0%, #8b5a2b 100%);
		color: #2c1e16;
		font-weight: bold;
		border-color: #d4a373;
	}
</style>
</head>
<body>

<img src="https://images.squarespace-cdn.com/content/v1/56fae4be1d07c0c393d8faa5/1556034153700-O4M9FPFDCMRX1DNQ2S6W/Flute.jpg" alt="Lakota Flute" class="flute-image">

<h1>🪶 Lakota Flute 🪶</h1>
<p class="instructions">Click keys, use your keyboard (A-L, ;), or play a soothing random melody.</p>

<div class="keyboard" id="keyboard"></div>
<div class="flute-visual" id="fluteVisual"></div>

<button id="randomPlayBtn" class="random-btn">فی البداهه</button>

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
		keyEl.setAttribute('role', 'button');
		keyEl.setAttribute('aria-label', 'Play note ' + n.note);
		keyEl.tabIndex = 0;
		keyEl.innerHTML = n.note + '<span>' + n.key.toUpperCase() + '</span>';
		
		const startPlaying = (e) => {
			e.preventDefault();
			if (isRandomPlaying) stopRandomPlay();
			playNote(n.freq, n.key);
		};
		const stopPlaying = (e) => {
			e.preventDefault();
			stopNote(n.key);
		};

		keyEl.addEventListener('mousedown', startPlaying);
		keyEl.addEventListener('mouseup', stopPlaying);
		keyEl.addEventListener('mouseleave', stopPlaying);
		keyEl.addEventListener('touchstart', startPlaying, { passive: false });
		keyEl.addEventListener('touchend', stopPlaying, { passive: false });
		
		keyEl.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') startPlaying(e);
		});
		keyEl.addEventListener('keyup', (e) => {
			if (e.key === 'Enter' || e.key === ' ') stopPlaying(e);
		});

		keyboardEl.appendChild(keyEl);

		const holeEl = document.createElement('div');
		holeEl.className = 'hole';
		holeEl.id = 'hole-' + n.key;
		fluteVisualEl.appendChild(holeEl);
	});

	let audioCtx;
	let masterGain;
	const activeNotes = {};
	let noiseBuffer;

	function initAudio() {
		if (audioCtx) return;
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		
		masterGain = audioCtx.createGain();
		masterGain.gain.value = 0.7;
		
		const compressor = audioCtx.createDynamicsCompressor();
		compressor.threshold.value = -18;
		compressor.knee.value = 20;
		compressor.ratio.value = 6;
		compressor.attack.value = 0.01;
		compressor.release.value = 0.3;
		
		masterGain.connect(compressor);
		compressor.connect(audioCtx.destination);

		const bufferSize = audioCtx.sampleRate * 2;
		noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
		const data = noiseBuffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}
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

		const osc = audioCtx.createOscillator();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq * 0.98, now);
		osc.frequency.exponentialRampToValueAtTime(freq, now + 0.1);

		const oscGain = audioCtx.createGain();
		oscGain.gain.setValueAtTime(0.0001, now);
		oscGain.gain.linearRampToValueAtTime(0.5, now + attackTime);
		oscGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);

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

		const lfo = audioCtx.createOscillator();
		lfo.type = 'sine';
		lfo.frequency.value = 5.5;
		const lfoGain = audioCtx.createGain();
		lfoGain.gain.setValueAtTime(0, now);
		lfoGain.gain.linearRampToValueAtTime(2.5, now + attackTime + decayTime);
		lfo.connect(lfoGain);
		lfoGain.connect(osc.frequency);

		osc.connect(oscGain);
		oscGain.connect(masterGain);
		whiteNoise.connect(bandpass);
		bandpass.connect(noiseGain);
		noiseGain.connect(masterGain);

		osc.start(now);
		whiteNoise.start(now);
		lfo.start(now);

		activeNotes[key] = { osc, whiteNoise, lfo, oscGain, noiseGain, lfoGain };
		
		const keyEl = document.getElementById('key-' + key);
		const holeEl = document.getElementById('hole-' + key);
		if (keyEl) keyEl.classList.add('active');
		if (holeEl) holeEl.classList.add('active');
	}

	function stopNote(key) {
		const note = activeNotes[key];
		if (!note) return;
		
		const now = audioCtx.currentTime;
		const releaseTime = 0.6;

		note.oscGain.gain.cancelScheduledValues(now);
		note.oscGain.gain.setValueAtTime(note.oscGain.gain.value, now);
		note.oscGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

		note.noiseGain.gain.cancelScheduledValues(now);
		note.noiseGain.gain.setValueAtTime(note.noiseGain.gain.value, now);
		note.noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime * 0.7);

		note.lfoGain.gain.cancelScheduledValues(now);
		note.lfoGain.gain.setValueAtTime(note.lfoGain.gain.value, now);
		note.lfoGain.gain.linearRampToValueAtTime(0, now + releaseTime);

		const stopTime = now + releaseTime + 0.05;
		note.osc.stop(stopTime);
		note.whiteNoise.stop(stopTime);
		note.lfo.stop(stopTime);

		delete activeNotes[key];

		const keyEl = document.getElementById('key-' + key);
		const holeEl = document.getElementById('hole-' + key);
		if (keyEl) keyEl.classList.remove('active');
		if (holeEl) holeEl.classList.remove('active');
	}

	// === Random Soothing Melody Logic ===
	let randomPlayTimeout = null;
	let isRandomPlaying = false;
	const randomBtn = document.getElementById('randomPlayBtn');

	function stopRandomPlay() {
		isRandomPlaying = false;
		if (randomPlayTimeout) {
			clearTimeout(randomPlayTimeout);
			randomPlayTimeout = null;
		}
		Object.keys(activeNotes).forEach(key => stopNote(key));
		randomBtn.classList.remove('active');
		randomBtn.innerHTML = 'فی البداهه';
	}

	function playSoothingMelody() {
		if (isRandomPlaying) {
			stopRandomPlay();
			return;
		}
		
		isRandomPlaying = true;
		initAudio();
		randomBtn.classList.add('active');
		randomBtn.innerHTML = 'توقف';

		const soothingNotes = [
			{ key: 'a', weight: 4 },
			{ key: 's', weight: 2 },
			{ key: 'd', weight: 3 },
			{ key: 'f', weight: 3 },
			{ key: 'g', weight: 4 },
			{ key: 'h', weight: 2 }
		];
		
		function scheduleNext() {
			if (!isRandomPlaying) return;

			if (Math.random() < 0.25) {
				const restDuration = 600 + Math.random() * 800;
				randomPlayTimeout = setTimeout(scheduleNext, restDuration);
				return;
			}

			const totalWeight = soothingNotes.reduce((sum, n) => sum + n.weight, 0);
			let random = Math.random() * totalWeight;
			let selected = soothingNotes[0];
			
			for (const n of soothingNotes) {
				random -= n.weight;
				if (random <= 0) {
					selected = n;
					break;
				}
			}

			const noteData = NOTES.find(n => n.key === selected.key);
			const duration = 1200 + Math.random() * 1800;

			playNote(noteData.freq, noteData.key);
			
			randomPlayTimeout = setTimeout(() => {
				stopNote(noteData.key);
				const gap = 100 + Math.random() * 200;
				randomPlayTimeout = setTimeout(scheduleNext, gap);
			}, duration);
		}

		scheduleNext();
	}

	randomBtn.addEventListener('click', () => {
		initAudio();
		playSoothingMelody();
	});

	window.addEventListener('keydown', (e) => {
		const key = e.key.toLowerCase();
		const noteData = NOTES.find(n => n.key === key);
		if (noteData) {
			e.preventDefault();
			if (isRandomPlaying) stopRandomPlay();
			playNote(noteData.freq, key);
		}
	});

	window.addEventListener('keyup', (e) => {
		const key = e.key.toLowerCase();
		if (NOTES.find(n => n.key === key)) {
			stopNote(key);
		}
	});

	window.addEventListener('blur', () => {
		if (!isRandomPlaying) {
			Object.keys(activeNotes).forEach(key => stopNote(key));
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
				'cache-control': 'public, max-age=86400, s-maxage=86400',
			},
		});
	},
};