// Signature Security Specialist - Login System
class SecurityLoginSystem {
    constructor() {
        this.currentTab = 'client';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupQuickAccess();
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        const clientForm = document.getElementById('clientForm');
        const guardForm = document.getElementById('guardForm');

        clientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin('client', new FormData(clientForm));
        });

        guardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin('guard', new FormData(guardForm));
        });

        // Input focus effects
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', this.handleInputFocus);
            input.addEventListener('blur', this.handleInputBlur);
            input.addEventListener('input', this.handleInputChange);
        });
    }

    setupFormValidation() {
        // Email validation for client form
        const clientEmail = document.getElementById('clientEmail');
        clientEmail.addEventListener('blur', () => {
            this.validateEmail(clientEmail);
        });

        // Guard ID validation
        const guardId = document.getElementById('guardId');
        guardId.addEventListener('blur', () => {
            this.validateGuardId(guardId);
        });

        // Password strength validation
        const passwords = document.querySelectorAll('input[type="password"]');
        passwords.forEach(password => {
            password.addEventListener('input', () => {
                this.validatePassword(password);
            });
        });
    }

    setupQuickAccess() {
        // Quick login buttons
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.quick-btn').onclick.toString().match(/quickLogin\('(\w+)'\)/)[1];
                this.quickLogin(type);
            });
        });
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.login-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tab}Form`).classList.add('active');

        this.currentTab = tab;
    }

    handleInputFocus(e) {
        const inputGroup = e.target.closest('.input-group');
        inputGroup.style.transform = 'scale(1.02)';
    }

    handleInputBlur(e) {
        const inputGroup = e.target.closest('.input-group');
        inputGroup.style.transform = 'scale(1)';
    }

    handleInputChange(e) {
        // Real-time validation feedback
        const input = e.target;
        if (input.type === 'email') {
            this.validateEmail(input);
        } else if (input.name === 'guardId') {
            this.validateGuardId(input);
        } else if (input.type === 'password') {
            this.validatePassword(input);
        }
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value);
        
        this.setInputValidation(input, isValid, 'Please enter a valid email address');
        return isValid;
    }

    validateGuardId(input) {
        const guardIdRegex = /^[A-Z]{2,3}\d{4,6}$/;
        const isValid = guardIdRegex.test(input.value) || input.value.length >= 6;
        
        this.setInputValidation(input, isValid, 'Guard ID should be at least 6 characters');
        return isValid;
    }

    validatePassword(input) {
        const password = input.value;
        const isValid = password.length >= 6;
        
        this.setInputValidation(input, isValid, 'Password must be at least 6 characters');
        return isValid;
    }

    setInputValidation(input, isValid, errorMessage) {
        const inputGroup = input.closest('.input-group');
        const existingError = inputGroup.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }

        if (!isValid && input.value.length > 0) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.style.cssText = `
                color: #ef4444;
                font-size: 0.8rem;
                margin-top: 5px;
                animation: fadeIn 0.3s ease;
            `;
            inputGroup.appendChild(errorDiv);
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = isValid ? '#10b981' : 'rgba(255, 255, 255, 0.1)';
        }
    }

    async handleLogin(type, formData) {
        const form = document.getElementById(`${type}Form`);
        const submitBtn = form.querySelector('.login-btn');
        
        // Show loading state
        this.setLoadingState(submitBtn, true);

        try {
            // Simulate API call
            await this.simulateLogin(type, formData);
            
            // Success - redirect to dashboard
            this.showSuccessMessage(type);
            setTimeout(() => {
                window.location.href = `${type}-dashboard.html`;
            }, 1500);

        } catch (error) {
            // Show error message
            this.showErrorMessage(error.message);
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async simulateLogin(type, formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock validation
        if (type === 'client') {
            const email = formData.get('email');
            const password = formData.get('password');
            
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }
            
            if (!this.validateEmail(document.getElementById('clientEmail'))) {
                throw new Error('Please enter a valid email address');
            }
            
            // Mock client credentials
            if (email === 'client@signaturesecurity.com' && password === 'client123') {
                return { success: true, userType: 'client' };
            } else {
                throw new Error('Invalid email or password');
            }
        } else {
            const guardId = formData.get('guardId');
            const password = formData.get('password');
            
            if (!guardId || !password) {
                throw new Error('Please fill in all fields');
            }
            
            if (!this.validateGuardId(document.getElementById('guardId'))) {
                throw new Error('Please enter a valid Guard ID');
            }
            
            // Mock guard credentials
            if (guardId === 'SG001' && password === 'guard123') {
                return { success: true, userType: 'guard' };
            } else {
                throw new Error('Invalid Guard ID or password');
            }
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner"></i> Logging in...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            const icon = this.currentTab === 'client' ? 'fas fa-sign-in-alt' : 'fas fa-shield-alt';
            const text = this.currentTab === 'client' ? 'Client Login' : 'Guard Login';
            button.innerHTML = `<i class="${icon}"></i> ${text}`;
        }
    }

    showSuccessMessage(type) {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Login successful! Redirecting to ${type} dashboard...</span>
        `;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-global';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 4000);
    }

    quickLogin(type) {
        if (type === 'client') {
            // Fill client demo credentials
            document.getElementById('clientEmail').value = 'client@signaturesecurity.com';
            document.getElementById('clientPassword').value = 'client123';
            this.switchTab('client');
        } else {
            // Fill guard demo credentials
            document.getElementById('guardId').value = 'SG001';
            document.getElementById('guardPassword').value = 'guard123';
            this.switchTab('guard');
        }
        
        // Auto-submit after filling
        setTimeout(() => {
            const form = document.getElementById(`${type}Form`);
            form.dispatchEvent(new Event('submit'));
        }, 500);
    }
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-message {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize the login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecurityLoginSystem();
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to login container
    const loginContainer = document.querySelector('.login-container');
    
    loginContainer.addEventListener('mouseenter', () => {
        loginContainer.style.transform = 'translateY(-5px)';
        loginContainer.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
    });
    
    loginContainer.addEventListener('mouseleave', () => {
        loginContainer.style.transform = 'translateY(0)';
        loginContainer.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)';
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Enhanced tab navigation
            const focusableElements = document.querySelectorAll('input, button, a');
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            if (e.shiftKey && currentIndex === 0) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            } else if (!e.shiftKey && currentIndex === focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[0].focus();
            }
        }
    });
});
