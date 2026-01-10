import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useTransaction } from '../../context/TransactionContext';
import { formatCurrency } from '../../utils/formatters';
import { getDateRangePreset } from '../../utils/calculations';
import StatCard from '../../shared/components/StatCard';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import WalletCard from '../../shared/components/WalletCard';
import TransactionItem from '../../shared/components/TransactionItem';
import Input from '../../shared/components/Input';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js';
import WalletFormModal from '../wallets/WalletFormModal';
import TransactionFormModal from '../transactions/TransactionFormModal';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const navigate = useNavigate();
  const { wallets, getTotalByType } = useWallet();
  const { getRecentTransactions, calculatePeriodTotals } = useTransaction();
  
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Get current month data
  const { startDate, endDate } = getDateRangePreset('thisMonth');
  const monthlyTotals = calculatePeriodTotals(startDate, endDate);
  const recentTransactions = getRecentTransactions(5);

  // Calculate stats
  const totalBalance = getTotalByType('tabungan');
  const totalSavings = getTotalByType('tabungan');
  const monthlyIncome = monthlyTotals.income;
  const monthlyExpense = monthlyTotals.expense;

  const handleViewWallet = (wallet) => {
    navigate(`/wallets/${wallet.id}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Ringkasan keuangan Anda</p>
        </div>
        <div className="dashboard-actions">
          {/* <Input 
            type="date"
            name="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="dashboard-date-filter"
          /> */}
          <Button 
            variant="tertiary" 
            icon={Wallet}
            onClick={() => setIsWalletModalOpen(true)}
          >
            Tambah Dompet
          </Button>
          <Button 
            variant="primary" 
            icon={Plus}
            onClick={() => setIsTransactionModalOpen(true)}
          >
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        <StatCard
          label="Total Saldo"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatCurrency(monthlyIncome)}
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatCurrency(monthlyExpense)}
          icon={TrendingDown}
          variant="default"
        />
        <StatCard
          label="Total Tabungan"
          value={formatCurrency(totalSavings)}
          icon={PiggyBank}
          variant="default"
        />
      </div>

      {/* Wallets Section */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Dompet Saya</h2>
          {wallets.length > 3 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/wallets')}>
              Lihat Semua
            </Button>
          )}
        </div>
        
        {wallets.length === 0 ? (
          <Card className="dashboard-empty">
            <Wallet size={48} className="dashboard-empty-icon" />
            <h3>Belum ada dompet</h3>
            <p>Mulai dengan menambahkan dompet pertama Anda</p>
            <Button variant="primary" icon={Plus} onClick={() => setIsWalletModalOpen(true)}>
              Tambah Dompet
            </Button>
          </Card>
        ) : (
          <div className="dashboard-wallets-container">
            <div className="dashboard-wallets">
              {wallets.map(wallet => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onView={handleViewWallet}
                />
              ))}
            </div>
            
            {wallets.length > 0 && (
              <Card className="dashboard-wallets-chart">
                <h3>Distribusi Saldo</h3>
                <div className="mini-chart-container">
                  <Doughnut 
                    data={{
                      labels: wallets.map(w => w.name),
                      datasets: [{
                        data: wallets.map(w => w.balance),
                        backgroundColor: [
                          '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'
                        ],
                        borderWidth: 0
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: { display: false }
                      },
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Transaksi Terbaru</h2>
          {recentTransactions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              Lihat Semua
            </Button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <Card className="dashboard-empty">
            <Plus size={48} className="dashboard-empty-icon" />
            <h3>Belum ada transaksi</h3>
            <p>Catat pemasukan atau pengeluaran Anda</p>
            <Button variant="primary" icon={Plus} onClick={() => setIsTransactionModalOpen(true)}>
              Tambah Transaksi
            </Button>
          </Card>
        ) : (
          <Card padding="sm" className="dashboard-transactions">
            {recentTransactions.map(transaction => {
              const wallet = wallets.find(
                w => w.id === transaction.wallet_id
              );
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  wallet={wallet}
                />
              );
            })}
          </Card>
        )}
      </div>

      <WalletFormModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
