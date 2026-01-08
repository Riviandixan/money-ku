import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';
import TransactionItem from '../../shared/components/TransactionItem';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import TransactionFormModal from './TransactionFormModal';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const { transactions } = useTransaction();
  const { wallets } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, income, expense, transfer

  const filteredTransactions = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Riwayat pemasukan dan pengeluaran</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Tambah Transaksi
        </Button>
      </div>

      <div className="transactions-filters">
        <Button 
          variant={filterType === 'all' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('all')}
        >
          Semua
        </Button>
        <Button 
          variant={filterType === 'income' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('income')}
        >
          Pemasukan
        </Button>
        <Button 
          variant={filterType === 'expense' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('expense')}
        >
          Pengeluaran
        </Button>
        <Button 
          variant={filterType === 'transfer' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => setFilterType('transfer')}
        >
          Transfer
        </Button>
      </div>

      <div className="transactions-content">
        {filteredTransactions.length === 0 ? (
          <Card className="empty-state">
            <h3>Tidak ada transaksi</h3>
            <p>Belum ada transaksi yang sesuai dengan filter ini</p>
          </Card>
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map(transaction => {
              const wallet = wallets.find(
                w => w.id === transaction.walletId || 
                     w.id === transaction.fromWalletId
              );
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  wallet={wallet}
                />
              );
            })}
          </div>
        )}
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default TransactionsPage;
