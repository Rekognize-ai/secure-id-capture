import React from 'react';
import { cn } from '@/lib/utils';
import { CaptureView } from '@/types/enrollment';

interface CameraOverlayProps {
  currentView: CaptureView;
  isCapturing?: boolean;
  className?: string;
}

export function CameraOverlay({ currentView, isCapturing = false, className }: CameraOverlayProps) {
  const getViewInstructions = () => {
    switch (currentView) {
      case 'front':
        return 'Look straight at the camera';
      case 'left':
        return 'Turn your head to the left';
      case 'right':
        return 'Turn your head to the right';
    }
  };

  const getViewIcon = () => {
    switch (currentView) {
      case 'front':
        return (
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="35" cy="40" r="4" fill="currentColor" opacity="0.5" />
            <circle cx="65" cy="40" r="4" fill="currentColor" opacity="0.5" />
            <path d="M 40 60 Q 50 70 60 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          </svg>
        );
      case 'left':
        return (
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <ellipse cx="55" cy="50" rx="30" ry="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="40" cy="42" r="3" fill="currentColor" opacity="0.5" />
            <path d="M 70 50 Q 75 50 75 55 L 75 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          </svg>
        );
      case 'right':
        return (
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <ellipse cx="45" cy="50" rx="30" ry="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="60" cy="42" r="3" fill="currentColor" opacity="0.5" />
            <path d="M 30 50 Q 25 50 25 55 L 25 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          </svg>
        );
    }
  };

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Corner markers */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg" />

      {/* Face guide overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={cn(
            'w-64 h-80 text-primary/60 transition-all duration-300',
            isCapturing && 'animate-pulse-ring text-success'
          )}
        >
          {getViewIcon()}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-32 left-0 right-0 text-center">
        <p className="text-lg font-semibold text-primary-foreground bg-primary/80 mx-auto px-6 py-2 rounded-full inline-block backdrop-blur-sm">
          {getViewInstructions()}
        </p>
      </div>

      {/* Scan line animation when capturing */}
      {isCapturing && (
        <div className="absolute inset-x-20 top-20 bottom-40 overflow-hidden">
          <div 
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-success to-transparent animate-scan-line"
          />
        </div>
      )}
    </div>
  );
}
