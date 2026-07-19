// worker.js
var worker_default = {
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
        background: linear-gradient(135deg, #200d01 0%, #200d01 100%);
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
        transition: all 0.3s ease;
    }
    .flute-image {
        width: 80%;
        max-width: 350px;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        margin-bottom: 15px;
        border: 3px solid #0e0d0dff;
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
        flex-direction: row-reverse; /* Reversed so highest frequency (closest to mouthpiece) is on the left */
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

    /* === NEW: Flute Visual Container to hold Overblow Button and Flute === */
    .flute-visual-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 15px;
        width: 95%;
        max-width: 600px;
        margin-top: 25px;
    }
    
    /* === NEW: Overblow Button Styles === */
    #overblowBtn {
        background: linear-gradient(180deg, #8b0000 0%, #5c0000 100%);
        color: #f4e4d4;
        border: 2px solid #3e2312;
        border-radius: 12px;
        font-family: 'Georgia', serif;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0;
        box-shadow: 0 6px 0 #3e2312, 0 10px 8px rgba(0,0,0,0.4);
        transition: all 0.1s ease;
        font-size: 0.8rem;
        padding: 10px 15px;
        font-weight: bold;
        text-align: center;
        line-height: 1.2;
    }
    #overblowBtn.active {
        transform: translateY(6px);
        box-shadow: 0 0px 0 #3e2312, 0 4px 5px rgba(0,0,0,0.4);
        background: linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%);
        color: #fff;
    }

    .flute-visual { 
        flex: 1;
        height: 36px;
        background: linear-gradient(90deg, #4a2c17, #8b5a2b, #4a2c17);
        border-radius: 20px; 
        display: flex; 
        flex-direction: row-reverse; /* Reversed so highest frequency (closest to mouthpiece) is on the left */
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
        cursor: pointer; /* Added to indicate clickability */
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
    }
    .hole.active { 
        background: #d4a373; 
        box-shadow: 0 0 15px #d4a373, inset 0 2px 4px rgba(0,0,0,0.8); 
    }
    /* NEW: Red color for holes when overblow is active */
    .hole.active-overblow { 
        background: #ff4d4d; 
        box-shadow: 0 0 15px #ff4d4d, inset 0 2px 4px rgba(0,0,0,0.8); 
    }

    /* === HAND GRAB MODE STYLES === */
    .vertical-flute {
        display: none; /* Hidden by default */
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        width: 100px;
        height: 85vh; /* Optimized for mobile screen height */
        max-height: 700px; /* Prevent overflow on very tall screens */
        background: linear-gradient(90deg, #3a1f0e, #6b3a1f, #3a1f0e);
        border-radius: 50px;
        box-shadow: inset 0 -10px 20px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.6);
        padding: 15px 0;
        margin: 70px auto 0 auto; /* Added top margin to clear the back button */
    }
    .v-hole {
        width: 55px;
        height: 55px;
        background: #1a0f08;
        border-radius: 50%;
        box-shadow: inset 0 4px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(255,255,255,0.1);
        transition: all 0.1s ease;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        flex-shrink: 0; /* Prevents squishing on smaller screens */
    }
    .v-hole.active {
        background: #d4a373;
        box-shadow: 0 0 25px #d4a373, inset 0 4px 8px rgba(0,0,0,0.5);
        transform: scale(0.92);
    }
    /* NEW: Red color for vertical holes when overblow is active */
    .v-hole.active-overblow {
        background: #ff4d4d;
        box-shadow: 0 0 25px #ff4d4d, inset 0 4px 8px rgba(0,0,0,0.5);
        transform: scale(0.92);
    }
    
    /* Hide standard UI elements when in hand grab mode */
    /* FIX: Hide .flute-visual instead of .flute-visual-container so #overblowBtn isn't hidden by its parent */
    body.hand-grab-mode .flute-image,
    body.hand-grab-mode h1,
    body.hand-grab-mode .instructions,
    body.hand-grab-mode .keyboard,
    body.hand-grab-mode .flute-visual,
    body.hand-grab-mode .btn-group,
    body.hand-grab-mode #handGrabModeBtn {
        display: none !important;
    }
    
    /* Show vertical flute in hand grab mode */
    body.hand-grab-mode .vertical-flute {
        display: flex;
    }

    /* Show Overblow button fixed on the left in hand grab mode */
    body.hand-grab-mode #overblowBtn {
        display: block !important;
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        padding: 0;
        font-size: 0.7rem;
        z-index: 1000;
    }
    body.hand-grab-mode #overblowBtn.active {
        transform: translateY(-50%) scale(0.92); /* Keep center transform when active */
    }
    
    /* Ensure hand grab mode centers the vertical flute */
    body.hand-grab-mode {
        justify-content: center;
        padding: 10px;
    }

    .btn-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 25px;
        width: 90%;
        max-width: 600px;
        align-items: center;
    }
    .random-btn {
        width: 100%;
        max-width: 320px;
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
    
    /* Hand grab mode toggle button */
    #handGrabModeBtn {
        margin-top: 0;
        background: linear-gradient(180deg, #2c5e4a 0%, #16352c 100%);
        border-color: #5a9e8b;
    }
    #handGrabModeBtn:hover {
        background: linear-gradient(180deg, #3a7a60 0%, #2c5e4a 100%);
    }

    /* === NEW: Parameters Menu Styles === */
    /* Row container that holds the complex button and the small params button side-by-side */
    .complex-row {
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
        width: 100%;
        max-width: 320px;
    }
    /* Small circular params icon button - positioned to the left of the complex button */
    .small-params-btn {
        width: 48px;
        height: 48px;
        padding: 0;
        font-size: 1.3rem;
        border-radius: 50%;
        flex-shrink: 0;
        background: linear-gradient(180deg, #4a3b2c 0%, #2c1e16 100%);
        border: 2px solid #8b5a2b;
    }
    .small-params-btn:hover {
        background: linear-gradient(180deg, #6b5540 0%, #4a3b2c 100%);
    }
    .small-params-btn.active {
        background: linear-gradient(180deg, #d4a373 0%, #8b5a2b 100%);
        color: #2c1e16;
        border-color: #d4a373;
    }
    /* Complex button expands to fill the remaining space in the row */
    .complex-row .random-btn.complex {
        flex: 1;
    }

    .source-btn {
        background: linear-gradient(180deg, #333333 0%, #1a1a1a 100%);
        border-color: #555555;
        font-size: 0.95rem;
        padding: 12px 20px;
    }
    .source-btn:hover {
        background: linear-gradient(180deg, #444444 0%, #2a2a2a 100%);
        transform: translateY(-2px);
    }

    .params-menu {
        display: none;
        flex-direction: column;
        gap: 12px;
        margin-top: 12px;
        width: 100%;
        background: rgba(32, 13, 1, 0.95);
        border: 2px solid #8b5a2b;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.6);
    }
    .params-menu.open {
        display: flex;
    }
    
    /* Responsive Grid for Parameters */
    .params-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 8px 24px;
        width: 100%;
    }
    
    /* Compact parameter rows (boxes/spacing omitted to save vertical space) */
    .param-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .param-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        color: #d4a373;
        font-weight: bold;
    }
    .param-input-group {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .param-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 6px;
        background: #3e2312;
        border-radius: 3px;
        outline: none;
    }
    .param-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: #d4a373;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid #2c1e16;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }
    .param-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background: #d4a373;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid #2c1e16;
    }
    .param-number {
        width: 55px;
        background: #2c1e16;
        border: 1px solid #8b5a2b;
        color: #f4e4d4;
        border-radius: 6px;
        padding: 4px;
        text-align: center;
        font-family: 'Georgia', serif;
        font-size: 0.85rem;
    }
    .param-number:focus {
        outline: none;
        border-color: #d4a373;
    }
    
    /* Cache status indicator */
    .cache-status {
        font-size: 0.75rem;
        color: #8b5a2b;
        text-align: center;
        margin-top: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-style: italic;
    }
    .cache-status.visible {
        opacity: 1;
    }
    
    /* Back button - centered at the top, clearly above the flute to prevent accidental touch */
    #backBtn {
        display: none;
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 16px;
        font-size: 1rem;
        font-weight: bold;
        background: linear-gradient(180deg, #4a2c17 0%, #2c1635 100%);
        border: 2px solid #8b5a2b;
        border-radius: 20px;
        color: #f4e4d4;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
    }
    #backBtn:hover {
        background: linear-gradient(180deg, #6b4423 0%, #4a2c17 100%);
    }
    body.hand-grab-mode #backBtn {
        display: block;
    }
</style>
</head>
<body>

<img src="https://images.squarespace-cdn.com/content/v1/56fae4be1d07c0c393d8faa5/1556034153700-O4M9FPFDCMRX1DNQ2S6W/Flute.jpg" alt="Lakota Flute" class="flute-image">

<h1>\u{1FAB6} Lakota Flute \u{1FAB6}</h1>
<p class="instructions">Click keys or flute holes, use your keyboard (A-L, ;), or play a soothing random melody.</p>

<div class="keyboard" id="keyboard"></div>

<!-- NEW: Flex container to hold Overblow Button (left) and Flute Visual (right) -->
<div class="flute-visual-container">
    <button id="overblowBtn">Overblow<br>دم شدید</button>
    <div class="flute-visual" id="fluteVisual"></div>
</div>

<!-- New Vertical Flute for Hand Grab Mode -->
<div class="vertical-flute" id="verticalFlute"></div>

<div class="btn-group">
    <button id="randomPlayBtn" class="random-btn">\u{1F3B5}  \u0628\u062F\u0627\u0647\u0647 \u062A\u06A9 \u062F\u06A9\u0645\u0647  </button>
    
    <!-- Complex button + small params button in a single row -->
    <div class="complex-row">
        <button id="paramsToggleBtn" class="random-btn small-params-btn" title="Parameters - \u067E\u0627\u0631\u0627\u0645\u062A\u0631\u0647\u0627">\u2699\uFE0F</button>
        <button id="complexPlayBtn" class="random-btn complex">\u{1F3BC} \u0628\u062F\u0627\u0647\u0647 \u067E\u06CC\u0686\u06CC\u062F\u0647 </button>
    </div>

    <!-- Expandable Parameters Menu -->
    <div id="paramsMenu" class="params-menu">
        <div class="params-grid">
            <!-- Core Timing -->
            <div class="param-row">
                <div class="param-header"><span>Phrase Length (Notes)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-phraseLength" min="4" max="16" step="1" value="6">
                    <input type="number" class="param-number" id="num-phraseLength" min="4" max="16" step="1" value="6">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Tempo Multiplier (x)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-tempo" min="0.3" max="3.0" step="0.1" value="1.0">
                    <input type="number" class="param-number" id="num-tempo" min="0.3" max="3.0" step="0.1" value="1.0">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Rest Duration (ms)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-restDuration" min="500" max="6000" step="100" value="2900">
                    <input type="number" class="param-number" id="num-restDuration" min="500" max="6000" step="100" value="2900">
                </div>
            </div>
            
            <!-- Melody & Harmony -->
            <div class="param-row">
                <div class="param-header"><span>Harmony Chance (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-harmonyChance" min="0" max="100" step="5" value="45">
                    <input type="number" class="param-number" id="num-harmonyChance" min="0" max="100" step="5" value="45">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Contour Bias (-100 Falling to 100 Rising)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-contourBias" min="-100" max="100" step="10" value="0">
                    <input type="number" class="param-number" id="num-contourBias" min="-100" max="100" step="10" value="0">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Motif Repeat Chance (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-motifRepeatChance" min="0" max="100" step="5" value="0">
                    <input type="number" class="param-number" id="num-motifRepeatChance" min="0" max="100" step="5" value="0">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Grace Note Chance (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-graceNoteChance" min="0" max="100" step="5" value="0">
                    <input type="number" class="param-number" id="num-graceNoteChance" min="0" max="100" step="5" value="0">
                </div>
            </div>
            
            <!-- Rhythm & Dynamics (Grouped together) -->
            <div class="param-row">
                <div class="param-header"><span>Rhythmic Variation (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-rhythmicVariation" min="0" max="100" step="5" value="0">
                    <input type="number" class="param-number" id="num-rhythmicVariation" min="0" max="100" step="5" value="0">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Dynamic Range (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-dynamicRange" min="0" max="100" step="5" value="0">
                    <input type="number" class="param-number" id="num-dynamicRange" min="0" max="100" step="5" value="0">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Dynamic Variation (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-dynamicVariation" min="0" max="60" step="5" value="0">
                    <input type="number" class="param-number" id="num-dynamicVariation" min="0" max="60" step="5" value="0">
                </div>
            </div>
            
            <!-- Drone -->
            <div class="param-row">
                <div class="param-header"><span>Drone Duration (ms)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-droneDuration" min="5000" max="20000" step="500" value="11500">
                    <input type="number" class="param-number" id="num-droneDuration" min="5000" max="20000" step="500" value="11500">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Drone Continue Chance (%)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-droneContinueChance" min="0" max="100" step="5" value="60">
                    <input type="number" class="param-number" id="num-droneContinueChance" min="0" max="100" step="5" value="60">
                </div>
            </div>
            
            <!-- Tone & Expression -->
            <div class="param-row">
                <div class="param-header"><span>Vibrato Depth (Hz)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-vibratoDepth" min="0" max="8" step="0.5" value="2.5">
                    <input type="number" class="param-number" id="num-vibratoDepth" min="0" max="8" step="0.5" value="2.5">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Breath Noise Level</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-breathNoiseLevel" min="0" max="0.08" step="0.005" value="0.04">
                    <input type="number" class="param-number" id="num-breathNoiseLevel" min="0" max="0.08" step="0.005" value="0.04">
                </div>
            </div>
            <div class="param-row">
                <div class="param-header"><span>Slide Duration (s)</span></div>
                <div class="param-input-group">
                    <input type="range" class="param-slider" id="slider-slideDuration" min="0" max="0.25" step="0.01" value="0.1">
                    <input type="number" class="param-number" id="num-slideDuration" min="0" max="0.25" step="0.01" value="0.1">
                </div>
            </div>
        </div>
        
        <!-- Presets Section -->
        <div style="text-align: center; color: #d4a373; font-weight: bold; margin-top: 12px; margin-bottom: 8px; font-size: 0.95rem; border-top: 1px solid #3e2312; padding-top: 12px;">
            Presets - پیشفرض‌ها
        </div>
        <div class="preset-group" style="display: flex; gap: 8px; width: 100%; max-width: 320px;">
            <button id="preset1Btn" class="random-btn" style="flex: 1; font-size: 0.75rem; padding: 10px; max-width: none;">\u{1F3B5} Traditional Flow</button>
            <button id="preset2Btn" class="random-btn" style="flex: 1; font-size: 0.75rem; padding: 10px; max-width: none;">\u{1F3B6} Expressive Realism</button>
            <button id="preset3Btn" class="random-btn" style="flex: 1; font-size: 0.75rem; padding: 10px; max-width: none;">\u{1F3BC} Advanced Improv</button>
        </div>
        <div id="cacheStatus" class="cache-status">\u2713 Saved</div>
    </div>

    <!-- Hand Grab Mode Toggle Button -->
    <button id="handGrabModeBtn" class="random-btn">\u270B \u062D\u0627\u0644\u062A \u062F\u0633\u062A \u06AF\u0631\u0641\u062A\u0646</button>

    <!-- Source Button (Hidden in hand-grab mode via .btn-group rule) -->
    <button id="sourceBtn" class="random-btn source-btn">\u{1F517} Source </button>
</div>

<!-- Back Button (visible only in hand grab mode) -->
<button id="backBtn">\u2715</button>

<script>
    /* 
     * ARCHITECTURAL NOTES & IMPROVEMENTS APPLIED:
     * 1. Audio Synthesis: Uses crossfaded white noise buffer to prevent loop clicking.
     * 2. Memory Management: Audio nodes are explicitly disconnected after release to prevent leaks.
     * 3. Visual-Audio Decoupling: playNote accepts 'displayKey' to allow polyphonic IDs to light up correct holes.
     * 4. Infinite Counter Fix: noteCounter is now reset in stopComplexPlay().
     * 5. Accessibility: Keys and holes have role="button", tabIndex, and aria-labels.
     * 6. Hand Grab Mode: Vertical flute with finger-friendly touch targets (55px) and proper margins.
     * 7. Note: The 'a' key for G5 is US ANSI layout specific. International users may need adaptation.
     * 8. MUSICALITY UPDATE: Unified parameters from all iterations, including velocity, motifs, grace notes, 
     *    rhythmic swing, phrase dynamics, portamento slides, and dynamic vibrato. Zero-value edge cases 
     *    are explicitly safeguarded to prevent audio engine failures.
     * 9. VISUAL ACCURACY UPDATE: Restricted flute visuals to exactly 6 holes (max for a Lakota flute). 
     *    Overblow frequencies are now triggered via a dedicated "Overblow" button (or Shift key) alongside a hole.
     * 10. OVERBLOW VISUALS: When an overblow note is played, the associated hole glows RED. The Overblow
     *     button and the 10 individual keyboard buttons retain their exact original functionality and visuals.
     * 11. FLUTE PHYSICS ENFORCEMENT (RANDOM PLAY): It is physically impossible to play a normal and overblow 
     *     frequency together. The complex procedural engine now restricts the melody and harmony to the same 
     *     register. If a drone (base note) is active, the melody remains base. When the drone rests, the melody 
     *     can explore overblows. This prevents sudden jumps and maintains physical realism.
     */

    // NOTES array now distinguishes between base holes and overblows to map visuals correctly.
    // baseKey points to the physical hole that should light up. For base holes, it's themselves.
    const NOTES = [
        // 6 Base Holes (Visually rendered on the flute)
        { key: ';', note: 'A3', freq: 220.00, baseKey: ';', isOverblow: false },
        { key: 'l', note: 'C4', freq: 261.63, baseKey: 'l', isOverblow: false },
        { key: 'k', note: 'D4', freq: 293.66, baseKey: 'k', isOverblow: false },
        { key: 'j', note: 'E4', freq: 329.63, baseKey: 'j', isOverblow: false },
        { key: 'h', note: 'G4', freq: 392.00, baseKey: 'h', isOverblow: false },
        { key: 'g', note: 'A4', freq: 440.00, baseKey: 'g', isOverblow: false },
        
        // 4 Overblow Notes (Triggered via Overblow button + Hole, or directly via keyboard)
        // These do NOT render as physical holes on the flute visual.
        { key: 'f', note: 'C5', freq: 523.25, baseKey: 'l', isOverblow: true },
        { key: 'd', note: 'D5', freq: 587.33, baseKey: 'k', isOverblow: true },
        { key: 's', note: 'E5', freq: 659.25, baseKey: 'j', isOverblow: true },
        { key: 'a', note: 'G5', freq: 783.99, baseKey: 'h', isOverblow: true }
    ];

    // Filter to get only the physical holes for rendering
    const HOLE_NOTES = NOTES.filter(n => !n.isOverblow);

    const keyboardEl = document.getElementById('keyboard');
    const fluteVisualEl = document.getElementById('fluteVisual');
    const verticalFluteEl = document.getElementById('verticalFlute');
    
    // Global state for Overblow modifier
    let isOverblowing = false;
    const overblowBtn = document.getElementById('overblowBtn');

    // Overblow Button Event Listeners (Press and Hold)
    const startOverblow = (e) => {
        if (e) e.preventDefault();
        isOverblowing = true;
        overblowBtn.classList.add('active');
    };
    const stopOverblow = (e) => {
        if (e) e.preventDefault();
        isOverblowing = false;
        // Only remove visual if no overblow notes are currently active
        const isAnyOverblowActive = Object.values(activeNotes).some(n => n.isOverblowNote);
        if (!isAnyOverblowActive) {
            overblowBtn.classList.remove('active');
        }
    };
    overblowBtn.addEventListener('mousedown', startOverblow);
    overblowBtn.addEventListener('mouseup', stopOverblow);
    overblowBtn.addEventListener('mouseleave', stopOverblow);
    overblowBtn.addEventListener('touchstart', startOverblow, { passive: false });
    overblowBtn.addEventListener('touchend', stopOverblow, { passive: false });

    // Unified Play/Stop Handlers
    function handleStartPlaying(n, e) {
        e.preventDefault();
        if (isRandomPlaying) stopRandomPlay();
        if (isComplexPlaying) stopComplexPlay();
        
        let freqToPlay = n.freq;
        let activeKey = n.key;
        let isOver = n.isOverblow;
        let dispKey = n.baseKey;
        
        // If the Overblow button is held and a base hole is pressed, find and play the overblow note
        if (isOverblowing && !n.isOverblow) {
            const overNote = NOTES.find(on => on.baseKey === n.key && on.isOverblow);
            if (overNote) {
                freqToPlay = overNote.freq;
                activeKey = overNote.key;
                isOver = true;
                dispKey = overNote.baseKey;
            }
        }
        
        playNote(freqToPlay, activeKey, dispKey, 1.0, complexParams.vibratoDepth, complexParams.breathNoiseLevel, complexParams.slideDuration, isOver);
    }

    function handleStopPlaying(n, e) {
        e.preventDefault();
        let activeKey = n.key;
        // If releasing a base hole while overblowing, stop the overblow note specifically
        if (isOverblowing && !n.isOverblow) {
            const overNote = NOTES.find(on => on.baseKey === n.key && on.isOverblow);
            if (overNote) activeKey = overNote.key;
        }
        // displayKey is always n.baseKey when interacting with a hole
        stopNote(activeKey, n.baseKey);
    }

    // Render all 10 keyboard keys
    NOTES.forEach((n) => {
        const keyEl = document.createElement('div');
        keyEl.className = 'key';
        keyEl.id = 'key-' + n.key;
        keyEl.setAttribute('role', 'button');
        keyEl.setAttribute('aria-label', 'Play note ' + n.note);
        keyEl.tabIndex = 0;
        keyEl.innerHTML = n.note + '<span>' + n.key.toUpperCase() + '</span>';
        
        // Attach listeners to KEY
        keyEl.addEventListener('mousedown', (e) => handleStartPlaying(n, e));
        keyEl.addEventListener('mouseup', (e) => handleStopPlaying(n, e));
        keyEl.addEventListener('mouseleave', (e) => handleStopPlaying(n, e));
        keyEl.addEventListener('touchstart', (e) => handleStartPlaying(n, e), { passive: false });
        keyEl.addEventListener('touchend', (e) => handleStopPlaying(n, e), { passive: false });
        keyEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStartPlaying(n, e);
        });
        keyEl.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStopPlaying(n, e);
        });
        keyboardEl.appendChild(keyEl);
    });

    // Render only the 6 physical holes on horizontal and vertical flutes
    HOLE_NOTES.forEach((n) => {
        // --- Create Horizontal Flute Hole ---
        const holeEl = document.createElement('div');
        holeEl.className = 'hole';
        holeEl.id = 'hole-' + n.key;
        holeEl.setAttribute('role', 'button');
        holeEl.setAttribute('aria-label', 'Play note ' + n.note);
        holeEl.tabIndex = 0;
        
        holeEl.addEventListener('mousedown', (e) => handleStartPlaying(n, e));
        holeEl.addEventListener('mouseup', (e) => handleStopPlaying(n, e));
        holeEl.addEventListener('mouseleave', (e) => handleStopPlaying(n, e));
        holeEl.addEventListener('touchstart', (e) => handleStartPlaying(n, e), { passive: false });
        holeEl.addEventListener('touchend', (e) => handleStopPlaying(n, e), { passive: false });
        holeEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStartPlaying(n, e);
        });
        holeEl.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStopPlaying(n, e);
        });
        fluteVisualEl.appendChild(holeEl);

        // --- Create Vertical Flute Hole (Hand Grab Mode) ---
        const vHoleEl = document.createElement('div');
        vHoleEl.className = 'v-hole';
        vHoleEl.id = 'v-hole-' + n.key;
        vHoleEl.setAttribute('role', 'button');
        vHoleEl.setAttribute('aria-label', 'Play note ' + n.note);
        vHoleEl.tabIndex = 0;
        
        vHoleEl.addEventListener('mousedown', (e) => handleStartPlaying(n, e));
        vHoleEl.addEventListener('mouseup', (e) => handleStopPlaying(n, e));
        vHoleEl.addEventListener('mouseleave', (e) => handleStopPlaying(n, e));
        vHoleEl.addEventListener('touchstart', (e) => handleStartPlaying(n, e), { passive: false });
        vHoleEl.addEventListener('touchend', (e) => handleStopPlaying(n, e), { passive: false });
        vHoleEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStartPlaying(n, e);
        });
        vHoleEl.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStopPlaying(n, e);
        });
        verticalFluteEl.appendChild(vHoleEl);
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
        
        // DynamicsCompressor prevents clipping during polyphonic complex mode
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 20;
        compressor.ratio.value = 6;
        compressor.attack.value = 0.01;
        compressor.release.value = 0.3;
        
        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);

        // Generate 2 seconds of white noise
        const bufferSize = audioCtx.sampleRate * 2;
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        // PROFESSIONAL AUDIO TECHNIQUE: Crossfade loop point to prevent audible "clicking"
        const xfade = Math.floor(bufferSize * 0.05);
        for (let i = 0; i < xfade; i++) {
            const fade = i / xfade;
            const idx = bufferSize - xfade + i;
            data[idx] = data[idx] * (1 - fade) + data[i] * fade;
        }
    }

    // displayKey allows the audio tracking ID to differ from the visual key
    // isOverblowNote helps manage the Overblow button visual state
    // Advanced parameters allow profound musical realism (velocity, vibrato, breath, slide)
    function playNote(freq, key, displayKey = key, velocity = 1.0, vibratoDepth = 2.5, breathNoiseLevel = 0.04, slideDuration = 0.1, isOverblowNote = false) {
        if (activeNotes[key]) return;
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // SAFEGUARD: Ensure velocity doesn't hit exactly 0 to avoid exponential ramp errors
        velocity = Math.max(0.15, velocity);

        const now = audioCtx.currentTime;
        const attackTime = 0.15;
        const decayTime = 0.25;
        const sustainLevel = 0.3;

        // Main tone oscillator
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        
        // Slide/Portamento effect: start slightly flat and slide up to target freq (mimics breath attack)
        const startFreq = slideDuration > 0 ? freq * 0.97 : freq;
        osc.frequency.setValueAtTime(startFreq, now);
        if (slideDuration > 0) {
            osc.frequency.exponentialRampToValueAtTime(freq, now + slideDuration);
        } else {
            osc.frequency.setValueAtTime(freq, now);
        }

        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.linearRampToValueAtTime(0.5 * velocity, now + attackTime);
        oscGain.gain.exponentialRampToValueAtTime(sustainLevel * velocity, now + attackTime + decayTime);

        // Breath noise source
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter breath noise to mimic wooden chamber acoustics
        const bandpass = audioCtx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = Math.min(freq * 1.2, 2500);
        bandpass.Q.value = 1.0;

        const lowpass = audioCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 3500;

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, now);
        // Tie breath noise dynamically to velocity (louder notes = more breath)
        noiseGain.gain.linearRampToValueAtTime(breathNoiseLevel * velocity, now + attackTime);
        noiseGain.gain.exponentialRampToValueAtTime(breathNoiseLevel * 0.6 * velocity, now + attackTime + decayTime);

        // LFO for Vibrato (fades in during sustain, mimicking human player)
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 5.5; // Natural flute vibrato rate ~5.5 Hz
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(0, now);
        // Vibrato depth is in Hz deviation, controlled by parameter (0 is safely inactive)
        lfoGain.gain.linearRampToValueAtTime(vibratoDepth, now + attackTime + decayTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // Routing
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        whiteNoise.connect(bandpass);
        bandpass.connect(lowpass);
        lowpass.connect(noiseGain);
        noiseGain.connect(masterGain);

        osc.start(now);
        whiteNoise.start(now);
        lfo.start(now);

        activeNotes[key] = { osc, whiteNoise, lfo, oscGain, noiseGain, lfoGain, lowpass, bandpass, displayKey, isOverblowNote };
        
        // Update visuals: Keyboard button lights up based on exact 'key' (a-;)
        const keyEl = document.getElementById('key-' + key);
        if (keyEl) keyEl.classList.add('active');
        
        // Flute holes light up based on 'displayKey' (the physical hole)
        const holeEl = document.getElementById('hole-' + displayKey);
        const vHoleEl = document.getElementById('v-hole-' + displayKey);
        
        // Apply red color if it's an overblow note, otherwise standard gold
        if (holeEl) {
            if (isOverblowNote) holeEl.classList.add('active-overblow');
            else holeEl.classList.add('active');
        }
        if (vHoleEl) {
            if (isOverblowNote) vHoleEl.classList.add('active-overblow');
            else vHoleEl.classList.add('active');
        }
        
        // If the note played is an overblow, light up the Overblow button
        if (isOverblowNote) {
            overblowBtn.classList.add('active');
        }
    }

    function stopNote(key, displayKey = key) {
        const note = activeNotes[key];
        if (!note) return;
        
        const now = audioCtx.currentTime;
        const releaseTime = 0.6;

        // Smooth release envelopes
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

        // MEMORY MANAGEMENT: Explicitly disconnect nodes after they stop to prevent garbage collection leaks
        setTimeout(() => {
            note.osc.disconnect();
            note.oscGain.disconnect();
            note.whiteNoise.disconnect();
            note.bandpass.disconnect();
            note.lowpass.disconnect();
            note.noiseGain.disconnect();
            note.lfo.disconnect();
            note.lfoGain.disconnect();
        }, (releaseTime + 0.1) * 1000);

        delete activeNotes[key];

        // Remove visual from the specific keyboard key
        const keyEl = document.getElementById('key-' + key);
        if (keyEl) keyEl.classList.remove('active');

        // Check if the physical hole should be cleared (only if no other notes are using it)
        const isDisplayKeyStillActive = Object.values(activeNotes).some(n => n.displayKey === displayKey);
        if (!isDisplayKeyStillActive) {
            const holeEl = document.getElementById('hole-' + displayKey);
            const vHoleEl = document.getElementById('v-hole-' + displayKey);
            
            if (holeEl) {
                holeEl.classList.remove('active');
                holeEl.classList.remove('active-overblow');
            }
            if (vHoleEl) {
                vHoleEl.classList.remove('active');
                vHoleEl.classList.remove('active-overblow');
            }
        }

        // Overblow button cleanup
        const isAnyOverblowActive = Object.values(activeNotes).some(n => n.isOverblowNote);
        if (!isAnyOverblowActive && !isOverblowing) {
            overblowBtn.classList.remove('active');
        }
    }

    // === Unified Visual Cleanup ===
    function clearAllVisuals() {
        // Remove active class from ALL keys and holes
        document.querySelectorAll('.key').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.hole').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('active-overblow');
        });
        document.querySelectorAll('.v-hole').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('active-overblow');
        });
        // Also clear overblow button
        overblowBtn.classList.remove('active');
    }

    // === Simple Random Melody ===
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
        clearAllVisuals(); // Ensure visuals are clean
        randomBtn.classList.remove('active');
        randomBtn.innerHTML = '\u{1F3B5}  \u0628\u062F\u0627\u0647\u0647 \u062A\u06A9 \u062F\u06A9\u0645\u0647  ';
    }

    function playSoothingMelody() {
        if (isRandomPlaying) { stopRandomPlay(); return; }
        if (isComplexPlaying) stopComplexPlay();
        
        isRandomPlaying = true;
        initAudio();
        randomBtn.classList.add('active');
        randomBtn.innerHTML = '\u23F9 \u062A\u0648\u0642\u0641';

        const soothingNotes = [
            { key: ';', weight: 4 }, { key: 'l', weight: 2 },
            { key: 'k', weight: 3 }, { key: 'j', weight: 3 },
            { key: 'h', weight: 4 }, { key: 'g', weight: 2 }
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
            // Updated to pass new parameters correctly
            playNote(noteData.freq, noteData.key, noteData.baseKey, 1.0, complexParams.vibratoDepth, complexParams.breathNoiseLevel, complexParams.slideDuration, noteData.isOverblow);
            randomPlayTimeout = setTimeout(() => {
                stopNote(noteData.key, noteData.baseKey);
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

    // Used to track motifs for repetition
    let lastMotif = []; 

    // HARMONY MAP: Separated base harmonies and overblow harmonies.
    // Flute physics dictate a normal and overblow cannot be played together.
    const harmonyMap = {
        // Base note harmonies (mapped to other base notes)
        ';': ['j', 'g'], 'l': ['h'], 'k': ['h', 'g'],
        'j': [';', 'g'], 'h': ['k'], 'g': ['j', 'k'],
        // Overblow harmonies (mapped to other overblows)
        'f': ['a'], 'd': ['s', 'a'], 's': ['d', 'f'], 'a': ['f', 'd']
    };

    function pickHarmony(melodyKey) {
        const options = harmonyMap[melodyKey];
        if (!options || options.length === 0) return null;
        // SAFEGUARD: Filter harmony options to strictly match the overblow register of the melody note.
        const melodyIsOverblow = NOTES.find(n => n.key === melodyKey).isOverblow;
        const validOptions = options.filter(optKey => {
            const optNote = NOTES.find(n => n.key === optKey);
            return optNote && optNote.isOverblow === melodyIsOverblow;
        });
        if (validOptions.length === 0) return null;
        return validOptions[Math.floor(Math.random() * validOptions.length)];
    }

    // === Unified Dynamic Complex Play Parameters State ===
    const defaultParams = {
        phraseLength: 6,
        harmonyChance: 45,
        tempo: 1.0,
        restDuration: 2900,
        droneDuration: 11500,
        droneContinueChance: 60,
        contourBias: 0,
        vibratoDepth: 2.5,
        breathNoiseLevel: 0.04,
        slideDuration: 0.1,
        dynamicVariation: 0,
        motifRepeatChance: 0,
        graceNoteChance: 0,
        rhythmicVariation: 0,
        dynamicRange: 0
    };

    const complexParams = { ...defaultParams };

    // === Browser Cache (localStorage) Persistence ===
    const CACHE_KEY = 'lakotaFluteComplexParams';
    const CACHE_STATUS_DURATION = 1500; // ms to show "✓ Saved" indicator
    let cacheStatusTimeout = null;

    // Read all parameters from browser cache on startup
    function loadParamsFromCache() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                let loadedCount = 0;
                for (const key in defaultParams) {
                    if (parsed[key] !== undefined && !isNaN(parsed[key])) {
                        complexParams[key] = parsed[key];
                        loadedCount++;
                    }
                }
                console.log('[Cache] Loaded ' + loadedCount + ' parameters from browser cache:', { ...complexParams });
            } else {
                console.log('[Cache] No cached parameters found. Using defaults:', { ...complexParams });
            }
        } catch (e) {
            console.warn('[Cache] Failed to load parameters from browser cache:', e);
        }
    }

    // Write the latest set values to browser cache
    function saveParamsToCache() {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(complexParams));
            console.log('[Cache] Saved latest parameters to browser cache:', { ...complexParams });
            showCacheStatus('✓ Saved');
        } catch (e) {
            console.warn('[Cache] Failed to save parameters to browser cache:', e);
            showCacheStatus('✗ Save failed');
        }
    }

    // Show a brief visual indicator that values were saved
    function showCacheStatus(message) {
        const statusEl = document.getElementById('cacheStatus');
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.add('visible');
        if (cacheStatusTimeout) clearTimeout(cacheStatusTimeout);
        cacheStatusTimeout = setTimeout(() => {
            statusEl.classList.remove('visible');
        }, CACHE_STATUS_DURATION);
    }

    // Sync all UI controls (sliders + number inputs) with the current complexParams values
    function syncUIWithParams() {
        for (const key in complexParams) {
            const slider = document.getElementById('slider-' + key);
            const numInput = document.getElementById('num-' + key);
            if (slider) slider.value = complexParams[key];
            if (numInput) numInput.value = complexParams[key];
        }
    }

    // Load cached params immediately after defining complexParams
    loadParamsFromCache();

    // === PRESETS CONFIGURATION ===
    const presets = {
        traditional: {
            phraseLength: 6,
            harmonyChance: 45,
            tempo: 1.0,
            restDuration: 2900,
            droneDuration: 11500,
            droneContinueChance: 60,
            contourBias: 0,
            vibratoDepth: 2.5,
            breathNoiseLevel: 0.04,
            slideDuration: 0.1,
            dynamicVariation: 0,
            motifRepeatChance: 0,
            graceNoteChance: 0,
            rhythmicVariation: 0,
            dynamicRange: 0
        },
        expressive: {
            phraseLength: 6,
            harmonyChance: 35,
            tempo: 1.0,
            restDuration: 2500,
            droneDuration: 10000,
            droneContinueChance: 50,
            contourBias: 0,
            vibratoDepth: 3.0,
            breathNoiseLevel: 0.025,
            slideDuration: 0.08,
            dynamicVariation: 30,
            motifRepeatChance: 0,
            graceNoteChance: 0,
            rhythmicVariation: 0,
            dynamicRange: 0
        },
        advanced: {
            phraseLength: 8,
            harmonyChance: 35,
            tempo: 1.0,
            restDuration: 2500,
            droneDuration: 12000,
            droneContinueChance: 65,
            contourBias: -20,
            vibratoDepth: 2.5,
            breathNoiseLevel: 0.04,
            slideDuration: 0.1,
            dynamicVariation: 0,
            motifRepeatChance: 35,
            graceNoteChance: 30,
            rhythmicVariation: 40,
            dynamicRange: 60
        }
    };

    function applyPreset(presetName, activeBtn) {
        const selectedPreset = presets[presetName];
        if (!selectedPreset) return;
        
        for (const key in selectedPreset) {
            complexParams[key] = selectedPreset[key];
        }
        
        syncUIWithParams();
        saveParamsToCache();
        
        // Update visual active state of preset buttons
        document.querySelectorAll('.preset-group .random-btn').forEach(btn => btn.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    function startDrone(noteKey) {
        if (currentDroneKey) stopDrone();
        const noteData = NOTES.find(n => n.key === noteKey);
        currentDroneKey = noteKey;
        // Drone uses steady velocity, moderate vibrato, low breath noise, and no slide
        // Updated to pass new parameters correctly
        playNote(noteData.freq, 'drone-' + noteKey, noteData.baseKey, 0.6, complexParams.vibratoDepth * 0.8, complexParams.breathNoiseLevel * 0.5, 0, noteData.isOverblow);

        const droneDuration = complexParams.droneDuration + (Math.random() * 1000 - 500);
        droneTimeout = setTimeout(() => {
            stopDrone();
            // Read dynamically from complexParams without pausing
            if (isComplexPlaying && Math.random() < (complexParams.droneContinueChance / 100)) {
                const droneOptions = [';', 'h', 'j'];
                const newDrone = droneOptions[Math.floor(Math.random() * droneOptions.length)];
                startDrone(newDrone);
            }
        }, droneDuration);
    }

    function stopDrone() {
        if (droneTimeout) { clearTimeout(droneTimeout); droneTimeout = null; }
        if (currentDroneKey) {
            const noteData = NOTES.find(n => n.key === currentDroneKey);
            stopNote('drone-' + currentDroneKey, noteData ? noteData.baseKey : currentDroneKey);
            currentDroneKey = null;
        }
    }

    function generateComplexPhrase() {
        // FLUTE PHYSICS ENFORCEMENT: If a drone is active, the melody must remain in the same register
        // (base or overblow) to prevent playing normal and overblow frequencies simultaneously.
        // Since drones are typically base notes, this naturally restricts the melody to base notes
        // while the drone is active, and allows overblows when the drone rests. This avoids sudden jumps.
        let melodyRange;
        if (currentDroneKey) {
            const droneIsOverblow = NOTES.find(n => n.key === currentDroneKey).isOverblow;
            melodyRange = NOTES.filter(n => n.isOverblow === droneIsOverblow).map(n => n.key);
        } else {
            // Full range available when no drone is active
            melodyRange = [';', 'l', 'k', 'j', 'h', 'g', 'f', 'd', 's', 'a'];
        }
        
        const length = Math.max(3, complexParams.phraseLength + Math.floor(Math.random() * 3) - 1);
        const phrase = [];
        
        let prevIdx = Math.floor(Math.random() * melodyRange.length);
        
        // MOTIF LOGIC: Decide if we are repeating the last motif
        let useMotif = complexParams.motifRepeatChance > 0 && Math.random() < (complexParams.motifRepeatChance / 100) && lastMotif.length >= 2;
        let motif = useMotif ? [...lastMotif] : [];
        let motifIdx = 0;
        
        for (let i = 0; i < length; i++) {
            let nextIdx;
            
            if (useMotif && motifIdx < motif.length) {
                // Repeat motif notes
                nextIdx = motif[motifIdx];
                motifIdx++;
            } else {
                // Generate new note based on contour bias
                const roll = Math.random();
                const bias = complexParams.contourBias / 100; // -1.0 (falling) to 1.0 (rising)
                
                // Improved probabilities: bias shifts the balance, but maintains musicality
                const stepUpProb = 0.50 + (bias * 0.30); // Ranges from 0.20 to 0.80
                const stepDownProb = stepUpProb + 0.35;   // Maintains a 35% band for stepping down
                
                if (roll < stepUpProb) {
                    nextIdx = Math.min(melodyRange.length - 1, prevIdx + 1);
                } else if (roll < stepDownProb) {
                    nextIdx = Math.max(0, prevIdx - 1);
                } else {
                    // Random leap (15% chance base)
                    nextIdx = Math.floor(Math.random() * melodyRange.length);
                }
            }
            
            // Store the first 3 notes of this phrase as the new motif
            if (i < 3) {
                if (i === 0) lastMotif = [];
                lastMotif.push(nextIdx);
            }
            
            const noteKey = melodyRange[nextIdx];
            
            // Harmony generation
            let harmonyKey = null;
            if (Math.random() < (complexParams.harmonyChance / 100) && nextIdx < melodyRange.length - 1) {
                harmonyKey = pickHarmony(noteKey);
            }
            
            // RHYTHMIC VARIATION LOGIC: Introduce swing and dotted notes
            const baseBeat = 600 / complexParams.tempo; 
            let rhythmMultiplier = 1.0;
            
            const variation = complexParams.rhythmicVariation / 100;
            // SAFEGUARD: Only apply variation if parameter is > 0
            if (variation > 0) {
                const swingRoll = Math.random();
                if (i === 0 || i === length - 1) {
                    rhythmMultiplier = 1.5 + (Math.random() * variation);
                } else {
                    if (swingRoll < (0.3 * variation)) {
                        rhythmMultiplier = 0.5; // Syncopated short note
                    } else if (swingRoll < (0.6 * variation)) {
                        rhythmMultiplier = 1.5; // Dotted note feel
                    } else {
                        rhythmMultiplier = 1.0; // Standard beat
                    }
                }
            }
            const duration = baseBeat * rhythmMultiplier;
            
            // DYNAMIC LOGIC: Combine phrase shape (dynamicRange) with random variation (dynamicVariation)
            const dynRange = complexParams.dynamicRange / 100;
            const dynVar = complexParams.dynamicVariation / 100;
            
            let velocity = 1.0; // Default steady velocity
            
            // SAFEGUARD: Only apply dynamics if parameters are > 0
            if (dynRange > 0 || dynVar > 0) {
                const phase = (i / Math.max(1, length - 1)) * Math.PI; // 0 to PI
                velocity = 0.7 + 0.3 * Math.sin(phase); // Peaks at 1.0 in middle
                
                // Apply dynamic range shaping
                velocity = 1.0 - (dynRange * (1.0 - velocity));
                
                // Apply random dynamic variation
                const randomVar = (Math.random() * dynVar * 2) - dynVar;
                velocity = velocity + randomVar;
            }
            
            // SAFEGUARD: Clamp to avoid silence (0) or clipping (>1.0)
            velocity = Math.max(0.15, Math.min(1.0, velocity));
            
            const noteObj = { noteKey, harmonyKey, duration, velocity };
            
            // GRACE NOTE LOGIC: Add a fast grace note right before the main note
            if (complexParams.graceNoteChance > 0 && Math.random() < (complexParams.graceNoteChance / 100) && i < length - 1) {
                // Grace note is usually a step above or below the main note
                let graceIdx = nextIdx > 0 ? nextIdx - 1 : nextIdx + 1;
                const mainNote = NOTES.find(n => n.key === melodyRange[nextIdx]);
                const graceNote = NOTES.find(n => n.key === melodyRange[graceIdx]);
                
                // FLUTE PHYSICS ENFORCEMENT: Grace note must not cross the overblow register boundary
                if (mainNote && graceNote && mainNote.isOverblow === graceNote.isOverblow) {
                    noteObj.graceKey = melodyRange[graceIdx];
                }
            }
            
            phrase.push(noteObj);
            prevIdx = nextIdx;
        }
        return phrase;
    }

    function scheduleComplexPhrase() {
        if (!isComplexPlaying) return;
        
        const phrase = generateComplexPhrase();
        let delay = 0;
        
        phrase.forEach((note) => {
            // Handle Grace Note
            if (note.graceKey) {
                setTimeout(() => {
                    if (!isComplexPlaying) return;
                    const graceData = NOTES.find(n => n.key === note.graceKey);
                    const gId = 'grace-' + (noteCounter++);
                    // Grace notes are quick, light, with minimal vibrato/breath and a tiny slide
                    // Updated to pass new parameters correctly
                    playNote(graceData.freq, gId, graceData.baseKey, note.velocity * 0.8, complexParams.vibratoDepth * 0.3, complexParams.breathNoiseLevel * 0.5, 0.02, graceData.isOverblow);
                    setTimeout(() => {
                        if (activeNotes[gId]) stopNote(gId, graceData.baseKey);
                    }, 120 / complexParams.tempo); // Very short duration based on tempo
                }, delay);
                delay += 120 / complexParams.tempo; // Add grace note duration to delay before main note
            }

            // Schedule melody note
            setTimeout(() => {
                if (!isComplexPlaying) return;
                const noteData = NOTES.find(n => n.key === note.noteKey);
                const id = 'melody-' + (noteCounter++);
                // Updated to pass new parameters correctly
                playNote(
                    noteData.freq, 
                    id, 
                    noteData.baseKey, 
                    note.velocity, 
                    complexParams.vibratoDepth, 
                    complexParams.breathNoiseLevel, 
                    complexParams.slideDuration, 
                    noteData.isOverblow
                );
                setTimeout(() => {
                    if (activeNotes[id]) stopNote(id, noteData.baseKey);
                }, note.duration * 0.9);
            }, delay);
            
            // Schedule harmony note simultaneously
            if (note.harmonyKey) {
                setTimeout(() => {
                    if (!isComplexPlaying) return;
                    const harmData = NOTES.find(n => n.key === note.harmonyKey);
                    const id = 'harmony-' + (noteCounter++);
                    // Harmony is voiced softer, with reduced vibrato and no slide, to support the melody
                    // Updated to pass new parameters correctly
                    playNote(
                        harmData.freq, 
                        id, 
                        harmData.baseKey, 
                        note.velocity * 0.6, 
                        complexParams.vibratoDepth * 0.5, 
                        complexParams.breathNoiseLevel * 0.8, 
                        0, 
                        harmData.isOverblow
                    );
                    setTimeout(() => {
                        if (activeNotes[id]) stopNote(id, harmData.baseKey);
                    }, note.duration * 0.85);
                }, delay);
            }
            
            delay += note.duration + 80;
        });
        
        // Rest between phrases: Read dynamically from complexParams with slight organic variance
        const restDuration = complexParams.restDuration + (Math.random() * 400 - 200);
        complexPlayTimeout = setTimeout(() => {
            if (isComplexPlaying) scheduleComplexPhrase();
        }, delay + restDuration);
    }

    function stopComplexPlay() {
        isComplexPlaying = false;
        noteCounter = 0; // FIX: Reset infinite counter to prevent unbounded memory growth
        lastMotif = []; // Reset motif memory
        if (complexPlayTimeout) { clearTimeout(complexPlayTimeout); complexPlayTimeout = null; }
        stopDrone();

        Object.keys(activeNotes).forEach(key => {
            stopNote(key);
        });

        clearAllVisuals();
        
        complexBtn.classList.remove('active');
        complexBtn.innerHTML = '🎼 بداهه پیچیده ';
    }

    function playComplexMelody() {
        if (isComplexPlaying) { stopComplexPlay(); return; }
        if (isRandomPlaying) stopRandomPlay();
        
        isComplexPlaying = true;
        initAudio();
        complexBtn.classList.add('active');
        complexBtn.innerHTML = '⏹ توقف';
        
        // Start with a drone
        const droneOptions = [';', 'h', 'j'];
        const initialDrone = droneOptions[Math.floor(Math.random() * droneOptions.length)];
        startDrone(initialDrone);
        
        // Begin phrase scheduling after a short delay
        complexPlayTimeout = setTimeout(() => {
            if (isComplexPlaying) scheduleComplexPhrase();
        }, 800);
    }

    complexBtn.addEventListener('click', () => { initAudio(); playComplexMelody(); });

    // === Parameters Menu Logic ===
    const paramsToggleBtn = document.getElementById('paramsToggleBtn');
    const paramsMenu = document.getElementById('paramsMenu');
    
    paramsToggleBtn.addEventListener('click', () => {
        paramsMenu.classList.toggle('open');
        // Toggle active state on the small params button for visual feedback
        paramsToggleBtn.classList.toggle('active');
    });

    function bindParamControl(paramKey, sliderId, numId, min, max, step) {
        const slider = document.getElementById(sliderId);
        const numInput = document.getElementById(numId);
        
        const updateValue = (val) => {
            let parsed = parseFloat(val);
            if (isNaN(parsed)) parsed = complexParams[paramKey];
            // Clamp value
            parsed = Math.max(min, Math.min(max, parsed));
            
            complexParams[paramKey] = parsed;
            slider.value = parsed;
            numInput.value = parsed;

            saveParamsToCache();
            
            // Clear active state from presets since manual change diverges from the preset
            document.querySelectorAll('.preset-group .random-btn').forEach(btn => btn.classList.remove('active'));
        };
        
        slider.addEventListener('input', (e) => updateValue(e.target.value));
        numInput.addEventListener('change', (e) => updateValue(e.target.value));
    }

    // Bind all parameter controls (unified from all iterations)
    bindParamControl('phraseLength', 'slider-phraseLength', 'num-phraseLength', 4, 16, 1);
    bindParamControl('tempo', 'slider-tempo', 'num-tempo', 0.3, 3.0, 0.1);
    bindParamControl('restDuration', 'slider-restDuration', 'num-restDuration', 500, 6000, 100);
    bindParamControl('harmonyChance', 'slider-harmonyChance', 'num-harmonyChance', 0, 100, 5);
    bindParamControl('contourBias', 'slider-contourBias', 'num-contourBias', -100, 100, 10);
    bindParamControl('motifRepeatChance', 'slider-motifRepeatChance', 'num-motifRepeatChance', 0, 100, 5);
    bindParamControl('graceNoteChance', 'slider-graceNoteChance', 'num-graceNoteChance', 0, 100, 5);
    bindParamControl('rhythmicVariation', 'slider-rhythmicVariation', 'num-rhythmicVariation', 0, 100, 5);
    bindParamControl('dynamicRange', 'slider-dynamicRange', 'num-dynamicRange', 0, 100, 5);
    bindParamControl('dynamicVariation', 'slider-dynamicVariation', 'num-dynamicVariation', 0, 60, 5);
    bindParamControl('droneDuration', 'slider-droneDuration', 'num-droneDuration', 5000, 20000, 500);
    bindParamControl('droneContinueChance', 'slider-droneContinueChance', 'num-droneContinueChance', 0, 100, 5);
    bindParamControl('vibratoDepth', 'slider-vibratoDepth', 'num-vibratoDepth', 0, 8, 0.5);
    bindParamControl('breathNoiseLevel', 'slider-breathNoiseLevel', 'num-breathNoiseLevel', 0, 0.08, 0.005);
    bindParamControl('slideDuration', 'slider-slideDuration', 'num-slideDuration', 0, 0.25, 0.01);

    // Preset Button Event Listeners
    document.getElementById('preset1Btn').addEventListener('click', (e) => applyPreset('traditional', e.currentTarget));
    document.getElementById('preset2Btn').addEventListener('click', (e) => applyPreset('expressive', e.currentTarget));
    document.getElementById('preset3Btn').addEventListener('click', (e) => applyPreset('advanced', e.currentTarget));

    // ensures sliders/inputs reflect the cached values, not just HTML defaults
    syncUIWithParams();

    // === Source Button Logic ===
    document.getElementById('sourceBtn').addEventListener('click', () => {
        window.open('https://github.com/mhdsedighi/lakota', '_blank');
    });

    // === Hand Grab Mode Toggle Logic ===
    const handGrabModeBtn = document.getElementById('handGrabModeBtn');
    const backBtn = document.getElementById('backBtn');
    let isHandGrabMode = false;
    
    function toggleHandGrabMode() {
        isHandGrabMode = !isHandGrabMode;
        if (isHandGrabMode) {
            document.body.classList.add('hand-grab-mode');
        } else {
            document.body.classList.remove('hand-grab-mode');
        }
    }
    
    handGrabModeBtn.addEventListener('click', toggleHandGrabMode);
    backBtn.addEventListener('click', toggleHandGrabMode);

    // === Global Event Listeners ===
    window.addEventListener('keydown', (e) => {
        // Prevent typing in inputs from triggering flute notes
        if (e.target.tagName === 'INPUT') return;
        
        // Shift key acts as Overblow modifier
        if (e.key === 'Shift') {
            if (!isOverblowing) startOverblow(e);
            return;
        }
        
        const key = e.key.toLowerCase();
        const noteData = NOTES.find(n => n.key === key);
        if (noteData) {
            e.preventDefault();
            if (isRandomPlaying) stopRandomPlay();
            if (isComplexPlaying) stopComplexPlay();
            
            // If Shift is held, and it's a base note, find the overblow equivalent
            if (isOverblowing && !noteData.isOverblow) {
                const overNote = NOTES.find(on => on.baseKey === noteData.key && on.isOverblow);
                if (overNote) {
                    playNote(overNote.freq, overNote.key, overNote.baseKey, 1.0, complexParams.vibratoDepth, complexParams.breathNoiseLevel, complexParams.slideDuration, true);
                    return;
                }
            }
            
            // Normal play
            playNote(noteData.freq, noteData.key, noteData.baseKey, 1.0, complexParams.vibratoDepth, complexParams.breathNoiseLevel, complexParams.slideDuration, noteData.isOverblow);
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        // Release Shift key
        if (e.key === 'Shift') {
            stopOverblow(e);
            return;
        }
        
        const key = e.key.toLowerCase();
        const noteData = NOTES.find(n => n.key === key);
        if (noteData) {
            // If we played an overblow via Shift, stop the overblow note specifically
            if (isOverblowing && !noteData.isOverblow) {
                const overNote = NOTES.find(on => on.baseKey === noteData.key && on.isOverblow);
                if (overNote) {
                    stopNote(overNote.key, overNote.baseKey);
                    return;
                }
            }
            stopNote(noteData.key, noteData.baseKey);
        }
    });

    // STUCK-NOTE PREVENTION: Stop all notes if user switches tabs/windows
    window.addEventListener('blur', () => {
        if (!isRandomPlaying && !isComplexPlaying) {
            Object.keys(activeNotes).forEach(key => stopNote(key));
            clearAllVisuals();
            // Also reset overblow state on blur
            isOverblowing = false;
            overblowBtn.classList.remove('active');
        }
    });

    // AUTOPLAY POLICY COMPLIANCE: Initialize audio context on first user interaction
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('touchstart', initAudio, { once: true });
    document.body.addEventListener('keydown', initAudio, { once: true });
<\/script>
</body>
</html>`;
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-cache, must-revalidate",
        "cf-cache-status": "BYPASS"
      }
    });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map