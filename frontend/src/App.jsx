import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { TransactionProvider } from './context/TransactionContext';
import Header from './layout/Header';
import ProtectedRoute from './layout/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import Dashboard from './features/dashboard/Dashboard';
import WalletsPage from './features/wallets/WalletsPage';
import WalletDetailPage from './features/wallets/WalletDetailPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import ReportsPage from './features/reports/ReportsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WalletProvider>
          <TransactionProvider>
            <BrowserRouter>
              <div className="app">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route
                      path="/*"
                      element={
                        <>
                          <Header title="Moneyku" />
                          <main className="app-main">
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/wallets" element={<WalletsPage />} />
                              <Route path="/wallets/:id" element={<WalletDetailPage />} />
                              <Route path="/transactions" element={<TransactionsPage />} />
                              <Route path="/reports" element={<ReportsPage />} />
                            </Routes>
                          </main>
                        </>
                      }
                    />
                  </Route>
                </Routes>
              </div>
            </BrowserRouter>
          </TransactionProvider>
        </WalletProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

