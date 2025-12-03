import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  className,
  ...props
}: PrimaryButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary',
    ghost: 'text-foreground hover:bg-muted focus-visible:ring-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
    success: 'bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success shadow-lg shadow-success/20',
  };
  
  const sizes = {
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-11 px-5 text-base gap-2',
    lg: 'h-14 px-6 text-lg gap-2.5',
    xl: 'h-16 px-8 text-xl gap-3',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
