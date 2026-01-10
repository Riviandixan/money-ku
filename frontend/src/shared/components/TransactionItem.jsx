import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './TransactionItem.css';

const TransactionItem = ({ 
  transaction, 
  wallet,
  onDelete,
  showWallet = true
}) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <ArrowUpRight size={20} />;
      case 'expense':
        return <ArrowDownRight size={20} />;
      case 'transfer':
        return <ArrowRightLeft size={20} />;
      default:
        return null;
    }
  };

  const getTransactionClass = () => {
    return `transaction-item-${transaction.type}`;
  };

  const getTransactionLabel = () => {
    switch (transaction.type) {
      case 'income':
        return 'Pemasukan';
      case 'expense':
        return 'Pengeluaran';
      case 'transfer':
        return 'Transfer';
      default:
        return '';
    }
  };

  return (
    <div className={`transaction-item ${getTransactionClass()}`}>
      <div className={`transaction-item-icon transaction-item-icon-${transaction.type}`}>
        {getTransactionIcon()}
      </div>
      
      <div className="transaction-item-content">
        <div className="transaction-item-header">
          <h4 className="transaction-item-title">
            {getTransactionLabel()}
            {transaction.category && (
              <span className="transaction-item-category"> • {transaction.category}</span>
            )}
          </h4>
          <p className={`transaction-item-amount transaction-item-amount-${transaction.type}`}>
            {transaction.type === 'expense' && '-'}
            {transaction.type === 'income' && '+'}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
        
        <div className="transaction-item-details">
          <span className="transaction-item-date">{formatDate(transaction.date, 'withTime')}</span>
          {showWallet && wallet && (
            <>
              <span className="transaction-item-separator">•</span>
              <span className="transaction-item-wallet">{wallet.name}</span>
            </>
          )}
          {transaction.description && (
            <>
              <span className="transaction-item-separator">•</span>
              <span className="transaction-item-description">{transaction.description}</span>
            </>
          )}
        </div>
      </div>

      {onDelete && (
        <button 
          className="transaction-item-delete"
          onClick={() => onDelete(transaction)}
          title="Hapus transaksi"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

export default TransactionItem;
