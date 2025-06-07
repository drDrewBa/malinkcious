import joblib
import sys

print(f"Python version: {sys.version}")

try:
    model = joblib.load("random_forest_model.pkl")
    print("Model loaded successfully!")
    print(f"Model type: {type(model)}")
except Exception as e:
    print(f"Error loading model: {e}")
    print(f"Error type: {type(e)}") 