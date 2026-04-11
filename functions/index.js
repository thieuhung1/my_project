/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

exports.generateAiReply = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const message = req.method === 'POST' ? req.body?.message : req.query?.message;
    if (!message) {
      return res.status(400).json({ error: 'Missing message parameter' });
    }

    // TODO: Replace with Firebase Secret
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBGBUx5eZIrWLBe_y3LaKo3NftKZ8j1LFY';

    const apiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `FoodHub AI - Hỗ trợ khách hàng đồ ăn Nghệ An. Mở 8h-22h, ship nội tỉnh 15k+.
Thân thiện, ngắn gọn, tiếng Việt.
Khách: ${message}`
          }]
        }]
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Gemini API: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                  "Cảm ơn! Admin sẽ hỗ trợ bạn sớm.";

    res.json({ reply, success: true });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ 
      error: 'AI tạm thời không khả dụng', 
      reply: "Xin lỗi, admin sẽ phản hồi bạn ngay!"
    });
  }
});

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });



