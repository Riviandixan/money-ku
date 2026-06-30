import React, { useState, useEffect } from 'react';
import { Plus, Target, Trash2, Pencil, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import BudgetFormModal from './BudgetFormModal';
import { toast } from 'react-toastify';
import './BudgetsPage.css';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const BudgetsPage = () => {
  const { budgets, loadBudgets, removeBudget, loading } = useBudget();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadBudgets(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleDelete = (budget) => {
    setConfirmDelete(budget);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const result = await removeBudget(confirmDelete.id);
    setConfirmDelete(null);
    if (result?.success) {
      toast.success('Budget berhasil dihapus');
      loadBudgets(selectedMonth, selectedYear);
    } else {
      toast.error(result?.message || 'Gagal menghapus budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.spent > b.amount).length;

  const yearOptions = [];
  const currentYear = now.getFullYear();
  for (let y = currentYear - 1; y <= currentYear + 2; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <div>
          <h1 className="budgets-title">Budget</h1>
          <p className="budgets-subtitle">Atur batas pengeluaran per kategori</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleAdd}>
          Tambah Budget
        </Button>
      </div>

      {/* Period Filter */}
      <div className="budgets-filter">
        <select
          className="budget-period-select"
          value={selectedMonth}
          onChange={e => setSelectedMonth(parseInt(e.target.value))}
        >
          {MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          className="budget-period-select"
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
        >
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="budgets-summary">
          <div className="budget-summary-card">
            <span className="budget-summary-label">Total Budget</span>
            <span className="budget-summary-value">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="budget-summary-card">
            <span className="budget-summary-label">Total Terpakai</span>
            <span className="budget-summary-value spent">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="budget-summary-card">
            <span className="budget-summary-label">Sisa Budget</span>
            <span className={`budget-summary-value ${totalBudget - totalSpent < 0 ? 'over' : 'remaining'}`}>
              {formatCurrency(Math.max(totalBudget - totalSpent, 0))}
            </span>
          </div>
          {overBudgetCount > 0 && (
            <div className="budget-summary-card warning">
              <AlertTriangle size={18} />
              <span className="budget-summary-label">{overBudgetCount} kategori over budget</span>
            </div>
          )}
        </div>
      )}

      {/* Budget List */}
      {loading ? (
        <div className="budgets-loading">Memuat budget...</div>
      ) : budgets.length === 0 ? (
        <Card className="budgets-empty">
          <Target size={48} className="budgets-empty-icon" />
          <h3>Belum ada budget</h3>
          <p>Tambahkan budget untuk mengontrol pengeluaran Anda per kategori</p>
          <Button variant="primary" icon={Plus} onClick={handleAdd}>
            Tambah Budget Pertama
          </Button>
        </Card>
      ) : (
        <div className="budgets-list">
          {budgets.map(budget => {
            const isOver = budget.spent > budget.amount;
            const isNearLimit = !isOver && budget.percentage >= 80;

            return (
              <Card key={budget.id} className={`budget-card ${isOver ? 'over' : isNearLimit ? 'near' : ''}`}>
                <div className="budget-card-header">
                  <div className="budget-card-info">
                    <div className="budget-card-category">
                      {isOver ? (
                        <AlertTriangle size={16} className="budget-status-icon over" />
                      ) : budget.percentage >= 100 ? (
                        <CheckCircle size={16} className="budget-status-icon done" />
                      ) : null}
                      <span>{budget.category}</span>
                    </div>
                    <div className="budget-card-amounts">
                      <span className={`budget-spent ${isOver ? 'over' : ''}`}>
                        {formatCurrency(budget.spent)}
                      </span>
                      <span className="budget-separator"> / </span>
                      <span className="budget-limit">{formatCurrency(budget.amount)}</span>
                    </div>
                  </div>
                  <div className="budget-card-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      onClick={() => handleEdit(budget)}
                      title="Edit budget"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(budget)}
                      title="Hapus budget"
                      className="btn-danger-ghost"
                    />
                  </div>
                </div>

                <div className="budget-progress-bar-wrapper">
                  <div className="budget-progress-bar">
                    <div
                      className={`budget-progress-fill ${isOver ? 'over' : isNearLimit ? 'near' : 'normal'}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="budget-percentage">
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="budget-card-footer">
                  {isOver ? (
                    <span className="budget-status-text over">
                      Over budget {formatCurrency(budget.spent - budget.amount)}
                    </span>
                  ) : (
                    <span className="budget-status-text remaining">
                      Sisa {formatCurrency(budget.remaining)}
                    </span>
                  )}
                  <span className="budget-period-badge">{budget.period === 'monthly' ? 'Bulanan' : 'Mingguan'}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editBudget={editingBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Hapus budget "${confirmDelete?.category}"?`}
        message="Budget yang dihapus tidak bisa dikembalikan. Pengeluaran yang sudah tercatat tidak terpengaruh."
        confirmLabel="Hapus"
        variant="danger"
      />
    </div>
  );
};

export default BudgetsPage;
