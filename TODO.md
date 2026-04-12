# Fix Firestore Index Error & Deploy

## Steps:
- [x] 1. Update firestore.indexes.json with missing index
- [x] 2. Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [x] 3. Deploy hosting: `firebase deploy --only hosting` ✅ https://do-an-food-hub.web.app
- [x] 4. Verify Waiter page (reload app)
- [x] 5. Mark complete

Firestore index fix deployed. 404 likely stale cache/path - use https://do-an-food-hub.web.app/#/waiter after hard refresh (Ctrl+Shift+R).

Current: Starting step 1.

