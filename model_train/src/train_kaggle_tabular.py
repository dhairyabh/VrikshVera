import torch
import torch.nn as nn
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import torch_directml
import os

# 1. Dataset Class for Tabular Data
class KaggleTabularDataset(torch.utils.data.Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

# 2. SIMPLE MLP for Tabular Prediction
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

def train_kaggle(csv_path):
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    # Load Data
    df = pd.read_csv(csv_path)
    
    # Preprocessing
    # Target: label (Crop Name)
    target_col = 'label'
    
    # Label Encoding for Target (22 crops)
    le_target = LabelEncoder()
    df[target_col] = le_target.fit_transform(df[target_col])
    
    # Features (N, P, K, temperature, humidity, ph, rainfall)
    X = df.drop(columns=[target_col]).values
    y = df[target_col].values
    
    # Save Label Encoder Classes for Inference
    classes = le_target.classes_
    if not os.path.exists('models'): os.makedirs('models')
    pd.DataFrame(classes, columns=['crop']).to_csv('models/crop_classes.csv', index=False)
    
    # Scaling
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Loader
    train_ds = KaggleTabularDataset(X_train, y_train)
    test_ds = KaggleTabularDataset(X_test, y_test)
    train_loader = torch.utils.data.DataLoader(train_ds, batch_size=32, shuffle=True)
    test_loader = torch.utils.data.DataLoader(test_ds, batch_size=32)

    # Device
    device = torch_directml.device()
    print(f"Training on: {device}")
    
    model = CropTabularMLP(X.shape[1], len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005) # Increased LR bit

    # Training Loop
    epochs = 30
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        # Validation
        if (epoch + 1) % 5 == 0:
            model.eval()
            correct = 0
            total = 0
            with torch.no_grad():
                for batch_x, batch_y in test_loader:
                    batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                    outputs = model(batch_x)
                    _, predicted = torch.max(outputs.data, 1)
                    total += batch_y.size(0)
                    correct += (predicted == batch_y).sum().item()
            
            acc = 100 * correct / total
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(train_loader):.4f}, Test Acc: {acc:.2f}%")

    # Save
    if not os.path.exists('models'): os.makedirs('models')
    torch.save(model.state_dict(), 'models/crop_recommendation_model.pth')
    print("Training Complete. Model and classes saved.")

if __name__ == "__main__":
    # Updated path to the new CSV
    train_kaggle('data/Crop_recommendation.csv')
