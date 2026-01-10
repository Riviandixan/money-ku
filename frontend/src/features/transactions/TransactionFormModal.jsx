import React, { useState, useEffect } from 'react';
import Modal from '../../shared/components/Modal';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import { useWallet } from '../../context/WalletContext';
import { useTransaction } from '../../context/TransactionContext';
import { formatDateForInput } from '../../utils/formatters';
import './TransactionFormModal.css';

const TransactionFormModal = ({ isOpen, onClose }) => {
  const { wallets, getWalletById } = useWallet();
  const { addIncome, addExpense, addTransfer } = useTransaction();
  
  const [activeTab, setActiveTab] = useState('income');
  const [formData, setFormData] = useState({
    walletId: '',
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    date: formatDateForInput(new Date()),
    category: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        walletId: '',
        fromWalletId: '',
        toWalletId: '',
        amount: '',
        date: formatDateForInput(new Date()),
        category: '',
        description: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (activeTab === 'transfer') {
      if (!formData.fromWalletId) {
        newErrors.fromWalletId = 'Dompet sumber harus dipilih';
      }
      if (!formData.toWalletId) {
        newErrors.toWalletId = 'Dompet tujuan harus dipilih';
      }
      if (formData.fromWalletId === formData.toWalletId) {
        newErrors.toWalletId = 'Dompet tujuan harus berbeda dengan dompet sumber';
      }
      if (formData.fromWalletId) {
        const wallet = getWalletById(formData.fromWalletId);
        if (wallet && parseFloat(formData.amount) > wallet.balance) {
          newErrors.amount = 'Saldo dompet tidak mencukupi';
        }
      }
    } else {
      if (!formData.walletId) {
        newErrors.walletId = 'Dompet harus dipilih';
      }
      if (activeTab === 'expense' && formData.walletId) {
        const wallet = getWalletById(formData.walletId);
        if (wallet && parseFloat(formData.amount) > wallet.balance) {
          newErrors.amount = 'Saldo dompet tidak mencukupi';
        }
      }
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah harus diisi dan lebih dari 0';
    }
    if (!formData.date) {
      newErrors.date = 'Tanggal harus diisi';
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

    const transactionData = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category.trim(),
      description: formData.description.trim()
    };

    if (activeTab === 'income') {
      addIncome({ ...transactionData, walletId: formData.walletId });
    } else if (activeTab === 'expense') {
      addExpense({ ...transactionData, walletId: formData.walletId });
    } else if (activeTab === 'transfer') {
      addTransfer({
        ...transactionData,
        fromWalletId: formData.fromWalletId,
        toWalletId: formData.toWalletId
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Transaksi"
      size="md"
    >
      <div className="transaction-form">
        <div className="transaction-tabs">
          <button
            type="button"
            className={`transaction-tab ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveTab('income')}
          >
            Pemasukan
          </button>
          <button
            type="button"
            className={`transaction-tab ${activeTab === 'expense' ? 'active' : ''}`}
            onClick={() => setActiveTab('expense')}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            className={`transaction-tab ${activeTab === 'transfer' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form-content">
          {activeTab === 'transfer' ? (
            <>
              <Input
                label="Dari Dompet"
                name="fromWalletId"
                type="select"
                value={formData.fromWalletId}
                onChange={handleChange}
                options={wallets.map(w => ({ value: w.id, label: w.name }))}
                error={errors.fromWalletId}
                required
              />
              <Input
                label="Ke Dompet"
                name="toWalletId"
                type="select"
                value={formData.toWalletId}
                onChange={handleChange}
                options={wallets.map(w => ({ value: w.id, label: w.name }))}
                error={errors.toWalletId}
                required
              />
            </>
          ) : (
            <Input
              label="Dompet"
              name="walletId"
              type="select"
              value={formData.walletId}
              onChange={handleChange}
              options={wallets.map(w => ({ value: w.id, label: w.name }))}
              error={errors.walletId}
              required
            />
          )}

          <Input
            label="Jumlah"
            name="amount"
            type="currency"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            error={errors.amount}
            required
          />

          <Input
            label="Tanggal"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            required
          />

          <Input
            label="Kategori (Opsional)"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Contoh: Makanan, Transport, Gaji"
          />

          <Input
            label="Catatan (Opsional)"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tambahkan catatan..."
            rows={3}
          />

          <div className="transaction-form-actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TransactionFormModal;
