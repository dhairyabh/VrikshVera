import torch
import torch.nn as nn
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os

# 1. SIMPLE MLP for Tabular Prediction
class CropTabularMLP(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(CropTabularMLP, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        return self.net(x)

def train_4feat_model(csv_path):
    # Load Data
    df = pd.read_csv(csv_path)
    
    # Preprocessing
    target_col = 'label'
    le_target = LabelEncoder()
    df[target_col] = le_target.fit_transform(df[target_col])
    
    # 4 FEATURES ONLY: N, P, K, ph
    FEATURES = ['N', 'P', 'K', 'ph']
    X = df[FEATURES].values
    y = df[target_col].values
    
    classes = le_target.classes_
    print(f"Classes: {classes}")
    
    # Scaling
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    print(f"Means: {scaler.mean_}")
    print(f"Stds: {scaler.scale_}")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    
    device = torch.device('cpu')
    model = CropTabularMLP(4, len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    # Training Loop
    epochs = 100
    for epoch in range(epochs):
        model.train()
        batch_x = torch.tensor(X_train, dtype=torch.float32)
        batch_y = torch.tensor(y_train, dtype=torch.long)
        
        optimizer.zero_grad()
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 20 == 0:
            model.eval()
            with torch.no_grad():
                test_outputs = model(torch.tensor(X_test, dtype=torch.float32))
                _, pred = torch.max(test_outputs, 1)
                acc = (pred == torch.tensor(y_test)).sum().item() / len(y_test)
                print(f"Epoch {epoch+1}, Loss: {loss.item():.4f}, Acc: {acc*100:.2f}%")

    # Save
    model_dir = 'backend/models'
    if not os.path.exists(model_dir): os.makedirs(model_dir)
    torch.save(model.state_dict(), os.path.join(model_dir, 'crop_recommendation_model.pth'))
    pd.DataFrame(classes, columns=['crop']).to_csv(os.path.join(model_dir, 'crop_classes.csv'), index=False)
    print("Retraining Complete.")

if __name__ == "__main__":
    train_4feat_model('model_train/data/Crop_recommendation.csv')
