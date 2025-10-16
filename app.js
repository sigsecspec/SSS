// Field Officer Mission Logger Application
class MissionLogger {
    constructor() {
        this.currentMission = null;
        this.missionLogs = this.loadMissionLogs();
        this.currentActivity = [];
        this.patrolStops = [];
        this.isOnSite = false;
        this.currentSite = null;
        this.incidentReports = [];
        
        this.initializeApp();
    }

    initializeApp() {
        // Load existing data from localStorage
        this.loadFromStorage();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                this.closeModal(e.target.closest('.modal').id);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(e);
        });
    }

    // Mission Selection
    selectMission(type) {
        this.currentMissionType = type;
        this.showDashboard(type);
    }

    showDashboard(type) {
        // Hide mission selection
        document.querySelector('.mission-selection').style.display = 'none';
        
        // Create and show dashboard
        this.createDashboard(type);
    }

    createDashboard(type) {
        const container = document.querySelector('.container');
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard';
        dashboard.id = `${type}-dashboard`;
        
        dashboard.innerHTML = this.getDashboardHTML(type);
        container.appendChild(dashboard);
        dashboard.style.display = 'block';
        
        this.updateDashboardState();
    }

    getDashboardHTML(type) {
        const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
        
        return `
            <div class="dashboard-header">
                <h2 class="dashboard-title">${typeTitle} Mission Dashboard</h2>
                <div class="status-indicator ${this.currentMission ? 'status-active' : 'status-inactive'}">
                    ${this.currentMission ? 'Mission Active' : 'No Active Mission'}
                </div>
            </div>
            
            <div class="control-panel">
                <button class="control-btn start-btn" onclick="missionLogger.startMission()" ${this.currentMission ? 'disabled' : ''}>
                    Start Mission
                </button>
                <button class="control-btn stop-btn" onclick="missionLogger.stopMission()" ${!this.currentMission ? 'disabled' : ''}>
                    End Mission
                </button>
                ${type === 'patrol' ? this.getPatrolControls() : ''}
                <button class="control-btn report-btn" onclick="missionLogger.showIncidentReport()">
                    Incident Report
                </button>
                <button class="control-btn report-btn" onclick="missionLogger.showMissionReport()" ${!this.currentMission ? 'disabled' : ''}>
                    Mission Report
                </button>
            </div>
            
            <div class="activity-log">
                <h3>Current Shift Activity</h3>
                <div id="activity-list">
                    ${this.renderActivityLog()}
                </div>
            </div>
            
            <div class="navigation-section" style="margin-top: 30px;">
                <button class="nav-btn" onclick="missionLogger.goHome()">← Back to Home</button>
                <button class="nav-btn" onclick="missionLogger.viewMissionLogs()">📋 View Mission Logs</button>
                <button class="copy-btn" onclick="missionLogger.copyCurrentReport()">📋 Copy Current Report</button>
            </div>
        `;
    }

    getPatrolControls() {
        return `
            <button class="control-btn onsite-btn" onclick="missionLogger.goOnSite()" ${!this.currentMission || this.isOnSite ? 'disabled' : ''}>
                Go On-Site
            </button>
            <button class="control-btn offsite-btn" onclick="missionLogger.goOffSite()" ${!this.isOnSite ? 'disabled' : ''}>
                Leave Site
            </button>
        `;
    }

    // Mission Management
    startMission() {
        this.showModal('start-mission-modal', this.getStartMissionModalHTML());
    }

    getStartMissionModalHTML() {
        return `
            <div class="modal-header">
                <h3 class="modal-title">Start Mission</h3>
                <span class="close">&times;</span>
            </div>
            <form id="start-mission-form">
                <div class="form-group">
                    <label for="mission-name">Mission Name/ID:</label>
                    <input type="text" id="mission-name" name="missionName" required>
                </div>
                <div class="form-group">
                    <label for="start-time">Start Time:</label>
                    <input type="datetime-local" id="start-time" name="startTime" required>
                </div>
                <div class="form-group">
                    <label for="end-time">Expected End Time:</label>
                    <input type="datetime-local" id="end-time" name="endTime" required>
                </div>
                ${this.currentMissionType === 'patrol' ? `
                <div class="form-group">
                    <label for="patrol-stops">Patrol Stops (optional, one per line):</label>
                    <textarea id="patrol-stops" name="patrolStops" placeholder="Location 1&#10;Location 2&#10;Location 3"></textarea>
                </div>
                ` : ''}
                <div class="form-group">
                    <label for="mission-details">Mission Details:</label>
                    <textarea id="mission-details" name="missionDetails" required></textarea>
                </div>
                <button type="submit" class="primary-btn">Start Mission</button>
            </form>
        `;
    }

    handleStartMission(formData) {
        const now = new Date();
        this.currentMission = {
            id: Date.now(),
            type: this.currentMissionType,
            name: formData.get('missionName'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            actualStartTime: now.toISOString(),
            details: formData.get('missionDetails'),
            patrolStops: this.currentMissionType === 'patrol' ? 
                formData.get('patrolStops')?.split('\n').filter(stop => stop.trim()) || [] : [],
            status: 'active'
        };

        this.addActivity(`Mission started: ${this.currentMission.name}`, 'mission-start');
        this.updateDashboardState();
        this.closeModal('start-mission-modal');
        this.saveToStorage();
    }

    stopMission() {
        if (!this.currentMission) return;
        
        const now = new Date();
        const expectedEnd = new Date(this.currentMission.endTime);
        const timeDiff = (expectedEnd - now) / (1000 * 60); // minutes
        
        if (timeDiff > 15) {
            this.showEarlyEndForm();
        } else {
            this.showMissionReport(true);
        }
    }

    showEarlyEndForm() {
        this.showModal('early-end-modal', this.getEarlyEndModalHTML());
    }

    getEarlyEndModalHTML() {
        return `
            <div class="modal-header">
                <h3 class="modal-title">Early Mission End</h3>
                <span class="close">&times;</span>
            </div>
            <p style="color: #dc3545; margin-bottom: 20px;">
                ⚠️ You are ending your mission more than 15 minutes early. Please provide a reason.
            </p>
            <form id="early-end-form">
                <div class="form-group">
                    <label for="early-reason">Reason for Early End:</label>
                    <textarea id="early-reason" name="earlyReason" required></textarea>
                </div>
                <div class="form-group">
                    <label for="has-cover">Do you have cover/replacement?</label>
                    <select id="has-cover" name="hasCover" required>
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <div class="form-group" id="cover-details" style="display: none;">
                    <label for="cover-name">Cover/Replacement Name:</label>
                    <input type="text" id="cover-name" name="coverName">
                </div>
                <button type="submit" class="primary-btn">Confirm Early End</button>
            </form>
        `;
    }

    // Patrol-specific functions
    goOnSite() {
        this.showModal('onsite-modal', this.getOnSiteModalHTML());
    }

    getOnSiteModalHTML() {
        return `
            <div class="modal-header">
                <h3 class="modal-title">Go On-Site</h3>
                <span class="close">&times;</span>
            </div>
            <form id="onsite-form">
                <div class="form-group">
                    <label for="site-location">Location:</label>
                    <input type="text" id="site-location" name="location" required>
                </div>
                <div class="form-group">
                    <label for="site-details">Site Details:</label>
                    <textarea id="site-details" name="details" required></textarea>
                </div>
                <div class="form-group">
                    <label for="arrival-time">Arrival Time:</label>
                    <input type="datetime-local" id="arrival-time" name="arrivalTime" required>
                </div>
                <button type="submit" class="primary-btn">Confirm On-Site</button>
            </form>
        `;
    }

    handleGoOnSite(formData) {
        this.isOnSite = true;
        this.currentSite = {
            location: formData.get('location'),
            details: formData.get('details'),
            arrivalTime: formData.get('arrivalTime'),
            activities: []
        };

        this.addActivity(`Arrived on-site: ${this.currentSite.location}`, 'site-arrival');
        this.updateDashboardState();
        this.closeModal('onsite-modal');
        this.saveToStorage();
    }

    goOffSite() {
        if (!this.isOnSite || !this.currentSite) return;
        
        const now = new Date().toISOString();
        this.currentSite.departureTime = now;
        
        this.patrolStops.push({...this.currentSite});
        this.addActivity(`Left site: ${this.currentSite.location}`, 'site-departure');
        
        this.isOnSite = false;
        this.currentSite = null;
        this.updateDashboardState();
        this.saveToStorage();
    }

    // Incident Reports
    showIncidentReport() {
        this.showModal('incident-modal', this.getIncidentReportModalHTML());
    }

    getIncidentReportModalHTML() {
        return `
            <div class="modal-header">
                <h3 class="modal-title">Incident Report</h3>
                <span class="close">&times;</span>
            </div>
            <form id="incident-form">
                <div class="form-group">
                    <label for="incident-time">Incident Time:</label>
                    <input type="datetime-local" id="incident-time" name="incidentTime" required>
                </div>
                <div class="form-group">
                    <label for="incident-location">Location:</label>
                    <input type="text" id="incident-location" name="location" value="${this.currentSite?.location || ''}" required>
                </div>
                <div class="form-group">
                    <label for="incident-type">Incident Type:</label>
                    <select id="incident-type" name="incidentType" required>
                        <option value="">Select...</option>
                        <option value="security-breach">Security Breach</option>
                        <option value="suspicious-activity">Suspicious Activity</option>
                        <option value="emergency">Emergency</option>
                        <option value="maintenance">Maintenance Issue</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="incident-description">Description:</label>
                    <textarea id="incident-description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="incident-action">Action Taken:</label>
                    <textarea id="incident-action" name="actionTaken" required></textarea>
                </div>
                <button type="submit" class="primary-btn">Submit Report</button>
            </form>
        `;
    }

    handleIncidentReport(formData) {
        const incident = {
            id: Date.now(),
            time: formData.get('incidentTime'),
            location: formData.get('location'),
            type: formData.get('incidentType'),
            description: formData.get('description'),
            actionTaken: formData.get('actionTaken'),
            reportedBy: 'Current Officer',
            reportTime: new Date().toISOString()
        };

        this.incidentReports.push(incident);
        
        if (this.isOnSite && this.currentSite) {
            this.currentSite.activities.push({
                type: 'incident',
                data: incident
            });
        }

        this.addActivity(`Incident reported: ${incident.type} at ${incident.location}`, 'incident');
        this.closeModal('incident-modal');
        this.saveToStorage();
    }

    // Mission Reports
    showMissionReport(isEnding = false) {
        this.showModal('mission-report-modal', this.getMissionReportModalHTML(isEnding));
    }

    getMissionReportModalHTML(isEnding) {
        return `
            <div class="modal-header">
                <h3 class="modal-title">${isEnding ? 'Final Mission Report' : 'Mission Report'}</h3>
                <span class="close">&times;</span>
            </div>
            ${isEnding ? '<p style="color: #dc3545; margin-bottom: 20px;">⚠️ This report is required to end the mission.</p>' : ''}
            <form id="mission-report-form">
                <input type="hidden" name="isEnding" value="${isEnding}">
                <div class="form-group">
                    <label for="report-summary">Mission Summary:</label>
                    <textarea id="report-summary" name="summary" required></textarea>
                </div>
                <div class="form-group">
                    <label for="report-observations">Key Observations:</label>
                    <textarea id="report-observations" name="observations" required></textarea>
                </div>
                <div class="form-group">
                    <label for="report-issues">Issues Encountered:</label>
                    <textarea id="report-issues" name="issues"></textarea>
                </div>
                <div class="form-group">
                    <label for="report-recommendations">Recommendations:</label>
                    <textarea id="report-recommendations" name="recommendations"></textarea>
                </div>
                <button type="submit" class="primary-btn">${isEnding ? 'Complete Mission' : 'Save Report'}</button>
            </form>
        `;
    }

    handleMissionReport(formData) {
        const isEnding = formData.get('isEnding') === 'true';
        
        const report = {
            summary: formData.get('summary'),
            observations: formData.get('observations'),
            issues: formData.get('issues'),
            recommendations: formData.get('recommendations'),
            timestamp: new Date().toISOString()
        };

        if (isEnding) {
            this.completeMission(report);
        } else {
            this.currentMission.report = report;
            this.addActivity('Mission report updated', 'report');
            this.closeModal('mission-report-modal');
            this.saveToStorage();
        }
    }

    completeMission(finalReport) {
        if (!this.currentMission) return;

        const completedMission = {
            ...this.currentMission,
            actualEndTime: new Date().toISOString(),
            finalReport: finalReport,
            patrolStops: this.patrolStops,
            incidentReports: this.incidentReports,
            activities: this.currentActivity,
            status: 'completed'
        };

        this.missionLogs.push(completedMission);
        this.addActivity('Mission completed', 'mission-end');
        
        // Reset current mission state
        this.currentMission = null;
        this.patrolStops = [];
        this.incidentReports = [];
        this.isOnSite = false;
        this.currentSite = null;
        
        this.updateDashboardState();
        this.closeModal('mission-report-modal');
        this.saveToStorage();
        
        alert('Mission completed successfully!');
    }

    // Activity Management
    addActivity(description, type) {
        const activity = {
            id: Date.now(),
            time: new Date().toISOString(),
            description: description,
            type: type
        };
        
        this.currentActivity.push(activity);
        this.updateActivityDisplay();
    }

    renderActivityLog() {
        if (this.currentActivity.length === 0) {
            return '<p style="color: #666; font-style: italic;">No activities logged yet.</p>';
        }
        
        return this.currentActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-time">${new Date(activity.time).toLocaleString()}</div>
                <div class="activity-description">${activity.description}</div>
            </div>
        `).join('');
    }

    updateActivityDisplay() {
        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = this.renderActivityLog();
        }
    }

    // Report Generation
    generateCurrentReport() {
        if (!this.currentMission) {
            return 'No active mission to report.';
        }

        let report = `FIELD OFFICER MISSION REPORT\n`;
        report += `${'='.repeat(50)}\n\n`;
        
        report += `Mission Type: ${this.currentMission.type.toUpperCase()}\n`;
        report += `Mission Name: ${this.currentMission.name}\n`;
        report += `Officer: Current Officer\n`;
        report += `Start Time: ${new Date(this.currentMission.actualStartTime).toLocaleString()}\n`;
        report += `Expected End: ${new Date(this.currentMission.endTime).toLocaleString()}\n`;
        
        if (this.currentMission.status === 'completed') {
            report += `Actual End: ${new Date(this.currentMission.actualEndTime).toLocaleString()}\n`;
        }
        
        report += `\nMISSION DETAILS:\n${'-'.repeat(20)}\n`;
        report += `${this.currentMission.details}\n\n`;

        if (this.currentMissionType === 'patrol' && this.patrolStops.length > 0) {
            report += `PATROL STOPS:\n${'-'.repeat(20)}\n`;
            this.patrolStops.forEach((stop, index) => {
                report += `${index + 1}. ${stop.location}\n`;
                report += `   Arrival: ${new Date(stop.arrivalTime).toLocaleString()}\n`;
                if (stop.departureTime) {
                    report += `   Departure: ${new Date(stop.departureTime).toLocaleString()}\n`;
                }
                report += `   Details: ${stop.details}\n\n`;
            });
        }

        if (this.incidentReports.length > 0) {
            report += `INCIDENT REPORTS:\n${'-'.repeat(20)}\n`;
            this.incidentReports.forEach((incident, index) => {
                report += `${index + 1}. ${incident.type.toUpperCase()}\n`;
                report += `   Time: ${new Date(incident.time).toLocaleString()}\n`;
                report += `   Location: ${incident.location}\n`;
                report += `   Description: ${incident.description}\n`;
                report += `   Action Taken: ${incident.actionTaken}\n\n`;
            });
        }

        report += `ACTIVITY LOG:\n${'-'.repeat(20)}\n`;
        this.currentActivity.forEach(activity => {
            report += `${new Date(activity.time).toLocaleString()} - ${activity.description}\n`;
        });

        if (this.currentMission.finalReport) {
            report += `\nFINAL MISSION REPORT:\n${'-'.repeat(20)}\n`;
            report += `Summary: ${this.currentMission.finalReport.summary}\n\n`;
            report += `Observations: ${this.currentMission.finalReport.observations}\n\n`;
            if (this.currentMission.finalReport.issues) {
                report += `Issues: ${this.currentMission.finalReport.issues}\n\n`;
            }
            if (this.currentMission.finalReport.recommendations) {
                report += `Recommendations: ${this.currentMission.finalReport.recommendations}\n\n`;
            }
        }

        report += `\nReport generated: ${new Date().toLocaleString()}\n`;
        
        return report;
    }

    copyCurrentReport() {
        const report = this.generateCurrentReport();
        navigator.clipboard.writeText(report).then(() => {
            alert('Report copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = report;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Report copied to clipboard!');
        });
    }

    // Mission Logs Viewing
    viewMissionLogs() {
        document.body.innerHTML = this.getMissionLogsHTML();
    }

    getMissionLogsHTML() {
        return `
            <div class="container">
                <header>
                    <h1>Mission Logs</h1>
                    <p class="subtitle">View and copy previous mission reports</p>
                </header>
                
                <div class="logs-container">
                    <div style="margin-bottom: 20px;">
                        <button class="nav-btn" onclick="location.reload()">← Back to Home</button>
                    </div>
                    
                    <div id="logs-list">
                        ${this.renderMissionLogs()}
                    </div>
                </div>
            </div>
        `;
    }

    renderMissionLogs() {
        if (this.missionLogs.length === 0) {
            return '<p style="color: #666; font-style: italic; text-align: center; padding: 40px;">No mission logs found.</p>';
        }

        return this.missionLogs.map(mission => `
            <div class="log-item">
                <div class="log-header">
                    <div class="log-title">${mission.name} (${mission.type.toUpperCase()})</div>
                    <div class="log-date">${new Date(mission.actualStartTime).toLocaleDateString()}</div>
                </div>
                <div style="margin: 10px 0;">
                    <strong>Duration:</strong> ${new Date(mission.actualStartTime).toLocaleString()} - 
                    ${mission.actualEndTime ? new Date(mission.actualEndTime).toLocaleString() : 'Ongoing'}
                </div>
                <div class="log-content">${this.generateMissionLogReport(mission)}</div>
                <button class="copy-btn" onclick="missionLogger.copyMissionLog('${mission.id}')">
                    📋 Copy Report
                </button>
            </div>
        `).join('');
    }

    generateMissionLogReport(mission) {
        let report = `FIELD OFFICER MISSION REPORT\n`;
        report += `${'='.repeat(50)}\n\n`;
        
        report += `Mission Type: ${mission.type.toUpperCase()}\n`;
        report += `Mission Name: ${mission.name}\n`;
        report += `Start Time: ${new Date(mission.actualStartTime).toLocaleString()}\n`;
        
        if (mission.actualEndTime) {
            report += `End Time: ${new Date(mission.actualEndTime).toLocaleString()}\n`;
        }
        
        report += `\nMISSION DETAILS:\n${'-'.repeat(20)}\n`;
        report += `${mission.details}\n\n`;

        if (mission.patrolStops && mission.patrolStops.length > 0) {
            report += `PATROL STOPS:\n${'-'.repeat(20)}\n`;
            mission.patrolStops.forEach((stop, index) => {
                report += `${index + 1}. ${stop.location}\n`;
                report += `   Arrival: ${new Date(stop.arrivalTime).toLocaleString()}\n`;
                if (stop.departureTime) {
                    report += `   Departure: ${new Date(stop.departureTime).toLocaleString()}\n`;
                }
                report += `   Details: ${stop.details}\n\n`;
            });
        }

        if (mission.incidentReports && mission.incidentReports.length > 0) {
            report += `INCIDENT REPORTS:\n${'-'.repeat(20)}\n`;
            mission.incidentReports.forEach((incident, index) => {
                report += `${index + 1}. ${incident.type.toUpperCase()}\n`;
                report += `   Time: ${new Date(incident.time).toLocaleString()}\n`;
                report += `   Location: ${incident.location}\n`;
                report += `   Description: ${incident.description}\n`;
                report += `   Action Taken: ${incident.actionTaken}\n\n`;
            });
        }

        if (mission.activities && mission.activities.length > 0) {
            report += `ACTIVITY LOG:\n${'-'.repeat(20)}\n`;
            mission.activities.forEach(activity => {
                report += `${new Date(activity.time).toLocaleString()} - ${activity.description}\n`;
            });
        }

        if (mission.finalReport) {
            report += `\nFINAL MISSION REPORT:\n${'-'.repeat(20)}\n`;
            report += `Summary: ${mission.finalReport.summary}\n\n`;
            report += `Observations: ${mission.finalReport.observations}\n\n`;
            if (mission.finalReport.issues) {
                report += `Issues: ${mission.finalReport.issues}\n\n`;
            }
            if (mission.finalReport.recommendations) {
                report += `Recommendations: ${mission.finalReport.recommendations}\n\n`;
            }
        }

        return report;
    }

    copyMissionLog(missionId) {
        const mission = this.missionLogs.find(m => m.id == missionId);
        if (mission) {
            const report = this.generateMissionLogReport(mission);
            navigator.clipboard.writeText(report).then(() => {
                alert('Mission log copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = report;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Mission log copied to clipboard!');
            });
        }
    }

    // Navigation
    goHome() {
        location.reload();
    }

    // UI Helper Methods
    updateDashboardState() {
        // Update status indicator
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            if (this.currentMission) {
                statusIndicator.className = 'status-indicator status-active';
                statusIndicator.textContent = this.isOnSite ? 'On-Site' : 'Mission Active';
            } else {
                statusIndicator.className = 'status-indicator status-inactive';
                statusIndicator.textContent = 'No Active Mission';
            }
        }

        // Update button states
        this.updateButtonStates();
        
        // Update activity display
        this.updateActivityDisplay();
    }

    updateButtonStates() {
        const startBtn = document.querySelector('.start-btn');
        const stopBtn = document.querySelector('.stop-btn');
        const onsiteBtn = document.querySelector('.onsite-btn');
        const offsiteBtn = document.querySelector('.offsite-btn');
        const missionReportBtn = document.querySelector('.report-btn:last-of-type');

        if (startBtn) startBtn.disabled = !!this.currentMission;
        if (stopBtn) stopBtn.disabled = !this.currentMission;
        if (onsiteBtn) onsiteBtn.disabled = !this.currentMission || this.isOnSite;
        if (offsiteBtn) offsiteBtn.disabled = !this.isOnSite;
        if (missionReportBtn) missionReportBtn.disabled = !this.currentMission;
    }

    showModal(modalId, content) {
        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        // Create new modal
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `<div class="modal-content">${content}</div>`;
        
        document.body.appendChild(modal);

        // Set default values for time inputs
        const timeInputs = modal.querySelectorAll('input[type="datetime-local"]');
        timeInputs.forEach(input => {
            if (!input.value) {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                input.value = now.toISOString().slice(0, 16);
            }
        });

        // Handle cover details visibility
        const hasCoverSelect = modal.querySelector('#has-cover');
        const coverDetails = modal.querySelector('#cover-details');
        if (hasCoverSelect && coverDetails) {
            hasCoverSelect.addEventListener('change', (e) => {
                coverDetails.style.display = e.target.value === 'yes' ? 'block' : 'none';
            });
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    handleFormSubmission(e) {
        const formId = e.target.id;
        const formData = new FormData(e.target);

        switch (formId) {
            case 'start-mission-form':
                this.handleStartMission(formData);
                break;
            case 'onsite-form':
                this.handleGoOnSite(formData);
                break;
            case 'incident-form':
                this.handleIncidentReport(formData);
                break;
            case 'mission-report-form':
                this.handleMissionReport(formData);
                break;
            case 'early-end-form':
                this.handleEarlyEnd(formData);
                break;
        }
    }

    handleEarlyEnd(formData) {
        const earlyEndData = {
            reason: formData.get('earlyReason'),
            hasCover: formData.get('hasCover'),
            coverName: formData.get('coverName') || 'N/A'
        };

        this.currentMission.earlyEnd = earlyEndData;
        this.addActivity(`Mission ended early: ${earlyEndData.reason}`, 'early-end');
        
        this.closeModal('early-end-modal');
        this.showMissionReport(true);
    }

    // Data Persistence
    saveToStorage() {
        const data = {
            currentMission: this.currentMission,
            currentActivity: this.currentActivity,
            patrolStops: this.patrolStops,
            isOnSite: this.isOnSite,
            currentSite: this.currentSite,
            incidentReports: this.incidentReports,
            missionLogs: this.missionLogs,
            currentMissionType: this.currentMissionType
        };
        
        localStorage.setItem('fieldOfficerData', JSON.stringify(data));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('fieldOfficerData');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentMission = data.currentMission;
            this.currentActivity = data.currentActivity || [];
            this.patrolStops = data.patrolStops || [];
            this.isOnSite = data.isOnSite || false;
            this.currentSite = data.currentSite;
            this.incidentReports = data.incidentReports || [];
            this.currentMissionType = data.currentMissionType;
        }
    }

    loadMissionLogs() {
        const saved = localStorage.getItem('fieldOfficerData');
        if (saved) {
            const data = JSON.parse(saved);
            return data.missionLogs || [];
        }
        return [];
    }
}

// Global functions for onclick handlers
function selectMission(type) {
    missionLogger.selectMission(type);
}

function viewMissionLogs() {
    missionLogger.viewMissionLogs();
}

// Initialize the application
const missionLogger = new MissionLogger();