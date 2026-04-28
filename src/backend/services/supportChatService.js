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
import { rtdb } from '../firebase/firebaseConfig';

const SUPPORT_CHATS_PATH = 'supportChats';
const SUPPORT_MESSAGES_PATH = (chatId) => `${SUPPORT_CHATS_PATH}/${chatId}/messages`;
const SUPPORT_CHAT_PATH = (chatId) => `${SUPPORT_CHATS_PATH}/${chatId}`;

const snapshotToList = (snapshot) => {
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
};

export const getSupportChats = async (limitCount = 50) => {
  const chatsRef = ref(rtdb, SUPPORT_CHATS_PATH);
  const q = query(chatsRef, orderByChild('lastMessageTime'), limitToLast(limitCount));
  const snapshot = await get(q);
  return snapshotToList(snapshot).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
};

export const subscribeToSupportChats = (callback) => {
  const chatsRef = ref(rtdb, SUPPORT_CHATS_PATH);
  const q = query(chatsRef, orderByChild('lastMessageTime'));

  return onValue(q, (snapshot) => {
    callback(snapshotToList(snapshot).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0)));
  });
};

export const getChatMessages = async (chatId, limitCount = 100) => {
  const messagesRef = ref(rtdb, SUPPORT_MESSAGES_PATH(chatId));
  const q = query(messagesRef, limitToLast(limitCount));
  const snapshot = await get(q);
  return snapshotToList(snapshot);
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = ref(rtdb, SUPPORT_MESSAGES_PATH(chatId));
  return onValue(messagesRef, (snapshot) => callback(snapshotToList(snapshot)));
};

export const updateChatLastMessage = async (chatId, { lastMessage, userName, timestamp }) => {
  const chatRef = ref(rtdb, SUPPORT_CHAT_PATH(chatId));
  await update(chatRef, {
    lastMessage,
    lastUserName: userName,
    lastMessageTime: timestamp || serverTimestamp(),
  });
};

export const sendSupportMessage = async (chatId, messageData) => {
  const messagesRef = ref(rtdb, SUPPORT_MESSAGES_PATH(chatId));
  const newMessageRef = push(messagesRef);
  const finalMessageData = {
    ...messageData,
    timestamp: messageData.timestamp || serverTimestamp(),
  };

  await set(newMessageRef, finalMessageData);

  const chatRef = ref(rtdb, SUPPORT_CHAT_PATH(chatId));
  const isAdmin = messageData.direction === 'admin';
  const updates = {
    lastMessage: messageData.text,
    lastUserName: messageData.userName,
    lastMessageTime: finalMessageData.timestamp,
  };

  if (!isAdmin) {
    updates.userName = messageData.userName;
  }

  await update(chatRef, updates);

  if (isAdmin) {
    await update(chatRef, { unreadCount: 0 });
  } else if (messageData.direction === 'user') {
    const unreadSnap = await get(ref(rtdb, `${SUPPORT_CHAT_PATH(chatId)}/unreadCount`));
    const currentUnread = unreadSnap.val() || 0;
    await update(chatRef, { unreadCount: currentUnread + 1 });
  }

  return newMessageRef;
};

export const markChatAsRead = async (chatId) => {
  const chatRef = ref(rtdb, SUPPORT_CHAT_PATH(chatId));
  await update(chatRef, { unreadCount: 0 });
};
