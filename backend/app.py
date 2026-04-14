

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import traceback

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# ── Model file paths ──────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE, 'models')

MODEL_CONFIG = {
    'telecom': {
        'model'     : os.path.join(MODELS_DIR, 'telecom', 'telecom_churn_model.pkl'),
        'columns'   : os.path.join(MODELS_DIR, 'telecom', 'telecom_feature_columns.pkl'),
        'scaler'    : None,  # not available
        'threshold' : os.path.join(MODELS_DIR, 'telecom', 'telecom_best_threshold.pkl'),
        'label'     : 'Telecommunications',
    },
    'saas': {
        'model'     : os.path.join(MODELS_DIR, 'saas', 'saas_churn_model.pkl'),
        'columns'   : os.path.join(MODELS_DIR, 'saas', 'saas_feature_columns.pkl'),
        'scaler'    : os.path.join(MODELS_DIR, 'saas', 'saas_scaler.pkl'),
        'threshold' : os.path.join(MODELS_DIR, 'saas', 'saas_best_threshold.pkl'),
        'label'     : 'SaaS / Software',
    },
    'retail': {
        'model'     : os.path.join(MODELS_DIR, 'ecommerce', 'ecommerce_churn_model.pkl'),
        'columns'   : os.path.join(MODELS_DIR, 'ecommerce', 'ecommerce_feature_columns.pkl'),
        'scaler'    : os.path.join(MODELS_DIR, 'ecommerce', 'ecommerce_scaler.pkl'),
        'threshold' : os.path.join(MODELS_DIR, 'ecommerce', 'ecommerce_best_threshold.pkl'),
        'label'     : 'Retail & E-commerce',
    },
    'finance': {
        'model'     : os.path.join(MODELS_DIR, 'banking', 'banking_churn_best_model.pkl'),
        'columns'   : os.path.join(MODELS_DIR, 'banking', 'banking_feature_columns.pkl'),
        'scaler'    : None,  # not available
        'threshold' : os.path.join(MODELS_DIR, 'banking', 'banking_best_threshold.pkl'),
        'label'     : 'Banking & Finance',
    },
    'healthcare': {
        'model'     : os.path.join(MODELS_DIR, 'insurance', 'insurance_churn_model.pkl'),
        'columns'   : os.path.join(MODELS_DIR, 'insurance', 'insurance_feature_columns.pkl'),
        'scaler'    : os.path.join(MODELS_DIR, 'insurance', 'insurance_scaler.pkl'),
        'threshold' : os.path.join(MODELS_DIR, 'insurance', 'insurance_best_threshold.pkl'),
        'label'     : 'Healthcare / Insurance',
    },
}

# ── Load model helper ─────────────────────────────────────
def load_model_assets(service):
    cfg     = MODEL_CONFIG[service]
    model   = joblib.load(cfg['model'])
    columns = joblib.load(cfg['columns'])

    scaler = None
    if cfg['scaler'] and os.path.exists(cfg['scaler']):
        scaler = joblib.load(cfg['scaler'])

    threshold = 0.5
    if cfg['threshold'] and os.path.exists(cfg['threshold']):
        threshold = joblib.load(cfg['threshold'])

    return model, columns, scaler, threshold

# ── Risk classification ───────────────────────────────────
# Risk is relative to the model's threshold so it works across
# models with very different probability ranges.
def assign_risk(prob, threshold=0.5):
    if prob >= threshold:
        # Above decision boundary — how far above?
        headroom = 1.0 - threshold
        if headroom > 0 and (prob - threshold) / headroom >= 0.35:
            return 'High'
        else:
            return 'Medium'
    else:
        # Below decision boundary — how far below?
        if threshold > 0 and (threshold - prob) / threshold >= 0.50:
            return 'Low'
        else:
            return 'Medium'

# ── Retention suggestion per service and risk ─────────────
SUGGESTIONS = {
    'telecom': {
        'High'  : 'This subscriber is very likely to leave. Immediately offer a personalised retention package — discounted plan, data upgrade, or priority support.',
        'Medium': 'This subscriber is showing signs of disengagement. Reach out with a loyalty reward or a plan upgrade offer before they decide to leave.',
        'Low'   : 'This subscriber is stable. Maintain engagement through regular usage updates and reward their loyalty.',
    },
    'saas': {
        'High'  : 'This account is at serious risk of cancellation. Assign a customer success manager and schedule an urgent business review call.',
        'Medium': 'This account shows reduced engagement. Trigger an automated re-engagement email and offer a feature walkthrough or upgrade.',
        'Low'   : 'This account is healthy. Continue regular check-ins and look for upsell opportunities.',
    },
    'retail': {
        'High'  : 'This customer has likely stopped buying. Send a win-back campaign with an exclusive discount and personalised product recommendations.',
        'Medium': 'This customer is becoming less active. Trigger a re-engagement email with a time-limited offer or loyalty points bonus.',
        'Low'   : 'This customer is loyal and active. Reward them with early access to new products or a loyalty programme invite.',
    },
    'finance': {
        'High'  : 'This customer is at high risk of closing their account. Assign a relationship manager and offer a premium service or fee waiver.',
        'Medium': 'This customer is showing early warning signs. Proactively reach out to discuss their financial needs and relevant product offers.',
        'Low'   : 'This customer is satisfied. Look for cross-selling opportunities such as investment products or insurance bundles.',
    },
    'healthcare': {
        'High'  : 'This policyholder is very likely to lapse. Contact them immediately to review their coverage and offer a premium discount or plan adjustment.',
        'Medium': 'This policyholder shows disengagement. Schedule a policy review call and highlight the value of their current coverage.',
        'Low'   : 'This policyholder is stable. Send a wellness update and reinforce the value of their plan through educational content.',
    },
}

def get_suggestion(service, risk):
    return SUGGESTIONS.get(service, SUGGESTIONS['telecom']).get(risk, '')

# ── Preprocessing per service ─────────────────────────────
def preprocess(df, service, columns, scaler):
    """
    Clean and encode the uploaded CSV to match the trained model's feature columns.
    Each service has its own encoding logic matching what we did in Colab.
    """
    df = df.copy()
    df.columns = df.columns.str.strip()

    # Drop ID-like columns
    id_cols = [c for c in df.columns if any(x in c.lower() for x in
               ['customerid', 'customer_id', 'rownum', 'rownumber',
                'surname', 'name', 'address', 'company'])]
    df.drop(columns=id_cols, errors='ignore', inplace=True)

    # Drop target column if accidentally included
    for t in ['Churn', 'churn', 'Exited', 'exited']:
        if t in df.columns:
            df.drop(columns=[t], inplace=True)

    # ── Replace whitespace-only strings with NaN ──
    df.replace(r'^\s*$', np.nan, regex=True, inplace=True)

    # ── Coerce object columns that are actually numeric ──
    for col in df.columns:
        if df[col].dtype == 'object':
            converted = pd.to_numeric(df[col], errors='coerce')
            # If at least half the non-null values converted, treat as numeric
            if converted.notna().sum() >= df[col].notna().sum() * 0.5:
                df[col] = converted

    # ── Fill missing values ──
    for col in df.columns:
        if df[col].dtype in ['float64', 'int64']:
            df[col].fillna(df[col].median(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown', inplace=True)

    # ── Service-specific encoding ──
    if service == 'telecom':
        if 'gender' in df.columns:
            df['gender'] = df['gender'].map({'Female': 0, 'Male': 1}).fillna(0)
        for col in ['Partner', 'Dependents', 'PhoneService', 'PaperlessBilling']:
            if col in df.columns:
                df[col] = df[col].map({'No': 0, 'Yes': 1}).fillna(0)
        multi_cols = ['MultipleLines', 'InternetService', 'OnlineSecurity',
                      'OnlineBackup', 'DeviceProtection', 'TechSupport',
                      'StreamingTV', 'StreamingMovies', 'Contract', 'PaymentMethod']
        existing = [c for c in multi_cols if c in df.columns]
        if existing:
            df = pd.get_dummies(df, columns=existing, drop_first=True)
        scale_cols = [c for c in ['tenure', 'MonthlyCharges', 'TotalCharges'] if c in df.columns]
        if scaler and scale_cols:
            df[scale_cols] = scaler.transform(df[scale_cols])

    elif service == 'saas':
        if 'Gender' in df.columns:
            df['Gender'] = df['Gender'].map({'Female': 0, 'Male': 1}).fillna(0)
        cat_cols = [c for c in ['Subscription Type', 'Contract Length'] if c in df.columns]
        if cat_cols:
            df = pd.get_dummies(df, columns=cat_cols, drop_first=True)
        scale_cols = [c for c in ['Age', 'Tenure', 'Usage Frequency', 'Support Calls',
                                   'Payment Delay', 'Total Spend', 'Last Interaction']
                      if c in df.columns]
        if scaler and scale_cols:
            df[scale_cols] = scaler.transform(df[scale_cols])

    elif service == 'retail':
        cat_cols = [c for c in df.columns if df[c].dtype == 'object']
        if cat_cols:
            df = pd.get_dummies(df, columns=cat_cols, drop_first=True)
        scale_cols = [c for c in df.columns
                      if df[c].dtype in ['float64', 'int64'] and df[c].nunique() > 2]
        if scaler and scale_cols:
            df[scale_cols] = scaler.transform(df[scale_cols])

    elif service == 'finance':
        if 'Gender' in df.columns:
            df['Gender'] = df['Gender'].map({'Female': 0, 'Male': 1}).fillna(0)
        if 'Geography' in df.columns:
            df = pd.get_dummies(df, columns=['Geography'], drop_first=True)
        scale_cols = [c for c in ['CreditScore', 'Age', 'Tenure', 'Balance',
                                   'NumOfProducts', 'EstimatedSalary'] if c in df.columns]
        if scaler and scale_cols:
            df[scale_cols] = scaler.transform(df[scale_cols])

    elif service == 'healthcare':
        cat_cols = [c for c in df.columns if df[c].dtype == 'object']
        if cat_cols:
            df = pd.get_dummies(df, columns=cat_cols, drop_first=True)
        scale_cols = [c for c in ['Claim Amount', 'Category Premium',
                                   'Premium/Amount Ratio', 'BMI'] if c in df.columns]
        if scaler and scale_cols:
            df[scale_cols] = scaler.transform(df[scale_cols])

    # ── Align to model columns ──
    # Add missing columns as 0, drop extras
    for col in columns:
        if col not in df.columns:
            df[col] = 0
    df = df[columns]

    # Convert bool columns to int
    for col in df.columns:
        if df[col].dtype == bool:
            df[col] = df[col].astype(int)

    return df

# ── Plain English summary ─────────────────────────────────
def generate_plain_summary(service, total, high, medium, low, churn_rate):
    label = MODEL_CONFIG[service]['label']
    summaries = {
        'telecom': f"Out of {total:,} subscribers analyzed, {high:,} ({high/total*100:.1f}%) are at serious risk of leaving your network in the near future. These customers are showing signs like low usage, frequent complaints, or month-to-month contracts. Another {medium:,} customers ({medium/total*100:.1f}%) are showing early warning signs and need attention. The good news is {low:,} subscribers ({low/total*100:.1f}%) are stable and loyal. Your overall churn rate stands at {churn_rate:.1f}%. Acting on high-risk customers now can save significant revenue.",
        'saas'   : f"Your {label} account analysis shows {high:,} accounts ({high/total*100:.1f}%) are at high risk of cancelling their subscription soon. These accounts show low login frequency, poor feature adoption, or high support ticket volume. {medium:,} accounts ({medium/total*100:.1f}%) need proactive engagement before they become high risk. {low:,} accounts ({low/total*100:.1f}%) are healthy and growing. Your current churn rate is {churn_rate:.1f}% — immediate outreach to high-risk accounts can significantly improve retention.",
        'retail' : f"Out of {total:,} customers analyzed, {high:,} ({high/total*100:.1f}%) have significantly reduced their purchase activity and are likely to stop buying altogether. {medium:,} customers ({medium/total*100:.1f}%) are showing declining engagement and need a re-engagement push. Your {low:,} loyal customers ({low/total*100:.1f}%) are actively purchasing and should be rewarded. Overall churn risk stands at {churn_rate:.1f}% — targeted win-back campaigns for high-risk customers can recover lost revenue.",
        'finance': f"Analysis of {total:,} banking customers reveals {high:,} ({high/total*100:.1f}%) are at high risk of closing their accounts or switching to a competitor. These customers may have dormant accounts, low product utilisation, or unresolved complaints. {medium:,} customers ({medium/total*100:.1f}%) need proactive outreach. Your {low:,} stable customers ({low/total*100:.1f}%) are satisfied and should be targeted for cross-sell. Churn risk is {churn_rate:.1f}% — assigning relationship managers to high-risk accounts is the most effective intervention.",
        'healthcare': f"Out of {total:,} policyholders analyzed, {high:,} ({high/total*100:.1f}%) are at high risk of not renewing their policies. These customers may have had claim rejections, high premiums relative to claims, or low engagement with their coverage. {medium:,} policyholders ({medium/total*100:.1f}%) need a proactive policy review call. {low:,} policyholders ({low/total*100:.1f}%) are satisfied and loyal. Your overall churn rate is {churn_rate:.1f}% — a timely outreach programme can significantly improve renewal rates.",
    }
    return summaries.get(service, summaries['telecom'])

# ═══════════════════════════════════════════════════════════
#   API ROUTES
# ═══════════════════════════════════════════════════════════

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'ChurnSense backend is running'})

@app.route('/api/predict/<service>', methods=['POST'])
def predict(service):
    if service not in MODEL_CONFIG:
        return jsonify({'error': f'Unknown service: {service}'}), 400

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # ── Read CSV ──
        df_original = pd.read_csv(file)
        total = len(df_original)

        if total == 0:
            return jsonify({'error': 'Uploaded file is empty'}), 400

        # ── Load model assets ──
        model, columns, scaler, threshold = load_model_assets(service)

        # ── Preprocess ──
        df_processed = preprocess(df_original.copy(), service, columns, scaler)

        # ── Predict ──
        probs = model.predict_proba(df_processed)[:, 1]
        preds = (probs >= threshold).astype(int)

        # ── Debug logging ──
        print(f"[DEBUG] Service: {service}")
        print(f"[DEBUG] Threshold: {threshold}")
        print(f"[DEBUG] Prob min={probs.min():.4f}  max={probs.max():.4f}  mean={probs.mean():.4f}")
        print(f"[DEBUG] Predictions sum={preds.sum()}/{len(preds)}")

        # ── Risk classification ──
        risks       = [assign_risk(p, threshold) for p in probs]
        suggestions = [get_suggestion(service, r) for r in risks]

        high_count   = int(sum(1 for r in risks if r == 'High'))
        medium_count = int(sum(1 for r in risks if r == 'Medium'))
        low_count    = int(sum(1 for r in risks if r == 'Low'))
        churn_rate   = float(preds.mean() * 100)

        print(f"[DEBUG] Risk counts: High={high_count}, Medium={medium_count}, Low={low_count}")
        print(f"[DEBUG] Churn rate: {churn_rate:.1f}%")

        # ── Per-customer table (first 200 rows max for UI) ──
        customer_rows = []
        id_col = None
        for c in df_original.columns:
            if any(x in c.lower() for x in ['customerid', 'customer_id', 'id']):
                id_col = c
                break

        for i in range(min(total, 200)):
            row = {
                'id'         : str(df_original[id_col].iloc[i]) if id_col else str(i + 1),
                'probability': round(float(probs[i]) * 100, 1),
                'risk'       : risks[i],
                'suggestion' : suggestions[i],
            }
            customer_rows.append(row)

        # ── Feature importance (top 8) ──
        feature_importance = []
        if hasattr(model, 'feature_importances_'):
            fi = pd.DataFrame({
                'feature'   : columns,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False).head(8)
            feature_importance = fi.to_dict(orient='records')

        # ── Plain English summary ──
        plain_summary = generate_plain_summary(
            service, total, high_count, medium_count, low_count, churn_rate
        )

        # ── Response ──
        response = {
            'serviceType'       : service,
            'serviceLabel'      : MODEL_CONFIG[service]['label'],
            'totalCustomers'    : total,
            'highRisk'          : high_count,
            'mediumRisk'        : medium_count,
            'lowRisk'           : low_count,
            'overallChurnRate'  : f'{churn_rate:.1f}%',
            'churnRateValue'    : churn_rate,
            'customers'         : customer_rows,
            'featureImportance' : feature_importance,
            'plainSummary'      : plain_summary,
            'modelThreshold'    : float(threshold),
        }

        return jsonify(response)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("ChurnSense backend starting on http://localhost:5000")
    app.run(debug=True, port=5000)