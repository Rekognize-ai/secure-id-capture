import React from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Cloud, CloudOff, Check, X, Loader2, AlertCircle } from 'lucide-react';

type BadgeVariant = 'online' | 'offline' | 'pending' | 'uploading' | 'uploaded' | 'failed' | 'success' | 'warning' | 'info';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantConfig: Record<BadgeVariant, {
  bg: string;
  text: string;
  icon: React.ElementType;
  defaultLabel: string;
}> = {
  online: {
    bg: 'bg-success/15',
    text: 'text-success',
    icon: Wifi,
    defaultLabel: 'Online',
  },
  offline: {
    bg: 'bg-warning/15',
    text: 'text-warning',
    icon: WifiOff,
    defaultLabel: 'Offline',
  },
  pending: {
    bg: 'bg-warning/15',
    text: 'text-warning',
    icon: Cloud,
    defaultLabel: 'Pending',
  },
  uploading: {
    bg: 'bg-info/15',
    text: 'text-info',
    icon: Loader2,
    defaultLabel: 'Uploading',
  },
  uploaded: {
    bg: 'bg-success/15',
    text: 'text-success',
    icon: Check,
    defaultLabel: 'Uploaded',
  },
  failed: {
    bg: 'bg-destructive/15',
    text: 'text-destructive',
    icon: X,
    defaultLabel: 'Failed',
  },
  success: {
    bg: 'bg-success/15',
    text: 'text-success',
    icon: Check,
    defaultLabel: 'Success',
  },
  warning: {
    bg: 'bg-warning/15',
    text: 'text-warning',
    icon: AlertCircle,
    defaultLabel: 'Warning',
  },
  info: {
    bg: 'bg-info/15',
    text: 'text-info',
    icon: AlertCircle,
    defaultLabel: 'Info',
  },
};

const sizes = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function StatusBadge({
  variant,
  label,
  showIcon = true,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        config.bg,
        config.text,
        sizes[size],
        className
      )}
    >
      {showIcon && (
        <Icon 
          size={iconSizes[size]} 
          className={variant === 'uploading' ? 'animate-spin' : ''} 
        />
      )}
      {label || config.defaultLabel}
    </span>
  );
}
