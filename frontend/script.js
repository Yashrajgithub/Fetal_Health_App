// ========================= Initialization =========================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Set today's date as max for date input
    const reportDate = document.getElementById('reportDate');
    if (reportDate) {
        reportDate.setAttribute('max', new Date().toISOString().split('T')[0]);
    }
    
    // Initialize all event listeners
    setupEventListeners();
    
    // Initialize scroll animations
    setupScrollAnimations();
    
    // Test backend connection on load
    testBackendConnection();
}

// ========================= Backend Connection Test =========================
async function testBackendConnection() {
    try {
        const response = await fetch('http://127.0.0.1:5000/health');
        if (response.ok) {
            console.log('✅ Backend connection successful');
        } else {
            console.warn('⚠️ Backend health check failed');
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
    }
}

// ========================= Event Listeners Setup =========================
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateToPage(page);
            document.getElementById('navLinks').classList.remove('active');
        });
    });

    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            if (navLinks) navLinks.classList.toggle('active');
        });
    }

    // Patient Form Submission
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientFormSubmit);
    }

    // CTG Form Submission
    const ctgForm = document.getElementById('ctgForm');
    if (ctgForm) {
        ctgForm.addEventListener('submit', handleCTGFormSubmit);
    }

    // Login functionality
    setupLoginFunctionality();

    // Chatbot toggle
    const chatbotFab = document.getElementById('chatbotFab');
    if (chatbotFab) {
        chatbotFab.addEventListener('click', () => {
            const chatbotModal = document.getElementById('chatbotModal');
            if (chatbotModal) chatbotModal.classList.toggle('active');
        });
    }

    // Close chatbot when clicking outside
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('chatbotModal');
        const fab = document.getElementById('chatbotFab');
        if (modal && fab && !modal.contains(e.target) && !fab.contains(e.target)) {
            modal.classList.remove('active');
        }
    });

    // Scroll to top button
    window.addEventListener('scroll', () => {
        const scrollTop = document.getElementById('scrollTop');
        if (scrollTop) {
            if (window.pageYOffset > 300) {
                scrollTop.classList.add('visible');
            } else {
                scrollTop.classList.remove('visible');
            }
        }
    });

    // Scroll to section
    const scrollToSection = document.querySelector('.scroll-to-section');
    if (scrollToSection) {
        scrollToSection.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('patientSection').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
}

// ========================= Scroll Animations =========================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe patient section
    const patientSection = document.getElementById('patientSection');
    if (patientSection) {
        observer.observe(patientSection);
    }
}

// ========================= Navigation =========================
function navigateToPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Show target page
    if (pageName === 'landing') {
        document.getElementById('landingPage').classList.add('active');
    } else if (pageName === 'about') {
        document.getElementById('aboutPage').classList.add('active');
        setTimeout(() => {
            const cards = document.querySelectorAll('.about-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('reveal');
                }, index * 100);
            });
        }, 100);
    } else if (pageName === 'prediction') {
        document.getElementById('predictionPage').classList.add('active');
        // Load patient data if available
        const patientData = sessionStorage.getItem('patientData');
        if (patientData) {
            displayPatientInfo(JSON.parse(patientData));
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================= Patient Form Handling =========================
function handlePatientFormSubmit(e) {
    e.preventDefault();
    
    const patientData = {
        name: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        hospital: document.getElementById('hospitalName').value,
        doctor: document.getElementById('doctorName').value,
        date: document.getElementById('reportDate').value
    };

    // Store patient data
    sessionStorage.setItem('patientData', JSON.stringify(patientData));

    // Navigate to prediction page with transition
    document.getElementById('landingPage').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('landingPage').classList.remove('active');
        document.getElementById('predictionPage').classList.add('active');
        displayPatientInfo(patientData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('landingPage').style.opacity = '1';
    }, 300);
}

function displayPatientInfo(data) {
    const nameElement = document.getElementById('displayName');
    const ageElement = document.getElementById('displayAge');
    const genderElement = document.getElementById('displayGender');
    const hospitalElement = document.getElementById('displayHospital');
    const doctorElement = document.getElementById('displayDoctor');
    const dateElement = document.getElementById('displayDate');
    const banner = document.getElementById('patientInfoBanner');

    if (nameElement) nameElement.textContent = data.name;
    if (ageElement) ageElement.textContent = data.age + ' years';
    if (genderElement) genderElement.textContent = data.gender;
    if (hospitalElement) hospitalElement.textContent = data.hospital;
    if (doctorElement) doctorElement.textContent = data.doctor;
    if (dateElement) dateElement.textContent = new Date(data.date).toLocaleDateString();
    if (banner) banner.style.display = 'block';
}

function backToPatientInfo() {
    document.getElementById('predictionPage').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('predictionPage').classList.remove('active');
        document.getElementById('landingPage').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('predictionPage').style.opacity = '1';
    }, 300);
}

// ========================= CTG Form Handling =========================
async function handleCTGFormSubmit(e) {
    e.preventDefault();
    
    // Validate all inputs first
    if (!validateCTGForm()) {
        showAlert('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Collect form data
    const formData = new FormData(e.target);
    const data = {};
    
    // Convert all values to numbers
    formData.forEach((value, key) => {
        data[key] = parseFloat(value);
    });

    console.log('Sending data to backend:', data); // Debug log

    // Show loading state
    const resultCard = document.getElementById('resultCard');
    const loading = document.getElementById('loading');
    const submitBtn = document.querySelector('#ctgForm .btn-primary');

    if (resultCard) resultCard.classList.remove('active');
    if (loading) loading.classList.add('active');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Received result:', result); // Debug log
        
        setTimeout(() => {
            if (loading) loading.classList.remove('active');
            displayResult(result);
            if (submitBtn) submitBtn.disabled = false;
        }, 1000);

    } catch (error) {
        console.error('Prediction error:', error);
        if (loading) loading.classList.remove('active');
        
        // Show specific error message instead of random result
        displayError(`Connection failed: ${error.message}. Please ensure the Flask server is running on http://127.0.0.1:5000`);
        
        if (submitBtn) submitBtn.disabled = false;
    }
}

function validateCTGForm() {
    const inputs = document.querySelectorAll('#ctgForm input[required]');
    let allValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        if (!value || isNaN(parseFloat(value))) {
            allValid = false;
            input.style.borderColor = 'var(--danger)';
        } else {
            input.style.borderColor = '#e5e7eb';
        }
    });
    
    return allValid;
}

// ========================= Result Display =========================
function displayResult(result) {
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultDescription = document.getElementById('resultDescription');

    if (!resultCard || !resultIcon || !resultText || !resultDescription) {
        console.error('Result elements not found');
        return;
    }

    let icon, text, className, description;

    // Use the actual result from backend
    const prediction = result.status_label || result.prediction || result.result;
    
    if (prediction === 'Normal' || prediction === 1 || prediction === '1') {
        icon = '🟢';
        text = 'Normal';
        className = 'result-normal';
        description = 'The CTG analysis indicates normal fetal heart rate patterns. The fetus is in a healthy state with no signs of distress. Continue routine monitoring as per clinical protocol.';
    } else if (prediction === 'Suspect' || prediction === 2 || prediction === '2') {
        icon = '🟠';
        text = 'Suspect';
        className = 'result-suspect';
        description = 'The CTG analysis shows suspicious patterns. Close monitoring is recommended. Consult with your healthcare provider for further evaluation and possible intervention.';
    } else if (prediction === 'Pathologic' || prediction === 3 || prediction === '3') {
        icon = '🔴';
        text = 'Pathologic';
        className = 'result-pathologic';
        description = 'The CTG analysis indicates pathological patterns. Immediate medical attention is required. Please contact your healthcare provider immediately or proceed to emergency care.';
    } else {
        icon = '❓';
        text = 'Unknown Result';
        className = 'result-suspect';
        description = `Received unexpected prediction: ${JSON.stringify(result)}. Please consult with a healthcare professional for interpretation.`;
    }

    resultIcon.textContent = icon;
    resultText.textContent = text;
    resultText.className = `result-text ${className}`;
    resultDescription.textContent = description;

    resultCard.classList.add('active');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function displayError(errorMessage) {
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultDescription = document.getElementById('resultDescription');

    if (!resultCard || !resultIcon || !resultText || !resultDescription) {
        console.error('Result elements not found');
        return;
    }

    resultIcon.textContent = '⚠️';
    resultText.textContent = 'Connection Error';
    resultText.className = 'result-text result-suspect';
    resultDescription.textContent = errorMessage;

    resultCard.classList.add('active');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetCTGForm() {
    const form = document.getElementById('ctgForm');
    const resultCard = document.getElementById('resultCard');
    const loading = document.getElementById('loading');

    if (form) form.reset();
    if (resultCard) resultCard.classList.remove('active');
    if (loading) loading.classList.remove('active');
    
    // Reset border colors
    const inputs = document.querySelectorAll('#ctgForm input');
    inputs.forEach(input => {
        input.style.borderColor = '#e5e7eb';
    });
}

// ========================= Login Functionality =========================
function setupLoginFunctionality() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    if (!loginBtn || !loginModal) return;

    // Show login modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close login modal
    closeLoginModal.addEventListener('click', () => {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            if (!username || !password) {
                showAlert('Please enter both username and password.', 'error');
                return;
            }
            
            const submitBtn = loginForm.querySelector('.modal-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Signing In...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showAlert(`Welcome back, ${username}! Login successful.`, 'success');
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                loginForm.reset();
                
                // Update login button to show logged in state
                loginBtn.textContent = '👤 ' + username;
                loginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
}

// ========================= Utility Functions =========================
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'error') {
        alert.style.background = 'var(--danger)';
    } else if (type === 'success') {
        alert.style.background = 'var(--success)';
    } else {
        alert.style.background = 'var(--primary-blue)';
    }
    
    document.body.appendChild(alert);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add CSS for alerts
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(alertStyles);

// ========================= Global Functions =========================
window.resetCTGForm = resetCTGForm;
window.backToPatientInfo = backToPatientInfo;
window.scrollToTop = scrollToTop;
window.navigateToPage = navigateToPage;