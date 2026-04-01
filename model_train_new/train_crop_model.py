import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import pickle
import os

def train_crop_recommendation(file_path):
    print("--- Training Crop Recommendation Model ---")
    
    # 1. Load context
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return
    
    df = pd.read_csv(file_path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns.")
    
    # 2. Preprocessing
    # Features (X) and Target (y)
    X = df.drop('label', axis=1)
    y = df['label']
    
    # Encode target labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)
    
    # 3. Model Training
    # Random Forest is typically one of the best for this tabular data
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    # 4. Evaluation
    y_pred = rf_model.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    # 5. Save Model and Preprocessors
    model_dir = 'models'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    with open(os.path.join(model_dir, 'crop_rf_model.pkl'), 'wb') as f:
        pickle.dump(rf_model, f)
    
    with open(os.path.join(model_dir, 'crop_label_encoder.pkl'), 'wb') as f:
        pickle.dump(le, f)
        
    with open(os.path.join(model_dir, 'crop_scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
        
    print(f"\nModel and preprocessors saved in '{model_dir}' directory.")

if __name__ == "__main__":
    train_crop_recommendation('crop_dataset.csv')
