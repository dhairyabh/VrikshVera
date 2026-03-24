"""
VrikshVera — Expanded Crop Recommendation Dataset Generator v2
Generates ~6,800 samples across 34 crop classes (7 features each).
More carefully differentiated crop parameters based on:
  - ICAR agronomic profiles, FAO crop profiles
  - Distinct pH, K, P, rainfall signatures to reduce confusion
"""

import os
import numpy as np
import pandas as pd

np.random.seed(99)
_DIR = os.path.dirname(os.path.abspath(__file__))

# ── [N_mu, N_sd, P_mu, P_sd, K_mu, K_sd,
#     temp_mu, temp_sd, hum_mu, hum_sd,
#     ph_mu, ph_sd, rain_mu, rain_sd, n_samples]
CROP_PARAMS = {

    # ── CEREALS ──────────────────────────────────────────────────────────────
    # Rice: high rainfall, warm, humid, neutral pH
    'rice':         [80, 22,  48, 12,  40,  8,  24.0, 2.5,  82, 3.5,  6.4, 0.40, 237, 48, 200],
    # Wheat: moderate rainfall, cool, moderate humidity, loamy (distinct from barley: lower N, more rain)
    'wheat':        [100,25,  45, 10,  40,  8,  18.0, 3.5,  52, 9.0,  6.5, 0.45,  65, 18, 200],
    # Maize: moderate warmth, moderate hum, distinct K=20
    'maize':        [88, 28,  48, 14,  20,  6,  22.0, 3.5,  65, 8.5,  6.2, 0.55,  68, 22, 200],
    # Barley: very cool, low rainfall, lower humidity, high pH (distinct from wheat)
    'barley':       [65, 18,  35,  8,  30,  8,  12.0, 3.0,  42, 7.0,  7.5, 0.45,  40, 14, 200],
    # Finger millet / Ragi: warm, moderate rainfall, neutral pH, low N-P-K
    'fingermillet': [38, 12,  28,  8,  28,  8,  24.0, 3.0,  70, 8.0,  6.1, 0.50,  85, 25, 200],
    # Sorghum / Jowar: hot dry, very low rainfall, high temp
    'sorghum':      [70, 18,  35, 10,  35,  8,  30.0, 2.5,  48, 6.0,  6.7, 0.50,  55, 18, 200],

    # ── LEGUMES ──────────────────────────────────────────────────────────────
    'chickpea':     [40, 10,  68, 12,  80, 12,  18.0, 2.5,  16, 3.5,  7.3, 0.40,  80, 28, 200],
    'kidneybeans':  [21,  8,  68, 13,  20,  5,  20.0, 2.5,  22, 4.0,  5.7, 0.50, 100, 30, 200],
    'pigeonpeas':   [21,  8,  68, 12,  20,  5,  27.0, 2.5,  49, 7.0,  5.8, 0.50, 160, 42, 200],
    'mothbeans':    [21,  8,  48, 12,  20,  5,  32.0, 2.0,  55, 8.0,  7.0, 0.50,  45, 15, 200],
    'mungbean':     [21,  8,  48, 14,  20,  5,  28.0, 2.5,  85, 3.5,  6.7, 0.50,  48, 16, 200],
    'blackgram':    [40, 12,  68, 15,  20,  5,  30.0, 2.0,  65, 6.5,  7.1, 0.40,  67, 22, 200],
    'lentil':       [19,  8,  68, 14,  19,  6,  24.0, 2.5,  65, 5.5,  6.9, 0.40,  46, 16, 200],
    'soybean':      [20,  8,  68, 14,  22,  6,  25.0, 2.5,  70, 7.0,  6.5, 0.50,  92, 28, 200],

    # ── FRUITS ───────────────────────────────────────────────────────────────
    'pomegranate':  [18,  6,  18,  6,  40,  8,  22.0, 2.5,  91, 2.5,  6.7, 0.50, 107, 30, 200],
    'banana':       [100,28,  82, 22,  50, 12,  27.0, 2.0,  80, 4.5,  5.9, 0.50, 104, 30, 200],
    'mango':        [20,  8,  27,  8,  30,  8,  31.0, 2.5,  50, 7.0,  6.1, 0.55,  95, 30, 200],
    'grapes':       [23,  7, 133, 18, 200, 28,  24.0, 2.5,  82, 3.5,  6.1, 0.50,  70, 22, 200],
    'watermelon':   [100,18,  18,  5,  50, 10,  25.0, 2.0,  85, 3.5,  6.5, 0.40,  50, 18, 200],
    'muskmelon':    [100,18,  18,  5,  50, 10,  30.0, 2.5,  92, 2.5,  6.4, 0.40,  22,  8, 200],
    'apple':        [21,  7, 134, 18, 200, 28,  21.0, 2.5,  92, 2.5,  5.9, 0.50, 113, 35, 200],
    'orange':       [20,  7,  16,  5,  10,  4,  22.0, 2.5,  92, 2.5,  7.0, 0.50, 110, 32, 200],
    'papaya':       [50, 15,  59, 16,  50, 10,  33.0, 2.0,  92, 2.5,  6.7, 0.50, 143, 38, 200],
    'coconut':      [22,  8,  17,  5,  30,  8,  27.0, 2.5,  95, 2.0,  5.9, 0.50, 151, 38, 200],

    # ── VEGETABLES ───────────────────────────────────────────────────────────
    # Potato: cool temp (distinct!), high K, moderate rain
    'potato':       [75, 20,  55, 14,  80, 14,  14.0, 3.0,  72, 8.0,  5.5, 0.45,  78, 22, 200],
    # Tomato: warm, high N-P-K, moderate rain
    'tomato':       [85, 20,  65, 14,  65, 12,  25.0, 2.5,  75, 7.0,  6.2, 0.50,  72, 22, 200],
    # Onion: warm, low rainfall (distinct: very low rain + high pH vs garlic)
    'onion':        [80, 18,  50, 12,  55, 10,  22.0, 3.0,  58, 7.0,  7.0, 0.50,  45, 15, 200],
    # Garlic: cool, low rainfall, different pH from onion
    'garlic':       [55, 15,  40, 10,  42, 10,  16.0, 3.0,  60, 7.0,  6.0, 0.50,  40, 15, 200],

    # ── SPICES ───────────────────────────────────────────────────────────────
    # Ginger: warm & humid, high rainfall (very distinct)
    'ginger':       [60, 15,  50, 12,  50, 10,  26.0, 2.5,  85, 5.0,  5.5, 0.45, 145, 38, 200],

    # ── OILSEEDS ─────────────────────────────────────────────────────────────
    # Mustard: cool, moderate N, very low rainfall (distinct from wheat/barley by high P)
    'mustard':      [88, 22,  55, 12,  38,  8,  14.0, 3.0,  55, 8.0,  6.9, 0.50,  45, 15, 200],
    # Groundnut: warm, moderate everything, low K distinctive
    'groundnut':    [25,  8,  50, 12,  25,  7,  26.0, 2.5,  60, 7.0,  5.8, 0.50,  70, 22, 200],
    # Sunflower: warm, moderate rain, distinct high-P signature
    'sunflower':    [60, 15,  80, 18,  42, 10,  23.0, 3.0,  55, 8.0,  6.5, 0.50,  58, 18, 200],

    # ── CASH / FIBER ─────────────────────────────────────────────────────────
    'cotton':       [118,32,  46, 12,  20,  6,  24.0, 3.0,  80, 5.5,  6.9, 0.50,  82, 28, 200],
    'jute':         [78, 20,  47, 14,  40,  8,  25.0, 2.5,  80, 5.5,  6.7, 0.50, 175, 45, 200],
    'sugarcane':    [120,28,  40, 10,  40,  8,  27.0, 2.5,  80, 5.0,  6.5, 0.50, 150, 40, 200],
}


def generate_dataset():
    rows = []
    for crop, p in CROP_PARAMS.items():
        n = p[14]
        N    = np.random.normal(p[0],  p[1],  n).clip(0,   200)
        P    = np.random.normal(p[2],  p[3],  n).clip(0,   200)
        K    = np.random.normal(p[4],  p[5],  n).clip(0,   250)
        temp = np.random.normal(p[6],  p[7],  n).clip(5,    45)
        hum  = np.random.normal(p[8],  p[9],  n).clip(10,  100)
        ph   = np.random.normal(p[10], p[11], n).clip(3.5, 9.0)
        rain = np.random.normal(p[12], p[13], n).clip(10,  400)
        for i in range(n):
            rows.append([round(N[i], 1), round(P[i], 1), round(K[i], 1),
                         round(temp[i], 2), round(hum[i], 2),
                         round(ph[i], 2), round(rain[i], 2), crop])

    df = pd.DataFrame(rows, columns=['N', 'P', 'K', 'temperature',
                                     'humidity', 'ph', 'rainfall', 'label'])
    df = df.sample(frac=1, random_state=99).reset_index(drop=True)
    out = os.path.join(_DIR, 'crop_dataset.csv')
    df.to_csv(out, index=False)
    print(f"Dataset: {len(df)} rows | {df['label'].nunique()} crops")
    return df


if __name__ == '__main__':
    generate_dataset()
