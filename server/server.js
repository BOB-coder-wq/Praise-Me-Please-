require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const Praise = require('./models/Praise');
const AdminSettings = require('./models/AdminSettings');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/praise-portal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB database');
})
.catch((error) => {
    console.error('❌ Database connection error:', error);
    process.exit(1);
});

// Utility functions
const getClientInfo = (req) => {
    return {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown'
    };
};

// API Routes

// Get all praises
app.get('/api/praises', async (req, res) => {
    try {
        const praises = await Praise.find().sort({ timestamp: -1 });
        res.json({
            success: true,
            data: praises,
            count: praises.length
        });
    } catch (error) {
        console.error('Error fetching praises:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching praises'
        });
    }
});

// Get recent praises (limited)
app.get('/api/praises/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const praises = await Praise.find()
            .sort({ timestamp: -1 })
            .limit(limit);
        
        res.json({
            success: true,
            data: praises,
            count: praises.length
        });
    } catch (error) {
        console.error('Error fetching recent praises:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent praises'
        });
    }
});

// Submit new praise
app.post('/api/praises', async (req, res) => {
    try {
        const { name, message, level, amount, emoji } = req.body;
        
        // Validation
        if (!name || !message || !level || !amount || !emoji) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        if (!['Basic', 'Premium', 'Elite'].includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid praise level'
            });
        }
        
        const clientInfo = getClientInfo(req);
        
        const praise = new Praise({
            name: name.trim(),
            message: message.trim(),
            level,
            amount: parseFloat(amount),
            emoji,
            ...clientInfo
        });
        
        await praise.save();
        
        res.status(201).json({
            success: true,
            message: 'Praise submitted successfully',
            data: praise
        });
    } catch (error) {
        console.error('Error submitting praise:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting praise'
        });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Praise.aggregate([
            {
                $group: {
                    _id: null,
                    totalEarned: { $sum: '$amount' },
                    totalPraises: { $sum: 1 },
                    elitePraises: {
                        $sum: { $cond: [{ $eq: ['$level', 'Elite'] }, 1, 0] }
                    },
                    premiumPraises: {
                        $sum: { $cond: [{ $eq: ['$level', 'Premium'] }, 1, 0] }
                    },
                    basicPraises: {
                        $sum: { $cond: [{ $eq: ['$level', 'Basic'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        const result = stats[0] || {
            totalEarned: 0,
            totalPraises: 0,
            elitePraises: 0,
            premiumPraises: 0,
            basicPraises: 0
        };
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Admin authentication
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }
        
        const settings = await AdminSettings.getSettings();
        
        // Check if account is locked
        if (settings.lockoutUntil && settings.lockoutUntil > Date.now()) {
            return res.status(423).json({
                success: false,
                message: 'Account temporarily locked. Please try again later.'
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, settings.adminPassword);
        
        if (isPasswordValid) {
            // Reset login attempts on successful login
            await AdminSettings.updateOne(
                { _id: settings._id },
                { 
                    $set: { loginAttempts: 0, lockoutUntil: undefined },
                    $currentDate: { lastLoginAttempt: true }
                }
            );
            
            res.json({
                success: true,
                message: 'Login successful'
            });
        } else {
            // Increment login attempts
            const attempts = settings.loginAttempts + 1;
            const lockoutUntil = attempts >= 5 ? Date.now() + (15 * 60 * 1000) : undefined; // Lock for 15 minutes after 5 attempts
            
            await AdminSettings.updateOne(
                { _id: settings._id },
                { 
                    $set: { 
                        loginAttempts: attempts,
                        lockoutUntil: lockoutUntil
                    },
                    $currentDate: { lastLoginAttempt: true }
                }
            );
            
            res.status(401).json({
                success: false,
                message: 'Invalid password',
                attemptsLeft: Math.max(0, 5 - attempts)
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login error'
        });
    }
});

// Change admin password
app.post('/api/admin/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new passwords are required'
            });
        }
        
        if (newPassword.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 4 characters long'
            });
        }
        
        const settings = await AdminSettings.getSettings();
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, settings.adminPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        await AdminSettings.updateOne(
            { _id: settings._id },
            { 
                $set: { adminPassword: hashedNewPassword },
                $currentDate: { lastUpdated: true }
            }
        );
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});

// Export data as CSV
app.get('/api/export/csv', async (req, res) => {
    try {
        const praises = await Praise.find().sort({ timestamp: -1 });
        
        if (praises.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data to export'
            });
        }
        
        // Create CSV content
        let csv = 'ID,Name,Message,Level,Amount,Emoji,Timestamp,IPAddress\n';
        praises.forEach(praise => {
            csv += `${praise._id},"${praise.name.replace(/"/g, '""')}","${praise.message.replace(/"/g, '""')}","${praise.level}",${praise.amount},"${praise.emoji}","${praise.timestamp.toISOString()}","${praise.ipAddress || 'N/A'}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="praises_data_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting data'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Accessible at: http://localhost:${PORT}`);
    console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});
