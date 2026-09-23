from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import pandas as pd
from pydantic import BaseModel, Field
import joblib
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: must match the pipeline's expected column names exactly —
# the original list had "latitude " (trailing space), which silently
# dropped the real latitude value and fed the model NaN instead.
COLUMNS = [
    "neighbourhood_group", "neighbourhood", "latitude", "longitude", "price",
    "minimum_nights", "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365",
]

model = joblib.load("Model_pipeline.pkl")


class Features(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude must be between -90 and 90")
    # NOTE: original had ge=180, le=180, which rejects every real longitude
    # (NYC longitudes are negative, around -74). Valid range is -180..180.
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinates")
    price: float = Field(..., gt=0, description="Price per night, must be positive")
    minimum_nights: int = Field(..., ge=1, le=365, description="Minimum nights to stay")
    number_of_reviews: int = Field(..., ge=0, description="Total number of reviews")
    # NOTE: original typed this as int, but reviews-per-month is naturally
    # a decimal (e.g. 0.85) — kept as float so real values validate.
    reviews_per_month: float = Field(..., ge=0, description="Avg reviews per month")
    calculated_host_listings_count: int = Field(..., ge=0, description="Number of listings by this host")
    availability_365: int = Field(..., ge=0, le=365, description="Availability for how many days")
    neighbourhood_group: str = Field(..., min_length=1, description="Neighbourhood group (borough)")
    neighbourhood: str = Field(..., min_length=1, description="Specific neighbourhood name")


@app.get("/")
def greet():
    return "hello guys"


@app.post("/predict")
def predict(features: Features):
    row = pd.DataFrame([features.model_dump()], columns=COLUMNS)
    prediction = model.predict(row)
    probability = model.predict_proba(row)

    return {
        "Predicted_room_type": prediction[0],
        "Probability": probability.tolist()[0],
    }


# Serves index.html / predict.html / about.html / style.css / script.js
# from the same folder this file lives in, at http://127.0.0.1:8000/site/
app.mount("/site", StaticFiles(directory=".", html=True), name="site")
