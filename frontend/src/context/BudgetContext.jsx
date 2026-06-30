import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import budgetService from '../services/budgetService';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBudgets = useCallback(async (month, year) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await budgetService.getBudgets(month, year);
      if (response.success) {
        setBudgets(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError(err.response?.data?.error || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addBudget = async (budgetData) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await budgetService.createBudget(budgetData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to create budget:', err);
      const message = err.response?.data?.error || 'Failed to create budget';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const editBudget = async (id, budgetData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await budgetService.updateBudget(id, budgetData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to update budget:', err);
      const message = err.response?.data?.error || 'Failed to update budget';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const removeBudget = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await budgetService.deleteBudget(id);
      if (response.success) {
        setBudgets(prev => prev.filter(b => b.id !== id));
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to delete budget:', err);
      const message = err.response?.data?.error || 'Failed to delete budget';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    budgets,
    loading,
    error,
    loadBudgets,
    addBudget,
    editBudget,
    removeBudget,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
