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

// Lấy danh sách chat gần nhất để hiển thị trong admin panel.
export const getSupportChats = async (limitCount = 50) => {
  const chatsRef = ref(rtdb, 'supportChats');
  const q = query(chatsRef, orderByChild('lastMessageTime'), limitToLast(limitCount));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.keys(data)
    .map((key) => ({ id: key, ...data[key] }))
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
};

// Lắng nghe realtime danh sách chat.
export const subscribeToSupportChats = (callback) => {
  const chatsRef = ref(rtdb, 'supportChats');
  const q = query(chatsRef, orderByChild('lastMessageTime'));

  return onValue(q, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const chatList = Object.keys(data)
      .map((key) => ({ id: key, ...data[key] }))
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    callback(chatList);
  });
};

// Lấy tin nhắn của một cuộc chat.
export const getChatMessages = async (chatId, limitCount = 100) => {
  const messagesRef = ref(rtdb, `supportChats/${chatId}/messages`);
  const q = query(messagesRef, limitToLast(limitCount));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
};

// Lắng nghe realtime tin nhắn trong một chat cụ thể.
export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = ref(rtdb, `supportChats/${chatId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const messageList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
    callback(messageList);
  });
};

// Cập nhật metadata của cuộc chat sau khi có tin nhắn mới.
export const updateChatLastMessage = async (chatId, { lastMessage, userName, timestamp }) => {
  const chatRef = ref(rtdb, `supportChats/${chatId}`);
  await update(chatRef, {
    lastMessage,
    lastUserName: userName,
    lastMessageTime: timestamp || serverTimestamp(),
  });
};

// Gửi tin nhắn và đồng thời cập nhật metadata cho danh sách chat.
export const sendSupportMessage = async (chatId, messageData) => {
  const messagesRef = ref(rtdb, `supportChats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);

  const finalMessageData = {
    ...messageData,
    timestamp: messageData.timestamp || serverTimestamp(),
  };

  await set(newMessageRef, finalMessageData);

  const chatRef = ref(rtdb, `supportChats/${chatId}`);
  const isAdmin = messageData.direction === 'admin';

  const updates = {
    lastMessage: messageData.text,
    lastUserName: messageData.userName,
    lastMessageTime: finalMessageData.timestamp,
    userName: !isAdmin ? messageData.userName : undefined,
  };

  if (updates.userName === undefined) delete updates.userName;

  await update(chatRef, updates);

  if (isAdmin) {
    await update(chatRef, { unreadCount: 0 });
  } else if (messageData.direction === 'user') {
    const snapshot = await get(ref(rtdb, `supportChats/${chatId}/unreadCount`));
    const currentUnread = snapshot.val() || 0;
    await update(chatRef, { unreadCount: currentUnread + 1 });
  }

  return newMessageRef;
};

// Đánh dấu chat đã đọc.
export const markChatAsRead = async (chatId) => {
  const chatRef = ref(rtdb, `supportChats/${chatId}`);
  await update(chatRef, { unreadCount: 0 });
};
