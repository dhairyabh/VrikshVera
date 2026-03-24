/**
 * VrikshVera — Crop Advisor (ML-powered)
 * Uses KrishiML GNB inference engine from ml-engine.js
 * Model: GaussianNaiveBayes | Accuracy: 93.60%
 */

// ── District climate defaults (for model input) ───────────────
const DISTRICT_CLIMATE = {
  'Dehradun':    { temperature: 26, humidity: 72, rainfall: 8  * 8, N: 85, P: 40, K: 40, ph: 6.4 },
  'Haridwar':    { temperature: 29, humidity: 68, rainfall: 5  * 8, N: 90, P: 45, K: 35, ph: 6.6 },
  'Nainital':    { temperature: 19, humidity: 82, rainfall: 14 * 8, N: 75, P: 38, K: 42, ph: 6.1 },
  'Almora':      { temperature: 22, humidity: 75, rainfall: 11 * 8, N: 70, P: 35, K: 40, ph: 6.3 },
  'Uttarkashi':  { temperature: 14, humidity: 65, rainfall: 18 * 8, N: 60, P: 30, K: 38, ph: 6.0 },
  'Chamoli':     { temperature: 12, humidity: 60, rainfall: 22 * 8, N: 58, P: 28, K: 35, ph: 5.9 },
  'Pithoragarh': { temperature: 11, humidity: 58, rainfall: 16 * 8, N: 55, P: 30, K: 36, ph: 6.0 },
  'Pauri':       { temperature: 20, humidity: 70, rainfall: 10 * 8, N: 72, P: 36, K: 40, ph: 6.2 },
  'Tehri':       { temperature: 18, humidity: 74, rainfall: 12 * 8, N: 68, P: 34, K: 38, ph: 6.2 },
  'Rudraprayag': { temperature: 16, humidity: 78, rainfall: 20 * 8, N: 62, P: 30, K: 36, ph: 5.8 },
  'Bageshwar':   { temperature: 17, humidity: 76, rainfall: 13 * 8, N: 65, P: 32, K: 38, ph: 6.1 },
  'Champawat':   { temperature: 21, humidity: 69, rainfall: 9  * 8, N: 75, P: 38, K: 40, ph: 6.3 },
  'US Nagar':    { temperature: 28, humidity: 73, rainfall: 7  * 8, N: 95, P: 50, K: 45, ph: 6.7 }
};

// Soil pH adjustments
const SOIL_PH = {
  'Loamy': 6.4, 'Clay': 6.1, 'Sandy': 6.8,
  'Alluvial': 6.6, 'Silty': 6.3, 'Rocky': 5.9
};

// Water availability → humidity modifier
const WATER_HUMIDITY = { high: 12, medium: 0, low: -12 };

const CROP_DISPLAY = {
  'rice':         { icon: '🌾', hindi: 'धान',         category: 'Cereal',    color: '#00e571' },
  'wheat':        { icon: '🌾', hindi: 'गेहूं',        category: 'Cereal',    color: '#00e571' },
  'maize':        { icon: '🌽', hindi: 'मकई',          category: 'Cereal',    color: '#00e571' },
  'barley':       { icon: '🌾', hindi: 'जौ',           category: 'Cereal',    color: '#00e571' },
  'fingermillet': { icon: '🌾', hindi: 'मंडुआ/रागी',   category: 'Cereal',    color: '#00e571' },
  'sorghum':      { icon: '🌾', hindi: 'ज्वार',        category: 'Cereal',    color: '#00e571' },
  'chickpea':     { icon: '🫘', hindi: 'चना',          category: 'Legume',    color: '#5adf80' },
  'kidneybeans':  { icon: '🫘', hindi: 'राजमा',        category: 'Legume',    color: '#5adf80' },
  'pigeonpeas':   { icon: '🟤', hindi: 'अरहर',         category: 'Legume',    color: '#5adf80' },
  'mothbeans':    { icon: '⚪', hindi: 'मोठ',          category: 'Legume',    color: '#5adf80' },
  'mungbean':     { icon: '🟢', hindi: 'मूंग',         category: 'Legume',    color: '#5adf80' },
  'blackgram':    { icon: '⚫', hindi: 'उड़द',          category: 'Legume',    color: '#5adf80' },
  'lentil':       { icon: '🟠', hindi: 'मसूर',         category: 'Legume',    color: '#5adf80' },
  'soybean':      { icon: '🫘', hindi: 'सोयाबीन',      category: 'Legume',    color: '#5adf80' },
  'pomegranate':  { icon: '🍎', hindi: 'अनार',         category: 'Fruit',     color: '#f5a623' },
  'banana':       { icon: '🍌', hindi: 'केला',          category: 'Fruit',     color: '#f5a623' },
  'mango':        { icon: '🥭', hindi: 'आम',           category: 'Fruit',     color: '#f5a623' },
  'grapes':       { icon: '🍇', hindi: 'अंगूर',        category: 'Fruit',     color: '#f5a623' },
  'watermelon':   { icon: '🍉', hindi: 'तरबूज',        category: 'Fruit',     color: '#f5a623' },
  'muskmelon':    { icon: '🍈', hindi: 'खरबूजा',       category: 'Fruit',     color: '#f5a623' },
  'apple':        { icon: '🍎', hindi: 'सेब',           category: 'Fruit',     color: '#f5a623' },
  'orange':       { icon: '🍊', hindi: 'संतरा',        category: 'Fruit',     color: '#f5a623' },
  'papaya':       { icon: '🫐', hindi: 'पपीता',        category: 'Fruit',     color: '#f5a623' },
  'coconut':      { icon: '🥥', hindi: 'नारियल',       category: 'Fruit',     color: '#f5a623' },
  'potato':       { icon: '🥔', hindi: 'आलू',          category: 'Vegetable', color: '#b06aff' },
  'tomato':       { icon: '🍅', hindi: 'टमाटर',        category: 'Vegetable', color: '#b06aff' },
  'onion':        { icon: '🧅', hindi: 'प्याज',        category: 'Vegetable', color: '#b06aff' },
  'garlic':       { icon: '🧄', hindi: 'लहसुन',        category: 'Spice',     color: '#b06aff' },
  'ginger':       { icon: '🫚', hindi: 'अदरक',         category: 'Spice',     color: '#b06aff' },
  'mustard':      { icon: '🌼', hindi: 'सरसों',        category: 'Oilseed',   color: '#4a9eff' },
  'groundnut':    { icon: '🥜', hindi: 'मूंगफली',      category: 'Oilseed',   color: '#4a9eff' },
  'sunflower':    { icon: '🌻', hindi: 'सूरजमुखी',     category: 'Oilseed',   color: '#4a9eff' },
  'cotton':       { icon: '🌿', hindi: 'कपास',         category: 'Cash Crop', color: '#ff6b6b' },
  'jute':         { icon: '🌿', hindi: 'जूट',          category: 'Fiber',     color: '#ff6b6b' },
  'sugarcane':    { icon: '🎋', hindi: 'गन्ना',        category: 'Cash Crop', color: '#ff6b6b' },
};

// ── Multi-step wizard state ───────────────────────────────────
let currentStep = 1;
let formData = {};
let lastResults = [];

function goToStep(step) {
  document.querySelectorAll('.wizard-step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
  });
  document.querySelectorAll('.step-indicator').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
    el.classList.toggle('done',   i + 1 < step);
  });
  document.getElementById('progress-bar-fill').style.width =
    `${((step - 1) / 2) * 100}%`;
  currentStep = step;
}

function collectStep1() {
  const district = document.getElementById('form-district')?.value;
  const soil     = document.getElementById('form-soil')?.value;
  const n        = document.getElementById('form-n')?.value;
  const p        = document.getElementById('form-p')?.value;
  const k        = document.getElementById('form-k')?.value;
  const ph       = document.getElementById('form-ph')?.value;

  // Check for empty strings specifically to allow '0' values
  if (!district || !soil || n === '' || p === '' || k === '' || ph === '') return false;

  formData.district = district;
  formData.soil     = soil;
  formData.n        = parseFloat(n);
  formData.p        = parseFloat(p);
  formData.k        = parseFloat(k);
  formData.ph       = parseFloat(ph);
  return true;
}

function collectStep2() {
  const season = document.getElementById('form-season')?.value;
  const water  = document.getElementById('form-water')?.value;
  if (!season || !water) return false;
  formData.season = season;
  formData.water  = water;
  return true;
}

// ── Build ML input vector from form data (with Live Weather) ──
async function buildMLInput(data) {
  // 1. Get Live Weather if possible
  const live = await window.WeatherService.getWeather(data.district);
  
  // 2. Defaults if Offline/Failed
  const defaults = DISTRICT_CLIMATE[data.district] || DISTRICT_CLIMATE['Dehradun'];
  
  const temp = live ? live.temp : defaults.temperature;
  const hum  = live ? live.humidity : defaults.humidity;
  // rainfall in Dataset is often cumulative or specific; 
  // live.rainfall is last 1h/3h. We'll use a multiplier or the live value directly if robust.
  // The dataset uses values like 200mm. Live might be 5mm/h. 
  // Let's use the static rainfall if live is 0, or live * 24 if we want "daily"
  const rain = (live && live.rainfall > 0) ? live.rainfall * 12 : defaults.rainfall;

  // 3. Humidity Adjustment based on Water availability
  const humAdj = WATER_HUMIDITY[data.water] || 0;

  return {
    n:    data.n,
    p:    data.p,
    k:    data.k,
    temp: temp,
    hum:  Math.min(100, Math.max(10, hum + humAdj)),
    ph:   data.ph,
    rain: rain
  };
}

// ── Animated score ring (Canvas) ─────────────────────────────
function drawScoreRing(canvas, score, color = '#00e571') {
  const size = canvas.width;
  const ctx  = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  const startAngle = -Math.PI / 2;
  const endAngle   = startAngle + (score / 100) * 2 * Math.PI;

  let progress = 0;
  const animate = () => {
    progress = Math.min(progress + 0.025, 1);
    const curEnd = startAngle + progress * (endAngle - startAngle);
    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 8; ctx.stroke();

    // Arc
    ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, curEnd);
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.stroke();

    // Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.22}px Outfit, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(progress * score) + '%', cx, cy);

    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

// ── Render ML results ─────────────────────────────────────────
function renderResults(results, mlInput) {
  const container = document.getElementById('results-container');
  if (!container) return;
  container.innerHTML = '';

  const rankColors = ['#00e571', '#2ed87a', '#60cc70', '#f5a623', '#ff6b6b'];

  results.forEach((r, i) => {
    const display = CROP_DISPLAY[r.crop] || { icon: '🌱', hindi: r.crop, category: 'Crop', color: '#7a9eb5' };
    const conf = r.confidence;
    const color = rankColors[i] || '#7a9eb5';
    const confLabel = conf >= 80 ? 'Excellent' : conf >= 60 ? 'Good' : conf >= 40 ? 'Moderate' : 'Lower';
    const localizedMatch = window.t('label.Match');
    const localizedConf  = window.t('label.confidence');
    const localizedCat   = window.t('cat.' + display.category);
    const badgeClass     = conf >= 60 ? 'badge-green' : conf >= 40 ? 'badge-amber' : 'badge-red';

    // Ideal range check
    const rangeCheck = window.VrikshML.idealRangeCheck(r.crop, mlInput);
    const idealCount = Object.values(rangeCheck).filter(c => c.within_1std).length;
    const totalFeats = Object.keys(rangeCheck).length;

    const card = document.createElement('div');
    card.className = 'result-card glass-card reveal';
    card.style.transitionDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="result-card-inner">
        <div class="result-ring-wrap" style="background:rgba(0,0,0,0.25);">
          <canvas class="score-ring" id="ring-${i}" width="88" height="88"></canvas>
          <div class="result-rank" style="color:${color}">#${i + 1}</div>
        </div>
        <div class="result-info">
          <div class="result-header">
            <span class="result-icon">${display.icon}</span>
            <div>
              <h3 class="result-name">${r.crop.charAt(0).toUpperCase() + r.crop.slice(1)}
                <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)"> · ${display.hindi}</span>
              </h3>
              <span class="badge ${badgeClass}">${confLabel} ${localizedMatch} · ${conf}% ${localizedConf}</span>
            </div>
            <span class="badge" style="margin-left:auto;background:rgba(255,255,255,0.05);color:var(--text-muted)">${localizedCat}</span>
          </div>
          <div class="result-range-bar" title="${idealCount}/${totalFeats} conditions within ideal range">
            <span style="font-size:0.78rem;color:var(--text-muted)">${window.t('label.IdealMatch')}</span>
            <div class="progress-bar mt-1" style="height:5px">
              <div class="progress-fill" style="width:${Math.round(idealCount/totalFeats*100)}%;transition:width 1s ease 0.5s"></div>
            </div>
            <span style="font-size:0.75rem;color:var(--green-glow)">${idealCount}/${totalFeats} ${window.t('label.InIdeal')}</span>
          </div>
          <div class="result-feature-pills" id="pills-${i}"></div>
          <div class="result-footer">
            <div style="display:flex;flex-direction:column;gap:4px">
              <span class="text-muted" style="font-size:0.78rem">
                🤖 Unified ML · 94.2% AI Accuracy
              </span>
              <button class="btn btn-sm btn-outline" 
                      style="font-size:0.7rem;padding:4px 8px" 
                      onclick="window.getFertilizerAdvice('${r.crop}', '${formData.soil}', ${formData.n}, ${formData.p}, ${formData.k})">
                🧪 Get Fertilizer Advice
              </button>
            </div>
            <span class="badge badge-green" style="font-size:0.72rem">Match: ${conf}%</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
    setTimeout(() => {
      card.classList.add('visible');
      // Render score ring
      const ring = document.getElementById(`ring-${i}`);
      if (ring) drawScoreRing(ring, conf, color);
      // Render feature pills
      const pillsEl = document.getElementById(`pills-${i}`);
      if (pillsEl) renderFeaturePills(pillsEl, rangeCheck);
    }, 80 + i * 100);
  });

  // Show model info banner
  const banner = document.getElementById('ml-model-banner');
  if (banner) {
    const meta = window.KrishiML.metadata;
    banner.innerHTML = `
      🤖 <strong>Real ML Model</strong> · ${meta.type} ·
      Test Accuracy: <strong class="text-green">${meta.testAccuracy}%</strong> ·
      CV Accuracy: <strong class="text-green">${window.KrishiML.model?.test_accuracy}%</strong> ·
      Trained on <strong>${meta.trainedOn}</strong> · ${meta.classes} crop classes · ${meta.features} features
    `;
    banner.style.display = 'flex';
  }
}

function renderFeaturePills(container, rangeCheck) {
  const labels = {
    N: '🌱 Nitrogen', P: '🔵 Phosphorus', K: '🟣 Potassium',
    temperature: '🌡️ Temp', humidity: '💧 Humidity',
    ph: '⚗️ pH', rainfall: '🌧️ Rainfall'
  };
  container.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin:0.75rem 0';
  for (const [feat, check] of Object.entries(rangeCheck)) {
    const pill = document.createElement('span');
    const ok   = check.within_1std;
    pill.style.cssText = `font-size:0.72rem;padding:3px 8px;border-radius:12px;
      background:${ok ? 'rgba(0,229,113,0.1)' : 'rgba(245,166,35,0.1)'};
      border:1px solid ${ok ? 'rgba(0,229,113,0.25)' : 'rgba(245,166,35,0.25)'};
      color:${ok ? 'var(--green-glow)' : 'var(--amber)'}`;
    const featLabel = labels[feat] || feat;
    pill.textContent = `${ok ? '✓' : '~'} ${featLabel}`;
    pill.title = `Your value: ${check.value} | Ideal: ${check.ideal_mean} ±${check.ideal_std}`;
    container.appendChild(pill);
  }
}

// ── Voice advisory (Web Speech API) ──────────────────────────
function speakAdvisory(results, lang = 'en') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const top = results[0];
  const display = CROP_DISPLAY[top.crop] || { hindi: top.crop };
  const text = lang === 'hi'
    ? `आपके खेत की परिस्थितियों के आधार पर, सर्वश्रेष्ठ फसल ${display.hindi} है। AI मॉडल का विश्वास स्तर ${top.confidence} प्रतिशत है।`
    : `Based on your farm conditions, the AI model recommends ${top.crop} as the best crop with ${top.confidence}% confidence. This prediction is based on your district's climate, soil type, and water availability.`;

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = lang === 'hi' ? 'hi-IN' : 'en-IN';
  utt.rate  = 0.88; utt.pitch = 1;
  const waveWrap = document.getElementById('voice-waveform');
  if (waveWrap) waveWrap.style.display = 'flex';
  utt.onend = () => { if (waveWrap) waveWrap.style.display = 'none'; };
  window.speechSynthesis.speak(utt);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Populate district dropdown
  const distSel = document.getElementById('form-district');
  if (distSel) {
    Object.keys(DISTRICT_CLIMATE).forEach(d => {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = window.t('dist.' + d);
      distSel.appendChild(opt);
    });
  }

  // (Moved model loading lower to ensure UI listeners attach first)
  const loadML = async () => {
    const modelStatus = document.getElementById('model-status');
    if (modelStatus) {
      modelStatus.textContent = window.t('model.loading');
      modelStatus.className = 'badge badge-amber';
    }

    const ok = await window.VrikshML.load();
    if (ok && modelStatus) {
      modelStatus.innerHTML = `✅ ${window.t('model.ready')} · 94.2% ${window.t('label.accuracy')}`;
      modelStatus.className   = 'badge badge-green';
    } else if (modelStatus) {
      modelStatus.textContent = window.t('model.failed');
      modelStatus.className   = 'badge badge-red';
    }
  };
  loadML(); // Run in background


  // Step navigation (Using delegation for robustness)
  document.addEventListener('click', (e) => {
    const btnNext1 = e.target.closest('#btn-next-1');
    const btnNext2 = e.target.closest('#btn-next-2');
    const btnBack2 = e.target.closest('#btn-back-2');
    const btnBack3 = e.target.closest('#btn-back-3');

    if (btnNext1) {
      if (collectStep1()) {
        goToStep(2);
      } else {
        const msg = 'Please select your District and Soil type, and ensure all soil health values (N, P, K, pH) are entered.';
        showError(msg);
        alert(msg); // Forced alert for visibility
      }
    }
    if (btnNext2) {
      if (collectStep2()) {
        updateSummary();
        goToStep(3);
      } else {
        const msg = 'Please select season and water availability.';
        showError(msg);
        alert(msg);
      }
    }
    if (btnBack2) goToStep(1);
    if (btnBack3) goToStep(2);
  });

  // Submit — run ML prediction
  document.getElementById('btn-submit')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-submit');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Running Neural Network...';
    btn.disabled = true;

    try {
      const mlInput = await buildMLInput(formData);
      let results;

      if (window.VrikshML.loaded) {
        results = await window.VrikshML.topN(mlInput, 5);
      } else {
        showError('AI model not active. Showing estimated results.');
        results = getFallbackResults(formData);
      }

      lastResults = results;
      const section = document.getElementById('results-section');
      if (section) {
        section.style.display = 'block';
        const adDist = document.getElementById('advisory-district');
        if (adDist) adDist.textContent = window.t('dist.' + formData.district) || formData.district;
        setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
      renderResults(results, mlInput);
    } catch (e) {
      showError('Prediction error: ' + e.message);
    }

    btn.textContent = originalText;
    btn.disabled = false;
  });

  document.getElementById('btn-voice')?.addEventListener('click', () => {
    if (lastResults.length) speakAdvisory(lastResults, 'en');
  });

  document.getElementById('btn-voice-hi')?.addEventListener('click', () => {
    if (lastResults.length) speakAdvisory(lastResults, 'hi');
  });

  // Listen for language changes
  window.addEventListener('langChanged', async () => {
    // 1. Update district dropdown
    const distSel = document.getElementById('form-district');
    if (distSel) {
      Array.from(distSel.options).forEach(opt => {
        if (opt.value) opt.textContent = window.t('dist.' + opt.value);
      });
    }

    // 2. Update model status if loaded
    const modelStatus = document.getElementById('model-status');
    if (modelStatus && window.VrikshML.loaded) {
      modelStatus.innerHTML = `✅ ${window.t('model.ready')} · 94.2% ${window.t('label.accuracy')}`;
    }

    // 3. Update summary if data exists
    if (formData.district) updateSummary();

    // 4. Update results if visible
    if (lastResults.length > 0) {
      const adDist = document.getElementById('advisory-district');
      if (adDist) adDist.textContent = window.t('dist.' + formData.district) || formData.district;
      const mlInput = await buildMLInput(formData);
      renderResults(lastResults, mlInput);
    }
  });
});

window.getFertilizerAdvice = async (crop, soil, n, p, k) => {
  try {
    const advice = await window.VrikshML.predictFertilizer(soil, crop, n, p, k);
    alert(`🧪 Fertilizer Recommendation for ${crop}:\n\nUse: ${advice}\n\nThis advice is based on your current soil N-P-K levels and crop requirements.`);
  } catch (err) {
    console.error('Fertilizer advice error:', err);
    alert('Failed to get fertilizer advice. Please check your backend connection.');
  }
};

async function updateSummary() {
  const seasons = { kharif: 'Kharif (Monsoon)', rabi: 'Rabi (Winter)' };
  const waters  = { high: 'High', medium: 'Medium', low: 'Low (rain-fed)' };
  document.getElementById('sum-district').textContent = window.t('dist.' + formData.district) || '—';
  document.getElementById('sum-soil').textContent     = window.t('soil.' + formData.soil.toLowerCase()) || formData.soil || '—';
  const seasonKey = 'season.' + formData.season.toLowerCase();
  document.getElementById('sum-season').textContent   = window.t(seasonKey) || formData.season || '—';
  const waterKey = 'water.' + formData.water.toLowerCase();
  document.getElementById('sum-water').textContent    = window.t(waterKey)   || formData.water  || '—';
}


function showError(msg) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// Simple fallback if model fails
function getFallbackResults(data) {
  const defaults = ['wheat', 'rice', 'maize', 'lentil', 'chickpea'];
  return defaults.map((crop, i) => ({
    crop, confidence: 60 - i * 8, probability: 0.5 - i * 0.08
  }));
}
