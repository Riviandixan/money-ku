import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import WalletCard from '../../shared/components/WalletCard';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import WalletFormModal from './WalletFormModal';
import { useNavigate } from 'react-router-dom';
import './WalletsPage.css';

const WalletsPage = () => {
  const { wallets } = useWallet();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewWallet = (wallet) => {
    navigate(`/wallets/${wallet.id}`);
  };

  return (
    <div className="wallets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dompet Saya</h1>
          <p className="page-subtitle">Kelola semua sumber dana Anda</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Tambah Dompet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <Card className="empty-state">
          <h3>Belum ada dompet</h3>
          <p>Tambahkan dompet untuk mulai mencatat keuangan Anda</p>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Buat Dompet Pertama
          </Button>
        </Card>
      ) : (
        <div className="wallets-grid">
          {wallets.map(wallet => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onView={handleViewWallet}
            />
          ))}
        </div>
      )}

      <WalletFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default WalletsPage;
