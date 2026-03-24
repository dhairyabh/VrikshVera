import kagglehub
import os
import shutil
import pandas as pd

target_dir = 'data'
if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# 1. Download Crop Recommendation Dataset
print("Downloading crop-recommendation-dataset...")
crop_path = kagglehub.dataset_download("atharvaingle/crop-recommendation-dataset")
for f in os.listdir(crop_path):
    shutil.copy(os.path.join(crop_path, f), os.path.join(target_dir, f))
    print(f"Copied {f} to {target_dir}/")

# 3. Download Soil Image Dataset
print("Downloading soil-image-dataset...")
img_path = kagglehub.dataset_download("jayaprakashpondy/soil-image-dataset")
print("Path to images:", img_path)

# Move to a dedicated folder and ensure structure is correct
target_img_dir = os.path.join(target_dir, 'soil_images')
if os.path.exists(target_img_dir): shutil.rmtree(target_img_dir)
shutil.copytree(img_path, target_img_dir)
print(f"Soil images moved to {target_img_dir}/")

# 4. Clean Tabular Data (Remove Weather)
print("Cleaning tabular data (removing weather features)...")
# Crop Recommendation
cr_path = os.path.join(target_dir, 'Crop_recommendation.csv')
if os.path.exists(cr_path):
    df = pd.read_csv(cr_path)
    df.drop(columns=['temperature', 'humidity', 'rainfall'], errors='ignore').to_csv(cr_path, index=False)
    print(f"Cleaned {cr_path}")

# Crop and Soil
cs_path = os.path.join(target_dir, 'Crop_and_Soil.csv')
if os.path.exists(cs_path):
    df = pd.read_csv(cs_path)
    df.drop(columns=['Temparature', 'Humidity'], errors='ignore').to_csv(cs_path, index=False)
    print(f"Cleaned {cs_path}")
