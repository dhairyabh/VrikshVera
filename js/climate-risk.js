/* ============================================================
   climate-risk.js — District risk map, heatmap, satellite panel
   ============================================================ */

// ── Risk Data ─────────────────────────────────────────────────
const DISTRICT_RISK = {
  'Dehradun':    { overall: 28, flood: 25, landslide: 30, drought: 20, frost: 15, coords: { c: 3, r: 3 } },
  'Haridwar':    { overall: 35, flood: 45, landslide: 20, drought: 30, frost: 10, coords: { c: 4, r: 4 } },
  'Nainital':    { overall: 55, flood: 40, landslide: 65, drought: 25, frost: 40, coords: { c: 6, r: 3 } },
  'Almora':      { overall: 48, flood: 35, landslide: 60, drought: 30, frost: 35, coords: { c: 6, r: 2 } },
  'Uttarkashi':  { overall: 78, flood: 55, landslide: 88, drought: 20, frost: 75, coords: { c: 2, r: 1 } },
  'Chamoli':     { overall: 82, flood: 70, landslide: 90, drought: 25, frost: 70, coords: { c: 3, r: 1 } },
  'Pithoragarh': { overall: 75, flood: 60, landslide: 82, drought: 22, frost: 80, coords: { c: 7, r: 1 } },
  'Pauri':       { overall: 52, flood: 45, landslide: 62, drought: 28, frost: 30, coords: { c: 3, r: 2 } },
  'Tehri':       { overall: 60, flood: 50, landslide: 72, drought: 20, frost: 45, coords: { c: 2, r: 2 } },
  'Rudraprayag': { overall: 72, flood: 65, landslide: 80, drought: 20, frost: 55, coords: { c: 3, r: 1 } },
  'Bageshwar':   { overall: 58, flood: 50, landslide: 70, drought: 25, frost: 50, coords: { c: 6, r: 2 } },
  'Champawat':   { overall: 45, flood: 38, landslide: 55, drought: 28, frost: 38, coords: { c: 7, r: 2 } },
  'US Nagar':    { overall: 40, flood: 52, landslide: 25, drought: 35, frost: 12, coords: { c: 5, r: 4 } }
};

const RISK_HAZARDS = ['landslide', 'flood', 'drought', 'frost'];
const HAZARD_ICONS = { landslide: '⛰️', flood: '🌊', drought: '☀️', frost: '❄️' };
const HAZARD_LABELS = { 
  landslide: window.t('hazard.landslide'), 
  flood: window.t('hazard.flood'), 
  drought: window.t('hazard.drought'), 
  frost: window.t('hazard.frost') 
};

// ── Compute color from risk score ────────────────────────────
function riskColor(score) {
  if (score >= 70) return { bg: 'rgba(255,59,85,0.18)', border: '#ff3b55', text: '#ff3b55', label: window.t('risk.status.high') };
  if (score >= 45) return { bg: 'rgba(245,166,35,0.18)', border: '#f5a623', text: '#f5a623', label: window.t('risk.status.med') };
  return { bg: 'rgba(0,229,113,0.12)', border: '#00e571', text: '#00e571', label: window.t('risk.status.low') };
}

// ── Build district grid ───────────────────────────────────────
async function buildDistrictGrid() {
  const grid = document.getElementById('district-grid');
  if (!grid) return;
  
  // Update header count badges if they exist
  const highBadge = document.querySelector('.badge-red');
  if (highBadge && highBadge.textContent.includes('High Risk')) {
    highBadge.textContent = window.t('risk.status.calculating');
  }

  // Iterate and update with live weather if possible
  for (const [name, data] of Object.entries(DISTRICT_RISK)) {
    const live = await window.WeatherService.getWeather(name);
    if (live) {
      // Dynamic shift: heavy rain increases flood/landslide risk
      // extreme temp increases frost/heat risk
      if (live.rainfall > 10) data.landslide = Math.min(100, data.landslide + 15);
      if (live.rainfall > 5) data.flood = Math.min(100, data.flood + 10);
      if (live.temp < 5) data.frost = Math.min(100, data.frost + 20);
      
      // Recompute overall
      data.overall = Math.round((data.landslide + data.flood + data.drought + data.frost) / 4);
    }
  }

  grid.innerHTML = '';
  Object.entries(DISTRICT_RISK).forEach(([name, data]) => {
    const color = riskColor(data.overall);
    const cell = document.createElement('div');
    cell.className = 'district-cell reveal';
    cell.dataset.district = name;
    cell.style.cssText = `background:${color.bg};border:1.5px solid ${color.border};`;
    cell.innerHTML = `
      <div class="district-cell-name">${window.t('dist.' + name).replace('US Nagar', 'US N.')}</div>
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

  // Update summary badges
  updateSummaryBadges();
}

function updateSummaryBadges() {
  let h = 0, m = 0, l = 0;
  Object.values(DISTRICT_RISK).forEach(d => {
    if (d.overall >= 70) h++;
    else if (d.overall >= 45) m++;
    else l++;
  });
  
  const bH = document.querySelector('.badge-red');
  const bM = document.querySelector('.badge-amber');
  const bL = document.querySelector('.badge-green');
  
  if (bH && bH.innerHTML.includes('High')) bH.textContent = `🔴 High Risk Districts: ${h}`;
  if (bM && bM.innerHTML.includes('Medium')) bM.textContent = `🟡 Medium Risk: ${m}`;
  if (bL && bL.innerHTML.includes('Low')) bL.textContent = `🟢 Low Risk: ${l}`;
  
  const satBadge = document.querySelectorAll('.badge-green')[1];
  if (satBadge && (satBadge.textContent.includes('satellite') || satBadge.textContent.includes('उपग्रह'))) {
    satBadge.textContent = `${window.t('risk.status.synced')}: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

// ── Init ─────────────────────────────────────────────────────
let selectedName = 'Dehradun';
// ── Select district → show detail ────────────────────────────
function selectDistrict(name, data) {
  // Highlight selected cell
  document.querySelectorAll('.district-cell').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[data-district="${name}"]`)?.classList.add('selected');

  // Detail panel
  const panel = document.getElementById('district-detail');
  if (panel) {
    panel.style.display = 'block';
    panel.classList.add('reveal');
    setTimeout(() => panel.classList.add('visible'), 50);
  }

  const nameEl = document.getElementById('detail-name');
  if (nameEl) nameEl.textContent = window.t('dist.' + name);

  const colorData = riskColor(data.overall);
  const overallEl = document.getElementById('detail-overall');
  if (overallEl) {
    overallEl.textContent = `${data.overall}%`;
    overallEl.style.color = colorData.text;
  }

  const badge = document.getElementById('detail-badge');
  if (badge) {
    badge.textContent = colorData.label + ' ' + window.t('risk.overall');
    badge.className = `badge ${data.overall >= 70 ? 'badge-red' : data.overall >= 45 ? 'badge-amber' : 'badge-green'}`;
  }

  // Individual hazard bars
  RISK_HAZARDS.forEach(hazard => {
    const score = data[hazard];
    const bar = document.getElementById(`bar-${hazard}`);
    const label = document.getElementById(`score-${hazard}`);
    if (bar) { bar.style.width = '0%'; setTimeout(() => { bar.style.width = score + '%'; }, 200); }
    if (label) label.textContent = score + '%';

    const barEl = bar;
    if (!barEl) return;
    const h = riskColor(score);
    barEl.style.background = h.border;
    barEl.style.boxShadow = `0 0 8px ${h.border}50`;
  });

  // Insurance info
  const insuranceEl = document.getElementById('detail-insurance');
  if (insuranceEl) {
    const schemes = data.overall >= 70 ? 'PMFBY + RWBCIS + WBCIS' :
                    data.overall >= 45 ? 'PMFBY + WBCIS' : 'PMFBY';
    insuranceEl.textContent = schemes;
  }

  // Advisory
  const advisoryEl = document.getElementById('detail-advisory');
  if (advisoryEl) {
    const msg = data.overall >= 70
      ? window.t('alert.high.m1') // Fallback to relevant high risk message
      : data.overall >= 45
      ? window.t('alert.med.m1')
      : window.t('alert.low.m1');
    advisoryEl.textContent = msg;
  }

  // Satellite reading
  animateSatelliteScan(name);
}

// ── Satellite scan animation ─────────────────────────────────
function animateSatelliteScan(district) {
  const panel = document.getElementById('satellite-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="sat-scanning">
      <div class="sat-spinner">🛰️</div>
      <p class="sat-label">${window.t('risk.sat.acquiring')} <strong>${window.t('dist.' + district)}</strong>...</p>
    </div>
  `;

  setTimeout(() => {
    const data = DISTRICT_RISK[district];
    const ndvi = (0.9 - data.overall / 150).toFixed(2);
    const moisture = (80 - data.drought * 0.4).toFixed(1);

    panel.innerHTML = `
      <h4 class="sat-title">${window.t('risk.sat.title')} ${window.t('dist.' + district)}</h4>
      <div class="sat-grid">
        <div class="sat-metric">
          <div class="sat-metric-value text-green">${ndvi}</div>
          <div class="sat-metric-label">${window.t('risk.sat.ndvi')}</div>
        </div>
        <div class="sat-metric">
          <div class="sat-metric-value text-amber">${moisture}%</div>
          <div class="sat-metric-label">${window.t('risk.sat.moisture')}</div>
        </div>
        <div class="sat-metric">
          <div class="sat-metric-value" style="color:#4a9eff">${data.flood}%</div>
          <div class="sat-metric-label">${window.t('risk.sat.flood')}</div>
        </div>
        <div class="sat-metric">
          <div class="sat-metric-value" style="color:#b06aff">${data.landslide}%</div>
          <div class="sat-metric-label">${window.t('risk.sat.landslide')}</div>
        </div>
      </div>
      <div class="sat-timestamp text-muted">${window.t('risk.sat.updated')} ${new Date().toLocaleTimeString()}</div>
    `;
    panel.classList.add('scanline-container');
  }, 1800);
}

// ── Risk Chart (Radar using Chart.js) ────────────────────────
let riskChart = null;

function buildRiskRadar(name) {
  const ctx = document.getElementById('riskRadarChart');
  if (!ctx) return;
  const d = DISTRICT_RISK[name];

  if (riskChart) riskChart.destroy();

  riskChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        window.t('hazard.landslide'), 
        window.t('hazard.flood'), 
        window.t('hazard.drought'), 
        window.t('hazard.frost'), 
        window.t('risk.overall')
      ],
      datasets: [{
        label: window.t('dist.' + name),
        data: [d.landslide, d.flood, d.drought, d.frost, d.overall],
        backgroundColor: 'rgba(255, 59, 85, 0.12)',
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

// ── Insurance Scheme Cards ────────────────────────────────────
function buildInsuranceCards() {
  const container = document.getElementById('insurance-cards');
  if (!container) return;

  const schemes = [
    { name: 'PMFBY', full: window.t('risk.ins.pmfby.full'),
      desc: window.t('risk.ins.pmfby.desc'), icon: '🌾', link: '#' },
    { name: 'WBCIS', full: window.t('risk.ins.wbcis.full'),
      desc: window.t('risk.ins.wbcis.desc'), icon: '🌧️', link: '#' },
    { name: 'RWBCIS', full: window.t('risk.ins.rwbcis.full'),
      desc: window.t('risk.ins.rwbcis.desc'), icon: '🍎', link: '#' },
    { name: 'KCC', full: window.t('risk.ins.kcc.full'),
      desc: window.t('risk.ins.kcc.desc'), icon: '💳', link: '#' }
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
      <a href="${s.link}" class="btn btn-outline btn-sm" style="margin-top:auto" data-lang="hero.cta">Learn More →</a>
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
    <div class="legend-item"><span style="background:#00e571"></span>${window.t('risk.status.low')} (0–44%)</div>
    <div class="legend-item"><span style="background:#f5a623"></span>${window.t('risk.status.med')} (45–69%)</div>
    <div class="legend-item"><span style="background:#ff3b55"></span>${window.t('risk.status.high')} (70–100%)</div>
  `;
}

// ── Init ─────────────────────────────────────────────────────
// Init
// selectedName is already declared above

document.addEventListener('DOMContentLoaded', () => {
  buildDistrictGrid();
  buildInsuranceCards();
  buildLegend();

  // Auto-select first district
  setTimeout(() => {
    selectDistrict(selectedName, DISTRICT_RISK[selectedName]);
    buildRiskRadar(selectedName);
  }, 600);

  // When detail selected update radar
  document.getElementById('district-grid')?.addEventListener('click', e => {
    const cell = e.target.closest('.district-cell');
    if (cell) {
      selectedName = cell.dataset.district;
      buildRiskRadar(selectedName);
    }
  });

  // Listen for language changes
  window.addEventListener('langChanged', () => {
    buildDistrictGrid();
    buildLegend();
    // Clear insurance and rebuild to translate
    const insContainer = document.getElementById('insurance-cards');
    if (insContainer) insContainer.innerHTML = '';
    buildInsuranceCards();
    
    // Refresh detail and radar
    selectDistrict(selectedName, DISTRICT_RISK[selectedName]);
    buildRiskRadar(selectedName);
  });
});
