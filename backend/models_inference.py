import os
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image
import joblib

class VrikshInference:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.crop_model = None
        self.crop_le = None
        self.crop_scaler = None
        self.soil_model = None
        self.soil_labels = []
        self.fert_model = None
        self.fert_features = []
        self.fert_labels = None
        self.load_models()
        
    def load_models(self):
        # 1. Load Crop Recommendation Models (Random Forest)
        try:
            with open(os.path.join(self.model_dir, 'crop_rf_model.pkl'), 'rb') as f:
                self.crop_model = pickle.load(f)
            with open(os.path.join(self.model_dir, 'crop_label_encoder.pkl'), 'rb') as f:
                self.crop_le = pickle.load(f)
            with open(os.path.join(self.model_dir, 'crop_scaler.pkl'), 'rb') as f:
                self.crop_scaler = pickle.load(f)
            print("Crop Recommendation models loaded successfully.")
        except Exception as e:
            print(f"Error loading Crop Recommendation models: {e}")
            self.crop_model = None
            
        # 2. Load Soil Classification Model (Keras/H5)
        try:
            self.soil_model = tf.keras.models.load_model(os.path.join(self.model_dir, 'soil_classifier_model.h5'))
            self.soil_labels = ['Alluvial_Soil', 'Arid_Soil', 'Black_Soil', 'Laterite_Soil', 'Mountain_Soil', 'Red_Soil', 'Yellow_Soil']
            print("Soil Classification model loaded successfully.")
        except Exception as e:
            print(f"Error loading Soil Classification model: {e}")
            self.soil_model = None
            
        # 3. Load Fertilizer Model (Kept from previous version)
        try:
            self.fert_model = joblib.load(os.path.join(self.model_dir, 'fertilizer_rf_model.joblib'))
            self.fert_features = joblib.load(os.path.join(self.model_dir, 'fertilizer_feature_names.joblib'))
            self.fert_labels = joblib.load(os.path.join(self.model_dir, 'fertilizer_labels.joblib'))
            print("Fertilizer model loaded successfully.")
        except Exception as e:
            print(f"Error loading Fertilizer model: {e}")
            self.fert_model = None

    def predict_crop(self, n, p, k, temp, humidity, ph, rainfall):
        if self.crop_model is None:
            return [{"crop": "Model Error", "confidence": 0, "probability": 0}]
        
        # New model uses 7 features: N, P, K, temp, humidity, ph, rainfall
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
        features_scaled = self.crop_scaler.transform(features)
        
        # Random Forest predict_proba gives probabilities for all classes
        probs = self.crop_model.predict_proba(features_scaled)[0]
        classes = self.crop_le.classes_
        
        results = []
        for i, prob in enumerate(probs):
            p_val = float(prob)
            results.append({
                "crop": classes[i],
                "probability": p_val,
                "confidence": float(np.round(p_val * 100, 2))
            })
        
        # Sort by probability descending
        return sorted(results, key=lambda x: x['probability'], reverse=True)

    def predict_soil(self, image_path):
        if self.soil_model is None:
            return [{"soil": "Model Error", "confidence": 0, "probability": 0}]
        
        # Preprocess image for MobileNetV2 (Keras)
        img = keras_image.load_img(image_path, target_size=(224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0
        
        predictions = self.soil_model.predict(img_array)
        probs = predictions[0]
        
        results = []
        for i, prob in enumerate(probs):
            p_val = float(prob)
            results.append({
                "soil": self.soil_labels[i],
                "probability": p_val,
                "confidence": float(np.round(p_val * 100, 2))
            })
            
        return sorted(results, key=lambda x: x['probability'], reverse=True)

    def predict_fertilizer(self, soil_type, crop_type, n, p, k):
        if self.fert_model is None:
            return "Fertilizer model Error"
            
        # Initialize dictionary with explicit float values to satisfy linter
        data = {str(feat): float(0) for feat in self.fert_features}
        if 'Nitrogen' in data: data['Nitrogen'] = float(n)
        if 'Phosphorous' in data: data['Phosphorous'] = float(p)
        if 'Potassium' in data: data['Potassium'] = float(k)
        
        soil_col = f'Soil Type_{soil_type}'
        crop_col = f'Crop Type_{crop_type}'
        
        if soil_col in data: data[soil_col] = 1
        if crop_col in data: data[crop_col] = 1
        
        df = pd.DataFrame([data])[self.fert_features]
        return self.fert_model.predict(df)[0]
