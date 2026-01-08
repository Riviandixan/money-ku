import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';
import transactionService from '../services/transactionService';
import { isWithinInterval, parseISO } from 'date-fns';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const { refreshWallets } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load transactions when user is authenticated
  useEffect(() => {
    if (user) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getTransactions();
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Add income
  const addIncome = async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.createTransaction({
        wallet_id: parseInt(transactionData.walletId),
        type: 'income',
        amount: parseFloat(transactionData.amount),
        category: transactionData.category || 'Income',
        description: transactionData.description || '',
        date: transactionData.date || new Date().toISOString(),
      });
      
      if (response.success) {
        setTransactions(prev => [...prev, response.data]);
        // Refresh wallets to update balance
        await refreshWallets();
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to add income:', err);
      const message = err.response?.data?.error || 'Failed to add income';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Add expense
  const addExpense = async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.createTransaction({
        wallet_id: parseInt(transactionData.walletId),
        type: 'expense',
        amount: parseFloat(transactionData.amount),
        category: transactionData.category || 'Expense',
        description: transactionData.description || '',
        date: transactionData.date || new Date().toISOString(),
      });
      
      if (response.success) {
        setTransactions(prev => [...prev, response.data]);
        // Refresh wallets to update balance
        await refreshWallets();
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to add expense:', err);
      const message = err.response?.data?.error || 'Failed to add expense';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Add transfer
  const addTransfer = async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.createTransaction({
        wallet_id: parseInt(transactionData.fromWalletId),
        type: 'transfer',
        amount: parseFloat(transactionData.amount),
        category: 'Transfer',
        description: transactionData.description || '',
        date: transactionData.date || new Date().toISOString(),
        to_wallet_id: parseInt(transactionData.toWalletId),
      });
      
      if (response.success) {
        setTransactions(prev => [...prev, response.data]);
        // Refresh wallets to update balances
        await refreshWallets();
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to add transfer:', err);
      const message = err.response?.data?.error || 'Failed to add transfer';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.deleteTransaction(id);
      
      if (response.success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        // Refresh wallets to update balance
        await refreshWallets();
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      const message = err.response?.data?.error || 'Failed to delete transaction';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const getRecentTransactions = (limit = 10) => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };

  const calculatePeriodTotals = (startDate, endDate) => {
    return transactions.reduce((acc, curr) => {
      const date = parseISO(curr.date);
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
        if (curr.type === 'income') acc.income += curr.amount;
        if (curr.type === 'expense') acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  };

  const value = {
    transactions,
    loading,
    error,
    addIncome,
    addExpense,
    addTransfer,
    deleteTransaction,
    getRecentTransactions,
    calculatePeriodTotals,
    refreshTransactions: loadTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

