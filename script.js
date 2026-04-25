// Data Management
let praises = JSON.parse(localStorage.getItem('praises')) || [];
let selectedLevel = null;
let selectedAmount = 0;
let selectedEmoji = '';
let adminPassword = localStorage.getItem('adminPassword') || 'admin123';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    displayRecentPraises();
    updateAdminStats();
});

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

function submitPraise() {
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
    
    const praise = {
        id: Date.now(),
        name: name,
        message: message,
        level: selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1),
        amount: selectedAmount,
        emoji: selectedEmoji,
        timestamp: new Date().toISOString()
    };
    
    praises.push(praise);
    localStorage.setItem('praises', JSON.stringify(praises));
    
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
    alert(`Thank you for your ${praise.level} praise of $${praise.amount}! 🎉`);
}

function updateStats() {
    const totalSpent = praises.reduce((sum, praise) => sum + praise.amount, 0);
    const totalPraises = praises.length;
    
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('totalPraises').textContent = totalPraises;
}

function displayRecentPraises() {
    const praisesList = document.getElementById('praisesList');
    const recentPraises = praises.slice(-5).reverse();
    
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
}

// Login Functions
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === adminPassword) {
        showAdminPortal();
        // Clear login form
        document.getElementById('password').value = '';
        document.getElementById('loginError').classList.add('hidden');
    } else {
        document.getElementById('loginError').textContent = 'Invalid username or password';
        document.getElementById('loginError').classList.remove('hidden');
    }
}

// Admin Portal Functions
function updateAdminStats() {
    const totalEarned = praises.reduce((sum, praise) => sum + praise.amount, 0);
    const totalPraises = praises.length;
    const elitePraises = praises.filter(p => p.level === 'Elite').length;
    const premiumPraises = praises.filter(p => p.level === 'Premium').length;
    
    document.getElementById('totalEarned').textContent = `$${totalEarned.toFixed(2)}`;
    document.getElementById('adminTotalPraises').textContent = totalPraises;
    document.getElementById('elitePraises').textContent = elitePraises;
    document.getElementById('premiumPraises').textContent = premiumPraises;
}

function displayAllPraises() {
    const adminPraisesList = document.getElementById('adminPraisesList');
    const allPraises = praises.slice().reverse();
    
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
}

function refreshAdminData() {
    updateAdminStats();
    displayAllPraises();
}

function exportData() {
    if (praises.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Create CSV content
    let csv = 'ID,Name,Message,Level,Amount,Emoji,Timestamp\n';
    praises.forEach(praise => {
        csv += `${praise.id},"${praise.name}","${praise.message}","${praise.level}",${praise.amount},"${praise.emoji}","${praise.timestamp}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `praises_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Change Password Functions
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (currentPassword !== adminPassword) {
        document.getElementById('changePasswordError').textContent = 'Current password is incorrect';
        document.getElementById('changePasswordError').classList.remove('hidden');
        return;
    }
    
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
    
    // Update password
    adminPassword = newPassword;
    localStorage.setItem('adminPassword', adminPassword);
    
    // Clear form and go back to login
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('changePasswordError').classList.add('hidden');
    
    alert('Password changed successfully!');
    showLogin();
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
