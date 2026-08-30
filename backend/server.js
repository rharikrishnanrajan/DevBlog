const express = require('express');
const cors = require('cors');
require('dotenv').config();

const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger for visibility
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Health check & status endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Developer Blog API is running smoothly' });
});

// Post API routes
app.use('/api/posts', postRoutes);

// Fallback 404 handler for undefined API routes
app.use((req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ message: 'An unexpected error occurred on the server' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Developer-Centric Blog API running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available under http://localhost:${PORT}/api/posts`);
});
