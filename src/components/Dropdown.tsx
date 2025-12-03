import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: DropdownOption[];
  error?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Dropdown({
  label,
  options,
  error,
  placeholder = 'Select an option',
  value,
  onChange,
  className,
  id,
  ...props
}: DropdownProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <label 
        htmlFor={selectId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'w-full h-14 px-4 pr-10 text-lg bg-card border-2 rounded-lg appearance-none cursor-pointer transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error 
              ? 'border-destructive focus:ring-destructive focus:border-destructive' 
              : 'border-input hover:border-primary/50',
            !value && 'text-muted-foreground',
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
          size={20} 
        />
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}
