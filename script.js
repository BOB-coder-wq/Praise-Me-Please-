// Data Management
let selectedLevel = null;
let selectedAmount = 0;
let selectedEmoji = '';
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.protocol === 'file:' 
    ? 'http://localhost:3000/api' 
    : 'https://your-server-url.com/api'; // Update this for production

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    displayRecentPraises();
    updateAdminStats();
});

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Navigation Functions
function showLogin() {
    hideAllPages();
    document.getElementById('loginWindow').classList.remove('hidden');
}

function showMainPortal() {
    hideAllPages();
    document.getElementById('mainPortal').classList.remove('hidden');
    updateStats();
    displayRecentPraises();
}

function showAdminPortal() {
    hideAllPages();
    document.getElementById('adminPortal').classList.remove('hidden');
    updateAdminStats();
    displayAllPraises();
}

function showChangePassword() {
    hideAllPages();
    document.getElementById('changePasswordWindow').classList.remove('hidden');
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
}

// Main Portal Functions
function selectPraiseLevel(level, amount, emoji) {
    selectedLevel = level;
    selectedAmount = amount;
    selectedEmoji = emoji;
    
    document.getElementById('selectedLevel').textContent = 
        `${emoji} ${level.charAt(0).toUpperCase() + level.slice(1)} Praise - $${amount}`;
    document.getElementById('btnPay').disabled = false;
    
    // Update button styles
    document.querySelectorAll('.praise-card').forEach(card => {
        card.style.border = '1px solid #4A5F7A';
    });
    document.querySelector(`[data-level="${level}"]`).style.border = '2px solid #F39C12';
}

async function submitPraise() {
    const name = document.getElementById('userName').value.trim();
    const message = document.getElementById('praiseMessage').value.trim();
    
    if (!name || !message) {
        alert('Please enter both your name and praise message.');
        return;
    }
    
    if (!selectedLevel) {
        alert('Please select a praise level.');
        return;
    }
    
    try {
        const praiseData = {
            name: name,
            message: message,
            level: selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1),
            amount: selectedAmount,
            emoji: selectedEmoji
        };
        
        const result = await apiCall('/praises', {
            method: 'POST',
            body: JSON.stringify(praiseData)
        });
        
        // Reset form
        document.getElementById('userName').value = '';
        document.getElementById('praiseMessage').value = '';
        document.getElementById('selectedLevel').textContent = 'No praise level selected';
        document.getElementById('btnPay').disabled = true;
        selectedLevel = null;
        selectedAmount = 0;
        selectedEmoji = '';
        
        // Reset card borders
        document.querySelectorAll('.praise-card').forEach(card => {
            card.style.border = '1px solid #4A5F7A';
        });
        
        // Update displays
        updateStats();
        displayRecentPraises();
        
        // Show success message
        alert(`Thank you for your ${result.data.level} praise of $${result.data.amount}! 🎉`);
    } catch (error) {
        alert('Error submitting praise: ' + error.message);
    }
}

async function updateStats() {
    try {
        const result = await apiCall('/stats');
        const stats = result.data;
        
        document.getElementById('totalSpent').textContent = `$${stats.totalEarned.toFixed(2)}`;
        document.getElementById('totalPraises').textContent = stats.totalPraises;
    } catch (error) {
        console.error('Error updating stats:', error);
        // Fallback to zeros if API fails
        document.getElementById('totalSpent').textContent = '$0.00';
        document.getElementById('totalPraises').textContent = '0';
    }
}

async function displayRecentPraises() {
    try {
        const result = await apiCall('/praises/recent?limit=5');
        const recentPraises = result.data;
        
        const praisesList = document.getElementById('praisesList');
        
        if (recentPraises.length === 0) {
            praisesList.innerHTML = '<p style="color: #7F8C8D; text-align: center;">No praises yet. Be the first!</p>';
            return;
        }
        
        praisesList.innerHTML = recentPraises.map(praise => `
            <div class="praise-item">
                <div class="level">${praise.emoji} ${praise.level} - $${praise.amount}</div>
                <div class="name">From: ${praise.name}</div>
                <div class="message">${praise.message}</div>
                <div class="timestamp">${formatDate(praise.timestamp)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying recent praises:', error);
        document.getElementById('praisesList').innerHTML = '<p style="color: #E74C3D; text-align: center;">Error loading praises. Please refresh.</p>';
    }
}

// Login Functions
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (username !== 'admin') {
        document.getElementById('loginError').textContent = 'Invalid username';
        document.getElementById('loginError').classList.remove('hidden');
        return;
    }
    
    try {
        const result = await apiCall('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
        
        showAdminPortal();
        // Clear login form
        document.getElementById('password').value = '';
        document.getElementById('loginError').classList.add('hidden');
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
        document.getElementById('loginError').classList.remove('hidden');
    }
}

// Admin Portal Functions
async function updateAdminStats() {
    try {
        const result = await apiCall('/stats');
        const stats = result.data;
        
        document.getElementById('totalEarned').textContent = `$${stats.totalEarned.toFixed(2)}`;
        document.getElementById('adminTotalPraises').textContent = stats.totalPraises;
        document.getElementById('elitePraises').textContent = stats.elitePraises;
        document.getElementById('premiumPraises').textContent = stats.premiumPraises;
    } catch (error) {
        console.error('Error updating admin stats:', error);
        // Fallback to zeros if API fails
        document.getElementById('totalEarned').textContent = '$0.00';
        document.getElementById('adminTotalPraises').textContent = '0';
        document.getElementById('elitePraises').textContent = '0';
        document.getElementById('premiumPraises').textContent = '0';
    }
}

async function displayAllPraises() {
    try {
        const result = await apiCall('/praises');
        const allPraises = result.data;
        
        const adminPraisesList = document.getElementById('adminPraisesList');
        
        if (allPraises.length === 0) {
            adminPraisesList.innerHTML = '<p style="color: #7F8C8D; text-align: center;">No praises yet.</p>';
            return;
        }
        
        adminPraisesList.innerHTML = allPraises.map(praise => `
            <div class="admin-praise-item">
                <div class="content">
                    <div class="level-amount">
                        <span class="level">${praise.emoji} ${praise.level}</span>
                        <span class="amount">- $${praise.amount}</span>
                    </div>
                    <div class="name">From: ${praise.name}</div>
                    <div class="message-label">Message:</div>
                    <div class="message">${praise.message}</div>
                    <div class="timestamp">${formatDate(praise.timestamp)}</div>
                </div>
                <div class="emoji">${praise.emoji}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying all praises:', error);
        document.getElementById('adminPraisesList').innerHTML = '<p style="color: #E74C3D; text-align: center;">Error loading praises. Please refresh.</p>';
    }
}

async function refreshAdminData() {
    await updateAdminStats();
    await displayAllPraises();
}

async function exportData() {
    try {
        const response = await fetch(`${API_BASE_URL}/export/csv`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Export failed');
        }
        
        // Create download link from the CSV response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `praises_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error exporting data: ' + error.message);
    }
}

// Change Password Functions
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword.length < 4) {
        document.getElementById('changePasswordError').textContent = 'New password must be at least 4 characters long';
        document.getElementById('changePasswordError').classList.remove('hidden');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        document.getElementById('changePasswordError').textContent = 'New passwords do not match';
        document.getElementById('changePasswordError').classList.remove('hidden');
        return;
    }
    
    try {
        const result = await apiCall('/admin/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        // Clear form and go back to login
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('changePasswordError').classList.add('hidden');
        
        alert('Password changed successfully!');
        showLogin();
    } catch (error) {
        document.getElementById('changePasswordError').textContent = error.message;
        document.getElementById('changePasswordError').classList.remove('hidden');
    }
}

function cancelChangePassword() {
    // Clear form and go back to login
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('changePasswordError').classList.add('hidden');
    showLogin();
}

// Navigation Functions
function logout() {
    showMainPortal();
}

function backToMain() {
    showMainPortal();
}

// Utility Functions
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key to submit forms
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement.id === 'password') {
            login();
        } else if (activeElement.id === 'confirmPassword') {
            changePassword();
        } else if (activeElement.id === 'praiseMessage' && !document.getElementById('btnPay').disabled) {
            submitPraise();
        }
    }
    
    // Escape key to go back
    if (e.key === 'Escape') {
        const currentPage = document.querySelector('.page:not(.hidden)');
        if (currentPage.id === 'loginWindow') {
            showMainPortal();
        } else if (currentPage.id === 'adminPortal') {
            showMainPortal();
        } else if (currentPage.id === 'changePasswordWindow') {
            cancelChangePassword();
        }
    }
});
