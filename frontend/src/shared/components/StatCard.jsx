import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';
import './StatCard.css';

const StatCard = ({ 
  label, 
  value, 
  icon: Icon = Wallet,
  trend,
  trendValue,
  variant = 'default'
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  return (
    <Card variant={variant} className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-card-icon stat-card-icon-${variant}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`stat-card-trend stat-card-trend-${trend}`}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="stat-card-content">
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
      </div>
    </Card>
  );
};

export default StatCard;
