# MediAI - Intelligent Health Analytics System

A professional, AI-powered medical diagnosis platform leveraging machine learning for early disease detection and risk assessment.

## Features

✨ **Advanced Disease Prediction**
- Diabetes Risk Assessment
- Cardiovascular Health Analysis
- Lung Cancer Screening
- Neurological Health Evaluation (Parkinson's)
- Thyroid Function Assessment

🔬 **Technology Stack**
- Flask Web Framework
- Scikit-learn ML Models
- Python Backend
- Modern Responsive UI

🔒 **Enterprise-Grade**
- Secure data handling
- Professional error management
- Comprehensive logging
- RESTful API endpoints

## Quick Start

### Prerequisites
- Python 3.8+
- pip/virtualenv

### Installation

1. **Create Virtual Environment**
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
source venv/bin/activate      # macOS/Linux
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Run Application**
```bash
python app.py
```

4. **Access the Application**
Open your browser and navigate to: `http://localhost:5000`

## Project Structure

```
medical-ai/
├── app.py                 # Flask application & routes
├── requirements.txt       # Python dependencies
├── train_model.py         # Model training script
├── templates/
│   └── index.html         # Professional UI
├── static/
│   ├── style.css          # Modern styling
│   ├── script.js          # Interactive features
│   └── images/            # Disease images
├── model/                 # Trained ML models
├── data/                  # Training datasets
└── logs/                  # Application logs
```

## API Endpoints

### Home
- **GET** `/` - Main application page

### Prediction
- **POST** `/predict` - Submit patient data for analysis
  - Parameters: `disease`, `f1`, `f2`, `f3`, `f4`
  - Returns: Risk assessment result

### Health Check
- **GET** `/api/health` - Application health status

## Supported Diseases

| Disease | Input Parameters | Range |
|---------|------------------|-------|
| Diabetes | Glucose, BP, BMI, Age | Medical ranges |
| Heart Disease | Age, Cholesterol, BP, Heart Rate | Clinical values |
| Lung Cancer | Smoking, Age, Cough, Fatigue | Binary/Numeric |
| Parkinson's | Voice Tremor, Pitch, Jitter, Shimmer | 0-1, 50-300 Hz |
| Thyroid | TSH, T3, T4, Age | 0.4-4.0, 80-200, 5-12 |

## Important Disclaimer

⚠️ **Medical Disclaimer**

MediAI is designed for **informational and educational purposes only**. The predictions provided:

- Are based on machine learning models trained on historical data
- Should NOT replace professional medical advice
- Should NOT be used for diagnosis or treatment decisions
- Must be validated by qualified healthcare professionals

**Always consult with qualified healthcare professionals for medical decisions.**

## Configuration

Environment variables (optional):
```
DEBUG=True/False
FLASK_ENV=development/production
LOG_LEVEL=INFO/DEBUG
```

## Logging

Application logs are saved in `logs/mediai.log` with detailed information about:
- Model loading
- Predictions made
- Error tracking
- API usage

## Performance

- Average prediction time: <100ms
- Supports concurrent requests
- Lightweight model footprint (~10MB)

## Future Enhancements

- [ ] User authentication
- [ ] Prediction history
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Real-time data validation
- [ ] Advanced analytics dashboard

## Development

To train models or modify the system:

```bash
python train_model.py  # Retrain models
```

## Support & Issues

For issues or suggestions, please check the application logs and error messages.

## License

© 2025 MediAI - Intelligent Health Analytics

---

**Built with ❤️ using Flask & Machine Learning**
