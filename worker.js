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
		justify-content: flex-start;
		min-height: 100vh;
		margin: 0;
		overflow-y: auto;
		padding: 20px 10px 40px 10px;
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
		height: 85px;
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
		touch-action: manipulation;
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
	
	.btn-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 25px;
		width: 90%;
		max-width: 320px;
	}
	.random-btn {
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
		justify-content: center;
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
	.random-btn.complex {
		background: linear-gradient(180deg, #4a2c5e 0%, #2c1635 100%);
		border-color: #8b5a9e;
	}
	.random-btn.complex:hover {
		background: linear-gradient(180deg, #6b4480 0%, #4a2c5e 100%);
	}
	.random-btn.complex.active {
		background: linear-gradient(180deg, #c49ed4 0%, #8b5a9e 100%);
		color: #2c1635;
		border-color: #c49ed4;
	}
</style>
</head>
<body>

<img src="https://images.squarespace-cdn.com/content/v1/56fae4be1d07c0c393d8faa5/1556034153700-O4M9FPFDCMRX1DNQ2S6W/Flute.jpg" alt="Lakota Flute" class="flute-image">

<h1>🪶 Lakota Flute 🪶</h1>
<p class="instructions">Click keys, use your keyboard (A-L, ;), or play a soothing random melody.</p>

<div class="keyboard" id="keyboard"></div>
<div class="flute-visual" id="fluteVisual"></div>

<div class="btn-group">
	<button id="randomPlayBtn" class="random-btn">🎵 فی البداهه</button>
	<button id="complexPlayBtn" class="random-btn complex">🎼 فی البداهه پیچیده</button>
</div>

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
			stopAllNotes(); // Stop EVERYTHING before starting manual play
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

	// displayKey allows the audio tracking ID to differ from the visual key
	function playNote(freq, key, displayKey = key) {
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
		bandpass.frequency.value = Math.min(freq * 1.2, 2500);
		bandpass.Q.value = 1.0;

		const lowpass = audioCtx.createBiquadFilter();
		lowpass.type = 'lowpass';
		lowpass.frequency.value = 3500;

		const noiseGain = audioCtx.createGain();
		noiseGain.gain.setValueAtTime(0.0001, now);
		noiseGain.gain.linearRampToValueAtTime(0.04, now + attackTime);
		noiseGain.gain.exponentialRampToValueAtTime(0.015, now + attackTime + decayTime);

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
		bandpass.connect(lowpass);
		lowpass.connect(noiseGain);
		noiseGain.connect(masterGain);

		osc.start(now);
		whiteNoise.start(now);
		lfo.start(now);

		activeNotes[key] = { osc, whiteNoise, lfo, oscGain, noiseGain, lfoGain, lowpass };
		
		const keyEl = document.getElementById('key-' + displayKey);
		const holeEl = document.getElementById('hole-' + displayKey);
		if (keyEl) keyEl.classList.add('active');
		if (holeEl) holeEl.classList.add('active');
	}

	function stopNote(key, displayKey = key) {
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

		const keyEl = document.getElementById('key-' + displayKey);
		const holeEl = document.getElementById('hole-' + displayKey);
		if (keyEl) keyEl.classList.remove('active');
		if (holeEl) holeEl.classList.remove('active');
	}

	// === NEW: Universal Note Stopper ===
	function stopAllNotes() {
		Object.keys(activeNotes).forEach(key => stopNote(key));
		clearTimeout(randomPlayTimeout);
		clearTimeout(complexPlayTimeout);
		clearTimeout(droneTimeout);
		randomPlayTimeout = null;
		complexPlayTimeout = null;
		droneTimeout = null;
		isRandomPlaying = false;
		isComplexPlaying = false;
		currentDroneKey = null;
	}

	// === Simple Random Melody ===
	let randomPlayTimeout = null;
	let isRandomPlaying = false;
	const randomBtn = document.getElementById('randomPlayBtn');

	function stopRandomPlay() {
		isRandomPlaying = false;
		if (randomPlayTimeout) clearTimeout(randomPlayTimeout);
		randomPlayTimeout = null;
		// Only stop notes that belong to the simple mode
		Object.keys(activeNotes).forEach(key => {
			if (!key.startsWith('melody-') && !key.startsWith('harmony-') && !key.startsWith('drone-')) {
				stopNote(key);
			}
		});
		randomBtn.classList.remove('active');
		randomBtn.innerHTML = '🎵 فی البداهه';
	}

	function playSoothingMelody() {
		if (isRandomPlaying) { stopRandomPlay(); return; }
		if (isComplexPlaying) stopComplexPlay();
		
		isRandomPlaying = true;
		initAudio();
		randomBtn.classList.add('active');
		randomBtn.innerHTML = '⏹ توقف';

		const soothingNotes = [
			{ key: 'a', weight: 4 }, { key: 's', weight: 2 },
			{ key: 'd', weight: 3 }, { key: 'f', weight: 3 },
			{ key: 'g', weight: 4 }, { key: 'h', weight: 2 }
		];
		
		function scheduleNext() {
			if (!isRandomPlaying) return;
			if (Math.random() < 0.25) {
				randomPlayTimeout = setTimeout(scheduleNext, 600 + Math.random() * 800);
				return;
			}
			const totalWeight = soothingNotes.reduce((sum, n) => sum + n.weight, 0);
			let random = Math.random() * totalWeight;
			let selected = soothingNotes[0];
			for (const n of soothingNotes) {
				random -= n.weight;
				if (random <= 0) { selected = n; break; }
			}
			const noteData = NOTES.find(n => n.key === selected.key);
			const duration = 1200 + Math.random() * 1800;
			playNote(noteData.freq, noteData.key);
			randomPlayTimeout = setTimeout(() => {
				stopNote(noteData.key);
				randomPlayTimeout = setTimeout(scheduleNext, 100 + Math.random() * 200);
			}, duration);
		}
		scheduleNext();
	}

	randomBtn.addEventListener('click', () => { initAudio(); playSoothingMelody(); });

	// === Complex Polyphonic Melody ===
	let complexPlayTimeout = null;
	let isComplexPlaying = false;
	const complexBtn = document.getElementById('complexPlayBtn');
	let noteCounter = 0;
	let currentDroneKey = null;
	let droneTimeout = null;

	const harmonyMap = {
		'a': ['f', 'h'], 's': ['g', 'j'], 'd': ['g', 'h'],
		'f': ['a', 'h'], 'g': ['d', 'j'], 'h': ['f', 'd'],
		'j': ['g', 'h'], 'k': ['h', 'g']
	};

	function pickHarmony(melodyKey) {
		const options = harmonyMap[melodyKey];
		if (!options || options.length === 0) return null;
		return options[Math.floor(Math.random() * options.length)];
	}

	function startDrone(noteKey) {
		if (currentDroneKey) stopDrone();
		const noteData = NOTES.find(n => n.key === noteKey);
		currentDroneKey = noteKey;
		playNote(noteData.freq, 'drone-' + noteKey, noteKey);
		
		const droneDuration = 8000 + Math.random() * 7000;
		droneTimeout = setTimeout(() => {
			stopDrone();
			// 60% chance to start a new drone
			if (isComplexPlaying && Math.random() < 0.6) {
				const droneOptions = ['a', 'g', 'f'];
				const newDrone = droneOptions[Math.floor(Math.random() * droneOptions.length)];
				startDrone(newDrone);
			}
		}, droneDuration);
	}

	function stopDrone() {
		if (droneTimeout) clearTimeout(droneTimeout);
		droneTimeout = null;
		if (currentDroneKey) {
			stopNote('drone-' + currentDroneKey, currentDroneKey);
			currentDroneKey = null;
		}
	}

	function generateComplexPhrase() {
		const melodyRange = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
		const length = 4 + Math.floor(Math.random() * 5); // 4-8 notes
		const phrase = [];
		
		// Choose a melodic contour: rising, falling, or arching
		const contourType = Math.random();
		let prevIdx = Math.floor(Math.random() * melodyRange.length);
		
		for (let i = 0; i < length; i++) {
			let nextIdx;
			const roll = Math.random();
			
			if (contourType < 0.33) {
				// Rising tendency
				if (roll < 0.65) nextIdx = Math.min(melodyRange.length - 1, prevIdx + 1);
				else if (roll < 0.85) nextIdx = Math.max(0, prevIdx - 1);
				else nextIdx = Math.floor(Math.random() * melodyRange.length);
			} else if (contourType < 0.66) {
				// Falling tendency
				if (roll < 0.65) nextIdx = Math.max(0, prevIdx - 1);
				else if (roll < 0.85) nextIdx = Math.min(melodyRange.length - 1, prevIdx + 1);
				else nextIdx = Math.floor(Math.random() * melodyRange.length);
			} else {
				// Arching / random
				if (roll < 0.7) {
					const step = Math.random() < 0.5 ? -1 : 1;
					nextIdx = Math.max(0, Math.min(melodyRange.length - 1, prevIdx + step));
				} else {
					nextIdx = Math.floor(Math.random() * melodyRange.length);
				}
			}
			
			const noteKey = melodyRange[nextIdx];
			
			// 45% chance of simultaneous harmony (less likely on very high notes)
			let harmonyKey = null;
			if (Math.random() < 0.45 && nextIdx < melodyRange.length - 1) {
				harmonyKey = pickHarmony(noteKey);
			}
			
			// Longer notes at phrase boundaries for breathing
			let duration;
			if (i === 0 || i === length - 1) {
				duration = 1200 + Math.random() * 1200;
			} else {
				duration = 700 + Math.random() * 1100;
			}
			
			phrase.push({ noteKey, harmonyKey, duration });
			prevIdx = nextIdx;
		}
		return phrase;
	}

	function scheduleComplexPhrase() {
		if (!isComplexPlaying) return;
		
		const phrase = generateComplexPhrase();
		let delay = 0;
		
		phrase.forEach((note) => {
			// Schedule melody note
			setTimeout(() => {
				if (!isComplexPlaying) return;
				const noteData = NOTES.find(n => n.key === note.noteKey);
				const id = 'melody-' + (noteCounter++);
				playNote(noteData.freq, id, note.noteKey);
				setTimeout(() => {
					if (activeNotes[id]) stopNote(id, note.noteKey);
				}, note.duration * 0.9);
			}, delay);
			
			// Schedule harmony note simultaneously
			if (note.harmonyKey) {
				setTimeout(() => {
					if (!isComplexPlaying) return;
					const harmData = NOTES.find(n => n.key === note.harmonyKey);
					const id = 'harmony-' + (noteCounter++);
					playNote(harmData.freq, id, note.harmonyKey);
					setTimeout(() => {
						if (activeNotes[id]) stopNote(id, note.harmonyKey);
					}, note.duration * 0.85);
				}, delay);
			}
			
			delay += note.duration + 80;
		});
		
		// Rest between phrases
		const restDuration = 1800 + Math.random() * 2200;
		complexPlayTimeout = setTimeout(() => {
			if (isComplexPlaying) scheduleComplexPhrase();
		}, delay + restDuration);
	}

	function stopComplexPlay() {
		isComplexPlaying = false;
		if (complexPlayTimeout) clearTimeout(complexPlayTimeout);
		complexPlayTimeout = null;
		stopDrone();
		// Stop only complex-mode notes
		Object.keys(activeNotes).forEach(key => {
			if (key.startsWith('melody-') || key.startsWith('harmony-')) {
				stopNote(key);
			}
		});
		complexBtn.classList.remove('active');
		complexBtn.innerHTML = '🎼 فی البداهه پیچیده';
	}

	function playComplexMelody() {
		if (isComplexPlaying) { stopComplexPlay(); return; }
		if (isRandomPlaying) stopRandomPlay();
		
		isComplexPlaying = true;
		initAudio();
		complexBtn.classList.add('active');
		complexBtn.innerHTML = '⏹ توقف';
		
		// Start with a drone
		const droneOptions = ['a', 'g', 'f'];
		const initialDrone = droneOptions[Math.floor(Math.random() * droneOptions.length)];
		startDrone(initialDrone);
		
		// Begin phrase scheduling after a short delay
		complexPlayTimeout = setTimeout(() => {
			if (isComplexPlaying) scheduleComplexPhrase();
		}, 800);
	}

	complexBtn.addEventListener('click', () => { initAudio(); playComplexMelody(); });

	// === Global Event Listeners ===
	window.addEventListener('keydown', (e) => {
		const key = e.key.toLowerCase();
		const noteData = NOTES.find(n => n.key === key);
		if (noteData) {
			e.preventDefault();
			stopAllNotes(); // Critical: stop everything before manual play
			playNote(noteData.freq, key);
		}
	});

	window.addEventListener('keyup', (e) => {
		const key = e.key.toLowerCase();
		if (NOTES.find(n => n.key === key)) stopNote(key);
	});

	window.addEventListener('blur', () => {
		stopAllNotes();
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
				'cache-control': 'no-cache, must-revalidate',
				'cf-cache-status': 'BYPASS',
			},
		});
	},
};