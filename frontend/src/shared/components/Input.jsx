import React from 'react';
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


  const inputClasses = [
    'input-field',
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const labelClasses = [
    'input-label',
    error ? 'input-label-error' : ''
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    const commonProps = {
      name,
      value: value || '',
      onChange,
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
      
      case 'currency':
        const displayValue = value ? new Intl.NumberFormat('id-ID').format(value) : '';
        const handleCurrencyChange = (e) => {
          // Remove non-numeric characters except for leading zero
          const rawValue = e.target.value.replace(/[^\d]/g, '');
          const numericValue = rawValue === '' ? '' : parseInt(rawValue, 10);
          onChange({
            target: {
              name,
              value: numericValue
            }
          });
        };
        return (
          <div className="currency-input-container">
            <span className="currency-prefix">Rp</span>
            <input
              {...commonProps}
              type="text"
              value={displayValue}
              onChange={handleCurrencyChange}
              placeholder={placeholder || '0'}
            />
          </div>
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
      {label && (
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
