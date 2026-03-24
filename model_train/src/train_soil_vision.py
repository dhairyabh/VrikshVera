import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
import torch_directml
import os

def train_soil_vision(data_dir, model_save_path):
    # 1. Transforms
    data_transforms = {
        'Train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'test': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # 2. Datasets & Loaders
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
                      for x in ['Train', 'test']}
    
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=32, shuffle=True)
                   for x in ['Train', 'test']}
    
    dataset_sizes = {x: len(image_datasets[x]) for x in ['Train', 'test']}
    class_names = image_datasets['Train'].classes
    print(f"Classes found: {class_names}")

    # 3. Model (Transfer Learning)
    device = torch_directml.device()
    print(f"Training on: {device}")

    model = models.mobilenet_v3_small(weights='DEFAULT')
    # Freeze background layers (optional, but good for quick fine-tuning)
    for param in model.parameters():
        param.requires_grad = False
    
    # Replace classifier
    num_ftrs = model.classifier[0].in_features
    model.classifier = nn.Sequential(
        nn.Linear(num_ftrs, 128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, len(class_names))
    )
    
    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    # Only optimize the classifier parameters
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)

    # 4. Training Loop
    num_epochs = 15
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloaders['Train']:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)
        
        epoch_loss = running_loss / dataset_sizes['Train']
        epoch_acc = running_corrects.double() / dataset_sizes['Train']

        # Validation
        model.eval()
        val_corrects = 0
        with torch.no_grad():
            for inputs, labels in dataloaders['test']:
                inputs = inputs.to(device)
                labels = labels.to(device)
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                val_corrects += torch.sum(preds == labels.data)
        
        val_acc = val_corrects.double() / dataset_sizes['test']
        
        print(f'Epoch {epoch+1}/{num_epochs} - Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f} Val Acc: {val_acc:.4f}')

    # 5. Save
    if not os.path.exists('models'): os.makedirs('models')
    torch.save(model.state_dict(), model_save_path)
    # Save class names
    with open('models/soil_classes.txt', 'w') as f:
        for name in class_names:
            f.write(name + '\n')
            
    print(f"Soil Vision Model saved to {model_save_path}")

if __name__ == "__main__":
    train_soil_vision('data/soil_images/Dataset', 'models/soil_vision_model.pth')
