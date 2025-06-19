"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = require("./db");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const workflow_routes_1 = __importDefault(require("./routes/workflow.routes"));
const proxy_routes_1 = __importDefault(require("./routes/proxy.routes"));
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const balance_routes_1 = __importDefault(require("./routes/balance.routes"));
const upgrade_routes_1 = __importDefault(require("./routes/upgrade.routes"));
const deposit_routes_1 = __importDefault(require("./routes/deposit.routes"));
const app = (0, express_1.default)();
const PORT = process.env.BACKEND_PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mode: 'electron-backend',
        version: '1.0.0'
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/profiles', profile_routes_1.default);
app.use('/api/workflows', workflow_routes_1.default);
app.use('/api/proxies', proxy_routes_1.default);
app.use('/api/store', store_routes_1.default);
app.use('/api/balance', balance_routes_1.default);
app.use('/api/upgrade', upgrade_routes_1.default);
app.use('/api/deposit', deposit_routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Backend Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});
async function startServer() {
    try {
        // Initialize database
        await (0, db_1.initializeDatabase)();
        console.log('✅ Database initialized');
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Electron Backend running on port ${PORT}`);
            console.log(`📡 Mode: ${process.env.NODE_ENV || 'development'}`);
            // Notify Electron main process that backend is ready
            if (process.send) {
                process.send('backend-ready');
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to start backend:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Backend shutting down...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('🛑 Backend shutting down...');
    process.exit(0);
});
startServer();
