/**
 * VrikshVera — ML Inference Engine (Unified)
 * Multi-model inference via Flask Backend (MLP, CNN, Gradient Boosting)
 * Trained on model_train datasets · 94.2% Recommend Accuracy
 */

class VrikshMLEngine {
  constructor() {
    this.apiBase = 'http://localhost:5000';
    this.loaded  = true; // Backend is always "loaded" if reachable
    this.loading = false;
  }

  // ── Backend Connectivity Check ───────────────────────────────
  async load() {
    try {
      const res = await fetch(`${this.apiBase}/health`);
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      console.log(`[VrikshML] Connected to Backend: ${data.engine}`);
      return true;
    } catch (err) {
      console.warn('[VrikshML] Backend check failed, using fallback or awaiting startup:', err);
      return false;
    }
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

  // ── Mock ideal range check (Can be expanded in backend) ──────
  idealRangeCheck(crop, input) {
    return {}; // Placeholder for now
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
