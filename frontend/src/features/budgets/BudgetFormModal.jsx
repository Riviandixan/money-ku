import React, { useState, useEffect } from 'react';
import Modal from '../../shared/components/Modal';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import { useBudget } from '../../context/BudgetContext';
import { toast } from 'react-toastify';

const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transport',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan & Utilitas',
  'Perawatan Diri',
  'Olahraga',
  'Lainnya',
];

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const BudgetFormModal = ({ isOpen, onClose, editBudget, currentMonth, currentYear }) => {
  const { addBudget, editBudget: updateBudget, loadBudgets } = useBudget();
  const isEdit = !!editBudget;

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    month: currentMonth || new Date().getMonth() + 1,
    year: currentYear || new Date().getFullYear(),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setFormData({
          category: editBudget.category,
          amount: editBudget.amount,
          period: editBudget.period,
          month: editBudget.month,
          year: editBudget.year,
        });
      } else {
        setFormData({
          category: '',
          amount: '',
          period: 'monthly',
          month: currentMonth || new Date().getMonth() + 1,
          year: currentYear || new Date().getFullYear(),
        });
      }
      setErrors({});
    }
  }, [isOpen, isEdit, editBudget, currentMonth, currentYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Kategori harus dipilih';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah budget harus lebih dari 0';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
      month: parseInt(formData.month),
      year: parseInt(formData.year),
    };

    let result;
    if (isEdit) {
      result = await updateBudget(editBudget.id, payload);
    } else {
      result = await addBudget(payload);
    }

    if (result?.success) {
      toast.success(`Budget berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`);
      await loadBudgets(parseInt(formData.month), parseInt(formData.year));
      onClose();
    } else {
      toast.error(result?.message || `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} budget`);
    }
  };

  const yearOptions = [];
  const baseYear = new Date().getFullYear();
  for (let y = baseYear - 1; y <= baseYear + 2; y++) {
    yearOptions.push({ value: y, label: String(y) });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Budget' : 'Tambah Budget'}
      size="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Kategori"
          name="category"
          type="select"
          value={formData.category}
          onChange={handleChange}
          options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
          error={errors.category}
          required
        />

        <Input
          label="Batas Budget"
          name="amount"
          type="currency"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0"
          error={errors.amount}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Bulan"
            name="month"
            type="select"
            value={formData.month}
            onChange={handleChange}
            options={MONTHS}
            required
          />
          <Input
            label="Tahun"
            name="year"
            type="select"
            value={formData.year}
            onChange={handleChange}
            options={yearOptions}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetFormModal;
