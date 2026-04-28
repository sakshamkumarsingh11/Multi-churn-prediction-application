# ChurnSense — Multi-Industry Customer Churn Prediction Platform

<div align="center">

![ChurnSense Banner](https://img.shields.io/badge/ChurnSense-AI%20Powered%20Churn%20Prediction-0f766e?style=for-the-badge&logo=react)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-FF6600?style=flat-square)](https://xgboost.readthedocs.io/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Predict customer churn before it happens — across 5 industries, powered by AI.**

[Live Demo](https://multi-churn-prediction-application.vercel.app/) • [Report Bug](https://github.com/sakshamkumarsingh11/Multi-churn-prediction-application/issues) • [Request Feature](https://github.com/sakshamkumarsingh11/Multi-churn-prediction-application/issues)

</div>

---

## What is ChurnSense?

Customer churn is the silent killer of businesses. Most companies only detect it **after** the customer has already left — when it is too late to act.

**ChurnSense** is a web-based AI decision support platform that predicts which customers are likely to leave **before they actually do** — giving businesses the window to intervene, retain, and save revenue.

> Research shows acquiring a new customer costs **5-7x more** than retaining an existing one. ChurnSense gives you the early warning system to act first.

---

## The Problem We Solve

```
Traditional Approach:              ChurnSense Approach:
─────────────────────              ──────────────────────
Customer leaves         →          AI detects risk signals
Company notices         →          Risk score generated
Too late to act         →          Retention action taken
Revenue lost            →          Customer retained ✓
```

---

## Key Features

- **Multi-Industry Support** — One platform for Telecom, Banking, E-Commerce, SaaS and Insurance
- **AI-Powered Predictions** — XGBoost models trained per industry with up to 94% accuracy
- **Risk Classification** — Every customer scored as Low, Medium or High risk
- **Dual Output Dashboard** — Statistical view for analysts + Plain English for executives
- **Actionable Suggestions** — Personalized retention recommendations per customer
- **CSV Upload** — Simple drag and drop interface, no technical knowledge needed
- **Feature Importance** — See exactly what is driving churn in your data
- **Export Results** — Download full prediction report as CSV

---

## Supported Industries

| Industry | Model | Accuracy | ROC-AUC |
|----------|-------|----------|---------|
| Telecommunications | XGBoost | ~85% | ~0.87 |
| Banking & Finance | XGBoost | ~86% | ~0.90 |
| E-Commerce & Retail | XGBoost | ~92% | ~0.97 |
| SaaS / Software | XGBoost | ~91% | ~0.96 |
| Healthcare / Insurance | XGBoost | ~80% | ~0.85 |

---

## How It Works

```
User visits website
        ↓
Selects Industry (Telecom / Banking / E-Commerce / SaaS / Insurance)
        ↓
Uploads customer CSV file
        ↓
Flask backend receives file
        ↓
Preprocessing pipeline cleans & encodes data
        ↓
Pre-trained XGBoost model runs inference
        ↓
Risk classification (Low / Medium / High)
        ↓
Results dashboard rendered
   ├── Statistical view (charts, ROC, feature importance)
   └── Plain English summary + actionable suggestions
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| Vite | Build tool |
| React Router DOM v7 | Client-side routing |
| GSAP | Animations |
| Lucide React | Icons |
| CSS Variables | Theming |

### Backend
| Technology | Purpose |
|-----------|---------|
| Flask | REST API server |
| Flask-CORS | Cross-origin requests |
| Pandas | Data manipulation |
| NumPy | Numerical operations |
| Scikit-learn | Preprocessing + evaluation |
| XGBoost | Primary ML model |
| Imbalanced-learn | SMOTE for class balancing |
| Joblib | Model serialization |

### Machine Learning Pipeline
| Step | Technique |
|------|-----------|
| Missing values | Median / Mode imputation |
| Encoding | Label encoding + One-Hot encoding |
| Scaling | StandardScaler |
| Class imbalance | SMOTE + RandomUnderSampler |
| Models trained | Logistic Regression, Random Forest, XGBoost |
| Hypertuning | RandomizedSearchCV (50 iterations, 5-fold CV) |
| Threshold tuning | Best threshold search (0.1 to 0.9) |
| Evaluation | Accuracy, ROC-AUC, Confusion Matrix, F1 Score |

---

## Project Structure

```
Multi-churn-prediction-application/
│
├── src/                          ← React Frontend
│   ├── pages/
│   │   ├── Home.jsx              ← Landing page
│   │   ├── Dashboard.jsx         ← Industry selector
│   │   ├── ServiceDetails.jsx    ← CSV upload + predict
│   │   ├── Results.jsx           ← Prediction results
│   │   ├── Login.jsx             ← Authentication
│   │   ├── Signup.jsx
│   │   └── Settings.jsx
│   ├── context/
│   │   └── AuthContext.jsx       ← Auth state management
│   ├── assets/
│   └── index.css
│
├── backend/                      ← Flask Backend
│   ├── app.py                    ← Main Flask server
│   ├── requirements.txt
│   └── models/
│       ├── telecom/              ← Telecom pkl files
│       ├── banking/              ← Banking pkl files
│       ├── ecommerce/            ← E-Commerce pkl files
│       ├── saas/                 ← SaaS pkl files
│       └── insurance/            ← Insurance pkl files
│
├── notebooks/                    ← Google Colab notebooks
│   ├── telecom_preprocessing.py
│   ├── telecom_model_training.py
│   ├── banking_preprocessing.py
│   ├── banking_model_training.py
│   ├── ecommerce_preprocessing.py
│   ├── ecommerce_training_hypertuning.py
│   ├── saas_preprocessing.py
│   ├── saas_training_hypertuning.py
│   ├── insurance_preprocessing.py
│   └── insurance_training_hypertuning.py
│
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

```
Node.js >= 20
Python >= 3.10
pip
```

### 1. Clone the repository

```bash
git clone https://github.com/sakshamkumarsingh11/Multi-churn-prediction-application.git
cd Multi-churn-prediction-application
```

### 2. Setup Frontend

```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on: `http://localhost:5000`

### 4. Add Model Files

Download trained model `.pkl` files and place them in the correct folders:

```
backend/models/
├── telecom/
│   ├── telecom_churn_model.pkl
│   └── telecom_feature_columns.pkl
├── banking/
│   ├── banking_churn_best_model.pkl
│   ├── banking_feature_columns.pkl
│   └── banking_best_threshold.pkl
├── ecommerce/
│   ├── ecommerce_churn_model.pkl
│   ├── ecommerce_feature_columns.pkl
│   ├── ecommerce_scaler.pkl
│   └── ecommerce_best_threshold.pkl
├── saas/
│   ├── saas_churn_model.pkl
│   ├── saas_feature_columns.pkl
│   ├── saas_scaler.pkl
│   └── saas_best_threshold.pkl
└── insurance/
    ├── insurance_churn_model.pkl
    ├── insurance_feature_columns.pkl
    ├── insurance_scaler.pkl
    └── insurance_best_threshold.pkl
```

### 5. Test the API

```
http://localhost:5000/health
```

Should return:
```json
{"status": "ok", "message": "ChurnSense backend is running"}
```

---

## API Reference

### Health Check
```
GET /health
```

### Run Prediction
```
POST /api/predict/{serviceType}
```

**serviceType options:** `telecom` | `saas` | `retail` | `finance` | `healthcare`

**Request:** `multipart/form-data` with CSV file attached as `file`

**Response:**
```json
{
  "serviceType": "telecom",
  "serviceLabel": "Telecommunications",
  "totalCustomers": 200,
  "highRisk": 45,
  "mediumRisk": 78,
  "lowRisk": 77,
  "overallChurnRate": "22.5%",
  "churnRateValue": 22.5,
  "customers": [
    {
      "id": "CUST-001",
      "probability": 87.3,
      "risk": "High",
      "suggestion": "This subscriber is very likely to leave..."
    }
  ],
  "featureImportance": [
    {"feature": "tenure", "importance": 0.24}
  ],
  "plainSummary": "Out of 200 customers analyzed..."
}
```

---

## Datasets Used

| Industry | Dataset | Source | Rows |
|----------|---------|--------|------|
| Telecom | IBM Telco Customer Churn | Kaggle | 7,043 |
| Banking | Bank Customer Churn Modelling | Kaggle | 10,000 |
| E-Commerce | E-Commerce Customer Churn | Kaggle | 5,630 |
| SaaS | Customer Churn Dataset | Kaggle | 64,374 |
| Insurance | Life Insurance Customer Churn | Kaggle | 200,000 |

---

## ML Model Details

### Why XGBoost?

We trained and compared 3 models for each industry:

| Model | Strength | Weakness |
|-------|---------|---------|
| Logistic Regression | Simple, interpretable | Cannot capture complex patterns |
| Random Forest | Strong, resistant to overfitting | Slower, less accurate |
| **XGBoost** | **Learns from mistakes iteratively** | **None for tabular data** |

XGBoost won across all 5 industries because our data is structured tabular data — exactly what gradient boosting is designed for.

### Handling Class Imbalance

Most churn datasets are imbalanced — only 20-27% customers actually churn. Without fixing this, models predict No Churn for everyone and still get 73% accuracy — which is useless.

**Solution:** SMOTE (Synthetic Minority Oversampling Technique)
- Creates synthetic churn examples by interpolating between real ones
- Balances training data to 50/50
- Applied only on training data — never on test data

### Hyperparameter Tuning

Used RandomizedSearchCV with 50 iterations and 5-fold cross validation to find the best combination of:

```python
params = {
    'n_estimators'    : [100, 200, 300, 400, 500],
    'max_depth'       : [3, 4, 5, 6, 7],
    'learning_rate'   : [0.01, 0.03, 0.05, 0.1],
    'subsample'       : [0.6, 0.7, 0.8, 0.9],
    'colsample_bytree': [0.6, 0.7, 0.8, 0.9],
}
```

---

## Screenshots

### Industry Selection
> Dashboard with 5 industry cards — Telecom, SaaS, E-Commerce, Banking, Healthcare
> <img width="1919" height="929" alt="Screenshot 2026-04-14 221724" src="https://github.com/user-attachments/assets/3c348634-5607-4fa0-b538-794d57875228" />


### Upload & Predict
> Drag and drop CSV upload with industry-specific anti-churn best practices
> <img width="1919" height="976" alt="image" src="https://github.com/user-attachments/assets/a0255467-4a87-41ab-89e4-aedf0382620c" />


### Results Dashboard
> Three-tab results page — Overview with charts, Customer table with risk levels, Insights with plain English explanations
<img width="1919" height="946" alt="Screenshot 2026-04-14 221808" src="https://github.com/user-attachments/assets/dfa19685-b2db-4c1a-b842-9a56128fdccf" />

---

## Academic Value

This project demonstrates:

- **Machine Learning** — Model training, evaluation, comparison
- **Deep Learning Ready** — Architecture supports LSTM/CNN for time-series
- **Data Engineering** — Preprocessing pipelines for 5 different datasets
- **Class Imbalance Handling** — SMOTE, RandomUnderSampler
- **Hyperparameter Optimization** — RandomizedSearchCV
- **REST API Design** — Flask with CORS, multipart file upload
- **UI/UX Design** — Dual output for technical and non-technical users
- **Decision Support Systems** — Plain English summaries + actionable suggestions
- **Software Engineering** — Modular architecture, plug-in model design

---

## Future Scope

- [ ] Deep learning models (LSTM) for time-series behavioral data
- [ ] Real-time churn monitoring dashboard
- [ ] CRM integrations (Salesforce, HubSpot)
- [ ] Email/SMS automated retention campaign triggers
- [ ] Premium SaaS subscription model
- [ ] Cloud deployment (AWS / GCP / Azure)
- [ ] Additional industries (EdTech, Gaming, Hospitality)
- [ ] Multi-language support

---

## Team

Built with dedication by:

- **Saksham Kumar Singh** — ML Pipeline, Model Training, Backend API
- **Om negi** — Frontend Development, UI/UX Design
- **Harshit Singh** — Data Collection, Preprocessing, Research

---
<div align="center">

**If this project helped you, please give it a star!**

Made with dedication for academic research and real-world application.

</div>
