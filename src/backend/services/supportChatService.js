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
  serverTimestamp
} from 'firebase/database';
import { rtdb } from '../firebase/firebaseConfig';

// Get all support chats (recent first)
export const getSupportChats = async (limitCount = 50) => {
  const chatsRef = ref(rtdb, 'supportChats');
  const q = query(chatsRef, orderByChild('lastMessageTime'), limitToLast(limitCount));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data)
    .map(key => ({ id: key, ...data[key] }))
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
};

// Subscribe to all support chats
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
      .map(key => ({ id: key, ...data[key] }))
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    callback(chatList);
  });
};

// Get chat messages
export const getChatMessages = async (chatId, limitCount = 100) => {
  const messagesRef = ref(rtdb, `supportChats/${chatId}/messages`);
  const q = query(messagesRef, limitToLast(limitCount));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  
  const data = snapshot.val();
  return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

// Subscribe to chat messages
export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = ref(rtdb, `supportChats/${chatId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const messageList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    callback(messageList);
  });
};

// Update chat last message metadata
export const updateChatLastMessage = async (chatId, { lastMessage, userName, timestamp }) => {
  const chatRef = ref(rtdb, `supportChats/${chatId}`);
  await update(chatRef, {
    lastMessage,
    lastUserName: userName,
    lastMessageTime: timestamp || serverTimestamp(),
  });
};

// Send message (updates chat metadata)
export const sendSupportMessage = async (chatId, messageData) => {
  const messagesRef = ref(rtdb, `supportChats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);
  
  const finalMessageData = {
    ...messageData,
    timestamp: messageData.timestamp || serverTimestamp()
  };

  await set(newMessageRef, finalMessageData);

  // Update chat metadata (last message, update info for chat list)
  const chatRef = ref(rtdb, `supportChats/${chatId}`);
  
  // If it's from user, increment unreadCount for admin
  // If it's from admin, reset unreadCount
  const isAdmin = messageData.direction === 'admin'; 
  
  const updates = {
    lastMessage: messageData.text,
    lastUserName: messageData.userName,
    lastMessageTime: finalMessageData.timestamp,
    userName: !isAdmin ? messageData.userName : undefined, // Keep/Update customer name if sent by customer
  };

  // Note: We avoid overwriting undefined userName if admin replies
  if (updates.userName === undefined) delete updates.userName;

  await update(chatRef, updates);
  
  // Logic for unread count
  if (isAdmin) {
    await update(chatRef, { unreadCount: 0 });
  } else if (messageData.direction === 'user') {
    // Increment unread count (requires a transaction or simple update if we don't care about precise race conditions)
    const snapshot = await get(ref(rtdb, `supportChats/${chatId}/unreadCount`));
    const currentUnread = snapshot.val() || 0;
    await update(chatRef, { unreadCount: currentUnread + 1 });
  }

  return newMessageRef;
};

export const markChatAsRead = async (chatId) => {
  const chatRef = ref(rtdb, `supportChats/${chatId}`);
  await update(chatRef, { unreadCount: 0 });
};
