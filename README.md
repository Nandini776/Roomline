# Roomline 🏠
### NYC Airbnb Room Type Classification

Roomline is an end-to-end machine learning application that predicts the **room type of an Airbnb listing in New York City** using location, pricing, review, host, and availability-related features.

🔗 **Live Demo:** https://roomline-guvg.onrender.com/predict.html

---

## Overview

The project takes Airbnb listing information as input and classifies the listing into one of three room types:

- **Entire home/apt**
- **Private room**
- **Shared room**

The project covers the complete ML workflow — from data exploration and preprocessing to model evaluation, hyperparameter tuning, model serialization, and integration with a web application.

---

## ML Workflow


AB_NYC_2019 Dataset
        │
        ▼
Data Cleaning & EDA
        │
        ▼
Feature Selection
        │
        ▼
Train / Test Split
        │
        ▼
Preprocessing Pipeline
        │
        ├── Numerical → Imputation + StandardScaler
        │
        └── Categorical → Imputation + OneHotEncoder
        │
        ▼
Model Training & Comparison
        │
        ▼
Random Forest Classifier
        │
        ▼
Cross-Validation & Evaluation
        │
        ▼
Hyperparameter Tuning
        │
        ▼
Final Scikit-learn Pipeline
        │
        ▼
FastAPI Application
        │
        ▼
Interactive Prediction Interface
        |
        ▼
Deployed on Render


---

## Real-World Use

- Roomline demonstrates how Airbnb listing data can be used to understand and predict the type of accommodation being offered based on factors such as location, pricing, reviews, host activity, and availability.
- Such a prediction can be useful for **understanding listing patterns, analyzing accommodation markets, and supporting data-driven decisions for hosts, platforms, or property analysts**.
- The project brings the complete process together — from raw real-world data and machine learning to a simple interface that makes the prediction accessible to users.
