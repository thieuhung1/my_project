import {
  ref,
  push,
  set,
  update,
  onValue,
  get,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp,
} from 'firebase/database';
import { rtdb } from '../../firebase/firebase.Config';
import { aiModel, buildConversationContext } from './supportChatRuntime';
import { classifyIntent, INTENT_TYPES, resolveKnowledge } from './supportChatKnowledge';
import { sanitizeChatId, sanitizeMessageText, sanitizeUserName, normalizeText } from './supportChatUtils';
import { persistSupportChatState, readSupportChatState, clearSupportChatState, clearAllSupportChatCache as clearAllSupportChatState } from './supportChatPersistence';

const SUPPORT_CHATS_PATH = 'supportChats';
const SUPPORT_MESSAGES_PATH = (chatId) => `${SUPPORT_CHATS_PATH}/${chatId}/messages`;
const SUPPORT_CHAT_PATH = (chatId) => `${SUPPORT_CHATS_PATH}/${chatId}`;

const getSafeChatId = (chatId) => sanitizeChatId(chatId);
const getSafeChatRef = (chatId) => ref(rtdb, SUPPORT_CHAT_PATH(getSafeChatId(chatId)));
const getSafeMessagesRef = (chatId) => ref(rtdb, SUPPORT_MESSAGES_PATH(getSafeChatId(chatId)));

const snapshotToList = (snapshot) => {
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
};

export const getSupportChats = async (limitCount = 50) => {
  const chatsRef = ref(rtdb, SUPPORT_CHATS_PATH);
  const q = query(chatsRef, orderByChild('lastMessageTime'), limitToLast(limitCount));
  const snapshot = await get(q);
  const chats = snapshotToList(snapshot).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  return chats.map((chat) => {
    const persisted = readSupportChatState(chat.id);
    return persisted ? { ...chat, ...persisted } : chat;
  });
};

export const subscribeToSupportChats = (callback) => {
  const chatsRef = ref(rtdb, SUPPORT_CHATS_PATH);
  const q = query(chatsRef, orderByChild('lastMessageTime'));
  return onValue(q, (snapshot) => {
    const chats = snapshotToList(snapshot).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    callback(chats.map((chat) => {
      const persisted = readSupportChatState(chat.id);
      return persisted ? { ...chat, ...persisted } : chat;
    }));
  });
};

export const getChatMessages = async (chatId, limitCount = 100) => {
  const messagesRef = getSafeMessagesRef(chatId);
  const q = query(messagesRef, limitToLast(limitCount));
  const snapshot = await get(q);
  return snapshotToList(snapshot);
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = getSafeMessagesRef(chatId);
  return onValue(messagesRef, (snapshot) => {
    const messages = snapshotToList(snapshot);
    callback(messages);
    persistSupportChatState(chatId, { messages });
  });
};

export const updateChatLastMessage = async (chatId, { lastMessage, userName, timestamp }) => {
  const chatRef = getSafeChatRef(chatId);
  await update(chatRef, {
    lastMessage,
    lastUserName: userName,
    lastMessageTime: timestamp || serverTimestamp(),
  });
};

export const sendSupportMessage = async (chatId, messageData) => {
  const safeChatId = getSafeChatId(chatId);
  if (!safeChatId) {
    throw new Error('Invalid support chat id');
  }

  const messagesRef = getSafeMessagesRef(safeChatId);
  const newMessageRef = push(messagesRef);
  const finalMessageData = {
    ...messageData,
    text: sanitizeMessageText(messageData.text),
    userName: sanitizeUserName(messageData.userName),
    timestamp: messageData.timestamp || serverTimestamp(),
    senderType: messageData.senderType || (messageData.direction === 'admin' ? 'admin' : 'user'),
    intent: messageData.intent || classifyIntent(messageData.text),
  };

  await set(newMessageRef, finalMessageData);

  const chatRef = getSafeChatRef(safeChatId);
  const isAdmin = finalMessageData.senderType === 'admin';
  const updates = {
    lastMessage: finalMessageData.text,
    lastUserName: finalMessageData.userName,
    lastMessageTime: finalMessageData.timestamp,
    lastSenderType: finalMessageData.senderType,
    activeIntent: finalMessageData.intent,
  };

  if (!isAdmin) {
    updates.userName = finalMessageData.userName;
  }

  await update(chatRef, updates);

  if (isAdmin) {
    await update(chatRef, { unreadCount: 0, routedToAdmin: true, assignedTo: 'admin' });
  } else if (finalMessageData.senderType === 'user') {
    const unreadSnap = await get(ref(rtdb, `${SUPPORT_CHAT_PATH(safeChatId)}/unreadCount`));
    const currentUnread = unreadSnap.val() || 0;
    await update(chatRef, { unreadCount: currentUnread + 1 });
  }

  persistSupportChatState(safeChatId, {
    lastMessage: finalMessageData.text,
    lastUserName: finalMessageData.userName,
    lastMessageTime: finalMessageData.timestamp,
  });

  return newMessageRef;
};

export const ensureConversationThread = async ({ chatId, userId, userName }) => {
  const safeChatId = getSafeChatId(chatId);
  if (!safeChatId) {
    throw new Error('Invalid support chat id');
  }

  const chatRef = getSafeChatRef(safeChatId);
  const snapshot = await get(chatRef);
  if (snapshot.exists()) return snapshot.val();

  const initialThread = {
    userId,
    userName,
    unreadCount: 0,
    routedToAdmin: false,
    assignedTo: 'ai',
    activeIntent: 'ai',
    createdAt: serverTimestamp(),
    lastMessage: 'Xin chào! Em có thể giúp gì cho anh/chị ạ?',
    lastMessageTime: serverTimestamp(),
    lastSenderType: 'system',
  };

  persistSupportChatState(safeChatId, {
    lastMessage: initialThread.lastMessage,
    lastUserName: userName,
    lastMessageTime: initialThread.lastMessageTime,
    messages: [],
  });

  await set(chatRef, initialThread);
  await set(ref(rtdb, `${SUPPORT_MESSAGES_PATH(safeChatId)}/welcome`), {
    text: 'Xin chào! Em có thể giúp gì cho anh/chị ạ?',
    userId: 'system',
    userName: 'Hệ thống',
    senderType: 'system',
    direction: 'system',
    intent: INTENT_TYPES.SYSTEM,
    timestamp: serverTimestamp(),
  });

  const refreshed = await get(chatRef);
  return refreshed.val();
};

export const routeConversationMessage = async ({ chatId, text, userId, userName, messages = [] }) => {
  const safeChatId = getSafeChatId(chatId);
  const safeText = sanitizeMessageText(text);
  const safeUserName = sanitizeUserName(userName);
  const intent = classifyIntent(safeText);
  const chatRef = getSafeChatRef(safeChatId);

  await ensureConversationThread({ chatId: safeChatId, userId, userName: safeUserName });

  const userMessage = await sendSupportMessage(safeChatId, {
    text: safeText,
    userId,
    userName: safeUserName,
    senderType: 'user',
    direction: 'user',
    intent,
    routedToAdmin: intent === INTENT_TYPES.ADMIN,
  });

  if (intent === INTENT_TYPES.ADMIN) {
    await update(chatRef, {
      routedToAdmin: true,
      routingReason: 'keyword',
      assignedTo: 'admin',
      activeIntent: 'admin',
    });
    return { routedToAdmin: true, userMessage, intent };
  }

  const knowledge = await resolveKnowledge({ text: safeText, userId });
  if (knowledge) {
    await sendSupportMessage(safeChatId, {
      text: knowledge.summary,
      userId: 'ai',
      userName: 'AI tư vấn',
      senderType: 'ai',
      direction: 'bot',
      intent: INTENT_TYPES.AI,
      metadata: { knowledgeType: knowledge.type },
    });

    await update(chatRef, {
      routedToAdmin: false,
      routingReason: knowledge.type,
      assignedTo: 'ai',
      activeIntent: 'ai',
    });

    return { routedToAdmin: false, userMessage, intent: INTENT_TYPES.AI, knowledge };
  }

  if (!aiModel) {
    await sendSupportMessage(safeChatId, {
      text: 'Dạ em chưa sẵn sàng trả lời lúc này. Em đã ghi nhận tin nhắn và sẽ chuyển cho admin hỗ trợ anh/chị ạ.',
      userId: 'ai',
      userName: 'AI tư vấn',
      senderType: 'system',
      direction: 'system',
      intent: INTENT_TYPES.SYSTEM,
    });
    await update(chatRef, {
      routedToAdmin: true,
      routingReason: 'ai_unavailable',
      assignedTo: 'admin',
      activeIntent: 'admin',
    });
    return { routedToAdmin: true, userMessage, intent: INTENT_TYPES.SYSTEM };
  }

  try {
    const chat = aiModel.startChat({ history: buildConversationContext(messages) });
    const result = await chat.sendMessage(safeText);
    const botResponse = result.response.text()?.trim();
    if (!botResponse) throw new Error('Empty AI response');

    await sendSupportMessage(safeChatId, {
      text: botResponse,
      userId: 'ai',
      userName: 'AI tư vấn',
      senderType: 'ai',
      direction: 'bot',
      intent: INTENT_TYPES.AI,
    });

    await update(chatRef, {
      routedToAdmin: false,
      routingReason: 'ai',
      assignedTo: 'ai',
      activeIntent: 'ai',
    });

    return { routedToAdmin: false, userMessage, intent: INTENT_TYPES.AI };
  } catch (error) {
    await sendSupportMessage(safeChatId, {
      text: 'Dạ em đã ghi nhận và chuyển cho admin hỗ trợ anh/chị ngay ạ.',
      userId: 'system',
      userName: 'Hệ thống',
      senderType: 'system',
      direction: 'system',
      intent: INTENT_TYPES.SYSTEM,
    });
    await update(chatRef, {
      routedToAdmin: true,
      routingReason: 'ai_error',
      assignedTo: 'admin',
      activeIntent: 'admin',
    });
    return { routedToAdmin: true, userMessage, intent: INTENT_TYPES.SYSTEM, error };
  }
};

export const markChatAsRead = async (chatId) => {
  const safeChatId = getSafeChatId(chatId);
  const chatRef = getSafeChatRef(safeChatId);
  await update(chatRef, { unreadCount: 0 });
  const persisted = readSupportChatState(safeChatId) || {};
  persistSupportChatState(safeChatId, { ...persisted, unreadCount: 0 });
};

export const clearSupportChatCache = (chatId) => clearSupportChatState(chatId);
export const clearAllSupportChatCache = () => clearAllSupportChatState();

export const isSupportChatRoutedToAdmin = (chat) => Boolean(chat?.routedToAdmin);
