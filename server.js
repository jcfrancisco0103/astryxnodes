const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════╗
    ║                                              ║
    ║        🌌 AstryxNodes Server Running 🌌      ║
    ║                                              ║
    ║     Server: http://localhost:${PORT}          ║
    ║     Status: ✓ Online                         ║
    ║     Theme:  Nebula UI                        ║
    ║                                              ║
    ╚══════════════════════════════════════════════╝
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
