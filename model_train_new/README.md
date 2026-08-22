# Agriculture AI: Crop Recommendation and Soil Classification

This project provides machine learning models and scripts to assist in agricultural decision-making. It includes a crop recommendation system based on soil/climate parameters and a computer vision model for soil type classification.

## Features

1.  **Crop Recommendation**: Predicts the best crop to grow based on Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, pH, and Rainfall.
2.  **Soil Classification**: Identifies soil type (Alluvial, Arid, Black, Laterite, Mountain, Red, Yellow) from images.

## Project Structure

- `crop_dataset.csv`: Dataset used for crop recommendation.
- `Orignal-Dataset/`: Original soil image dataset.
- `CyAUG-Dataset/`: Augmented soil image dataset.
- `train_crop_model.py`: Script to train the Random Forest crop recommendation model.
- `train_soil_model.py`: Script to train the CNN soil classification model.
- `predict.py`: Unified inference script for making predictions using the trained models.
- `models/`: Directory containing saved models and preprocessors (`.pkl`, `.h5`).
- `requirements.txt`: List of dependencies.

## Installation

Ensure you have Python 3.9+ installed. Clone this repository and install the dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Training

To retrain the models:

```bash
# For Crop Recommendation
python train_crop_model.py

# For Soil Classification
python train_soil_model.py
```

### Inference (Prediction)

To use the models for predictions, use the `predict.py` script:

```python
from predict import AgricultureAI

# Initialize the AI
ai = AgricultureAI()

# 1. Recommend a crop
crop = ai.predict_crop(n=90, p=42, k=43, temp=20, humidity=82, ph=6.5, rainfall=202)
print(f"Recommended Crop: {crop}")

# 2. Classify soil from an image
soil_type, confidence = ai.predict_soil("path/to/your/soil_image.jpg")
print(f"Predicted Soil: {soil_type} ({confidence*100:.2f}%)")
```

## Model Performance

- **Crop Recommendation**: 86% Accuracy (Random Forest)
- **Soil Classification**: ~81% Validation Accuracy (MobileNetV2 Transfer Learning)
