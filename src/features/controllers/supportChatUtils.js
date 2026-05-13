const MAX_CHAT_TEXT_LENGTH = 2000;
const MAX_USER_NAME_LENGTH = 60;
const MAX_CHAT_ID_LENGTH = 80;

const sanitizeString = (value = '', maxLength = 0) => {
  const text = String(value ?? '').trim();
  return maxLength > 0 ? text.slice(0, maxLength) : text;
};

export const sanitizeChatId = (chatId) => sanitizeString(chatId, MAX_CHAT_ID_LENGTH).replace(/[^a-zA-Z0-9_-]/g, '');
export const sanitizeMessageText = (text) => sanitizeString(text, MAX_CHAT_TEXT_LENGTH);
export const sanitizeUserName = (userName) => sanitizeString(userName || 'Khách', MAX_USER_NAME_LENGTH);

export const normalizeText = (value = '') =>
  sanitizeString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

export const formatChatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const raw = timestamp?.toDate ? timestamp.toDate() : timestamp;
  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};
