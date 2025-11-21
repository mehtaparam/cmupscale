"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var upscaler_routes_1 = __importDefault(require("./routes/upscaler.routes"));
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
// Middleware to handle JSON with larger payload (for base64 images)
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check endpoint
app.get('/health', function (req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
    });
});
// Root endpoint
app.get('/', function (req, res) {
    res.json({
        message: 'Image Upscaler API - Base64 Edition',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            upscale: 'POST /api/upscale',
        },
        usage: {
            method: 'POST',
            endpoint: '/api/upscale',
            body: {
                image: 'base64 string (with or without image prefix)',
            },
        },
        timestamp: new Date().toISOString(),
    });
});
app.use('/api', upscaler_routes_1.default);
// Global error handler
app.use(function (err, req, res, next) {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message,
    });
});
// Start server
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Image Upscaler API running on port ".concat(PORT));
    console.log("\uD83D\uDCCA Health check: http://localhost:".concat(PORT, "/health"));
    console.log("\uD83D\uDDBC\uFE0F  Upscale endpoint: http://localhost:".concat(PORT, "/api/upscale"));
    console.log("\uD83D\uDCDD Memory limit: 50MB for base64 images");
});
// Graceful shutdown
process.on('SIGTERM', function () {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', function () {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map