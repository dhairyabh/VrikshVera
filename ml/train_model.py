"""
KrishiMitra -- ML Training Pipeline
Trains Random Forest & Gaussian Naive Bayes on crop dataset.
Exports trained model as crop_model.json for use in JS frontend.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report

_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- Step 1: Generate / Load dataset ----------------------------
from generate_dataset import generate_dataset

print("=" * 60)
print("  KrishiMitra -- Crop Recommendation ML Training Pipeline")
print("=" * 60)

df = generate_dataset()
print(f"\n[OK] Dataset: {len(df)} samples, {df['label'].nunique()} crops\n")

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
X = df[FEATURES].values
y = df['label'].values

# ---- Step 2: Train / Test Split ---------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train: {len(X_train)} | Test: {len(X_test)}")

# ---- Step 3: Train Random Forest --------------------------------
print("\n[RF] Training Random Forest (200 trees)...")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf.predict(X_test))
rf_cv  = cross_val_score(rf, X, y, cv=5).mean()
print(f"   Test Accuracy  : {rf_acc * 100:.2f}%")
print(f"   CV  Accuracy   : {rf_cv  * 100:.2f}%")
print("\n   Feature Importances:")
for feat, imp in sorted(zip(FEATURES, rf.feature_importances_), key=lambda x: -x[1]):
    bar = '#' * int(imp * 40)
    print(f"   {feat:14s} {bar:<40s} {imp * 100:.1f}%")

# ---- Step 4: Train Gaussian NB (for JS export) ------------------
print("\n[GNB] Training Gaussian Naive Bayes...")
gnb = GaussianNB()
gnb.fit(X_train, y_train)
gnb_acc = accuracy_score(y_test, gnb.predict(X_test))
gnb_cv  = cross_val_score(gnb, X, y, cv=5).mean()
print(f"   Test Accuracy  : {gnb_acc * 100:.2f}%")
print(f"   CV  Accuracy   : {gnb_cv  * 100:.2f}%")

# ---- Step 5: Classification Report ------------------------------
print("\n[REPORT] Classification Report (Random Forest):")
print(classification_report(y_test, rf.predict(X_test)))

# ---- Step 6: Export GNB model to JSON --------------------------
print("\n[EXPORT] Saving model to crop_model.json ...")

classes = list(gnb.classes_)
theta   = gnb.theta_.tolist()    # means  (n_classes x n_features)
var     = gnb.var_.tolist()      # variances
prior   = gnb.class_prior_.tolist()

# Per-class descriptive stats (for UI ideal-range display)
class_stats = {}
for crop in classes:
    sub = df[df['label'] == crop]
    class_stats[crop] = {
        feat: {
            'mean': round(float(sub[feat].mean()), 2),
            'std':  round(float(sub[feat].std()),  2),
            'min':  round(float(sub[feat].min()),  2),
            'max':  round(float(sub[feat].max()),  2)
        }
        for feat in FEATURES
    }

feature_importance = {
    feat: round(float(imp), 4)
    for feat, imp in zip(FEATURES, rf.feature_importances_)
}

model_json = {
    "model_type":    "GaussianNaiveBayes",
    "version":       "2.0",
    "trained_on":    f"{len(df)} samples",
    "test_accuracy": round(gnb_acc * 100, 2),
    "rf_accuracy":   round(rf_acc  * 100, 2),
    "features":      FEATURES,
    "n_features":    len(FEATURES),
    "classes":       classes,
    "n_classes":     len(classes),
    "class_prior":   {c: round(p, 6) for c, p in zip(classes, prior)},
    "theta":         {c: theta[i] for i, c in enumerate(classes)},
    "var":           {c: var[i]   for i, c in enumerate(classes)},
    "feature_importance": feature_importance,
    "class_stats":   class_stats,
    "crop_icons": {
        # Cereals
        "rice": "Grain", "wheat": "Grain", "maize": "Corn",
        "barley": "Grain", "fingermillet": "Grain", "sorghum": "Grain",
        # Legumes
        "chickpea": "Legume", "kidneybeans": "Legume", "pigeonpeas": "Legume",
        "mothbeans": "Legume", "mungbean": "Legume", "blackgram": "Legume",
        "lentil": "Legume", "soybean": "Legume",
        # Fruits
        "pomegranate": "Fruit", "banana": "Fruit", "mango": "Fruit",
        "grapes": "Fruit", "watermelon": "Fruit", "muskmelon": "Fruit",
        "apple": "Fruit", "orange": "Fruit", "papaya": "Fruit", "coconut": "Fruit",
        # Vegetables
        "potato": "Vegetable", "tomato": "Vegetable",
        "onion": "Vegetable", "garlic": "Spice",
        # Spices
        "ginger": "Spice",
        # Oilseeds
        "mustard": "Oilseed", "groundnut": "Oilseed", "sunflower": "Oilseed",
        # Cash / Fiber
        "cotton": "Cash", "jute": "Fiber", "sugarcane": "Cash"
    }
}

out_path = os.path.join(_DIR, 'crop_model.json')
with open(out_path, 'w') as f:
    json.dump(model_json, f, indent=2)

size_kb = os.path.getsize(out_path) / 1024
print(f"[DONE] Model saved: {out_path}")
print(f"       Size: {size_kb:.1f} KB | Classes: {len(classes)}")
print(f"\n{'=' * 60}")
print(f"  Training Complete!")
print(f"  Random Forest Accuracy : {rf_acc  * 100:.2f}%")
print(f"  GNB Accuracy           : {gnb_acc * 100:.2f}%")
print(f"  Model path             : ml/crop_model.json")
print(f"{'=' * 60}\n")
