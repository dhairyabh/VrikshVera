import torch
import torch.nn as nn
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import torch_directml
import os

class FertilizerMLP(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(FertilizerMLP, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        return self.net(x)

def train_fertilizer(csv_path):
    df = pd.read_csv(csv_path)
    
    # 1. One-Hot Encoding for categorical inputs
    df_encoded = pd.get_dummies(df, columns=['Soil Type', 'Crop Type'])
    
    # Target: Fertilizer Name
    target_col = 'Fertilizer Name'
    le_target = LabelEncoder()
    df_encoded[target_col] = le_target.fit_transform(df_encoded[target_col])
    
    # Features
    X = df_encoded.drop(columns=[target_col]).values.astype(float)
    y = df_encoded[target_col].values
    
    # Save target classes and feature columns for inference
    if not os.path.exists('models'): os.makedirs('models')
    pd.DataFrame(le_target.classes_, columns=['fertilizer']).to_csv('models/fertilizer_classes.csv', index=False)
    pd.DataFrame(df_encoded.drop(columns=[target_col]).columns, columns=['feature']).to_csv('models/fertilizer_features.csv', index=False)

    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    
    # Device - Using CPU for Debugging Convergence
    device = torch.device('cpu') 
    print(f"Training Fertilizer Model on: {device}")
    
    model = FertilizerMLP(X.shape[1], len(le_target.classes_)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    train_ds = torch.utils.data.TensorDataset(torch.tensor(X_train, dtype=torch.float32), torch.tensor(y_train, dtype=torch.long))
    train_loader = torch.utils.data.DataLoader(train_ds, batch_size=32, shuffle=True)

    test_ds = torch.utils.data.TensorDataset(torch.tensor(X_test, dtype=torch.float32), torch.tensor(y_test, dtype=torch.long))
    test_loader = torch.utils.data.DataLoader(test_ds, batch_size=32)

    for epoch in range(50): # Increased epochs
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
        
        # Eval every 10 epochs
        if (epoch + 1) % 10 == 0:
            model.eval()
            correct = 0
            with torch.no_grad():
                for batch_x, batch_y in test_loader:
                    batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                    _, pred = torch.max(model(batch_x), 1)
                    correct += (pred == batch_y).sum().item()
            print(f"Epoch {epoch+1}/50, Loss: {total_loss/len(train_loader):.4f}, Test Accuracy: {100*correct/len(X_test):.2f}%")

    torch.save(model.state_dict(), 'models/fertilizer_model.pth')
    print("Fertilizer Model Saved.")

if __name__ == "__main__":
    train_fertilizer('data/Crop_and_Soil.csv')

if __name__ == "__main__":
    train_fertilizer('data/Crop_and_Soil.csv')
