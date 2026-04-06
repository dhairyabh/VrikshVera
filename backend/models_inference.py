import pandas as pd
import numpy as np
import pickle
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image

class VrikshInference:
    def __init__(self, model_dir=None):
        if model_dir is None:
            self.model_dir = os.path.join(os.path.dirname(__file__), 'models')
        else:
            self.model_dir = model_dir
            
        self._crop_model = None
        self._crop_le = None
        self._crop_scaler = None
        self._soil_model = None
        self.soil_classes = ['Alluvial_Soil', 'Arid_Soil', 'Black_Soil', 'Laterite_Soil', 'Mountain_Soil', 'Red_Soil', 'Yellow_Soil']

    def _load_crop_models(self):
        if self._crop_model is not None:
            return
        try:
            with open(os.path.join(self.model_dir, 'crop_rf_model.pkl'), 'rb') as f:
                self._crop_model = pickle.load(f)
            with open(os.path.join(self.model_dir, 'crop_label_encoder.pkl'), 'rb') as f:
                self._crop_le = pickle.load(f)
            with open(os.path.join(self.model_dir, 'crop_scaler.pkl'), 'rb') as f:
                self._crop_scaler = pickle.load(f)
            print(f"Crop models lazy-loaded from {self.model_dir}")
        except Exception as e:
            print(f"Lazy-loading Crop models failed: {e}")

    def _load_soil_model(self):
        if self._soil_model is not None:
            return
        try:
            print("Lazy-loading Soil Classification model (TensorFlow)...")
            self._soil_model = tf.keras.models.load_model(os.path.join(self.model_dir, 'soil_classifier_model.h5'))
            print("Soil model lazy-loaded successfully.")
        except Exception as e:
            print(f"Lazy-loading Soil model failed: {e}")

    def predict_crop(self, n, p, k, temp, humidity, ph, rainfall):
        """
        Recommend top crops based on soil and climate features.
        Returns a list of dictionaries with 'crop' and 'confidence'.
        """
        self._load_crop_models()
        if self._crop_model is None:
            return []
        
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
        features_scaled = self._crop_scaler.transform(features)
        
        # Get probabilities for all classes
        probs = self._crop_model.predict_proba(features_scaled)[0]
        
        # Sort by confidence
        top_indices = np.argsort(probs)[::-1]
        
        results = []
        for idx in top_indices:
            if probs[idx] > 0:
                results.append({
                    'crop': self._crop_le.inverse_transform([idx])[0],
                    'confidence': round(float(probs[idx]) * 100, 2)
                })
        
        return results

    def predict_soil(self, img_path):
        """
        Classify soil type from an image path.
        """
        self._load_soil_model()
        if self._soil_model is None:
            return None
        
        try:
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            
            predictions = self._soil_model.predict(img_array)
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            
            return {
                'soil_type': self.soil_classes[class_idx],
                'confidence': round(confidence * 100, 2)
            }
        except Exception as e:
            print(f"Error during soil prediction: {e}")
            return None
