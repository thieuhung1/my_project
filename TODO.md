# Clean Code & Optimization TODO
Status: In progress

## 1. [x] Structure Fixes
   - Rename src/Conponents → src/components (Header/Footer)
   - [x] Fill src/components/LoadingSpinner.js
   - Rename src/Model → src/models (lowercase)

## 2. [x] Remove Console Logs

   - src/Config/DB.js
   - src/contexts/ProductContext.js

## 3. [ ] App.js Optimizations
   - Lazy load routes + Suspense
   - Fix duplicate paths
   - Update imports post-rename

## 4. [ ] Contexts Enhancements
   - useMemo, useCallback
   - Error handling improvements

## 5. [ ] Package.json & Config
   - Clean deps (pure Vite)
   - ESLint/Prettier setup

## 6. [ ] Pages Fixes
   - Fix typos (Home.js etc.)
   - Add LoadingSpinner usage
   - Lazy imgs, memo

## 7. [ ] New Components
   - src/utils/constants.js
   - src/components/ErrorBoundary.js

## 8. [ ] Test & Verify
   - npm run dev
   - Check performance/linting

Next: Start with 1-2.
