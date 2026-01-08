import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = ''
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const fullWidthClass = fullWidth ? 'btn-full' : '';
  const iconOnlyClass = !children && Icon ? 'btn-icon-only' : '';
  
  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    iconOnlyClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && iconPosition === 'left' && <Icon className="btn-icon" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children && <span>{children}</span>}
      {Icon && iconPosition === 'right' && <Icon className="btn-icon" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
    </button>
  );
};

export default Button;
