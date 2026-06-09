const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'nodejs-docker-app';

// Simple structured JSON logger — wahi concept jo hum seekh rahe hain
function log(level, message, extra = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    message,
    ...extra,
  }));
}

app.use((req, res, next) => {
  log('INFO', 'Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check — Docker/k8s ka standard endpoint
app.get('/health', (req, res) => {
  log('INFO', 'Health check called');
  res.json({ status: 'ok', service: SERVICE_NAME, uptime: process.uptime() });
});

// Home route
app.get('/', (req, res) => {
  log('INFO', 'Home route hit');
  res.json({ message: 'Hello from Dockerized Node.js app', version: '1.0.0' });
});

// A route that intentionally logs a warning
app.get('/slow', (req, res) => {
  log('WARN', 'Slow endpoint hit — simulating delay');
  setTimeout(() => {
    res.json({ message: 'This was slow!', delay_ms: 2000 });
  }, 2000);
});

// Catch-all — 404
app.use((req, res) => {
  log('ERROR', 'Route not found', { path: req.path });
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  log('INFO', `Server started`, { port: PORT });
});