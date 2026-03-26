import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from models_inference import VrikshInference

try:
    print("Testing VrikshInference initialization...")
    model_dir = os.path.join(os.getcwd(), 'backend', 'models')
    inference = VrikshInference(model_dir=model_dir)
    print("SUCCESS: VrikshInference initialized!")
except Exception as e:
    print(f"FAILURE: {str(e)}")
    import traceback
    traceback.print_exc()
