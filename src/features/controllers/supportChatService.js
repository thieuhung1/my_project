// supportChatService.js — Điều phối toàn bộ luồng chat: tạo thread, gửi tin,
// fetch dữ liệu thực, gọi Gemini với context đầy đủ, fallback sang admin.

import {
  ref, push, set, update, onValue, get,
  query, orderByChild, limitToLast, serverTimestamp,
} from 'firebase/database';
import { rtdb } from '../../firebase/firebase.Config';
import { createAiModel, buildConversationContext } from './supportChatRuntime';
import { classifyIntent, detectDataNeeds, fetchContextData, INTENT_TYPES } from './supportChatKnowledge';
import { sanitizeChatId, sanitizeMessageText, sanitizeUserName } from './supportChatUtils';
import {
  persistSupportChatState, readSupportChatState,
  clearSupportChatState, clearAllSupportChatCache as clearAllSupportChatState,
} from './supportChatPersistence';

const SUPPORT_CHATS_PATH = 'supportChats';
const MESSAGES_PATH = (id) => `${SUPPORT_CHATS_PATH}/${id}/messages`;
const CHAT_PATH = (id) => `${SUPPORT_CHATS_PATH}/${id}`;

const SESSION_KEY = (uid) => `foodhub_chat_session:${String(uid || 'anon').trim()}`;
const hasStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const saveSession = (uid, messages) => {
  if (!hasStorage()) return;
  try { window.sessionStorage.setItem(SESSION_KEY(uid), JSON.stringify({ savedAt: Date.now(), messages })); } catch {}
};
const readSession = (uid) => {
  if (!hasStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY(uid));
    if (!raw) return null;
    const p = JSON.parse(raw);
    return Array.isArray(p?.messages) ? p.messages : null;
  } catch { return null; }
};
const clearSession = (uid) => {
  if (!hasStorage()) return;
  try { window.sessionStorage.removeItem(SESSION_KEY(uid)); } catch {}
};

const safeId = (id) => sanitizeChatId(id);
const chatRef = (id) => ref(rtdb, CHAT_PATH(safeId(id)));
const msgsRef = (id) => ref(rtdb, MESSAGES_PATH(safeId(id)));

const snapshotToList = (snap) => {
  if (!snap.exists()) return [];
  const data = snap.val();
  return Object.keys(data).map((k) => ({ id: k, ...data[k] }));
};

// ─── Public API ────────────────────────────────────────────────────────────

export const getSupportChats = async (limit = 50) => {
  const q = query(ref(rtdb, SUPPORT_CHATS_PATH), orderByChild('lastMessageTime'), limitToLast(limit));
  const snap = await get(q);
  return snapshotToList(snap)
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
    .map((c) => { const p = readSupportChatState(c.id); return p ? { ...c, ...p } : c; });
};

export const subscribeToSupportChats = (callback) => {
  const q = query(ref(rtdb, SUPPORT_CHATS_PATH), orderByChild('lastMessageTime'));
  return onValue(q, (snap) => {
    const chats = snapshotToList(snap)
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
      .map((c) => { const p = readSupportChatState(c.id); return p ? { ...c, ...p } : c; });
    callback(chats);
  });
};

export const getChatMessages = async (chatId, limit = 100) => {
  const q = query(msgsRef(chatId), limitToLast(limit));
  const snap = await get(q);
  return snapshotToList(snap);
};

export const subscribeToMessages = (chatId, callback, userId) => {
  return onValue(msgsRef(chatId), (snap) => {
    const messages = snapshotToList(snap);
    callback(messages);
    persistSupportChatState(chatId, { messages });
    if (userId) saveSession(userId, messages);
  });
};

export const sendSupportMessage = async (chatId, messageData) => {
  const id = safeId(chatId);
  if (!id) throw new Error('Invalid chat id');

  const data = {
    ...messageData,
    text: sanitizeMessageText(messageData.text),
    userName: sanitizeUserName(messageData.userName),
    timestamp: messageData.timestamp || serverTimestamp(),
    senderType: messageData.senderType || 'user',
    intent: messageData.intent || classifyIntent(messageData.text),
  };

  const newRef = push(msgsRef(id));
  await set(newRef, data);

  const isAdmin = data.senderType === 'admin';
  const updates = {
    lastMessage: data.text,
    lastUserName: data.userName,
    lastMessageTime: data.timestamp,
    lastSenderType: data.senderType,
    activeIntent: data.intent,
  };
  if (!isAdmin) updates.userName = data.userName;
  await update(chatRef(id), updates);

  if (isAdmin) {
    await update(chatRef(id), { unreadCount: 0, routedToAdmin: true, assignedTo: 'admin' });
  } else if (data.senderType === 'user') {
    const snap = await get(ref(rtdb, `${CHAT_PATH(id)}/unreadCount`));
    await update(chatRef(id), { unreadCount: (snap.val() || 0) + 1 });
  }

  persistSupportChatState(id, { lastMessage: data.text, lastUserName: data.userName, lastMessageTime: data.timestamp });
  return newRef;
};

export const ensureConversationThread = async ({ chatId, userId, userName }) => {
  const id = safeId(chatId);
  if (!id) throw new Error('Invalid chat id');

  const snap = await get(chatRef(id));
  if (snap.exists()) return snap.val();

  clearSession(userId);

  const thread = {
    userId, userName,
    unreadCount: 0,
    routedToAdmin: false,
    assignedTo: 'ai',
    activeIntent: 'ai',
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    lastSenderType: 'system',
  };

  await set(chatRef(id), thread);

  // Tin nhắn chào tự động thông minh
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'buổi sáng' : hour < 14 ? 'buổi trưa' : hour < 18 ? 'buổi chiều' : 'buổi tối';
  const firstName = userName?.split(' ').pop() || 'bạn';
  const welcomeText = `Chào ${greet} ${firstName}! 👋 Em là Hubi — trợ lý AI của FoodHub. Em có thể giúp anh/chị tư vấn món ăn, kiểm tra đơn hàng, hoặc hướng dẫn đặt hàng. Anh/chị cần gì ạ? 😊`;

  await set(ref(rtdb, `${MESSAGES_PATH(id)}/welcome`), {
    text: welcomeText,
    userId: 'ai',
    userName: 'Hubi AI',
    senderType: 'ai',
    direction: 'bot',
    intent: INTENT_TYPES.AI,
    timestamp: serverTimestamp(),
  });

  await update(chatRef(id), { lastMessage: welcomeText, lastMessageTime: serverTimestamp() });

  const refreshed = await get(chatRef(id));
  return refreshed.val();
};

export const routeConversationMessage = async ({ chatId, text, userId, userName, messages = [] }) => {
  const id = safeId(chatId);
  const safeText = sanitizeMessageText(text);
  const safeUser = sanitizeUserName(userName);
  const intent = classifyIntent(safeText);

  await ensureConversationThread({ chatId: id, userId, userName: safeUser });

  // Lưu tin nhắn user
  const userMsg = await sendSupportMessage(id, {
    text: safeText, userId, userName: safeUser,
    senderType: 'user', direction: 'user', intent,
    routedToAdmin: intent === INTENT_TYPES.ADMIN,
  });

  // Route sang admin ngay nếu keyword cứng
  if (intent === INTENT_TYPES.ADMIN) {
    await update(chatRef(id), { routedToAdmin: true, routingReason: 'keyword', assignedTo: 'admin', activeIntent: 'admin' });
    await sendSupportMessage(id, {
      text: 'Em đã ghi nhận và chuyển cho nhân viên hỗ trợ anh/chị ngay ạ. Vui lòng chờ trong giây lát! 🙏',
      userId: 'ai', userName: 'Hubi AI',
      senderType: 'ai', direction: 'bot', intent: INTENT_TYPES.AI,
    });
    return { routedToAdmin: true, userMsg, intent };
  }

  // Phát hiện dữ liệu cần fetch
  const needs = detectDataNeeds(safeText);
  const contextData = await fetchContextData({ needs, userId });

  // Tạo model với context thực tế
  const model = createAiModel(contextData);
  if (!model) {
    await sendSupportMessage(id, {
      text: 'Dạ em chưa sẵn sàng lúc này. Em đã chuyển cho nhân viên hỗ trợ anh/chị ạ.',
      userId: 'ai', userName: 'Hubi AI',
      senderType: 'system', direction: 'system', intent: INTENT_TYPES.SYSTEM,
    });
    await update(chatRef(id), { routedToAdmin: true, routingReason: 'ai_unavailable', assignedTo: 'admin', activeIntent: 'admin' });
    return { routedToAdmin: true, userMsg, intent: INTENT_TYPES.SYSTEM };
  }

  try {
    // Lấy lịch sử hội thoại để AI có context
    const history = (Array.isArray(messages) && messages.length > 0)
      ? messages
      : (readSession(userId) || []);

    const chat = model.startChat({ history: buildConversationContext(history) });
    const result = await chat.sendMessage(safeText);
    const reply = result.response.text()?.trim();
    if (!reply) throw new Error('Empty AI response');

    await sendSupportMessage(id, {
      text: reply,
      userId: 'ai', userName: 'Hubi AI',
      senderType: 'ai', direction: 'bot', intent: INTENT_TYPES.AI,
    });

    await update(chatRef(id), { routedToAdmin: false, routingReason: 'ai', assignedTo: 'ai', activeIntent: 'ai' });
    return { routedToAdmin: false, userMsg, intent: INTENT_TYPES.AI };

  } catch (err) {
    console.error('AI error:', err);
    await sendSupportMessage(id, {
      text: 'Dạ em xin lỗi, em gặp sự cố nhỏ. Em đã chuyển cho nhân viên hỗ trợ anh/chị ngay ạ! 🙏',
      userId: 'system', userName: 'Hệ thống',
      senderType: 'system', direction: 'system', intent: INTENT_TYPES.SYSTEM,
    });
    await update(chatRef(id), { routedToAdmin: true, routingReason: 'ai_error', assignedTo: 'admin', activeIntent: 'admin' });
    return { routedToAdmin: true, userMsg, intent: INTENT_TYPES.SYSTEM, err };
  }
};

export const markChatAsRead = async (chatId) => {
  const id = safeId(chatId);
  await update(chatRef(id), { unreadCount: 0 });
  const p = readSupportChatState(id) || {};
  persistSupportChatState(id, { ...p, unreadCount: 0 });
};

export const clearSupportChatCache = (chatId) => clearSupportChatState(chatId);
export const clearAllSupportChatCache = () => clearAllSupportChatState();
export const isSupportChatRoutedToAdmin = (chat) => Boolean(chat?.routedToAdmin);
export const updateChatLastMessage = async (chatId, { lastMessage, userName, timestamp }) => {
  await update(chatRef(chatId), { lastMessage, lastUserName: userName, lastMessageTime: timestamp || serverTimestamp() });
};
