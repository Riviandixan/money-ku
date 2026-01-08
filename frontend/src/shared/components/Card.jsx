import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hover = false
}) => {
  const baseClass = 'card';
  const variantClass = `card-${variant}`;
  const paddingClass = `card-padding-${padding}`;
  const hoverClass = hover ? 'card-hover' : '';
  const clickableClass = onClick ? 'card-clickable' : '';
  
  const classes = [
    baseClass,
    variantClass,
    paddingClass,
    hoverClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
