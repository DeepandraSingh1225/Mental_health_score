🧠 Mental Health Score Prediction

A Machine Learning project that predicts a Mental Health Score based on lifestyle, social media usage, academic, physical activity, sleep, and stress-related factors.

⚠️ Disclaimer: This project predicts a score, not a medical diagnosis. See the Disclaimer section for details.

🚀 Live Demo
Component	Link
🌐 Frontend	mental-health-score-frontend-okec.onrender.com
⚙️ Backend (API)	mental-health-score-backend-h9nz.onrender.com
📋 Project Overview

This project uses supervised regression techniques to predict a person's Mental Health Score using lifestyle and behavioral data such as social media usage, sleep patterns, academic workload, physical activity, and stress levels.

The pipeline covers the full ML lifecycle:

Exploratory Data Analysis (EDA)
Data preprocessing & feature transformation
Model building and evaluation
Hyperparameter tuning
Deployment via a FastAPI backend and a lightweight HTML/CSS/JS frontend
🧾 Input Features
Feature	Description
Age	Age of the user
Gender	Gender of the user
Country	Country of residence
Academic Level	Current academic level
Most Used Social Media Platform	Primary social media platform used
Purpose of Use	Primary purpose of social media usage
Average Daily Usage Hours	Average hours spent on social media per day
Daily Unlocks	Number of times the phone is unlocked daily
Study Hours	Hours spent studying per day
Physical Activity Hours	Hours spent on physical activity per day
Sleep Hours per Night	Average sleep hours per night
Stress Level	Self-reported stress level
🎯 Target Variable

Mental_Health_Score — a continuous numerical score representing overall mental well-being.

📊 Exploratory Data Analysis

The following analyses were performed to understand the dataset:

📈 Mental Health Score Distribution
🔥 Correlation Heatmap
😰 Stress Level vs Mental Health Score
📱 Daily Usage Hours vs Mental Health Score
😴 Sleep Hours vs Mental Health Score
📦 Outlier Detection using IQR
📐 Skewness Analysis
🔍 Data Analysis & Preprocessing

Outlier Detection (IQR Method):

Q1 = First Quartile
Q3 = Third Quartile
IQR = Q3 - Q1

Skewness Handling:

Skewness was analyzed across numerical features. Study_Hours showed significant skewness, so a Log1p transformation was applied.

Study_Hours
    ↓
Log1p Transformation
    ↓
StandardScaler
🛠️ Preprocessing Pipeline
Feature Type	Preprocessing
Numerical Features	StandardScaler
Study Hours	Log1p + StandardScaler
Stress Level	OrdinalEncoder
Nominal Categorical Features	OneHotEncoder

Stress Level Order (Ordinal Encoding):

Low → Medium → High → Very High

Categorical Encoding:

OneHotEncoder(handle_unknown='ignore') was used for nominal categorical features.
All preprocessing steps were combined using a ColumnTransformer.

Train/Test Split:

test_size    = 0.3
random_state = 42
🤖 Model Building
#	Model	Notes
1	Linear Regression	Used as the baseline model
2	Random Forest Regressor	Used to capture non-linear relationships
3	Tuned Random Forest Regressor	Hyperparameters tuned using RandomizedSearchCV
📈 Model Evaluation

Metrics used:

R² Score
Mean Absolute Error (MAE)
Root Mean Squared Error (RMSE)

Results:

Model	R² Score	MAE	RMSE
Linear Regression	0.740	0.536	0.676
Random Forest	0.878	0.347	0.464
Tuned Random Forest	0.878	0.348	0.463
🏆 Best Model

Tuned Random Forest Regressor

Metric	Score
R² Score	0.878
MAE	0.348
RMSE	0.463

The trained model was saved using joblib as:

Mental_Health_Model.pkl
⚡ FastAPI Backend

Tech used:

FastAPI
Pydantic
Uvicorn
Joblib
Scikit-learn

Endpoint:

POST /predict

The API accepts user input features and returns the predicted Mental Health Score as a floating-point value.

Backend Validation Rules:

🌍 Country values are grouped into "Other" unless they belong to the top countries:
  Other, India, USA, Canada, Australia, UK, Germany, Mexico, Turkey, France
⏱️ The backend validates that:
  Average Daily Usage Hours + Study Hours + Physical Activity Hours + Sleep Hours per Night <= 24
📬 Example API Request
json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 5,
  "daily_unlocks": 50,
  "study_hours": 4,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
🖥️ Frontend

Built using:

HTML
CSS
JavaScript

The frontend provides a simple form where users enter the required information and receive the predicted Mental Health Score in real time.

🏗️ Project Architecture
User
  ↓
Frontend (HTML / CSS / JavaScript)
  ↓
FastAPI Backend
  ↓
Preprocessing Pipeline
  ↓
Tuned Random Forest Model
  ↓
Mental Health Score Prediction
  ↓
Frontend Result
🧰 Tech Stack
Category	Technologies
Programming	Python
Machine Learning	Scikit-learn, Pandas, NumPy, Joblib
Backend	FastAPI, Pydantic, Uvicorn
Frontend	HTML, CSS, JavaScript
Deployment	Render
Development	Jupyter Notebook / Google Colab, VS Code, Git & GitHub
☁️ Deployment

The application is deployed using Render, with the frontend and backend hosted as separate services.

⚠️ Disclaimer

This project is created for educational and demonstration purposes only. The predicted score should NOT be considered a medical diagnosis or professional mental health assessment.

🔮 Future Improvements
🚀 Try advanced boosting models such as XGBoost or LightGBM
🧪 Improve model performance through feature engineering
🔎 Add model explainability using SHAP
🎨 Improve frontend UI/UX
🔐 Add authentication and database support
📡 Monitor model performance after deployment
👤 Author

Deepandra Singh

AI/ML Engineer | Machine Learning | Python | AWS | Scikit-learn | FastAPI
