import sys
import os

# Add backend to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, 'backend'))

try:
    from models_inference import VrikshInference
    print("Importing VrikshInference successful.")
    
    # Initialize with the migrated models
    model_dir = os.path.join(BASE_DIR, 'backend', 'models')
    inference = VrikshInference(model_dir=model_dir)
    
    print("\n--- Testing Crop Prediction ---")
    # N, P, K, temp, humidity, ph, rainfall
    crop_res = inference.predict_crop(90, 42, 43, 20, 82, 6.5, 202)
    print(f"Top prediction: {crop_res[0]}")
    
    print("\n--- Testing Fertilizer Prediction ---")
    fert_res = inference.predict_fertilizer("Loamy", "Rice", 80, 40, 40)
    print(f"Recommendation: {fert_res}")
    
    print("\nVerification Complete: Backend is ready for new models.")

except Exception as e:
    print(f"\nVerification FAILED: {e}")
    import traceback
    traceback.print_exc()
