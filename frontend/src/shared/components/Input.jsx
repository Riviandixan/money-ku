import React, { useState } from 'react';
import './Input.css';

const Input = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  options = [], // for select
  rows = 4, // for textarea
  min,
  max,
  step,
  className = ''
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== '' && value !== null && value !== undefined;

  const inputClasses = [
    'input-field',
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'input-label',
    (focused || hasValue) ? 'input-label-float' : ''
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    const commonProps = {
      name,
      value: value || '',
      onChange,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      disabled,
      required,
      className: inputClasses
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Pilih {label}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            placeholder={placeholder}
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
          />
        );
    }
  };

  return (
    <div className="input-wrapper">
      {label && type !== 'select' && (
        <label className={labelClasses}>
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
