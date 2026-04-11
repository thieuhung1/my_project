const PROD_ENDPOINT = '/api/ai-reply';
const DEV_ENDPOINT = 'https://us-central1-do-an-food-hub.cloudfunctions.net/generateAiReply';

const getAiEndpoint = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' ? DEV_ENDPOINT : PROD_ENDPOINT;
};

export const getAiReply = async (chatId, userMessage) => {
  const response = await fetch(getAiEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message: userMessage }),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('AI endpoint returned non-JSON response');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'AI service unavailable');
  }

  if (!data.reply) {
    throw new Error('AI response payload missing reply');
  }

  return data.reply;
};
