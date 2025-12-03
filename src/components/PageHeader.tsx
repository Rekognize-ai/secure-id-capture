import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = true,
  backTo,
  rightElement,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn('bg-card border-b border-border safe-top', className)}>
      <div className="flex items-center gap-4 px-4 h-16">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors touch-manipulation"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {rightElement && (
          <div className="flex-shrink-0">{rightElement}</div>
        )}
      </div>
    </header>
  );
}
