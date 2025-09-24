// Dashboard Script - Signature Security Specialist

class DashboardManager {
    constructor() {
        this.currentSection = 'overview';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        this.initializeDashboard();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.switchSection(sectionId);
            });
        });
    }

    setupEventListeners() {
        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.action-btn').textContent.trim();
                this.handleQuickAction(action);
            });
        });

        // Guard action buttons
        const guardActionBtns = document.querySelectorAll('.guard-actions .btn');
        guardActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                this.handleGuardAction(action, e.target.closest('.guard-card'));
            });
        });

        // Checkpoint buttons
        const checkpointBtns = document.querySelectorAll('.checkpoint-actions .btn');
        checkpointBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                this.handleCheckpointAction(action, e.target.closest('.checkpoint-card'));
            });
        });

        // Emergency buttons
        const emergencyBtns = document.querySelectorAll('.btn.emergency');
        emergencyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleEmergencyAction(e.target);
            });
        });

        // Notification button
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
    }

    setupRealTimeUpdates() {
        // Update time every minute
        setInterval(() => {
            this.updateTime();
        }, 60000);

        // Update status indicators every 30 seconds
        setInterval(() => {
            this.updateStatusIndicators();
        }, 30000);

        // Simulate real-time data updates
        setInterval(() => {
            this.updateRealTimeData();
        }, 10000);
    }

    initializeDashboard() {
        this.updateTime();
        this.updateStatusIndicators();
        this.loadDashboardData();
    }

    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).closest('.nav-item').classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;
        this.loadSectionData(sectionId);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'Request Guard':
                this.showRequestGuardModal();
                break;
            case 'Check In':
                this.handleCheckIn();
                break;
            case 'Emergency':
                this.handleEmergencyAlert();
                break;
            default:
                console.log('Quick action:', action);
        }
    }

    handleGuardAction(action, guardCard) {
        const guardName = guardCard.querySelector('.guard-info h3').textContent;
        
        switch (action) {
            case 'View Details':
                this.showGuardDetails(guardName);
                break;
            case 'Contact':
                this.contactGuard(guardName);
                break;
            default:
                console.log('Guard action:', action, guardName);
        }
    }

    handleCheckpointAction(action, checkpointCard) {
        const checkpointName = checkpointCard.querySelector('.checkpoint-header h3').textContent;
        
        switch (action) {
            case 'View Details':
                this.showCheckpointDetails(checkpointName);
                break;
            case 'Check In':
                this.handleCheckpointCheckIn(checkpointName);
                break;
            default:
                console.log('Checkpoint action:', action, checkpointName);
        }
    }

    handleEmergencyAction(button) {
        const contactInfo = button.closest('.emergency-card');
        const contactName = contactInfo.querySelector('.emergency-info h3').textContent;
        const contactNumber = contactInfo.querySelector('.emergency-info p').textContent;
        
        this.showEmergencyConfirmation(contactName, contactNumber);
    }

    showRequestGuardModal() {
        const modal = this.createModal('Request New Guard', `
            <form class="request-form">
                <div class="form-group">
                    <label>Location</label>
                    <select class="form-input">
                        <option>Main Entrance</option>
                        <option>Building A - Floor 3</option>
                        <option>Parking Garage</option>
                        <option>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <select class="form-input">
                        <option>4 hours</option>
                        <option>8 hours</option>
                        <option>12 hours</option>
                        <option>24 hours</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Special Requirements</label>
                    <textarea class="form-input" placeholder="Any special requirements or notes..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn primary">Submit Request</button>
                </div>
            </form>
        `);
        
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitGuardRequest(new FormData(e.target));
            modal.remove();
        });
    }

    handleCheckIn() {
        const button = document.querySelector('.action-btn.primary');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking In...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Checked In';
            button.classList.remove('primary');
            button.classList.add('secondary');
            
            this.showSuccessMessage('Successfully checked in!');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('secondary');
                button.classList.add('primary');
                button.disabled = false;
            }, 3000);
        }, 2000);
    }

    handleEmergencyAlert() {
        this.showEmergencyConfirmation('Emergency Services', '911');
    }

    showEmergencyConfirmation(contactName, contactNumber) {
        const modal = this.createModal('Emergency Contact', `
            <div class="emergency-confirmation">
                <div class="emergency-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Contact ${contactName}?</h3>
                <p>This will initiate an emergency call to ${contactNumber}</p>
                <div class="emergency-actions">
                    <button class="btn secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn emergency" onclick="window.open('tel:${contactNumber}'); this.closest('.modal').remove();">
                        <i class="fas fa-phone"></i> Call Now
                    </button>
                </div>
            </div>
        `);
    }

    showGuardDetails(guardName) {
        const modal = this.createModal(`Guard Details - ${guardName}`, `
            <div class="guard-details">
                <div class="guard-avatar-large">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="guard-info-detailed">
                    <h3>${guardName}</h3>
                    <p class="guard-title">Senior Security Officer</p>
                    <div class="guard-stats">
                        <div class="stat">
                            <span class="stat-label">Experience</span>
                            <span class="stat-value">5 years</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Rating</span>
                            <span class="stat-value">4.9/5</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Status</span>
                            <span class="stat-value online">On Duty</span>
                        </div>
                    </div>
                    <div class="guard-contact">
                        <button class="btn primary">
                            <i class="fas fa-phone"></i> Call Guard
                        </button>
                        <button class="btn secondary">
                            <i class="fas fa-envelope"></i> Send Message
                        </button>
                    </div>
                </div>
            </div>
        `);
    }

    contactGuard(guardName) {
        this.showSuccessMessage(`Initiating contact with ${guardName}...`);
        // Simulate contact initiation
        setTimeout(() => {
            this.showSuccessMessage(`Connected to ${guardName}`);
        }, 2000);
    }

    showCheckpointDetails(checkpointName) {
        const modal = this.createModal(`Checkpoint Details - ${checkpointName}`, `
            <div class="checkpoint-details-modal">
                <div class="checkpoint-info">
                    <h3>${checkpointName}</h3>
                    <div class="checkpoint-status">
                        <span class="status-dot online"></span>
                        <span>Active</span>
                    </div>
                </div>
                <div class="checkpoint-schedule">
                    <h4>Schedule</h4>
                    <div class="schedule-item">
                        <span class="time">08:00 - 16:00</span>
                        <span class="guard">Mike Johnson</span>
                    </div>
                    <div class="schedule-item">
                        <span class="time">16:00 - 00:00</span>
                        <span class="guard">Sarah Wilson</span>
                    </div>
                </div>
                <div class="checkpoint-actions">
                    <button class="btn primary">Check In</button>
                    <button class="btn secondary">View History</button>
                </div>
            </div>
        `);
    }

    handleCheckpointCheckIn(checkpointName) {
        this.showSuccessMessage(`Checking in at ${checkpointName}...`);
        
        // Update checkpoint status
        setTimeout(() => {
            this.updateCheckpointStatus(checkpointName, 'completed');
            this.showSuccessMessage(`Successfully checked in at ${checkpointName}`);
        }, 1500);
    }

    showNotifications() {
        const notifications = [
            { type: 'info', message: 'New guard assigned to Building A', time: '2 hours ago' },
            { type: 'success', message: 'Security check completed at Main Entrance', time: '4 hours ago' },
            { type: 'warning', message: 'Schedule change for tomorrow', time: '1 day ago' }
        ];

        const modal = this.createModal('Notifications', `
            <div class="notifications-list">
                ${notifications.map(notif => `
                    <div class="notification-item ${notif.type}">
                        <div class="notification-icon">
                            <i class="fas fa-${notif.type === 'info' ? 'info-circle' : notif.type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                        </div>
                        <div class="notification-content">
                            <p>${notif.message}</p>
                            <span class="notification-time">${notif.time}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `);
    }

    submitGuardRequest(formData) {
        this.showSuccessMessage('Guard request submitted successfully!');
        // Simulate API call
        setTimeout(() => {
            this.updateGuardStats();
        }, 2000);
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Update any time displays
        const timeElements = document.querySelectorAll('.current-time');
        timeElements.forEach(el => {
            el.textContent = timeString;
        });
    }

    updateStatusIndicators() {
        // Simulate status updates
        const statusDots = document.querySelectorAll('.status-dot');
        statusDots.forEach(dot => {
            // Randomly update some statuses (for demo purposes)
            if (Math.random() > 0.9) {
                dot.classList.toggle('online');
                dot.classList.toggle('offline');
            }
        });
    }

    updateRealTimeData() {
        // Update stats with slight variations
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const currentValue = parseInt(stat.textContent);
            if (!isNaN(currentValue) && Math.random() > 0.8) {
                const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                const newValue = Math.max(0, currentValue + variation);
                stat.textContent = newValue;
            }
        });
    }

    updateCheckpointStatus(checkpointName, status) {
        const checkpointCards = document.querySelectorAll('.checkpoint-card');
        checkpointCards.forEach(card => {
            const name = card.querySelector('.checkpoint-header h3').textContent;
            if (name === checkpointName) {
                const statusBadge = card.querySelector('.checkpoint-status-badge');
                statusBadge.textContent = status === 'completed' ? 'Completed' : 'Pending';
                statusBadge.className = `checkpoint-status-badge ${status === 'completed' ? 'success' : 'pending'}`;
            }
        });
    }

    updateGuardStats() {
        // Update guard statistics
        const activeGuardsStat = document.querySelector('.stat-card .stat-number');
        if (activeGuardsStat) {
            const currentValue = parseInt(activeGuardsStat.textContent);
            activeGuardsStat.textContent = currentValue + 1;
        }
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.showLoadingState();
        
        setTimeout(() => {
            this.hideLoadingState();
            this.populateDashboardData();
        }, 1000);
    }

    loadSectionData(sectionId) {
        // Load specific section data
        console.log(`Loading data for section: ${sectionId}`);
    }

    populateDashboardData() {
        // Populate dashboard with data
        console.log('Dashboard data populated');
    }

    showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading dashboard...</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.closest('.modal').remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Show loading state
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Logging out...</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        document.body.appendChild(loadingOverlay);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Emergency alert function
function emergencyAlert() {
    if (confirm('This will trigger an emergency alert. Are you sure?')) {
        // Show emergency alert
        const alert = document.createElement('div');
        alert.className = 'emergency-alert';
        alert.innerHTML = `
            <div class="emergency-alert-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>EMERGENCY ALERT TRIGGERED</h3>
                <p>Emergency services have been notified</p>
                <button onclick="this.closest('.emergency-alert').remove()">Close</button>
            </div>
        `;
        alert.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(239, 68, 68, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: emergencyPulse 1s infinite;
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 10000);
    }
}

// Check in function
function checkIn() {
    const dashboard = window.dashboardManager;
    if (dashboard) {
        dashboard.handleCheckIn();
    }
}

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
        background: #1a1a1a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        z-index: 1;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .modal-header h3 {
        color: #ffffff;
        font-size: 1.3rem;
        font-weight: 600;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }
    
    .modal-body {
        padding: 25px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        color: #e5e7eb;
        font-weight: 500;
    }
    
    .form-input {
        width: 100%;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #ffffff;
        font-size: 0.9rem;
    }
    
    .form-input:focus {
        outline: none;
        border-color: #10b981;
        background: rgba(255, 255, 255, 0.08);
    }
    
    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 25px;
    }
    
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
    
    @keyframes emergencyPulse {
        0%, 100% { 
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            transform: scale(1);
        }
        50% { 
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(modalStyles);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
