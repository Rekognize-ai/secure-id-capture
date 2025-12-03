import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  max?: string;
  min?: string;
  className?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  max,
  min,
  className,
}: DatePickerProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={max}
          min={min}
          className={cn(
            'w-full h-14 px-4 pr-12 text-lg bg-card border-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[color-scheme:light]',
            error 
              ? 'border-destructive focus:ring-destructive focus:border-destructive' 
              : 'border-input hover:border-primary/50',
            className
          )}
        />
        <Calendar 
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
