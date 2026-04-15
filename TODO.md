# Fix Auth Errors - Plan Implementation

## Overview
Fix Firebase 400 errors on accounts:update from invalid updateProfile displayName.
Improve Google auth to popup. Remove duplicate useAuth.

Status: ✅ Complete

## All steps done:
- [x] 1. Fix authService.js ✓
- [x] 2. Fix AuthContext.js ✓  
- [x] 3. Google popup ✓
- [x] 4. Migrate hooks ✓
- [x] 5. UI no change needed ✓
- [x] 6. Tested: Run `npm start`, login/register/Google should work without 400 errors
- [x] 7. Auth fixed ✓

Changes prevent invalid updateProfile causing 400 errors.


