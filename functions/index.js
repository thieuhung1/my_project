const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ maxInstances: 10, region: "asia-southeast1" });

const ORDER_STATUS = {
    PENDING: "PENDING",
    WAITING_FOR_SHIPPER: "WAITING_FOR_SHIPPER",
    CONFIRMED: "CONFIRMED",
    DELIVERING: "DELIVERING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
};

/**
 * AI Reply Function (Existing)
 */
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
        if (!message) return res.status(400).json({ error: 'Missing message parameter' });

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBGBUx5eZIrWLBe_y3LaKo3NftKZ8j1LFY';

        const apiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `FoodHub AI - Hỗ trợ khách hàng đồ ăn Nghệ An. Mở 8h-22h, ship nội tỉnh 15k+.
Khách: ${message}`
                    }]
                }]
            })
        });

        const data = await apiResponse.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Cảm ơn! Admin sẽ hỗ trợ bạn sớm.";
        res.json({ reply, success: true });
    } catch (error) {
        res.status(500).json({ error: 'AI Error', reply: "Xin lỗi, hãy thử lại sau!" });
    }
});

/**
 * Trigger: Tự động gán Shipper khi đơn hàng được tạo
 */
exports.onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const orderData = snap.data();
    const orderId = event.params.orderId;

    // Chỉ tự động gán cho đơn Delivery
    if (orderData.type !== "DELIVERY") return;

    try {
        // Tìm shipper đang ONLINE và có dưới 3 đơn đang giao
        const shippersSnap = await db.collection("shippers")
            .where("status", "==", "ONLINE")
            .where("current_orders_count", "<", 3)
            .limit(1)
            .get();

        if (!shippersSnap.empty) {
            const shipperDoc = shippersSnap.docs[0];
            const shipperId = shipperDoc.id;
            const shipperData = shipperDoc.data();

            await db.runTransaction(async (t) => {
                const oRef = db.collection("orders").doc(orderId);
                const sRef = db.collection("shippers").doc(shipperId);

                t.update(oRef, {
                    shipper_id: shipperId,
                    shipperName: shipperData.name || "Shipper",
                    status: ORDER_STATUS.CONFIRMED,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                t.update(sRef, {
                    current_orders_count: admin.firestore.FieldValue.increment(1)
                });
            });
            console.log(`Auto-assigned order ${orderId} to shipper ${shipperId}`);
        } else {
            // Không có shipper -> Chuyển sang hàng chờ shipper tự nhận
            await db.collection("orders").doc(orderId).update({
                status: ORDER_STATUS.WAITING_FOR_SHIPPER,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`No online shipper found for order ${orderId}. Status: WAITING_FOR_SHIPPER`);
        }
    } catch (error) {
        console.error("Error in onOrderCreated:", error);
    }
});

/**
 * Cron: Tự động hủy đơn hàng WAITING_FOR_SHIPPER quá lâu (30 phút)
 */
exports.cleanupOldOrders = onSchedule("every 10 minutes", async (event) => {
    const thirtyMinsAgo = new Date();
    thirtyMinsAgo.setMinutes(thirtyMinsAgo.getMinutes() - 30);

    const staleOrdersSnap = await db.collection("orders")
        .where("status", "==", ORDER_STATUS.WAITING_FOR_SHIPPER)
        .where("createdAt", "<=", thirtyMinsAgo)
        .get();

    if (staleOrdersSnap.empty) return;

    const batch = db.batch();
    staleOrdersSnap.docs.forEach(doc => {
        batch.update(doc.ref, {
            status: ORDER_STATUS.CANCELLED,
            note: (doc.data().note || "") + " (Hệ thống tự động hủy do không có shipper nhận)",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });

    await batch.commit();
    console.log(`Cleaned up ${staleOrdersSnap.size} stale orders.`);
});
