// Backend router: gửi email xác nhận đơn hàng
// Dùng nodemailer + SMTP env.
// ENV required:
//  - SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS
//  - SMTP_FROM (optional, default SMTP_USER)
//
// API:
//  POST /api/email/order-confirmation
//   body: { to, orderId, amount, paymentMethod, items?[] }
//
// Note: Không log secrets. Validate input tối thiểu.

const express = require('express');
const nodemailer = require('nodemailer');

const toBool = (v) => String(v).toLowerCase() === 'true';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = toBool(process.env.SMTP_SECURE || 'false');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Thiếu cấu hình SMTP. Cần SMTP_HOST, SMTP_USER, SMTP_PASS (và SMTP_PORT nếu khác mặc định).');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const escapeHtml = (s = '') =>
  String(s)
    .replaceAll('&', '&')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", "'");

const formatVnd = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return '0₫';
  return `${num.toLocaleString('vi-VN')}₫`;
};

const buildOrderHtml = ({ orderId, amount, paymentMethod, items = [] }) => {
  const safeOrderId = escapeHtml(orderId);
  const safeMethod = escapeHtml(paymentMethod || 'COD');

  const itemsHtml =
    Array.isArray(items) && items.length
      ? `<table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead>
          <tr>
            <th align="left" style="border-bottom:1px solid #eee;padding:8px 0">Sản phẩm</th>
            <th align="right" style="border-bottom:1px solid #eee;padding:8px 0">SL</th>
            <th align="right" style="border-bottom:1px solid #eee;padding:8px 0">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((it) => {
              const name = escapeHtml(it.productName || it.name || 'Sản phẩm');
              const qty = Number(it.quantity || 0);
              const price = Number(it.price || 0);
              return `<tr>
                <td style="padding:6px 0">${name}</td>
                <td align="right" style="padding:6px 0">${qty}</td>
                <td align="right" style="padding:6px 0">${formatVnd(price * qty)}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>`
      : '';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#222">
    <h2 style="margin:0 0 8px">Xác nhận đơn hàng</h2>
    <p style="margin:0 0 16px">Đơn hàng <b>#${safeOrderId.slice(-8).toUpperCase()}</b> đã được ghi nhận.</p>

    <div style="background:#fafafa;border:1px solid #eee;border-radius:10px;padding:12px 14px">
      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div><b>Mã đơn:</b> ${safeOrderId}</div>
        <div><b>Thanh toán:</b> ${safeMethod}</div>
      </div>
      <div style="margin-top:10px"><b>Tổng tiền:</b> ${formatVnd(amount)}</div>
      ${itemsHtml}
    </div>

    <p style="margin:16px 0 0;color:#666;font-size:12px">
      Email này được gửi tự động. Vui lòng không trả lời.
    </p>
  </div>
  `;
};

const createEmailRouter = () => {
  const router = express.Router();

  router.post('/order-confirmation', async (req, res, next) => {
    try {
      const { to, orderId, amount, paymentMethod, items } = req.body || {};

      if (!to || !String(to).includes('@')) {
        return res.status(400).json({ success: false, message: 'Thiếu/không hợp lệ: to' });
      }
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'Thiếu: orderId' });
      }

      const transporter = createTransporter();
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;

      await transporter.sendMail({
        from,
        to,
        subject: `FoodHub - Xác nhận đơn hàng #${String(orderId).slice(-8).toUpperCase()}`,
        html: buildOrderHtml({ orderId: String(orderId), amount, paymentMethod, items }),
      });

      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  });

  return router;
};

module.exports = { createEmailRouter };