import pandas as pd
import numpy as np
import pickle
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image

class VrikshInference:
    def __init__(self, model_dir=None):
        # Default to the local models directory if not provided
        if model_dir is None:
            self.model_dir = os.path.join(os.path.dirname(__file__), 'models')
        else:
            self.model_dir = model_dir
            
        self.load_models()
        
    def load_models(self):
        # Load Crop Recommendation Models
        try:
            with open(os.path.join(self.model_dir, 'crop_rf_model.pkl'), 'rb') as f:
                self.crop_model = pickle.load(f)
            with open(os.path.join(self.model_dir, 'crop_label_encoder.pkl'), 'rb') as f:
                self.crop_le = pickle.load(f)
            with open(os.path.join(self.model_dir, 'crop_scaler.pkl'), 'rb') as f:
                self.crop_scaler = pickle.load(f)
            print(f"Crop Recommendation models loaded from {self.model_dir}")
        except Exception as e:
            print(f"Error loading Crop Recommendation models: {e}")
            self.crop_model = None
            
        # Load Soil Classification Model
        try:
            self.soil_model = tf.keras.models.load_model(os.path.join(self.model_dir, 'soil_classifier_model.h5'))
            # Class indices for soil (matching model_train_new/predict.py)
            self.soil_classes = ['Alluvial_Soil', 'Arid_Soil', 'Black_Soil', 'Laterite_Soil', 'Mountain_Soil', 'Red_Soil', 'Yellow_Soil']
            print(f"Soil Classification model loaded from {self.model_dir}")
        except Exception as e:
            print(f"Error loading Soil Classification model: {e}")
            self.soil_model = None

    def predict_crop(self, n, p, k, temp, humidity, ph, rainfall):
        """
        Recommend top crops based on soil and climate features.
        Returns a list of dictionaries with 'crop' and 'confidence'.
        """
        if self.crop_model is None:
            return []
        
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
        features_scaled = self.crop_scaler.transform(features)
        
        # Get probabilities for all classes
        probs = self.crop_model.predict_proba(features_scaled)[0]
        
        # Sort by confidence
        top_indices = np.argsort(probs)[::-1]
        
        results = []
        for idx in top_indices:
            if probs[idx] > 0:
                results.append({
                    'crop': self.crop_le.inverse_transform([idx])[0],
                    'confidence': round(float(probs[idx]) * 100, 2)
                })
        
        return results

    def predict_soil(self, img_path):
        """
        Classify soil type from an image path.
        """
        if self.soil_model is None:
            return None
        
        try:
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            
            predictions = self.soil_model.predict(img_array)
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            
            return {
                'soil_type': self.soil_classes[class_idx],
                'confidence': round(confidence * 100, 2)
            }
        except Exception as e:
            print(f"Error during soil prediction: {e}")
            return None
