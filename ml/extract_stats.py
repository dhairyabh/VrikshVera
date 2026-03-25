import json
import os

def extract_stats(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    stats = {}
    features = ['N', 'P', 'K', 'ph']
    
    # We only care about the 22 crops in the new model
    new_model_crops = [
        'apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee', 'cotton',
        'grapes', 'jute', 'kidneybeans', 'lentil', 'maize', 'mango', 'mothbeans',
        'mungbean', 'muskmelon', 'orange', 'papaya', 'pigeonpeas', 'pomegranate',
        'rice', 'watermelon'
    ]
    
    for crop in new_model_crops:
        if crop in data['class_stats']:
            crop_data = data['class_stats'][crop]
            stats[crop] = {}
            for f in features:
                stats[crop][f] = [
                    round(crop_data[f]['mean'], 1),
                    round(crop_data[f]['std'], 1)
                ]
    
    print(json.dumps(stats, indent=2))

if __name__ == "__main__":
    extract_stats('C:/Users/dhair_zr08i69/OneDrive/Desktop/Agriculture_2/ml/crop_model.json')
