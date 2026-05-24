// Global variable to track current disease
let currentDisease = null;

// Hamburger menu toggle
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger) return;
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Smooth scroll to services section
function scrollServices() {
    document.getElementById("services").scrollIntoView({ behavior: "smooth" });
}

// Open assessment form
function openForm(type) {
    const formSection = document.getElementById("form-section");
    formSection.classList.add("active");
    document.body.style.overflow = "hidden";
    
    // Store current disease for retaking assessment
    currentDisease = type;
    
    document.getElementById("disease").value = type;
    
    let html = "";
    let labels = {};
    
    if (type === "diabetes") {
        labels = {
            f1: "Glucose Level (70-200 mg/dL)",
            f2: "Blood Pressure (40-120 mmHg)",
            f3: "BMI (Body Mass Index)",
            f4: "Age (years)"
        };
        html = `
            <input type="number" name="f1" placeholder="Glucose Level (70-200 mg/dL)" step="0.1" required>
            <input type="number" name="f2" placeholder="Blood Pressure (40-120 mmHg)" step="0.1" required>
            <input type="number" name="f3" placeholder="BMI (15-50)" step="0.1" required>
            <input type="number" name="f4" placeholder="Age (0-100)" step="1" required>
        `;
    } else if (type === "heart") {
        html = `
            <input type="number" name="f1" placeholder="Age (20-80 years)" step="1" required>
            <input type="number" name="f2" placeholder="Cholesterol (100-400 mg/dL)" step="1" required>
            <input type="number" name="f3" placeholder="Blood Pressure (80-180 mmHg)" step="1" required>
            <input type="number" name="f4" placeholder="Max Heart Rate (60-200 bpm)" step="1" required>
        `;
    } else if (type === "lung") {
        html = `
            <input type="number" name="f1" placeholder="Smoking Status (0=No, 1=Yes)" min="0" max="1" step="1" required>
            <input type="number" name="f2" placeholder="Age (20-80 years)" step="1" required>
            <input type="number" name="f3" placeholder="Cough Symptoms (0=No, 1=Yes)" min="0" max="1" step="1" required>
            <input type="number" name="f4" placeholder="Fatigue Level (0=No, 1=Yes)" min="0" max="1" step="1" required>
        `;
    } else if (type === "parkinsons") {
        html = `
            <input type="number" name="f1" placeholder="Voice Tremor (0-1)" step="0.01" required>
            <input type="number" name="f2" placeholder="Pitch (50-300 Hz)" step="0.1" required>
            <input type="number" name="f3" placeholder="Jitter (0-1)" step="0.0001" required>
            <input type="number" name="f4" placeholder="Shimmer (0-1)" step="0.0001" required>
        `;
    } else if (type === "thyroid") {
        html = `
            <input type="number" name="f1" placeholder="TSH Level (0.4-4.0 mIU/L)" step="0.01" required>
            <input type="number" name="f2" placeholder="T3 Level (80-200 ng/dL)" step="0.1" required>
            <input type="number" name="f3" placeholder="T4 Level (5-12 µg/dL)" step="0.1" required>
            <input type="number" name="f4" placeholder="Age (10-80 years)" step="1" required>
        `;
    }
    
    document.getElementById("inputs").innerHTML = html;
}

// Close form
function closeForm() {
    const formSection = document.getElementById("form-section");
    formSection.classList.remove("active");
    document.body.style.overflow = "auto";
}

// Close form when clicking outside
document.addEventListener("DOMContentLoaded", function() {
    // Initialize hamburger menu
    initializeHamburgerMenu();
    
    const formSection = document.getElementById("form-section");
    
    formSection.addEventListener("click", function(event) {
        if (event.target === formSection) {
            closeForm();
        }
    });
    
    // Form submission handler with AJAX
    const form = document.getElementById("assessmentForm");
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Validate inputs before submission
            const inputs = this.querySelectorAll("input[type='number']");
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.style.borderColor = "#ef4444";
                } else {
                    input.style.borderColor = "#e2e8f0";
                }
            });
            
            if (!isValid) {
                alert("Please fill all fields");
                return;
            }
            
            // Submit form via AJAX
            const formData = new FormData(form);
            
            fetch('/predict', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(html => {
                // Extract prediction text from the HTML response
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const resultTitle = doc.querySelector('#resultTitle');
                
                if (resultTitle) {
                    // Update result card with prediction text
                    document.getElementById('resultTitle').innerHTML = resultTitle.innerHTML;
                    
                    // Show result card
                    const resultCard = document.getElementById('resultCard');
                    resultCard.style.display = 'block';
                    
                    // Close the form modal
                    closeForm();
                    
                    // Smooth scroll to result card
                    setTimeout(() => {
                        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });
    }
});

// Smooth scroll navigation
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(e) {
        const href = this.getAttribute("href");
        // Only prevent default for anchor links (#), not for page navigation links
        if (href && href.startsWith("#")) {
            e.preventDefault();
            const targetId = href;
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        }
        // For non-anchor links like /login, /signup, allow normal navigation
    });
});

// Retake assessment - reopen form for same disease
function retakeAssessment() {
    // Hide result card
    const resultCard = document.getElementById("resultCard");
    resultCard.style.display = 'none';
    resultCard.innerHTML = '<div class="result-wrapper"><div class="result-content"><div class="result-header"><h2 id="resultTitle"></h2></div><div class="result-body"><p class="result-message">Assessment Complete</p><div class="result-disclaimer"><p>⚠️ <strong>Important Notice:</strong> This is an AI-generated prediction and should NOT replace professional medical advice. Always consult with qualified healthcare professionals for medical decisions.</p></div></div><div class="result-actions"><button class="btn-primary" onclick="retakeAssessment()">Retake Assessment</button><button class="btn-secondary" onclick="goHome()">Back to Home</button></div></div></div>';
    // Reopen form for same disease
    if (currentDisease) {
        openForm(currentDisease);
    }
}

// Go back to home
function goHome() {
    // Clear and hide result
    const resultCard = document.getElementById("resultCard");
    resultCard.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Disease information with descriptions and precautions
const diseaseInfo = {
    diabetes: {
        icon: '🩺',
        name: 'Diabetes Mellitus',
        description: 'Diabetes is a chronic metabolic disorder characterized by high blood sugar levels. It occurs when the pancreas cannot produce enough insulin or when the body cannot effectively use the insulin produced. Type 2 diabetes is the most common form, accounting for 90% of all cases.',
        precautions: [
            'Monitor blood sugar levels regularly (fasting and random)',
            'Maintain a balanced diet low in refined sugars and high in fiber',
            'Engage in at least 150 minutes of moderate physical activity per week',
            'Keep your weight within a healthy BMI range (18.5-24.9)',
            'Limit alcohol consumption',
            'Get regular health check-ups and eye examinations',
            'Manage stress through meditation and yoga',
            'Quit smoking if you smoke',
            'Stay hydrated and drink plenty of water',
            'Take medications as prescribed by your doctor'
        ]
    },
    heart: {
        icon: '❤️',
        name: 'Heart Disease',
        description: 'Heart disease encompasses various conditions affecting the heart and blood vessels, including coronary artery disease, arrhythmias, and heart failure. It remains the leading cause of death globally. Risk factors include high blood pressure, high cholesterol, smoking, obesity, and diabetes.',
        precautions: [
            'Maintain healthy blood pressure (below 120/80 mmHg)',
            'Keep cholesterol levels in check through diet and exercise',
            'Avoid smoking and secondhand smoke exposure',
            'Exercise regularly (at least 30 minutes, 5 days a week)',
            'Follow a heart-healthy diet (Mediterranean or DASH diet)',
            'Manage stress with relaxation techniques',
            'Maintain a healthy weight',
            'Limit sodium intake to less than 2,300mg per day',
            'Get adequate sleep (7-9 hours per night)',
            'Have regular cardiovascular health check-ups'
        ]
    },
    lung: {
        icon: '🫁',
        name: 'Lung Cancer',
        description: 'Lung cancer is a malignant tumor that develops in the tissues of the lungs. It is the leading cause of cancer deaths worldwide. The two main types are small cell lung cancer (SCLC) and non-small cell lung cancer (NSCLC). Smoking is the primary risk factor, but non-smokers can also develop lung cancer.',
        precautions: [
            'Do not smoke or use tobacco products',
            'Avoid secondhand smoke and air pollution',
            'Test your home for radon gas and reduce exposure if necessary',
            'Work in a safe environment with proper ventilation',
            'Avoid asbestos exposure',
            'Maintain a healthy diet rich in fruits and vegetables',
            'Exercise regularly to keep lungs healthy',
            'Get annual screening if you are at high risk (former heavy smokers)',
            'Avoid exposure to occupational hazards',
            'Report persistent cough or respiratory symptoms to your doctor'
        ]
    },
    parkinsons: {
        icon: '🧠',
        name: "Parkinson's Disease",
        description: "Parkinson's disease is a progressive neurological disorder that affects movement control. It occurs due to the loss of nerve cells that produce dopamine in the brain. The disease typically develops gradually and symptoms worsen over time. While there is no cure, treatments can help manage symptoms.",
        precautions: [
            'Stay physically active with regular exercise (walking, swimming, dancing)',
            'Practice balance and coordination exercises',
            'Engage in occupational and speech therapy when recommended',
            'Maintain cognitive health through mental exercises and puzzles',
            'Get adequate sleep and maintain a regular sleep schedule',
            'Manage stress through relaxation and meditation',
            'Follow a balanced, nutritious diet',
            'Stay socially connected and maintain relationships',
            'Take medications exactly as prescribed',
            'Attend regular neurological check-ups and follow medical advice'
        ]
    },
    thyroid: {
        icon: '🦋',
        name: 'Thyroid Disorder',
        description: 'Thyroid disorders affect the thyroid gland, which controls metabolism. The main types are hypothyroidism (underactive thyroid), hyperthyroidism (overactive thyroid), and thyroid nodules. Autoimmune diseases like Hashimoto\'s and Graves\' disease are common causes. Early detection is crucial for proper management.',
        precautions: [
            'Get regular thyroid function tests (TSH, T3, T4)',
            'Consume adequate iodine through diet (seafood, dairy, eggs)',
            'Maintain a balanced diet with selenium and zinc',
            'Manage stress levels effectively',
            'Exercise regularly for metabolic health',
            'Maintain a healthy weight',
            'Avoid excessive iodine supplementation',
            'If diagnosed, take thyroid medication as prescribed',
            'Get thyroid checked if you have family history of thyroid disease',
            'Report symptoms like fatigue, weight changes, or mood swings to your doctor'
        ]
    }
};

// Open precaution modal
function openPrecaution(diseaseType) {
    const modal = document.getElementById('precautionModal');
    const detailDiv = document.getElementById('precautionDetail');
    
    const disease = diseaseInfo[diseaseType];
    
    if (disease) {
        let precautionsList = disease.precautions.map(precaution => `<li>${precaution}</li>`).join('');
        
        detailDiv.innerHTML = `
            <h2>
                <span class="disease-icon">${disease.icon}</span>
                ${disease.name}
            </h2>
            <div class="description">
                ${disease.description}
            </div>
            <h3>Prevention & Precautions:</h3>
            <ul>
                ${precautionsList}
            </ul>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close precaution modal
function closePrecaution() {
    const modal = document.getElementById('precautionModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('precautionModal');
    
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closePrecaution();
        }
    });
});