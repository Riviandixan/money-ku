import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../shared/components/Button';
import moneykuLogo from '../moneykuv2.png';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header">
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
          <Link to="/budgets" className={`nav-link ${isActive('/budgets')}`}>Budget</Link>
          <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>Laporan</Link>
        </nav>

        <div className="header-right">
          <span className="user-greeting">Hi, {user?.username || 'test123'}</span>
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
