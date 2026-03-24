import torch
import torch_directml

def verify_gpu():
    print("Checking for DirectML device...")
    
    # Get the DirectML device
    dml = torch_directml.device()
    print(f"DirectML device: {dml}")
    
    # Check if DirectML is available
    if torch_directml.is_available():
        print("SUCCESS: DirectML is available and ready to use.")
        
        # Create a tensor on the DML device
        x = torch.tensor([1.0, 2.0, 3.0]).to(dml)
        y = torch.tensor([4.0, 5.0, 6.0]).to(dml)
        z = x + y
        
        print(f"Tensor addition on GPU: {z}")
        print("Verification complete.")
    else:
        print("FAILURE: DirectML is not available.")

if __name__ == "__main__":
    verify_gpu()
