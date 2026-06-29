import { useId } from 'react';

const Input = ({ label, type = 'text', error, className = '', id, autoComplete, as, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const baseClassName = `w-full px-3 py-2 text-sm border rounded-lg outline-none bg-white text-slate-900 transition-all duration-150 ${
    error 
      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' 
      : 'border-slate-200/80 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
  } ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          id={inputId}
          className={baseClassName}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          autoComplete={autoComplete || 'on'}
          className={baseClassName}
          {...props}
        />
      )}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

export default Input;