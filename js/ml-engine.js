/**
 * KrishiMitra — ML Inference Engine (Browser)
 * Gaussian Naive Bayes inference from trained crop_model.json
 * Model accuracy: 93.60% (test), 92.52% (5-fold CV)
 * Trained on 2,420 samples · 22 crop classes · 7 features
 */

class KrishiMLEngine {
  constructor() {
    this.model   = null;
    this.loaded  = false;
    this.loading = false;
  }

  // ── Load model JSON from server / local ──────────────────────
  async load(modelPath = 'ml/crop_model.json') {
    if (this.loaded) return true;
    if (this.loading) return false;
    this.loading = true;
    try {
      const res = await fetch(modelPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.model  = await res.json();
      this.loaded = true;
      console.log(`[KrishiML] Model loaded: ${this.model.model_type} | ` +
                  `Accuracy: ${this.model.test_accuracy}% | ` +
                  `Classes: ${this.model.n_classes}`);
      return true;
    } catch (err) {
      console.error('[KrishiML] Failed to load model:', err);
      this.loading = false;
      return false;
    }
  }

  // ── Gaussian log-probability ──────────────────────────────────
  _logGaussian(x, mean, variance) {
    const eps = 1e-9;
    const v   = variance + eps;
    return -0.5 * Math.log(2 * Math.PI * v) - ((x - mean) ** 2) / (2 * v);
  }

  // ── Core predict: returns sorted {crop, score, probability}[] ─
  predict(input) {
    if (!this.loaded || !this.model) {
      throw new Error('Model not loaded. Call await engine.load() first.');
    }

    const { features, classes, theta, var: variances, class_prior, class_stats } = this.model;

    // Map input keys to feature order
    const featureVec = features.map(f => {
      const val = input[f];
      if (val === undefined || val === null) throw new Error(`Missing feature: ${f}`);
      return parseFloat(val);
    });

    // Compute log-posterior for each class
    const scores = {};
    for (const cls of classes) {
      const means  = theta[cls];
      const vars   = variances[cls];
      const logPrior = Math.log(class_prior[cls] + 1e-9);

      let logLikelihood = 0;
      for (let i = 0; i < features.length; i++) {
        logLikelihood += this._logGaussian(featureVec[i], means[i], vars[i]);
      }
      scores[cls] = logPrior + logLikelihood;
    }

    // Convert to probabilities via log-sum-exp trick
    const maxScore = Math.max(...Object.values(scores));
    const expScores = {};
    let sumExp = 0;
    for (const cls of classes) {
      expScores[cls] = Math.exp(scores[cls] - maxScore);
      sumExp += expScores[cls];
    }

    const results = classes.map(cls => ({
      crop:        cls,
      score:       scores[cls],
      probability: expScores[cls] / sumExp,
      confidence:  Math.round((expScores[cls] / sumExp) * 100),
      stats:       class_stats[cls] || {}
    }));

    // Sort by probability descending
    results.sort((a, b) => b.probability - a.probability);
    return results;
  }

  // ── Top-N predictions ─────────────────────────────────────────
  topN(input, n = 5) {
    return this.predict(input).slice(0, n);
  }

  // ── Check if input is within ideal range for a crop ──────────
  idealRangeCheck(crop, input) {
    const stats = this.model?.class_stats?.[crop];
    if (!stats) return {};
    const checks = {};
    for (const [feat, val] of Object.entries(input)) {
      if (!stats[feat]) continue;
      const { mean, std } = stats[feat];
      const z = Math.abs((val - mean) / (std + 0.01));
      checks[feat] = {
        value: val, ideal_mean: mean, ideal_std: std,
        within_1std: z <= 1,
        within_2std: z <= 2,
        deviation: Math.round(z * 10) / 10
      };
    }
    return checks;
  }

  // ── Feature importances ───────────────────────────────────────
  get featureImportance() {
    return this.model?.feature_importance || {};
  }

  // ── Model metadata ────────────────────────────────────────────
  get metadata() {
    if (!this.model) return {};
    return {
      type:           this.model.model_type,
      trainedOn:      this.model.trained_on,
      testAccuracy:   this.model.test_accuracy,
      rfAccuracy:     this.model.rf_accuracy,
      classes:        this.model.n_classes,
      features:       this.model.n_features
    };
  }
}

// Export global singleton
window.KrishiML = new KrishiMLEngine();
