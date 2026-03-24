/* ============================================================
   dashboard.js — Weather data, Chart.js trends, alerts
   ============================================================ */

// ── District Data ─────────────────────────────────────────────
const DISTRICTS = {
  'Dehradun':    { temp: 26, humidity: 72, rainfall: 8,  wind: 14, risk: 'low',    soil: 'Loamy',   ndvi: 0.72 },
  'Haridwar':    { temp: 29, humidity: 68, rainfall: 5,  wind: 18, risk: 'low',    soil: 'Sandy',   ndvi: 0.61 },
  'Nainital':    { temp: 19, humidity: 82, rainfall: 14, wind: 10, risk: 'medium', soil: 'Clay',    ndvi: 0.78 },
  'Almora':      { temp: 22, humidity: 75, rainfall: 11, wind: 9,  risk: 'medium', soil: 'Loamy',   ndvi: 0.69 },
  'Uttarkashi':  { temp: 4,  humidity: 65, rainfall: 22, wind: 12, risk: 'high',   soil: 'Rocky',   ndvi: 0.55 },
  'Chamoli':     { temp: 12, humidity: 60, rainfall: 22, wind: 20, risk: 'high',   soil: 'Rocky',   ndvi: 0.48 },
  'Pithoragarh': { temp: 11, humidity: 58, rainfall: 16, wind: 15, risk: 'high',   soil: 'Clay',    ndvi: 0.52 },
  'Pauri':       { temp: 20, humidity: 70, rainfall: 10, wind: 11, risk: 'medium', soil: 'Loamy',   ndvi: 0.65 },
  'Tehri':       { temp: 18, humidity: 74, rainfall: 12, wind: 13, risk: 'medium', soil: 'Silty',   ndvi: 0.67 },
  'Rudraprayag': { temp: 16, humidity: 78, rainfall: 20, wind: 17, risk: 'high',   soil: 'Rocky',   ndvi: 0.53 },
  'Bageshwar':   { temp: 17, humidity: 76, rainfall: 13, wind: 8,  risk: 'medium', soil: 'Clay',    ndvi: 0.64 },
  'Champawat':   { temp: 21, humidity: 69, rainfall: 9,  wind: 10, risk: 'low',    soil: 'Loamy',   ndvi: 0.70 },
  'US Nagar':    { temp: 38, humidity: 88, rainfall: 7,  wind: 16, risk: 'low',    soil: 'Alluvial', ndvi: 0.74 }
};

const RISK_ALERTS = {
  low: [
    { level: 'green', icon: '✅', title: 'alert.low.t1', msg: 'alert.low.m1' },
    { level: 'green', icon: '🌱', title: 'alert.low.t2', msg: 'alert.low.m2' }
  ],
  medium: [
    { level: 'amber', icon: '⚠️', title: 'alert.med.t1', msg: 'alert.med.m1' },
    { level: 'amber', icon: '🌡️', title: 'alert.med.t2', msg: 'alert.med.m2' },
    { level: 'green', icon: '📡', title: 'alert.med.t3', msg: 'alert.med.m3' }
  ],
  high: [
    { level: 'red',   icon: '🚨', title: 'alert.high.t1', msg: 'alert.high.m1' },
    { level: 'red',   icon: '⛰️', title: 'alert.high.t2', msg: 'alert.high.m2' },
    { level: 'amber', icon: '💧', title: 'alert.high.t3', msg: 'alert.high.m3' },
    { level: 'amber', icon: '🌬️', title: 'alert.high.t4', msg: 'alert.high.m4' }
  ]
};

// ── Generate 7-day trend data ────────────────────────────────
function generateTrend(base, variance) {
  return Array.from({ length: 7 }, (_, i) => {
    const noise = (Math.random() - 0.5) * variance;
    return Math.round((base + noise + i * 0.5) * 10) / 10;
  });
}

// ── Init Chart ───────────────────────────────────────────────
let weatherChart = null;
const TREND_CACHE = {}; // Store trends so they don't change randomly every refresh

function initChart(district) {
  const data = DISTRICTS[district];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Use cached trend if available, otherwise generate and cache
  if (!TREND_CACHE[district]) {
    TREND_CACHE[district] = {
      temps: generateTrend(data.temp, 3),
      rains: generateTrend(data.rainfall, 4)
    };
  }
  
  const { temps, rains } = TREND_CACHE[district];

  const ctx = document.getElementById('weatherChart');
  if (!ctx) return;

  if (weatherChart) weatherChart.destroy();

  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: window.t('chart.temp'),
          data: temps,
          borderColor: '#00e571',
          backgroundColor: 'rgba(0, 229, 113, 0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#00e571',
          pointRadius: 4,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.45,
          yAxisID: 'y'
        },
        {
          label: window.t('chart.rain'),
          data: rains,
          borderColor: '#4a9eff',
          backgroundColor: 'rgba(74, 158, 255, 0.08)',
          borderWidth: 2,
          pointBackgroundColor: '#4a9eff',
          pointRadius: 4,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.45,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#7a9eb5', font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 20 }
        },
        tooltip: {
          backgroundColor: 'rgba(10, 22, 40, 0.95)',
          borderColor: 'rgba(0, 229, 113, 0.3)',
          borderWidth: 1,
          titleColor: '#e8f4f0',
          bodyColor: '#7a9eb5',
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#7a9eb5', font: { family: 'Inter', size: 11 } }
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(0,229,113,0.07)' },
          ticks: { color: '#00e571', font: { family: 'Inter', size: 11 }, callback: v => v + '°' }
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#4a9eff', font: { family: 'Inter', size: 11 }, callback: v => v + 'mm' }
        }
      }
    }
  });
}

// ── Update Weather Cards ──────────────────────────────────────
function updateWeatherCards(district) {
  const d = DISTRICTS[district];
  animateValue('val-temp',     0, d.temp,     1200, window.t('unit.temp'));
  animateValue('val-humidity', 0, d.humidity, 1200, window.t('unit.hum'));
  animateValue('val-rainfall', 0, d.rainfall, 1200, window.t('unit.rain'));
  animateValue('val-wind',     0, d.wind,     1200, window.t('unit.wind'));

  const ndviEl = document.getElementById('val-ndvi');
  if (ndviEl) {
    animateValue('val-ndvi', 0, Math.round(d.ndvi * 100), 1200, '');
    setTimeout(() => {
      const bar = document.getElementById('ndvi-bar');
      if (bar) bar.style.width = (d.ndvi * 100) + '%';
    }, 500);
  }

  const soilEl = document.getElementById('val-soil');
  if (soilEl) soilEl.textContent = window.t('soil.' + d.soil);
}

function animateValue(id, from, to, dur, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const step = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + ease * (to - from)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Update Alerts ────────────────────────────────────────────
function updateAlerts(districtName) {
  const d = DISTRICTS[districtName];
  const risk = d.risk;
  const panel = document.getElementById('alert-panel');
  const enginePanel = document.getElementById('engine-alerts');
  if (!panel || !enginePanel) return;

  panel.innerHTML = '';
  enginePanel.innerHTML = '';

  // 1. Module 1: Weather Engine Analysis
  if (window.WeatherEngine) {
    const engineAlerts = window.WeatherEngine.analyze(d);
    engineAlerts.forEach((alert, i) => {
      const div = document.createElement('div');
      div.className = `alert-item alert-${alert.level} reveal`;
      div.style.borderLeft = `4px solid var(--${alert.level})`;
      div.innerHTML = `
        <div class="alert-icon">${alert.icon}</div>
        <div class="alert-text"><strong>${alert.title}</strong>: ${alert.msg}</div>
      `;
      enginePanel.appendChild(div);
      setTimeout(() => div.classList.add('visible'), 50 + i * 100);
    });
  }

  // 2. Original Risk Alerts
  RISK_ALERTS[risk].forEach((alert, i) => {
    const div = document.createElement('div');
    div.className = `alert-item alert-${alert.level} reveal`;
    div.style.transitionDelay = `${i * 0.1}s`;
    div.innerHTML = `
      <div class="alert-icon">${alert.icon}</div>
      <div class="alert-text"><strong>${window.t(alert.title)}</strong>${window.t(alert.msg)}</div>
    `;
    panel.appendChild(div);
    setTimeout(() => div.classList.add('visible'), 100 + i * 120);
  });
}

// ── Risk Badge ───────────────────────────────────────────────
function updateRiskBadge(risk) {
  const el = document.getElementById('risk-badge');
  if (!el) return;
  const map = {
    low:    { label: '🟢 Low Risk',    cls: 'badge-green' },
    medium: { label: '🟡 Medium Risk', cls: 'badge-amber' },
    high:   { label: '🔴 High Risk',   cls: 'badge-red'   }
  };
  el.className = `badge ${map[risk].cls}`;
  el.textContent = window.t('dash.risk.' + risk);
}

// ── Crop Calendar ────────────────────────────────────────────
const CROP_CALENDAR = {
  'Dehradun':   ['Wheat', 'Rice', 'Sugarcane', 'Vegetables'],
  'Haridwar':   ['Wheat', 'Sugarcane', 'Potato', 'Mustard'],
  'Nainital':   ['Potato', 'Apple', 'Peach', 'Barley'],
  'Almora':     ['Mandua', 'Jhangora', 'Rajma', 'Wheat'],
  'Uttarkashi': ['Potato', 'Ginger', 'Kidney Beans', 'Barley'],
  'Chamoli':    ['Kidney Beans', 'Wheat', 'Potato', 'Buckwheat'],
  'Pithoragarh':['Rajma', 'Wheat', 'Barley', 'Apple'],
  'Pauri':      ['Mandua', 'Urad', 'Soybean', 'Vegetables'],
  'Tehri':      ['Wheat', 'Potato', 'Garlic', 'Tomato'],
  'Rudraprayag':['Potato', 'Ginger', 'Turmeric', 'Rajma'],
  'Bageshwar':  ['Rajma', 'Wheat', 'Soybean', 'Mandua'],
  'Champawat':  ['Wheat', 'Soybean', 'Rice', 'Vegetables'],
  'US Nagar':   ['Rice', 'Wheat', 'Sugarcane', 'Vegetables']
};

function updateCropCalendar(district) {
  const el = document.getElementById('crop-calendar');
  if (!el) return;
  const crops = CROP_CALENDAR[district] || [];
  el.innerHTML = crops.map(c => `<span class="badge badge-green">${window.t('crop.' + c)}</span>`).join('');
}

// ── Main Refresh ─────────────────────────────────────────────
async function refreshDashboard(district) {
  const indicator = document.getElementById('refresh-indicator');
  if (indicator) {
    indicator.textContent = '🔄 Updating...';
    indicator.style.color = 'var(--amber)';
  }

  // Fetch Live Data
  const liveData = await window.WeatherService.getWeather(district);
  
  if (liveData) {
    // Update local DISTRICTS mirror for this session
    DISTRICTS[district].temp = liveData.temp;
    DISTRICTS[district].humidity = liveData.humidity;
    DISTRICTS[district].rainfall = liveData.rainfall;
    DISTRICTS[district].wind = liveData.wind;
    
    // Dynamic Risk Shift (Sync with climate-risk.js logic)
    // Start with a base score mapping from static risk
    let baseScore = district === 'US Nagar' ? 40 : (d.risk === 'high' ? 75 : d.risk === 'medium' ? 55 : 30);
    
    if (liveData.rainfall > 10) baseScore += 15;
    if (liveData.rainfall > 5) baseScore += 10;
    if (liveData.temp < 5) baseScore += 20;
    
    // Convert score back to risk level
    if (baseScore >= 70) DISTRICTS[district].risk = 'high';
    else if (baseScore >= 45) DISTRICTS[district].risk = 'medium';
    else DISTRICTS[district].risk = 'low';
    
    if (indicator) {
      const timeStr = new Date(liveData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      indicator.innerHTML = `✅ Live <span style="font-size:0.7rem;opacity:0.7;margin-left:4px">${timeStr}</span>`;
      indicator.style.color = 'var(--green-glow)';
    }
  }

  const d = DISTRICTS[district];
  updateWeatherCards(district);
  updateAlerts(district);
  updateRiskBadge(d.risk);
  updateCropCalendar(district);
  initChart(district);

  // Update district name
  const nameEl = document.getElementById('selected-district');
  if (nameEl) nameEl.textContent = window.t('dist.' + district);
}

// ── Live clock ───────────────────────────────────────────────
function initClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

// ── Auto-refresh simulation ───────────────────────────────────
function initAutoRefresh() {
  const select = document.getElementById('district-select');
  const indicator = document.getElementById('refresh-indicator');
  if (!select) return;

  setInterval(() => {
    const currentDistrict = select.value;
    if (indicator) {
      indicator.textContent = '🔄 Updating...';
      indicator.style.color = 'var(--amber)';
    }
    setTimeout(() => {
      refreshDashboard(currentDistrict);
      if (indicator) {
        indicator.textContent = window.t('dash.status.live');
        indicator.style.color = 'var(--green-glow)';
      }
    }, 800);
  }, 60000); // 60s for stability
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('district-select');
  if (!select) return;

  // Populate options
  Object.keys(DISTRICTS).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = window.t('dist.' + d);
    select.appendChild(opt);
  });

  select.addEventListener('change', () => refreshDashboard(select.value));

  // Listen for language changes to update dynamic parts
  window.addEventListener('langChanged', () => {
    const val = select.value;
    // Update select options text
    Array.from(select.options).forEach(opt => {
      opt.textContent = window.t('dist.' + opt.value);
    });
    refreshDashboard(val);
  });

  // Default
  const defaultDistrict = 'Dehradun';
  select.value = defaultDistrict;
  refreshDashboard(defaultDistrict);
  initClock();
  initAutoRefresh();
});
