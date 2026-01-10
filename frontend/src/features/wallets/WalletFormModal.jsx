import React, { useState, useEffect } from 'react';
import Modal from '../../shared/components/Modal';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import { useWallet } from '../../context/WalletContext';
import './WalletFormModal.css';

const WalletFormModal = ({ isOpen, onClose, wallet = null }) => {
  const { addWallet, updateWallet } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: '',
    budget: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (wallet) {
      setFormData({
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance.toString(),
        budget: wallet.budget ? wallet.budget.toString() : ''
      });
    } else {
      setFormData({
        name: '',
        type: '',
        balance: '',
        budget: ''
      });
    }
    setErrors({});
  }, [wallet, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nama dompet harus diisi';
    }
    if (!formData.type) {
      newErrors.type = 'Tipe dompet harus dipilih';
    }
    if (!formData.balance || parseFloat(formData.balance) < 0) {
      newErrors.balance = 'Saldo awal harus diisi dan tidak boleh negatif';
    }
    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget tidak boleh negatif';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const walletData = {
      name: formData.name.trim(),
      type: formData.type,
      balance: parseFloat(formData.balance),
      budget: formData.budget ? parseFloat(formData.budget) : null
    };

    if (wallet) {
      updateWallet(wallet.id, walletData);
    } else {
      addWallet(walletData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={wallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="wallet-form">
        <Input
          label="Nama Dompet"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: Gaji Utama, Belanja Bulanan"
          error={errors.name}
          required
        />

        <Input
          label="Tipe Dompet"
          name="type"
          type="select"
          value={formData.type}
          onChange={handleChange}
          options={[
            { value: 'tabungan', label: 'Tabungan' },
            { value: 'transaksi', label: 'Transaksi' }
          ]}
          error={errors.type}
          required
        />

        <Input
          label="Saldo Awal"
          name="balance"
          type="currency"
          value={formData.balance}
          onChange={handleChange}
          placeholder="0"
          error={errors.balance}
          required
        />

        <Input
          label="Budget (Opsional)"
          name="budget"
          type="currency"
          value={formData.budget}
          onChange={handleChange}
          placeholder="0"
          error={errors.budget}
        />

        <div className="wallet-form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary">
            {wallet ? 'Simpan Perubahan' : 'Tambah Dompet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WalletFormModal;
