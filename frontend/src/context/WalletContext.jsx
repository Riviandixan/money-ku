import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import walletService from '../services/walletService';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wallets when user is authenticated
  useEffect(() => {
    if (user) {
      loadWallets();
    } else {
      setWallets([]);
    }
  }, [user]);

  const loadWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await walletService.getWallets();
      if (response.success) {
        setWallets(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load wallets:', err);
      setError(err.response?.data?.error || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async (wallet) => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await walletService.createWallet(wallet);
      if (response.success) {
        setWallets(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to create wallet:', err);
      const message = err.response?.data?.error || 'Failed to create wallet';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateWallet = async (id, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await walletService.updateWallet(id, updatedData);
      if (response.success) {
        setWallets(prev => prev.map(wallet => 
          wallet.id === id ? response.data : wallet
        ));
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to update wallet:', err);
      const message = err.response?.data?.error || 'Failed to update wallet';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await walletService.deleteWallet(id);
      if (response.success) {
        setWallets(prev => prev.filter(wallet => wallet.id !== id));
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err) {
      console.error('Failed to delete wallet:', err);
      const message = err.response?.data?.error || 'Failed to delete wallet';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const getWalletById = (id) => {
    return wallets.find(wallet => wallet.id === parseInt(id));
  };

  const getTotalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  };

  const getTotalByType = (type) => {
    return wallets
      .filter(wallet => wallet.type === type)
      .reduce((sum, wallet) => sum + wallet.balance, 0);
  };

  const value = {
    wallets,
    loading,
    error,
    addWallet,
    updateWallet,
    deleteWallet,
    getWalletById,
    getTotalBalance,
    getTotalByType,
    refreshWallets: loadWallets,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

