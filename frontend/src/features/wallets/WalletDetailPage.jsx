import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useTransaction } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import StatCard from '../../shared/components/StatCard';
import TransactionItem from '../../shared/components/TransactionItem';
import WalletFormModal from './WalletFormModal';
import TransactionFormModal from '../transactions/TransactionFormModal';
import './WalletDetailPage.css';

const WalletDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWalletById } = useWallet();
  const { transactions } = useTransaction();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const wallet = getWalletById(id);
  
  // Redirect if wallet not found
  if (!wallet) {
    return (
      <div className="wallet-not-found">
        <h2>Dompet tidak ditemukan</h2>
        <Button onClick={() => navigate('/wallets')}>Kembali ke Daftar Dompet</Button>
      </div>
    );
  }

  // Filter transactions for this wallet
  const walletTransactions = transactions.filter(
    t => t.walletId === id || t.fromWalletId === id || t.toWalletId === id
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate stats
  const totalIncome = walletTransactions
    .filter(t => t.type === 'income' && t.walletId === id)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = walletTransactions
    .filter(t => t.type === 'expense' && t.walletId === id)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="wallet-detail-page">
      <div className="wallet-detail-header">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Kembali
        </Button>
        <div className="wallet-detail-actions">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
            Edit Dompet
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsTransactionModalOpen(true)}>
            Tambah Transaksi
          </Button>
        </div>
      </div>

      <div className="wallet-hero">
        <div className="wallet-hero-content">
          <h1 className="wallet-name">{wallet.name}</h1>

          <div className="wallet-balance">
            {formatCurrency(wallet.balance)}
          </div>
          {wallet.budget > 0 && (
             <div className="wallet-budget-info">
               Target Budget: {formatCurrency(wallet.budget)}
             </div>
          )}
        </div>
      </div>

      <div className="wallet-stats-grid">
        <StatCard
          label="Total Pemasukan"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          variant="default"
        />
      </div>

      <div className="wallet-transactions-section">
        <h3>Riwayat Transaksi</h3>
        {walletTransactions.length === 0 ? (
          <Card className="empty-transactions">
            <p>Belum ada transaksi di dompet ini</p>
          </Card>
        ) : (
          <div className="transactions-list">
            {walletTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                wallet={wallet} // We know the wallet context here
              />
            ))}
          </div>
        )}
      </div>

      <WalletFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        wallet={wallet}
      />
      
      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        defaultWalletId={wallet.id}
      />
    </div>
  );
};

export default WalletDetailPage;
