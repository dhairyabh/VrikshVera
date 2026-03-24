import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_fertilizer_gb(csv_path):
    print("Training Fertilizer Model (Optimized Gradient Boosting)...")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    
    # Filter for high-quality data (First 100 rows are the "ground truth" patterns)
    df = df.head(100).copy()
    
    # Target column
    target_col = 'Fertilizer Name'
    
    # Ensure no weather features (Temperature, Humidity)
    to_drop = [col for col in ['Temparature', 'Humidity'] if col in df.columns]
    if to_drop:
        df = df.drop(columns=to_drop)

    # One-Hot Encoding for categorical features
    df_encoded = pd.get_dummies(df, columns=['Soil Type', 'Crop Type'])
    
    # Features (X) and Target (y)
    X = df_encoded.drop(columns=[target_col])
    y = df_encoded[target_col]
    
    # Save feature names for inference
    feature_names = X.columns.tolist()
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Best Model: Gradient Boosting
    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    
    # K-Fold Cross-Validation to address overfitting concerns
    from sklearn.model_selection import cross_val_score
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"5-Fold Cross-Validation Scores: {cv_scores}")
    print(f"Mean CV Accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*2*100:.2f}%)")
    
    model.fit(X_train, y_train)
    
    # Evaluation
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Gradient Boosting Accuracy: {acc*100:.2f}%")
    
    # Save artifacts
    if not os.path.exists('models'): 
        os.makedirs('models')
        
    joblib.dump(model, 'models/fertilizer_rf_model.joblib') # Reusing same name for compatibility
    joblib.dump(feature_names, 'models/fertilizer_feature_names.joblib')
    
    # Also save unique labels for reference
    labels = np.unique(y).tolist()
    joblib.dump(labels, 'models/fertilizer_labels.joblib')
    
    print("Optimized Fertilizer Model saved.")

if __name__ == "__main__":
    train_fertilizer_gb('models/data_core.csv')
