import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../shared/components/Button';
import moneykuLogo from '../moneykuv2.png';
import './Header.css';

const Header = ({ title = 'Moneyku', onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header glass">
      <div className="header-content">
        <div className="header-left">
          {onMenuClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              icon={Menu}
              onClick={onMenuClick}
              className="header-menu-btn"
            />
          )}
          <Link to="/" className="header-logo-link">
            <img src={moneykuLogo} alt="Moneyku" className="header-logo" />
            <span className="header-logo-text">MoneyKu</span>
          </Link>
        </div>
        
        <nav className="header-nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Dashboard</Link>
          <Link to="/wallets" className={`nav-link ${isActive('/wallets')}`}>Dompet</Link>
          <Link to="/transactions" className={`nav-link ${isActive('/transactions')}`}>Transaksi</Link>
          <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>Laporan</Link>
        </nav>

        <div className="header-right">
          <span className="user-greeting">Hi, {user?.username}</span>
          <Button
            variant="ghost"
            size="sm"
            icon={theme === 'dark' ? Sun : Moon}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={LogOut}
            onClick={logout}
            title="Keluar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
