import torch
import torch.nn as nn
from torchvision import models, transforms
import joblib
import pandas as pd
import numpy as np
from PIL import Image
import os

# ── Crop Recommendation MLP ────────────────────────────────────
class CropTabularMLP(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(CropTabularMLP, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes)
        )

    def forward(self, x):
        return self.net(x)

# ── Inference Engine Class ──────────────────────────────────────
class VrikshInference:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load Labels
        self.crop_labels = pd.read_csv(os.path.join(model_dir, 'crop_classes.csv'))['crop'].tolist()
        with open(os.path.join(model_dir, 'soil_classes.txt'), 'r') as f:
            self.soil_labels = [line.strip() for line in f.readlines() if line.strip()]
        
        # Load Crop Model
        self.crop_model = CropTabularMLP(4, len(self.crop_labels))
        self.crop_model.load_state_dict(torch.load(os.path.join(model_dir, 'crop_recommendation_model.pth'), map_location=self.device))
        self.crop_model.to(self.device).eval()
        
        # Load Soil Vision Model
        self.soil_model = models.mobilenet_v3_small()
        num_ftrs = self.soil_model.classifier[0].in_features
        self.soil_model.classifier = nn.Sequential(
            nn.Linear(num_ftrs, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, len(self.soil_labels))
        )
        self.soil_model.load_state_dict(torch.load(os.path.join(model_dir, 'soil_vision_model.pth'), map_location=self.device))
        self.soil_model.to(self.device).eval()
        
        # Load Fertilizer Model
        self.fert_model = joblib.load(os.path.join(model_dir, 'fertilizer_rf_model.joblib'))
        self.fert_features = joblib.load(os.path.join(model_dir, 'fertilizer_feature_names.joblib'))
        self.fert_labels = joblib.load(os.path.join(model_dir, 'fertilizer_labels.joblib'))

        # Image Transforms
        self.soil_transforms = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def predict_crop(self, n, p, k, ph):
        # ── Scaling (Manual StandardScaler) ───────────────────
        # Based on training set statistics
        # Means: [50.55, 53.36, 48.14, 6.47]
        # Stds:  [36.91, 32.98, 50.64, 0.77]
        n_s  = (n - 50.55) / 36.91
        p_s  = (p - 53.36) / 32.98
        k_s  = (k - 48.14) / 50.64
        ph_s = (ph - 6.47) / 0.77
        
        input_data = torch.tensor([[n_s, p_s, k_s, ph_s]], dtype=torch.float32).to(self.device)
        with torch.no_grad():
            outputs = self.crop_model(input_data)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
        
        results = []
        for i, prob in enumerate(probs):
            results.append({
                "crop": self.crop_labels[i],
                "probability": float(prob),
                "confidence": round(float(prob) * 100, 2)
            })
        return sorted(results, key=lambda x: x['probability'], reverse=True)

    def predict_soil(self, image_path):
        img = Image.open(image_path).convert('RGB')
        img_t = self.soil_transforms(img).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.soil_model(img_t)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
        
        results = []
        for i, prob in enumerate(probs):
            results.append({
                "soil": self.soil_labels[i],
                "probability": float(prob),
                "confidence": round(float(prob) * 100, 2)
            })
        return sorted(results, key=lambda x: x['probability'], reverse=True)

    def predict_fertilizer(self, soil_type, crop_type, n, p, k):
        # Prepare feature vector based on saved feature names
        # Example feature name: 'Soil Type_Lava' or 'Crop Type_Potato'
        data = {feat: 0 for feat in self.fert_features}
        
        # Numeric features
        if 'Nitrogen' in data: data['Nitrogen'] = n
        if 'Phosphorous' in data: data['Phosphorous'] = p
        if 'Potassium' in data: data['Potassium'] = k
        
        # Categorical features (one-hot)
        soil_col = f'Soil Type_{soil_type}'
        crop_col = f'Crop Type_{crop_type}'
        
        if soil_col in data: data[soil_col] = 1
        if crop_col in data: data[crop_col] = 1
        
        # Create DataFrame to match training order
        df = pd.DataFrame([data])[self.fert_features]
        
        # Predict
        pred = self.fert_model.predict(df)[0]
        # In this GB model, the output is often the label string itself if trained that way, 
        # or an index. Let's check training code.
        # GB trained with y as Fertilizer Name (strings). 
        # So return directly.
        return pred
