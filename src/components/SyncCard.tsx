import React from 'react';
import { cn } from '@/lib/utils';
import { EnrollmentRecord } from '@/types/enrollment';
import { StatusBadge } from './StatusBadge';
import { User, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';

interface SyncCardProps {
  record: EnrollmentRecord;
  onRetry?: (id: string) => void;
  className?: string;
}

export function SyncCard({ record, onRetry, className }: SyncCardProps) {
  const statusVariant = record.status === 'uploaded' ? 'uploaded' 
    : record.status === 'uploading' ? 'uploading'
    : record.status === 'failed' ? 'failed' 
    : 'pending';

  return (
    <div 
      className={cn(
        'bg-card border border-border rounded-lg p-4 transition-all duration-200',
        'hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Name and type */}
          <div className="flex items-center gap-2 mb-2">
            <User size={18} className="text-primary flex-shrink-0" />
            <h3 className="font-semibold text-foreground truncate">
              {record.form.firstName} {record.form.lastName}
            </h3>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              record.type === 'inmate' 
                ? 'bg-secondary/50 text-secondary-foreground' 
                : 'bg-accent/50 text-accent-foreground'
            )}>
              {record.type === 'inmate' ? 'Inmate' : 'Staff'}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm text-muted-foreground">
            {record.type === 'inmate' && record.form.prisonBlock && (
              <div className="flex items-center gap-2">
                <Building2 size={14} />
                <span>Block {record.form.prisonBlock}, Cell {record.form.cellNumber}</span>
              </div>
            )}
            {record.type === 'staff' && record.form.department && (
              <div className="flex items-center gap-2">
                <Building2 size={14} />
                <span>{record.form.department}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{format(new Date(record.timestamp), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>

          {/* Local ID */}
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            ID: {record.localId}
          </p>

          {/* Error message */}
          {record.error && (
            <p className="text-xs text-destructive mt-2">{record.error}</p>
          )}
        </div>

        {/* Status and actions */}
        <div className="flex flex-col items-end gap-2">
          <StatusBadge variant={statusVariant} size="sm" />
          
          {record.status === 'failed' && onRetry && (
            <button
              onClick={() => onRetry(record.id)}
              className="text-xs text-primary font-medium hover:underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Image thumbnails indicator */}
      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Photos:</span>
        <div className="flex gap-1">
          {['front', 'left', 'right'].map((view) => (
            <div
              key={view}
              className={cn(
                'w-6 h-6 rounded text-2xs flex items-center justify-center font-medium',
                record.images[view as keyof typeof record.images]
                  ? 'bg-success/20 text-success'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {view[0].toUpperCase()}
            </div>
          ))}
        </div>
        {record.livenessVerified && (
          <span className="text-xs text-success ml-auto">✓ Liveness</span>
        )}
      </div>
    </div>
  );
}
