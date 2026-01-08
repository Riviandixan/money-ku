# Money Management Application

Aplikasi manajemen keuangan full-stack dengan backend Golang (clean architecture) dan frontend React.

## Tech Stack

### Backend

- **Language**: Go 1.23.1
- **Framework**: Gin (HTTP framework)
- **Database**: PostgreSQL
- **Architecture**: Clean Architecture
- **Authentication**: JWT
- **Password Hashing**: bcrypt

### Frontend

- **Framework**: React 19
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Features

- ✅ **Authentication**: Sign up, Login dengan JWT
- ✅ **Wallet Management**: CRUD dompet dengan multi-currency support
- ✅ **Transactions**:
  - Income (Pemasukan)
  - Expense (Pengeluaran)
  - Transfer antar dompet
- ✅ **Dashboard**: Summary total balance, income, expense
- ✅ **Reports**: Laporan transaksi dengan filter tanggal

## Prerequisites

- Go 1.23.1 atau lebih baru
- PostgreSQL 12 atau lebih baru
- Node.js 16 atau lebih baru
- npm atau yarn

## Setup Instructions

### 1. Database Setup

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE db_moneyku;

# Keluar dari psql
\q

# Jalankan schema
psql -U postgres -d db_moneyku -f backend/database/schema.sql
```

### 2. Backend Setup

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
go mod tidy

# Update .env file dengan password PostgreSQL Anda
# DB_PASSWORD=your_postgres_password

# Jalankan server
go run cmd/main.go
```

Backend akan berjalan di `http://localhost:8080`

### 3. Frontend Setup

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm start
```

Frontend akan berjalan di `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Wallets

- `GET /api/wallets` - Get all wallets (protected)
- `GET /api/wallets/:id` - Get wallet by ID (protected)
- `POST /api/wallets` - Create wallet (protected)
- `PUT /api/wallets/:id` - Update wallet (protected)
- `DELETE /api/wallets/:id` - Delete wallet (protected)

### Transactions

- `GET /api/transactions` - Get all transactions (protected)
  - Query params: `wallet_id`, `start_date`, `end_date`
- `POST /api/transactions` - Create transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)

### Dashboard

- `GET /api/dashboard/summary` - Get dashboard summary (protected)
- `GET /api/dashboard/spending-by-category` - Get spending by category (protected)

### Reports

- `GET /api/reports/transactions` - Get transaction report (protected)
  - Query params: `start_date`, `end_date` (required, format: YYYY-MM-DD)
- `GET /api/reports/export` - Export all transactions (protected)

## Project Structure

### Backend (Clean Architecture)

```
backend/
├── cmd/
│   └── main.go                 # Entry point
├── internal/
│   ├── app/
│   │   ├── router.go          # Route definitions
│   │   └── server.go          # HTTP server
│   ├── config/
│   │   └── config.go          # Configuration loader
│   ├── database/
│   │   └── database.go        # Database connection
│   ├── domain/                # Entities & interfaces
│   │   ├── user.go
│   │   ├── wallet.go
│   │   └── transaction.go
│   ├── repository/            # Data access layer
│   │   ├── user_repository.go
│   │   ├── wallet_repository.go
│   │   └── transaction_repository.go
│   ├── service/               # Business logic layer
│   │   ├── auth_service.go
│   │   ├── wallet_service.go
│   │   ├── transaction_service.go
│   │   ├── dashboard_service.go
│   │   └── report_service.go
│   ├── handler/               # HTTP handlers
│   │   ├── auth_handler.go
│   │   ├── wallet_handler.go
│   │   ├── transaction_handler.go
│   │   ├── dashboard_handler.go
│   │   └── report_handler.go
│   ├── middleware/
│   │   ├── auth_middleware.go
│   │   └── cors_middleware.go
│   └── utils/
│       ├── jwt.go
│       ├── password.go
│       └── response.go
├── database/
│   └── schema.sql             # Database schema
├── .env                       # Environment variables
└── go.mod                     # Go dependencies
```

### Frontend

```
frontend/
├── src/
│   ├── services/              # API services
│   │   ├── api.js            # Axios instance
│   │   ├── authService.js
│   │   ├── walletService.js
│   │   ├── transactionService.js
│   │   ├── dashboardService.js
│   │   └── reportService.js
│   ├── context/              # React Context
│   │   ├── AuthContext.jsx
│   │   ├── WalletContext.jsx
│   │   └── TransactionContext.jsx
│   ├── features/             # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── wallets/
│   │   ├── transactions/
│   │   └── reports/
│   ├── shared/               # Shared components
│   └── App.jsx
└── .env                      # Environment variables
```

## Environment Variables

### Backend (.env)

```
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=db_moneyku

JWT_SECRET=your-secret-key-change-this-in-production
SERVER_PORT=8080
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:8080/api
```

## Testing

### Manual Testing Flow

1. **Sign Up**: Buat akun baru di `/signup`
2. **Login**: Login dengan akun yang sudah dibuat
3. **Create Wallet**: Tambah dompet baru (contoh: Cash, Bank)
4. **Add Income**: Tambah pemasukan ke salah satu dompet
5. **Add Expense**: Tambah pengeluaran dari dompet
6. **Transfer**: Transfer uang antar dompet
7. **View Dashboard**: Lihat summary di dashboard
8. **View Reports**: Lihat laporan transaksi

### API Testing dengan curl

```bash
# Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Create Wallet (ganti <TOKEN> dengan token dari login)
curl -X POST http://localhost:8080/api/wallets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cash","balance":1000000,"currency":"IDR","icon":"wallet","color":"blue"}'
```

## Development Notes

- Backend menggunakan clean architecture untuk maintainability
- Frontend menggunakan Context API untuk state management
- JWT token disimpan di localStorage dengan expiry 24 jam
- Password di-hash menggunakan bcrypt sebelum disimpan
- Database menggunakan foreign key constraints untuk data integrity
- CORS sudah dikonfigurasi untuk allow frontend access

## Troubleshooting

### Backend tidak bisa connect ke database

- Pastikan PostgreSQL sudah running
- Check credentials di `.env`
- Pastikan database `db_moneyku` sudah dibuat

### Frontend tidak bisa connect ke backend

- Pastikan backend sudah running di port 8080
- Check `REACT_APP_API_URL` di frontend `.env`
- Check browser console untuk error CORS

### Token expired

- Token JWT berlaku 24 jam
- Logout dan login kembali untuk mendapatkan token baru

## License

MIT
