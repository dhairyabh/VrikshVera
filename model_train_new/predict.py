import pandas as pd
import numpy as np
import pickle
import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image

class AgricultureAI:
    def __init__(self, models_dir='models'):
        self.models_dir = models_dir
        self.load_models()
        
    def load_models(self):
        # Load Crop Recommendation Models
        try:
            with open(os.path.join(self.models_dir, 'crop_rf_model.pkl'), 'rb') as f:
                self.crop_model = pickle.load(f)
            with open(os.path.join(self.models_dir, 'crop_label_encoder.pkl'), 'rb') as f:
                self.crop_le = pickle.load(f)
            with open(os.path.join(self.models_dir, 'crop_scaler.pkl'), 'rb') as f:
                self.crop_scaler = pickle.load(f)
            print("Crop Recommendation models loaded successfully.")
        except Exception as e:
            print(f"Error loading Crop Recommendation models: {e}")
            self.crop_model = None
            
        # Load Soil Classification Model
        try:
            self.soil_model = tf.keras.models.load_model(os.path.join(self.models_dir, 'soil_classifier_model.h5'))
            # Class indices for soil (should match what was used in training)
            self.soil_classes = ['Alluvial_Soil', 'Arid_Soil', 'Black_Soil', 'Laterite_Soil', 'Mountain_Soil', 'Red_Soil', 'Yellow_Soil']
            print("Soil Classification model loaded successfully.")
        except Exception as e:
            print(f"Error loading Soil Classification model: {e}")
            self.soil_model = None

    def predict_crop(self, n, p, k, temp, humidity, ph, rainfall):
        """
        Recommend a crop based on soil and climate features.
        """
        if self.crop_model is None:
            return "Crop model not loaded."
        
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
        features_scaled = self.crop_scaler.transform(features)
        prediction = self.crop_model.predict(features_scaled)
        crop_name = self.crop_le.inverse_transform(prediction)[0]
        return crop_name

    def predict_soil(self, img_path):
        """
        Classify soil type from an image.
        """
        if self.soil_model is None:
            return "Soil model not loaded."
        
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0
        
        predictions = self.soil_model.predict(img_array)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        return self.soil_classes[class_idx], confidence

# Example usage
if __name__ == "__main__":
    ai = AgricultureAI()
    
    # Example Crop Prediction
    # Input: N, P, K, temp, humidity, ph, rainfall
    # Example values for 'rice' category
    crop = ai.predict_crop(90, 42, 43, 20, 82, 6.5, 202)
    print(f"\nRecommended Crop: {crop}")
    
    # Example Soil Prediction (if an image exists)
    # soil_type, conf = ai.predict_soil('path/to/soil/image.jpg')
    # print(f"Predicted Soil: {soil_type} ({conf*100:.2f}%)")
