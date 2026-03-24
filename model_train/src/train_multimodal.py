import torch
import torch.nn as nn
import torchvision.models as models
import torch_directml
from data_loader import get_dataloader

class MultimodalModel(nn.Module):
    def __init__(self, num_classes):
        super(MultimodalModel, self).__init__()
        
        # 1. Vision Branch (MobileNetV3)
        self.vision_base = models.mobilenet_v3_small(weights='DEFAULT')
        # Remove the classifier and keep features
        self.vision_features = self.vision_base.features
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        
        # 2. Tabular Branch
        self.tabular_branch = nn.Sequential(
            nn.Linear(5, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU()
        )
        
        # 3. Fusion Layer
        # MobileNetV3 small has 576 output channels before pooling
        self.fc = nn.Sequential(
            nn.Linear(576 + 16, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x_img, x_tab):
        # Vision forward
        img_feat = self.vision_features(x_img)
        img_feat = self.avgpool(img_feat)
        img_feat = torch.flatten(img_feat, 1)
        
        # Tabular forward
        tab_feat = self.tabular_branch(x_tab)
        
        # Concatenate
        combined = torch.cat((img_feat, tab_feat), dim=1)
        
        # Classifier
        output = self.fc(combined)
        return output

def train_model(csv_file, img_dir, num_classes, epochs=10):
    # Device setup (DirectML for Intel GPU)
    device = torch_directml.device()
    print(f"Training on device: {device}")

    model = MultimodalModel(num_classes).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    loader = get_dataloader(csv_file, img_dir)

    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for images, tabs, labels in loader:
            images = images.to(device)
            tabs = tabs.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images, tabs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(loader):.4f}")

    # Save model
    torch.save(model.state_dict(), 'models/multimodal_crop_model.pth')
    print("Model saved to models/multimodal_crop_model.pth")

if __name__ == "__main__":
    # Example usage (placeholders)
    # train_model('data/crop_data.csv', 'data/images/', num_classes=10)
    print("Multimodal Training Script Ready. Please provide dataset.")
