import joblib 
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel , Field            # use for data validation
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

model = joblib.load('Mental_Health_Model.pkl')


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class InputData(BaseModel):
    age                            : int = Field(... , ge=0 , le=100)    # ... means imp and ge = greater than equal to
    gender                         : Literal['Male','Female']
    country                        : str
    academic_level                 : Literal['Undergraduate', 'Graduate', 'High School']
    most_used_platform             : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter','YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp','WeChat']
    purpose_of_use                 : Literal['Networking', 'Education', 'Entertainment', 'News']
    avg_daily_usage_hours          : float = Field(... , ge=0 , le=24)
    daily_unlocks                  : int = Field(... , ge=0)
    study_hours                    : float = Field(... , ge=0 , le=24)
    physical_activity_hours        : float = Field(... , ge=0 , le=24)
    sleep_hours_per_night          : float = Field(... , ge=0 , le=24)
    stress_level                   : Literal[ 'Low','Medium', 'High', 'Very High']





# respose validate 
class PredictionResponse(BaseModel):
    predicted_mental_health_score : float
    
    
    


@app.get("/")
def greet():
    return {
        "message": "Mental Health Prediction API",
        "status": "running"
    }


top_countries = ['Other','India','USA','Canada','Australia','UK','Germany','Mexico','Turkey','France']


@app.post('/predict' , response_model = PredictionResponse)
def predict(data : InputData):
    
    country_group = data.country if data.country in top_countries else 'Other'
    
    input_values = pd.DataFrame([{
        
        'Age'     : data.age,
        'Gender'  : data.gender,
        'Country' : data.country,
        'Academic_Level' : data.academic_level,
        'Most_Used_Platform' : data.most_used_platform,
        'Purpose_Of_Use' : data.purpose_of_use,
        'Avg_Daily_Usage_Hours' : data.avg_daily_usage_hours,
        'Daily_Unlocks' : data.daily_unlocks,
        'Study_Hours' : data.study_hours,
        'Physical_Activity_Hours' : data.physical_activity_hours,
        'Sleep_Hours_Per_Night' : data.sleep_hours_per_night,
        'Stress_Level' : data.stress_level,
        'Grouped_country' : country_group

    }])
    
    total_hours = (
    data.avg_daily_usage_hours
    + data.study_hours
    + data.physical_activity_hours
    + data.sleep_hours_per_night
    )

    if total_hours > 24:
        raise HTTPException(
            status_code=400,
            detail="The total of sleep, study, social media usage, and physical activity hours cannot exceed 24 hours per day."
        )
    
    prediction = model.predict(input_values)[0]
    
    return PredictionResponse(predicted_mental_health_score = round(float(prediction) , 2))