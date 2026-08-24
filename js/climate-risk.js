/* ============================================================
   climate-risk.js — State-based district risk map
   Supports full Pan-India state selection
   ============================================================ */

// ── Risk seed per district name (deterministic hash → consistent values) ──
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a believable risk profile from district name
function generateRiskData(districtName, stateName) {
  const h = hashCode(districtName + stateName);
  const rng = (min, max, seed) => min + ((hashCode(districtName + seed) % (max - min + 1)));

  const landslide = rng(10, 90, 'ls');
  const flood     = rng(10, 90, 'fl');
  const drought   = rng(5,  80, 'dr');
  const frost     = rng(5,  85, 'fr');
  const overall   = Math.round((landslide + flood + drought + frost) / 4);

  return { overall, landslide, flood, drought, frost };
}

// ── Current state risk data (populated when a state is selected) ──
let CURRENT_STATE_RISK = {};
let selectedStateName = 'Uttarakhand';
let selectedName = '';

const RISK_HAZARDS = ['landslide', 'flood', 'drought', 'frost'];

// ── Color from risk score ─────────────────────────────────────
function riskColor(score) {
  if (score >= 70) return { bg: 'rgba(255,59,85,0.18)', border: '#ff3b55', text: '#ff3b55', label: 'High' };
  if (score >= 45) return { bg: 'rgba(245,166,35,0.18)', border: '#f5a623', text: '#f5a623', label: 'Medium' };
  return { bg: 'rgba(0,229,113,0.12)', border: '#00e571', text: '#00e571', label: 'Low' };
}

// ── Build district grid for the selected state ────────────────
async function buildDistrictGrid(stateName) {
  const grid = document.getElementById('district-grid');
  if (!grid) return;

  // Show loading state
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-muted)">
    <div style="font-size:2rem;margin-bottom:0.5rem">🛰️</div>
    <div>Loading districts for <strong>${stateName}</strong>...</div>
  </div>`;

  // Load districts from JSON
  const locData = await window.LocationsManager.init();
  if (!locData) { grid.innerHTML = '<p style="color:red;padding:1rem">Failed to load district data.</p>'; return; }

  const stateObj = locData.states.find(s => s.state === stateName);
  if (!stateObj) { grid.innerHTML = '<p style="color:var(--text-muted);padding:1rem">No districts found for this state.</p>'; return; }

  // Generate risk data for each district
  CURRENT_STATE_RISK = {};
  stateObj.districts.forEach(district => {
    CURRENT_STATE_RISK[district] = generateRiskData(district, stateName);
  });

  // Auto-select first district
  selectedName = stateObj.districts[0];

  // Parallel live weather update for visible districts (limit to 8 to avoid API flood)
  const districtSlice = stateObj.districts.slice(0, 8);
  await Promise.all(districtSlice.map(async name => {
    const live = await window.WeatherService?.getWeather(name).catch(() => null);
    if (live && CURRENT_STATE_RISK[name]) {
      const d = CURRENT_STATE_RISK[name];
      if (live.rainfall > 10) d.landslide = Math.min(100, d.landslide + 15);
      if (live.rainfall > 5)  d.flood     = Math.min(100, d.flood + 10);
      if (live.temp < 5)      d.frost     = Math.min(100, d.frost + 20);
      d.overall = Math.round((d.landslide + d.flood + d.drought + d.frost) / 4);
    }
  }));

  // Render grid
  grid.innerHTML = '';
  Object.entries(CURRENT_STATE_RISK).forEach(([name, data]) => {
    const color = riskColor(data.overall);
    const shortName = name.length > 12 ? name.substring(0, 10) + '…' : name;
    const cell = document.createElement('div');
    cell.className = 'district-cell reveal';
    cell.dataset.district = name;
    cell.style.cssText = `background:${color.bg};border:1.5px solid ${color.border};`;
    cell.innerHTML = `
      <div class="district-cell-name" title="${name}">${shortName}</div>
      <div class="district-cell-score" style="color:${color.text}">${data.overall}%</div>
      <div class="district-cell-label" style="color:${color.text}">${color.label}</div>
    `;
    cell.addEventListener('click', () => {
      selectedName = name;
      selectDistrict(name, data);
      buildRiskRadar(name);
    });
    grid.appendChild(cell);
    setTimeout(() => cell.classList.add('visible'), 50);
  });

  updateSummaryBadges();

  // Auto-select first district after render
  setTimeout(() => {
    if (selectedName && CURRENT_STATE_RISK[selectedName]) {
      selectDistrict(selectedName, CURRENT_STATE_RISK[selectedName]);
      buildRiskRadar(selectedName);
    }
  }, 400);
}

// ── Summary badge counts ──────────────────────────────────────
function updateSummaryBadges() {
  let h = 0, m = 0, l = 0;
  Object.values(CURRENT_STATE_RISK).forEach(d => {
    if (d.overall >= 70) h++;
    else if (d.overall >= 45) m++;
    else l++;
  });

  document.querySelectorAll('.badge-red').forEach(b => {
    if (b.textContent.includes('High')) b.textContent = `🔴 High Risk Districts: ${h}`;
  });
  document.querySelectorAll('.badge-amber').forEach(b => {
    if (b.textContent.includes('Medium')) b.textContent = `🟡 Medium Risk: ${m}`;
  });
  // Update the first badge-green in header (low risk count)
  const allGreenBadges = document.querySelectorAll('.risk-header .badge-green');
  if (allGreenBadges[0]) allGreenBadges[0].textContent = `🟢 Low Risk: ${l}`;
  // Update satellite badge
  const satBadge = document.querySelector('.risk-header .badge-green:last-child');
  if (satBadge && (satBadge.textContent.includes('satellite') || satBadge.textContent.includes('pass'))) {
    satBadge.textContent = `🛰️ Synced: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

// ── Select a district → populate the right panel ─────────────
function selectDistrict(name, data) {
  document.querySelectorAll('.district-cell').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[data-district="${name}"]`)?.classList.add('selected');

  const panel = document.getElementById('district-detail');
  if (panel) {
    panel.style.display = 'block';
    panel.classList.add('reveal');
    setTimeout(() => panel.classList.add('visible'), 50);
  }

  const nameEl = document.getElementById('detail-name');
  if (nameEl) nameEl.textContent = name;

  const colorData = riskColor(data.overall);
  const overallEl = document.getElementById('detail-overall');
  if (overallEl) {
    overallEl.textContent = `${data.overall}%`;
    overallEl.style.color = colorData.text;
  }

  const badge = document.getElementById('detail-badge');
  if (badge) {
    badge.textContent = `${colorData.label} RISK`;
    badge.className = `badge ${data.overall >= 70 ? 'badge-red' : data.overall >= 45 ? 'badge-amber' : 'badge-green'}`;
  }

  RISK_HAZARDS.forEach(hazard => {
    const score = data[hazard] ?? 0;
    const bar = document.getElementById(`bar-${hazard}`);
    const label = document.getElementById(`score-${hazard}`);
    if (bar) {
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = score + '%'; }, 200);
      const hc = riskColor(score);
      bar.style.background = hc.border;
      bar.style.boxShadow = `0 0 8px ${hc.border}50`;
    }
    if (label) label.textContent = score + '%';
  });

  const insuranceEl = document.getElementById('detail-insurance');
  if (insuranceEl) {
    const schemes = data.overall >= 70 ? 'PMFBY + RWBCIS + WBCIS' :
                    data.overall >= 45 ? 'PMFBY + WBCIS' : 'PMFBY';
    insuranceEl.textContent = schemes;
  }

  const advisoryEl = document.getElementById('detail-advisory');
  if (advisoryEl) {
    const msgs = {
      high: `${name} shows high climate risk. Avoid sowing in flood-prone zones. Apply for PMFBY immediately and monitor NDVI weekly.`,
      med: `${name} has moderate climate risk. Prepare drainage channels before monsoon onset and use WBCIS for weather-based crop protection.`,
      low: `${name} has low climate risk. Standard agronomic practices apply. Consider PMFBY for basic crop insurance coverage.`
    };
    advisoryEl.textContent = data.overall >= 70 ? msgs.high : data.overall >= 45 ? msgs.med : msgs.low;
  }

  animateSatelliteScan(name, data);
}

// ── Satellite panel animation ─────────────────────────────────
function animateSatelliteScan(district, data) {
  const panel = document.getElementById('satellite-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="sat-scanning">
      <div class="sat-spinner">🛰️</div>
      <p class="sat-label">Acquiring <strong>${district}</strong>...</p>
    </div>
  `;

  setTimeout(() => {
    const ndvi = (0.9 - data.overall / 150).toFixed(2);
    const moisture = (80 - data.drought * 0.4).toFixed(1);
    panel.innerHTML = `
      <h4 class="sat-title">🛰️ Satellite Data — ${district}</h4>
      <div class="sat-grid">
        <div class="sat-metric">
          <div class="sat-metric-value text-green">${ndvi}</div>
          <div class="sat-metric-label">NDVI Index</div>
        </div>
        <div class="sat-metric">
          <div class="sat-metric-value text-amber">${moisture}%</div>
          <div class="sat-metric-label">Soil Moisture</div>
        </div>
        <div class="sat-metric">
          <div class="sat-metric-value" style="color:#4a9eff">${data.flood}%</div>
          <div class="sat-metric-label">Flood Prob.</div>
        </div>
        <div class="sat-metric">
          <div class="sat-metric-value" style="color:#b06aff">${data.landslide}%</div>
          <div class="sat-metric-label">Slide Risk</div>
        </div>
      </div>
      <div class="sat-timestamp text-muted">Updated: ${new Date().toLocaleTimeString()}</div>
    `;
    panel.classList.add('scanline-container');
  }, 1600);
}

// ── Radar Chart ───────────────────────────────────────────────
let riskChart = null;
function buildRiskRadar(name) {
  const ctx = document.getElementById('riskRadarChart');
  if (!ctx) return;
  const d = CURRENT_STATE_RISK[name];
  if (!d) return;

  if (riskChart) riskChart.destroy();
  riskChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Landslide', 'Flood', 'Drought', 'Frost', 'Overall'],
      datasets: [{
        label: name,
        data: [d.landslide, d.flood, d.drought, d.frost, d.overall],
        backgroundColor: 'rgba(255,59,85,0.12)',
        borderColor: '#ff3b55',
        borderWidth: 2,
        pointBackgroundColor: '#ff3b55',
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(5,13,26,0.95)',
          borderColor: 'rgba(255,59,85,0.3)',
          borderWidth: 1,
          titleColor: '#e8f4f0',
          bodyColor: '#7a9eb5'
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          grid: { color: 'rgba(255,255,255,0.06)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: '#445a70', backdropColor: 'transparent', font: { size: 9 } },
          pointLabels: { color: '#7a9eb5', font: { size: 11 } }
        }
      }
    }
  });
}

// ── Insurance Cards ───────────────────────────────────────────
function buildInsuranceCards() {
  const container = document.getElementById('insurance-cards');
  if (!container) return;

  const schemes = [
    { name: 'PMFBY',  full: 'Pradhan Mantri Fasal Bima Yojana',   icon: '🌾', desc: 'Comprehensive crop insurance against natural calamities, pest attacks and diseases.' },
    { name: 'WBCIS',  full: 'Weather Based Crop Insurance Scheme', icon: '🌧️', desc: 'Protects farmers against losses due to deviation in weather parameters.' },
    { name: 'RWBCIS', full: 'Restructured Weather Based CIS',      icon: '🍎', desc: 'Enhanced scheme for horticulture crops including fruits and vegetables.' },
    { name: 'KCC',    full: 'Kisan Credit Card',                   icon: '💳', desc: 'Short-term credit for agricultural needs, post-harvest and allied activities.' }
  ];

  schemes.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'glass-card insurance-card reveal';
    card.style.transitionDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="insurance-icon">${s.icon}</div>
      <div>
        <h4>${s.name}</h4>
        <div class="text-muted" style="font-size:0.78rem;margin-bottom:6px">${s.full}</div>
        <p style="font-size:0.85rem">${s.desc}</p>
      </div>
      <a href="#" class="btn btn-outline btn-sm" style="margin-top:auto">Learn More →</a>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.add('visible'), 200 + i * 100);
  });
}

// ── Legend ────────────────────────────────────────────────────
function buildLegend() {
  const el = document.getElementById('risk-legend');
  if (!el) return;
  el.innerHTML = `
    <div class="legend-item"><span style="background:#00e571"></span>Low (0–44%)</div>
    <div class="legend-item"><span style="background:#f5a623"></span>Medium (45–69%)</div>
    <div class="legend-item"><span style="background:#ff3b55"></span>High (70–100%)</div>
  `;
}

// ── State Selector Setup ──────────────────────────────────────
async function setupStateSelector() {
  await window.LocationsManager.populateStates('state-select', selectedStateName);

  const stateSelect = document.getElementById('state-select');
  if (!stateSelect) return;

  stateSelect.addEventListener('change', async (e) => {
    selectedStateName = e.target.value;

    // Update the map title
    const mapTitle = document.querySelector('[data-lang="risk.map"]');
    if (mapTitle) mapTitle.textContent = `🗺️ ${selectedStateName} Risk Map`;

    await buildDistrictGrid(selectedStateName);
    buildLegend();
  });
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  buildLegend();
  buildInsuranceCards();

  // Setup state selector and load default state
  await setupStateSelector();
  await buildDistrictGrid(selectedStateName);

  // Update map title with initial state
  const mapTitle = document.querySelector('[data-lang="risk.map"]');
  if (mapTitle) mapTitle.textContent = `🗺️ ${selectedStateName} Risk Map`;

  // Click delegation for district grid
  document.getElementById('district-grid')?.addEventListener('click', e => {
    const cell = e.target.closest('.district-cell');
    if (cell) {
      selectedName = cell.dataset.district;
      if (CURRENT_STATE_RISK[selectedName]) {
        selectDistrict(selectedName, CURRENT_STATE_RISK[selectedName]);
        buildRiskRadar(selectedName);
      }
    }
  });

  // Language change listener
  window.addEventListener('langChanged', () => {
    buildLegend();
    const insContainer = document.getElementById('insurance-cards');
    if (insContainer) insContainer.innerHTML = '';
    buildInsuranceCards();
    if (selectedName && CURRENT_STATE_RISK[selectedName]) {
      selectDistrict(selectedName, CURRENT_STATE_RISK[selectedName]);
      buildRiskRadar(selectedName);
    }
  });
});
