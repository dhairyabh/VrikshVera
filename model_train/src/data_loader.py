import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import pandas as pd
import os

class MultimodalDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        """
        Args:
            csv_file (string): Path to the csv file with tabular data and img labels.
            img_dir (string): Directory with all the images.
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.data_frame = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform
        
        # Assume CSV has columns: 'N', 'P', 'K', 'ph', 'temp', 'hum', 'rain', 'img_name', 'label'

    def __len__(self):
        return len(self.data_frame)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        # Tabular Data (Flexible Column Matching)
        # Try to find common columns or just take first few
        row = self.data_frame.iloc[idx]
        
        # Example: Temperature, Humidity, Moisture, N, P, K, pH
        # We can explicitly map if they exist
        try:
            tab_values = [
                row.get('Nitrogen', row.get('N', 0)),
                row.get('Phosphorous', row.get('P', 0)),
                row.get('Potassium', row.get('K', 0)),
                row.get('ph', row.get('pH', 0)),
                row.get('Moisture', 0)
            ]
        except:
            tab_values = row[0:5].values.astype('float')
            
        tabular_data = torch.tensor(tab_values, dtype=torch.float32)

        # Image Data
        img_name = os.path.join(self.img_dir, self.data_frame.iloc[idx, 7])
        image = Image.open(img_name).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        else:
            # Default transform for MobileNet
            default_t = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ])
            image = default_t(image)

        # Label
        label = self.data_frame.iloc[idx, 8]
        
        return image, tabular_data, torch.tensor(label, dtype=torch.long)

def get_dataloader(csv_file, img_dir, batch_size=32):
    dataset = MultimodalDataset(csv_file=csv_file, img_dir=img_dir)
    return DataLoader(dataset, batch_size=batch_size, shuffle=True)
