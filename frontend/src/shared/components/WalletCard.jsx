import React from 'react';
import { Wallet, Edit, Trash2, Eye } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { formatCurrency } from '../../utils/formatters';
import './WalletCard.css';

const WalletCard = ({ 
  wallet, 
  onView,
  onEdit,
  onDelete
}) => {
  const getWalletTypeColor = (type) => {
    switch (type) {
      case 'Tabungan':
      case 'Income':
        return 'wallet-card-savings';
      case 'Pengeluaran':
        return 'wallet-card-expense';
      default:
        return 'wallet-card-general';
    }
  };

  const getUsagePercentage = () => {
    if (!wallet.budget || wallet.budget === 0) return 0;
    return Math.min((wallet.balance / wallet.budget) * 100, 100);
  };

  const usagePercentage = getUsagePercentage();

  return (
    <Card className={`wallet-card ${getWalletTypeColor(wallet.type)}`} hover>
      <div className="wallet-card-header">
        <div className="wallet-card-icon">
          <Wallet size={24} />
        </div>
        <span className="wallet-card-type">{wallet.type}</span>
      </div>

      <div className="wallet-card-content">
        <h3 className="wallet-card-name">{wallet.name.charAt(0).toUpperCase() + wallet.name.slice(1)}</h3>
        <p className="wallet-card-balance">{formatCurrency(wallet.balance)}</p>
      </div>

      {wallet.budget && (
        <div className="wallet-card-progress">
          <div className="wallet-card-progress-info">
            <span>Terpakai</span>
            <span>{usagePercentage.toFixed(0)}%</span>
          </div>
          <div className="wallet-card-progress-bar">
            <div 
              className="wallet-card-progress-fill"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="wallet-card-budget">
            Budget: {formatCurrency(wallet.budget)}
          </p>
        </div>
      )}

      <div className="wallet-card-actions">
        {onView && (
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Eye}
            onClick={() => onView(wallet)}
          >
            Lihat
          </Button>
        )}
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Edit}
            onClick={() => onEdit(wallet)}
          />
        )}
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Trash2}
            onClick={() => onDelete(wallet)}
          />
        )}
      </div>
    </Card>
  );
};

export default WalletCard;
