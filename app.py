"""
MediAI - Medical Diagnosis System
A Flask-based application for AI-powered disease prediction using machine learning models.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import pickle
import numpy as np
import logging
import os
from datetime import datetime
from config import DevelopmentConfig

# Create logs directory if it doesn't exist (must be before logging configuration)
os.makedirs('logs', exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/mediai.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mediai_users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database and login manager
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access the diagnosis tools.'
login_manager.login_message_category = 'info'

# User Model
class User(UserMixin, db.Model):
    """User model for authentication"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for session management"""
    return User.query.get(int(user_id))

# Model configuration
MODEL_CONFIG = {
    'diabetes': {
        'path': 'model/diabetes_model.sav',
        'name': 'Diabetes',
        'description': 'Diabetes Risk Assessment'
    },
    'heart': {
        'path': 'model/heart_model.sav',
        'name': 'Heart Disease',
        'description': 'Cardiovascular Risk Assessment'
    },
    'lung': {
        'path': 'model/lung_model.sav',
        'name': 'Lung Cancer',
        'description': 'Lung Cancer Risk Screening'
    },
    'parkinsons': {
        'path': 'model/parkinsons_model.sav',
        'name': "Parkinson's Disease",
        'description': 'Neurological Assessment'
    },
    'thyroid': {
        'path': 'model/thyroid_model.sav',
        'name': 'Thyroid Disorder',
        'description': 'Endocrine Health Assessment'
    }
}

# Load models at startup
models = {}

def load_models():
    """Load all ML models from pickle files."""
    try:
        for disease, config in MODEL_CONFIG.items():
            if os.path.exists(config['path']):
                models[disease] = pickle.load(open(config['path'], 'rb'))
                logger.info(f"OK - Loaded {config['name']} model successfully")
            else:
                logger.warning(f"ERROR - Model file not found: {config['path']}")
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        raise


# Load models when app starts
load_models()
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    """Render home page."""
    try:
        logger.info("Home page accessed")
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering home page: {str(e)}")
        return render_template('index.html'), 500


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """Handle user signup."""
    if request.method == 'POST':
        try:
            username = request.form.get('username', '').strip()
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            
            # Validation
            if not username or not email or not password:
                flash('All fields are required!', 'danger')
                logger.warning(f"Signup attempt with missing fields")
                return redirect(url_for('signup'))
            
            if len(password) < 6:
                flash('Password must be at least 6 characters long!', 'danger')
                return redirect(url_for('signup'))
            
            if password != confirm_password:
                flash('Passwords do not match!', 'danger')
                return redirect(url_for('signup'))
            
            # Check if user already exists
            if User.query.filter_by(username=username).first():
                flash('Username already exists! Please choose a different one.', 'danger')
                logger.warning(f"Signup attempt with existing username: {username}")
                return redirect(url_for('signup'))
            
            if User.query.filter_by(email=email).first():
                flash('Email already registered! Please use login.', 'danger')
                logger.warning(f"Signup attempt with existing email: {email}")
                return redirect(url_for('signup'))
            
            # Create new user
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            logger.info(f"New user registered: {username}")
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error during signup: {str(e)}")
            flash('An error occurred during signup. Please try again.', 'danger')
            return redirect(url_for('signup'))
    
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        try:
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '')
            
            if not username or not password:
                flash('Username and password are required!', 'danger')
                return redirect(url_for('login'))
            
            # Find user
            user = User.query.filter_by(username=username).first()
            
            if user and user.check_password(password):
                login_user(user)
                logger.info(f"User logged in: {username}")
                flash(f'Welcome back, {username}!', 'success')
                return redirect(url_for('home'))
            else:
                logger.warning(f"Failed login attempt for: {username}")
                flash('Invalid username or password!', 'danger')
                return redirect(url_for('login'))
        
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            flash('An error occurred during login. Please try again.', 'danger')
            return redirect(url_for('login'))
    
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    """Handle user logout."""
    username = current_user.username
    logout_user()
    logger.info(f"User logged out: {username}")
    flash('You have been logged out successfully!', 'info')
    return redirect(url_for('home'))


@app.route('/predict', methods=['POST'])
@login_required
def predict():
    """
    Handle disease prediction requests.
    Extracts patient data from form, processes through ML model, and returns prediction.
    """
    try:
        # Get disease type
        disease = request.form.get('disease', '').lower()
        
        # Validate disease type
        if disease not in MODEL_CONFIG:
            logger.warning(f"Invalid disease type requested: {disease}")
            return render_template('index.html', 
                                 prediction_text="❌ Invalid disease type selected",
                                 risk="Error"), 400
        
        # Check if model is loaded
        if disease not in models:
            logger.error(f"Model not loaded for disease: {disease}")
            return render_template('index.html',
                                 prediction_text="❌ Model not available. Please try again later.",
                                 risk="Error"), 500
        
        # Extract numeric values from form
        values = []
        for key in sorted(request.form.keys()):
            if key.startswith("f"):
                try:
                    values.append(float(request.form[key]))
                except ValueError:
                    logger.warning(f"Invalid numeric input for {key}: {request.form[key]}")
                    return render_template('index.html',
                                         prediction_text="❌ Invalid input values. Please enter numbers only.",
                                         risk="Error"), 400
        
        # Validate that we have input data
        if not values:
            logger.warning("No input values provided for prediction")
            return render_template('index.html',
                                 prediction_text="❌ No input values provided.",
                                 risk="Error"), 400
        
        # Prepare input for model
        input_data = np.array([values])
        
        # Get model and prediction
        model = models[disease]
        prediction = model.predict(input_data)
        disease_name = MODEL_CONFIG[disease]['name']
        
        # Prepare result message
        if prediction[0] == 1:
            result = f"⚠️ <strong>High Risk Detected</strong> for {disease_name}"
            risk = "High"
            logger.info(f"High risk prediction for {disease_name}")
        else:
            result = f"✅ <strong>Low Risk Assessment</strong> for {disease_name}"
            risk = "Low"
            logger.info(f"Low risk prediction for {disease_name}")
        
        # Log prediction details
        logger.info(f"Prediction complete - Disease: {disease_name}, Risk: {risk}, Values: {values}")
        
        return render_template('index.html', 
                             prediction_text=result, 
                             risk=risk)
    
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}", exc_info=True)
        return render_template('index.html',
                             prediction_text="❌ An error occurred during analysis. Please try again.",
                             risk="Error"), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """API endpoint to check application health."""
    try:
        loaded_models = len(models)
        total_models = len(MODEL_CONFIG)
        status = "healthy" if loaded_models == total_models else "degraded"
        
        return jsonify({
            'status': status,
            'timestamp': datetime.now().isoformat(),
            'models_loaded': loaded_models,
            'total_models': total_models
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    logger.warning(f"404 Error: {request.path}")
    return render_template('index.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"500 Error: {str(error)}")
    return render_template('index.html'), 500


if __name__ == "__main__":
    logger.info("=" * 50)
    logger.info("START - MediAI - Medical Diagnosis System Starting")
    logger.info(f"Timestamp: {datetime.now()}")
    logger.info("=" * 50)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        logger.info("Database tables created/verified")
    
    app.run(debug=True, host='0.0.0.0', port=5000)