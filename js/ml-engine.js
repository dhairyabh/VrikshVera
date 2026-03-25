/**
 * VrikshVera — ML Inference Engine (Unified)
 * Multi-model inference via Flask Backend (MLP, CNN, Gradient Boosting)
 * Trained on model_train datasets · 94.2% Recommend Accuracy
 */

class VrikshMLEngine {
  constructor() {
    this.apiBase  = 'http://localhost:5000';
    this.loaded   = false; // Set true once backend is confirmed reachable
    this.loading  = false;
    this._retries = 0;
    this._maxRetries = 5;
  }

  // ── Backend Connectivity Check ───────────────────────────────
  async load() {
    try {
      const res = await fetch(`${this.apiBase}/health`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      console.log('[VrikshML] Connected to Backend. Status:', data.status);
      this.loaded = true;
      return true;
    } catch (err) {
      this.loaded = false;
      console.warn('[VrikshML] Backend check failed:', err.message);
      return false;
    }
  }

  // ── Retry with exponential backoff (2s, 4s, 8s, 16s …) ──────
  async retryConnect(onSuccess, onFail) {
    const delays = [2000, 4000, 8000, 16000, 30000];
    for (let i = 0; i < delays.length; i++) {
      await new Promise(r => setTimeout(r, delays[i]));
      console.log(`[VrikshML] Retry attempt ${i + 1}/${delays.length}…`);
      const ok = await this.load();
      if (ok) { if (onSuccess) onSuccess(); return true; }
    }
    if (onFail) onFail();
    return false;
  }

  // ── Core predict: Sends N, P, K, Temp, Hum, pH, Rain to Backend ─
  async predict(input) {
    try {
      const res = await fetch(`${this.apiBase}/predict/crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        return data.predictions;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('[VrikshML] Prediction failed:', err);
      throw err;
    }
  }

  // ── Top-N predictions ─────────────────────────────────────────
  async topN(input, n = 5) {
    const results = await this.predict(input);
    return results.slice(0, n);
  }

  // ── Soil Vision Prediction ────────────────────────────────────
  async predictSoil(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const res = await fetch(`${this.apiBase}/predict/soil`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.predictions;
    } catch (err) {
      console.error('[VrikshML] Soil prediction failed:', err);
      throw err;
    }
  }

  // ── Fertilizer Prediction ─────────────────────────────────────
  async predictFertilizer(soil, crop, n, p, k) {
    try {
      const res = await fetch(`${this.apiBase}/predict/fertilizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soil_type: soil, crop_type: crop, n, p, k })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.recommendation;
    } catch (err) {
      console.error('[VrikshML] Fertilizer prediction failed:', err);
      throw err;
    }
  }

  // ── Real-time Ideal Range Check ────────────────────────────
  idealRangeCheck(crop, input) {
    // Top crop stats (Mean, Std) from training data
    const stats = {
      "apple": { "N": [20.6, 7.1], "P": [133.6, 18.1], "K": [199.5, 26.3], "ph": [5.9, 0.5] },
      "banana": { "N": [97.7, 30.0], "P": [81.8, 20.5], "K": [49.2, 11.8], "ph": [5.9, 0.5] },
      "blackgram": { "N": [41.7, 11.6], "P": [68.9, 14.6], "K": [19.6, 4.6], "ph": [7.1, 0.4] },
      "chickpea": { "N": [39.1, 9.6], "P": [66.7, 11.6], "K": [79.6, 11.4], "ph": [7.3, 0.4] },
      "coconut": { "N": [20.7, 8.2], "P": [16.4, 5.1], "K": [29.8, 8.3], "ph": [5.9, 0.5] },
      "cotton": { "N": [116.8, 34.6], "P": [47.0, 11.3], "K": [20.4, 6.3], "ph": [6.9, 0.5] },
      "grapes": { "N": [23.0, 7.2], "P": [135.0, 19.8], "K": [203.8, 27.4], "ph": [6.1, 0.5] },
      "jute": { "N": [74.9, 20.5], "P": [46.0, 15.2], "K": [39.8, 7.7], "ph": [6.7, 0.5] },
      "kidneybeans": { "N": [21.5, 8.1], "P": [68.5, 12.9], "K": [20.0, 4.8], "ph": [5.7, 0.5] },
      "lentil": { "N": [18.5, 7.5], "P": [67.7, 13.9], "K": [19.9, 6.5], "ph": [6.9, 0.4] },
      "maize": { "N": [91.0, 29.4], "P": [49.8, 14.4], "K": [20.0, 6.0], "ph": [6.2, 0.6] },
      "mango": { "N": [20.3, 8.1], "P": [27.3, 7.9], "K": [30.3, 7.6], "ph": [6.1, 0.6] },
      "mothbeans": { "N": [19.9, 7.9], "P": [47.2, 11.8], "K": [19.6, 4.7], "ph": [7.0, 0.5] },
      "mungbean": { "N": [20.2, 7.8], "P": [46.6, 13.7], "K": [20.2, 5.1], "ph": [6.7, 0.5] },
      "muskmelon": { "N": [99.9, 17.7], "P": [18.7, 5.1], "K": [50.1, 9.9], "ph": [6.4, 0.4] },
      "orange": { "N": [19.4, 7.4], "P": [15.9, 4.9], "K": [10.0, 4.1], "ph": [7.0, 0.5] },
      "papaya": { "N": [50.2, 14.8], "P": [59.4, 16.9], "K": [49.8, 10.1], "ph": [6.7, 0.5] },
      "pigeonpeas": { "N": [21.6, 7.6], "P": [68.6, 12.5], "K": [20.5, 5.5], "ph": [5.8, 0.5] },
      "pomegranate": { "N": [18.1, 5.9], "P": [18.5, 5.7], "K": [39.7, 8.3], "ph": [6.7, 0.5] },
      "rice": { "N": [80.4, 21.9], "P": [49.0, 11.8], "K": [39.9, 7.8], "ph": [6.4, 0.4] },
      "watermelon": { "N": [97.8, 17.8], "P": [17.9, 4.8], "K": [50.2, 9.1], "ph": [6.5, 0.4] }
    };

    const cropStats = stats[crop.toLowerCase()];
    if (!cropStats) return {};

    const results = {};
    const features = ['N', 'P', 'K', 'ph'];
    
    features.forEach(f => {
      const val = input[f.toLowerCase()] || input[f];
      const [mean, std] = cropStats[f];
      results[f] = {
        value: val,
        ideal_mean: mean,
        ideal_std: std,
        within_1std: Math.abs(val - mean) <= std,
        score: Math.max(0, 1 - Math.abs(val - mean) / (2 * std))
      };
    });

    return results;
  }

  get metadata() {
    return {
      type:           'Unified Cloud Inference',
      backend:        'Flask/PyTorch/SKLearn',
      recommender:    'Tabular MLP (94.2%)',
      vision:         'MobileNetV3 Small',
      fertilizer:     'Gradient Boosting'
    };
  }
}

// Export global singleton
window.VrikshML = new VrikshMLEngine();
