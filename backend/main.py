from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from typing import List, Literal
import traceback
import logging
import re
from urllib.parse import urlparse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Classification mapping
URL_CLASSIFICATIONS = {
    0: "benign",
    1: "defacement",
    2: "phishing",
    3: "malware"
}

app = FastAPI(title="Malicious Link Detection API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the model
model = None

# Feature extraction functions
def digit_count(url):
    """Counts the number of digit characters in a URL"""
    return sum(c.isdigit() for c in url)

def letter_count(url):
    """Counts the number of letter characters in a URL"""
    return sum(c.isalpha() for c in url)

def having_ip_address(url):
    match = re.search(
        '(([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.'
        '([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\/)|'  # IPv4
        '(([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.'
        '([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\/)|'  # IPv4 with port
        '((0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\/)' # IPv4 in hexadecimal
        '(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|'
        '([0-9]+(?:\.[0-9]+){3}:[0-9]+)|'
        '((?:(?:\d|[01]?\d\d|2[0-4]\d|25[0-5])\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d|\d)(?:\/\d{1,2})?)', url)  # Ipv6
    if match:
        return 1
    else:
        return 0

def Shortining_Service(url):
    """Check if URL uses a URL shortening service"""
    shortening_services = (
        'bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|'
        'yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|'
        'short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|'
        'doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|'
        'db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|'
        'q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|'
        'x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|'
        'tr\.im|link\.zip\.net'
    )
    return 1 if re.search(shortening_services, url) else 0

def httpSecure(url):
    """Check if URL uses HTTPS"""
    return 1 if urlparse(url).scheme == 'https' else 0

def abnormal_url(url):
    """Check if URL hostname matches the URL string"""
    hostname = urlparse(url).hostname
    if not hostname:
        return 1
    match = re.search(hostname, url)
    return 0 if match else 1

class LinkRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    classification: Literal["benign", "defacement", "phishing", "malware"]
    confidence: float
    text: str

@app.on_event("startup")
async def load_model():
    global model
    try:
        # Load the Random Forest model using joblib
        model = joblib.load("random_forest_model.pkl")
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to load model")

@app.get("/")
def read_root():
    return {"message": "Malicious Link Detection API is running"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: LinkRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        logger.info(f"Processing URL: {request.text}")
        
        # Extract features from the URL using the same functions used during training
        features = extract_features(request.text)
        logger.info(f"Extracted features: {features}")
        
        # Make prediction
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0]
        
        # Get the highest probability
        max_prob = max(probability)
        
        # Get the classification label
        classification = URL_CLASSIFICATIONS[prediction]
        
        logger.info(f"Prediction: {prediction} ({classification}), Probability: {max_prob}")
        
        return {
            "classification": classification,
            "confidence": float(max_prob),
            "text": request.text
        }
    except Exception as e:
        logger.error(f"Error processing URL: {request.text}")
        logger.error(str(e))
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

def extract_features(url):
    try:
        # Extract the same features used during training
        features = []
        feature_names = []
        
        # URL length
        features.append(len(url))
        feature_names.append("url_length")
        
        # Count of special characters
        special_chars = ['@','?','-','=','.','#','%','+','$','!','*',',','//']
        for char in special_chars:
            features.append(url.count(char))
            feature_names.append(f"count_{char}")
        
        # Other features
        features.append(abnormal_url(url))
        feature_names.append("abnormal_url")
        
        features.append(httpSecure(url))
        feature_names.append("https")
        
        features.append(digit_count(url))
        feature_names.append("digit_count")
        
        features.append(letter_count(url))
        feature_names.append("letter_count")
        
        features.append(Shortining_Service(url))
        feature_names.append("shortening_service")
        
        features.append(having_ip_address(url))
        feature_names.append("has_ip")

        # Log features with their names
        feature_dict = dict(zip(feature_names, features))
        logger.info("Extracted features:")
        for name, value in feature_dict.items():
            logger.info(f"  {name}: {value}")
        
        return features
    except Exception as e:
        logger.error(f"Error extracting features from URL: {url}")
        logger.error(str(e))
        logger.error(traceback.format_exc())
        raise 