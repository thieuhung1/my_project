const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { createVnpayRouter } = require('../app/routes/vnpay.routes');
const { createEmailRouter } = require('../app/routes/email.routes');

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
});

app.use('/api/vnpay', createVnpayRouter());
app.use('/api/email', createEmailRouter());

app.use((err, _req, res, _next) => {
  console.error('Unhandled backend error:', err);
  res.status(500).json({
    success: false,
    message: err?.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
