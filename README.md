# VinFast Dealer Management System

Hệ thống quản lý đại lý VinFast cho **VinFast Đông Sài Gòn** - quản lý hợp đồng, khách hàng, và in ấn biểu mẫu pháp lý.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Realtime Database

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/vinfast-web.git
cd vinfast-web

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

The app runs at `http://localhost:3004`

### Build & Deploy

```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

---

## 📋 Features

### Contract Management
- Create, edit, export contracts
- Auto-generate VSO codes: `{maDms}-VSO-{YY}-{MM}-{sequence}` (atomic transactions)
- Filter by showroom, status, date, TVBH
- RBAC access control (admin/leader/user)

### Price Calculator (Báo Giá)
- 12 vehicle models (VF 3, 5, 6, 7, 8, 9, Nimo, Herio, Nerio, Limo, ECVan)
- Apply discounts and promotions filtered by dongXe
- Calculate loan payments with Annuity formula
- On-road costs breakdown (BHVC, plate, inspection, road fees)

### Print Forms (Biểu Mẫu)
- 27 legal document templates (~22K LOC)
- Contracts, agreements, confirmations
- Bank-specific forms (BIDV, Shinhan, TPBank, VPBank, LFVN)
- A4 print validation with required fields check

### Dashboard
- Sales analytics with Chart.js
- Time filters (day/week/month/quarter/year/range)
- Employee performance charts
- Pending contracts table

### HR & Customer Management
- Employee directory by showroom
- Customer database with CRUD and history
- Lead scoring and work history tracking

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS 3.4 |
| Backend | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Routing | React Router DOM v6 |
| Functions | Firebase Cloud Functions (Node.js 20) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── BieuMau/          # 27 printable forms (~22K LOC)
│   ├── Calculator/       # Price calculator components (7 files)
│   ├── FilterPanel/      # Unified filter panel
│   ├── shared/           # CurrencyInput, Pagination
│   └── Header, Footer, EmployeeBarChart, PendingContractsTable
├── pages/                # 16 page components (~21K LOC)
├── hooks/                # 12 custom hooks (~2.3K LOC)
│   ├── useCarSelection, usePromotions, usePriceCalculations
│   ├── useCustomerData, useCustomerForm, useContractForm
│   └── usePaginatedFirebase
├── data/                 # Branch, vehicle, promotion data (~500 LOC)
├── utils/                # 10 utility files (~950 LOC)
│   ├── vsoGenerator (atomic), vndToWords, validation
│   ├── sanitize, formatting
│   └── calculator/       # Price/promotion/loan utils
├── firebase/             # Firebase config
└── config/               # Cloudinary config

functions/                # Cloud Functions (319 LOC)
├── index.js              # 4 functions (Sheets sync, daily summary, HTTP endpoint)
└── package.json
```

---

## 🏢 Showrooms

| Showroom | Mã DMS | Địa chỉ |
|----------|--------|---------|
| Thủ Đức | S00501 | 391 Võ Nguyên Giáp, TP. Thủ Đức |
| Trường Chinh | S00901 | 682A Trường Chinh, Q. Tân Bình |
| Âu Cơ | S41501 | 616 Âu Cơ, Q. Tân Phú |

---

## 🔧 Development

### Commands

```bash
npm run dev      # Start dev server (port 3004)
npm run build    # Production build
npm run preview  # Preview build
```

### Environment Variables

Required in `.env`:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_DATABASE_URL=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Code Conventions

- **Pages**: `*Page.jsx` (e.g., `ContractFormPage.jsx`)
- **BieuMau**: Vietnamese names (e.g., `HopDongMuaBanXe.jsx`)
- **Variables**: Mix Vietnamese for business terms (`tenKh`, `soTienCoc`)
- **Styling**: TailwindCSS classes + print styles

---

## 🔐 Firebase Structure

```
/contracts/{id}           # Draft contracts
/exportedContracts/{id}   # Exported contracts
/vsoCounters/{key}        # VSO sequence counters
/promotions/{id}          # Active promotions
/employees/{id}           # Employee data
/customers/{id}           # Customer data
```

---

## ☁️ Cloud Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `onContractExported` | onCreate | Sync to Google Sheets |
| `onContractUpdated` | onUpdate | Update Sheets row |
| `dailySummary` | Schedule 2AM | Daily statistics |
| `syncToSheets` | HTTP | Manual sync |

Deploy:
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Project Overview](docs/project-overview-pdr.md) | Business context & requirements |
| [Codebase Summary](docs/codebase-summary.md) | Directory structure & file inventory |
| [Code Standards](docs/code-standards.md) | Naming conventions & patterns |
| [System Architecture](docs/system-architecture.md) | Technical architecture |
| [Troubleshooting](docs/troubleshoot_tips.md) | Debug tips & common issues |

---

## ⚠️ Important Notes

1. **No branch defaults** on legal documents - always require explicit showroom selection
2. **Use CurrencyInput** component for all money fields
3. **VSO auto-generation** uses Firebase atomic transactions
4. **Print validation** checks required fields before enabling print
5. **Promotions filter** by vehicle model (`dongXe`)

---

## 📝 License

Private - VinFast Đông Sài Gòn

---

## 🤝 Contributing

See [GUIDE_PULL_REQUEST.md](GUIDE_PULL_REQUEST.md) for PR guidelines.
