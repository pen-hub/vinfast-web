# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VinFast Web Production - React SPA for VinFast Đông Sài Gòn dealers. Manages contracts, customers, and prints 27 legal document templates (BieuMau).

**Live:** https://vinfast-web-prod.web.app

## Commands

```bash
npm run dev      # Start dev server at localhost:3004
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm test         # Run tests with Vitest

# Firebase
firebase deploy --only database    # Deploy security rules
firebase deploy --only functions   # Deploy Cloud Functions
firebase deploy --only hosting     # Deploy frontend

# Migration scripts (require GOOGLE_APPLICATION_CREDENTIALS)
node scripts/remove-password-hashes.js    # Remove bcrypt hashes from DB
node scripts/reset-employee-passwords.js  # Reset all passwords to default
```

## Architecture

### Data Flow
- **Frontend State**: React useState/useEffect + Firebase Realtime listeners
- **Backend**: Firebase Realtime Database (NoSQL) + Cloud Functions
- **Auth**: Custom bcrypt auth (NOT Firebase Auth) - stores hash in `employees/{id}/pass`
- **Navigation State**: React Router `useLocation().state` passes contract data to BieuMau

### Security Rules (`database.rules.json`)
- Currently open (no auth required) because app uses custom auth, not Firebase Auth
- To enable proper security, need to migrate Login to Firebase Authentication
- Admin UID for future use: `zeA0Ompcg9MLQF95GOkyEL0bsEl2`

### Firebase Database Structure
```
/contracts/{id}           # Draft contracts
/exportedContracts/{id}   # Finalized contracts
/vsoCounters/{key}        # Atomic VSO sequence counters (key: S00901-25-12)
/promotions/{id}          # Active vehicle promotions
/employees/{id}           # Employee directory (includes pass field for auth)
/customers/{id}           # Customer database
/vehicleInventory/{id}    # Vehicle stock (~222 records)
/dailySummaries/{date}    # Auto-generated daily stats (Cloud Function)
```

### Key Modules

**VSO Generator** (`src/utils/vsoGenerator.js`)
- Generates unique contract codes: `{maDms}-VSO-{YY}-{MM}-{sequence}`
- Uses Firebase `runTransaction` for atomic counter increment

**Branch Data** (`src/data/branchData.js`)
- 3 showrooms: Thủ Đức (S00501), Trường Chinh (S00901), Âu Cơ (S41501)
- `getBranchByShowroomName()` handles Vietnamese name variations

**Cloud Functions** (`functions/index.js`)
- `onContractExported`: Sync new contracts to Google Sheets
- `onContractUpdated`: Update Sheets when contract changes
- `dailySummary`: Scheduled 2AM daily statistics
- `syncToSheets`: HTTP endpoint for manual sync

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | PascalCase + `Page.jsx` | `ContractFormPage.jsx` |
| BieuMau | Vietnamese PascalCase | `HopDongMuaBanXe.jsx` |
| Variables | Vietnamese for business terms | `tenKh`, `cccd`, `soTienCoc`, `dongXe` |
| Utils | camelCase | `vsoGenerator.js`, `vndToWords.js` |

## Critical Rules

1. **No branch defaults on legal documents** - Always require explicit showroom selection. Show `[Chưa chọn showroom]` placeholder if missing.

2. **Use CurrencyInput component** for all money fields - handles Vietnamese IME and formatting.

3. **VSO uses atomic transactions** - Never manually increment counter; use `generateVSO(maDms)`.

4. **Print validation** - Check required fields before enabling print button:
   ```javascript
   const requiredFields = ['tenKh', 'cccd', 'soDienThoai', 'diaChi', 'dongXe', 'ngoaiThat'];
   ```

5. **Filter promotions by vehicle model** - Use `dongXe` field when filtering available promotions.

## Print Layout

BieuMau components use A4 layout with TailwindCSS print classes:
```jsx
<button className="print:hidden">In biểu mẫu</button>
<div className="max-w-[210mm] mx-auto print:p-0">
  {/* Printable content */}
</div>
```

## Environment Variables

Required in `.env`:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
GOOGLE_APPLICATION_CREDENTIALS
```

## Documentation

- `docs/code-standards.md` - Detailed coding conventions
- `docs/system-architecture.md` - Technical architecture
- `docs/API.md` - Firebase API reference
- `docs/QUICKSTART.md` - Developer onboarding
