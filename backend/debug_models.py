"""Find optimal threshold for telecom model using test predictions."""
import os, sys, io, json, joblib, numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import preprocess, load_model_assets, assign_risk

BASE = os.path.dirname(os.path.abspath(__file__))
output = []
def log(msg=""): output.append(str(msg))

# Telecom model: find what thresholds produce reasonable results
# Use a larger dataset with known labels
telecom_csv = """customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges,Churn
7590-VHVEG,Female,0,Yes,No,1,No,No phone service,DSL,No,Yes,No,No,No,No,Month-to-month,Yes,Electronic check,29.85,29.85,No
5575-GNVDE,Male,0,No,No,34,Yes,No,DSL,Yes,No,Yes,No,No,No,One year,No,Mailed check,56.95,1889.5,No
3668-QPYBK,Male,0,No,No,2,Yes,No,DSL,Yes,Yes,No,No,No,No,Month-to-month,Yes,Mailed check,53.85,108.15,Yes
7795-CFOCW,Male,0,No,No,45,No,No phone service,DSL,Yes,No,Yes,Yes,No,No,One year,No,Bank transfer (automatic),42.3,1840.75,No
9237-HQITU,Female,0,No,No,2,Yes,No,Fiber optic,No,No,No,No,No,No,Month-to-month,Yes,Electronic check,70.7,151.65,Yes
9305-CDSKC,Female,0,No,No,8,Yes,Yes,Fiber optic,No,No,Yes,No,Yes,Yes,Month-to-month,Yes,Electronic check,99.65,820.5,Yes
1452-KIOVK,Male,0,No,Yes,22,Yes,Yes,Fiber optic,No,Yes,No,No,Yes,No,Month-to-month,Yes,Credit card (automatic),89.10,1949.4,No
6713-OKOMC,Female,0,No,No,10,No,No phone service,DSL,Yes,No,No,No,No,No,Month-to-month,No,Mailed check,29.75,301.9,No
7892-POOKP,Female,1,Yes,No,28,Yes,Yes,Fiber optic,No,No,Yes,Yes,Yes,Yes,Month-to-month,Yes,Electronic check,104.80,3046.05,Yes
6388-TABTU,Male,0,No,Yes,62,Yes,No,No,No internet service,No internet service,No internet service,No internet service,No internet service,No internet service,One year,No,Bank transfer (automatic),19.70,1237.85,No
9763-GRSKD,Male,0,Yes,Yes,13,Yes,No,DSL,Yes,No,No,No,No,No,Month-to-month,No,Mailed check,44.20,542.4,No
7469-LKBCI,Male,0,No,No,16,Yes,No,No,No internet service,No internet service,No internet service,No internet service,No internet service,No internet service,Two year,No,Credit card (automatic),18.95,326.8,No
8091-TTVAX,Male,0,Yes,No,58,Yes,Yes,Fiber optic,No,No,Yes,No,Yes,Yes,One year,Yes,Credit card (automatic),100.35,5681.1,No
0280-XJGEX,Male,0,No,No,49,Yes,Yes,Fiber optic,No,Yes,Yes,Yes,Yes,Yes,One year,Yes,Bank transfer (automatic),103.70,5036.3,No
5129-JLPIS,Male,0,No,No,25,Yes,No,Fiber optic,Yes,No,Yes,Yes,No,No,Month-to-month,Yes,Electronic check,84.60,2127.65,Yes
3655-SNQYZ,Female,0,Yes,Yes,69,Yes,Yes,DSL,Yes,Yes,Yes,Yes,Yes,Yes,Two year,No,Mailed check,78.7,5372.7,No
8879-MKJQH,Female,0,No,No,52,Yes,No,No,No internet service,No internet service,No internet service,No internet service,No internet service,No internet service,One year,No,Mailed check,18.75,984.15,No
0731-MJYAX,Male,1,Yes,No,1,Yes,No,Fiber optic,No,No,No,Yes,No,Yes,Month-to-month,Yes,Electronic check,84.65,84.65,Yes
6858-ENOQX,Female,0,Yes,No,1,Yes,No,DSL,No,No,No,No,No,No,Month-to-month,No,Mailed check,44.55,44.55,Yes
3186-AJIEC,Male,0,No,No,1,Yes,No,No,No internet service,No internet service,No internet service,No internet service,No internet service,No internet service,Month-to-month,Yes,Mailed check,20.15,20.15,Yes"""

model, columns, scaler, threshold = load_model_assets('telecom')
df = pd.read_csv(io.StringIO(telecom_csv))
actual = df['Churn'].map({'Yes': 1, 'No': 0}).values
df_proc = preprocess(df.copy(), 'telecom', columns, scaler)
probs = model.predict_proba(df_proc)[:, 1]

log("Telecom probabilities vs actual labels:")
for i in range(len(df)):
    log(f"  Customer {df['customerID'].iloc[i]}: prob={probs[i]:.4f}, actual={actual[i]}, risk={assign_risk(probs[i])}")

log(f"\nProb distribution:")
log(f"  Min: {probs.min():.4f}")
log(f"  Max: {probs.max():.4f}")
log(f"  Mean: {probs.mean():.4f}")
log(f"  Median: {np.median(probs):.4f}")

log(f"\nProbs for actual churners: {probs[actual == 1].tolist()}")
log(f"Probs for actual non-churners: {probs[actual == 0].tolist()}")
log(f"Mean prob churners: {probs[actual == 1].mean():.4f}")
log(f"Mean prob non-churners: {probs[actual == 0].mean():.4f}")

# Find optimal threshold
from sklearn.metrics import f1_score
best_t, best_f1 = 0.5, 0
for t in np.arange(0.05, 0.95, 0.01):
    p = (probs >= t).astype(int)
    f1 = f1_score(actual, p, zero_division=0)
    if f1 > best_f1:
        best_f1 = f1
        best_t = t
    
log(f"\nOptimal threshold (F1): {best_t:.2f} (F1={best_f1:.3f})")
log(f"Current threshold: {threshold}")

# Show churn rates at various thresholds
for t in [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50]:
    p = (probs >= t).astype(int)
    log(f"  threshold={t:.2f}: churn_rate={p.mean()*100:.1f}%, predictions={p.tolist()}")

with open(os.path.join(BASE, 'debug_threshold_output.txt'), 'w') as f:
    f.write('\n'.join(output))
print("Done. Output written to debug_threshold_output.txt")
