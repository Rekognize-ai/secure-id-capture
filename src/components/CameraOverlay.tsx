import React from 'react';
import { cn } from '@/lib/utils';
import { CaptureView } from '@/types/enrollment';
import { Check, AlertCircle, ArrowLeft, ArrowRight, Focus } from 'lucide-react';

interface FaceDetectionStatus {
  isDetected: boolean;
  isWellPositioned: boolean;
  isCentered: boolean;
  isSized: boolean;
}

interface CameraOverlayProps {
  currentView: CaptureView;
  isCapturing?: boolean;
  faceStatus?: FaceDetectionStatus;
  isDetectionSupported?: boolean;
  autoCaptureProgress?: number;
  className?: string;
}

function FrontFaceIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full" aria-hidden="true">
      <ellipse cx="50" cy="55" rx="36" ry="46" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="9 4" />
      <circle cx="36" cy="44" r="4.5" fill={color} opacity="0.6" />
      <circle cx="64" cy="44" r="4.5" fill={color} opacity="0.6" />
      <path d="M 38 68 Q 50 78 62 68" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
      {/* Nose bridge hint */}
      <line x1="50" y1="50" x2="50" y2="60" stroke={color} strokeWidth="1.5" opacity="0.3" />
    </svg>
  );
}

function LeftFaceIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full" aria-hidden="true">
      {/* Profile silhouette facing left */}
      <ellipse cx="54" cy="55" rx="28" ry="44" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="9 4" />
      <circle cx="42" cy="46" r="3.5" fill={color} opacity="0.6" />
      {/* Ear hint on the right */}
      <path d="M 78 50 Q 84 50 84 56 Q 84 62 78 62" fill="none" stroke={color} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      {/* Left arrow indicator */}
      <g opacity="0.9">
        <polygon points="10,55 22,48 22,62" fill={color} />
        <line x1="22" y1="55" x2="34" y2="55" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function RightFaceIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 120" className="w-full h-full" aria-hidden="true">
      {/* Profile silhouette facing right */}
      <ellipse cx="46" cy="55" rx="28" ry="44" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="9 4" />
      <circle cx="58" cy="46" r="3.5" fill={color} opacity="0.6" />
      {/* Ear hint on the left */}
      <path d="M 22 50 Q 16 50 16 56 Q 16 62 22 62" fill="none" stroke={color} strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      {/* Right arrow indicator */}
      <g opacity="0.9">
        <polygon points="90,55 78,48 78,62" fill={color} />
        <line x1="66" y1="55" x2="78" y2="55" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const viewConfig: Record<CaptureView, {
  instruction: string;
  subInstruction: string;
  DirectionIcon: React.FC<{ className?: string }> | null;
}> = {
  front: {
    instruction: 'Look straight ahead',
    subInstruction: 'Keep your face centered and still',
    DirectionIcon: ({ className }) => <Focus size={28} className={className} />,
  },
  left: {
    instruction: 'Turn your head slowly to the left',
    subInstruction: 'Rotate until your ear faces the camera',
    DirectionIcon: ({ className }) => <ArrowLeft size={28} className={className} />,
  },
  right: {
    instruction: 'Turn your head slowly to the right',
    subInstruction: 'Rotate until your ear faces the camera',
    DirectionIcon: ({ className }) => <ArrowRight size={28} className={className} />,
  },
};

export function CameraOverlay({
  currentView,
  isCapturing = false,
  faceStatus,
  isDetectionSupported = false,
  autoCaptureProgress = 0,
  className,
}: CameraOverlayProps) {
  const isWellPositioned = faceStatus?.isWellPositioned && isDetectionSupported;
  const isDetectedButNotPositioned = faceStatus?.isDetected && !faceStatus?.isWellPositioned && isDetectionSupported;

  const faceIconColor = isWellPositioned
    ? 'hsl(var(--success))'
    : isDetectedButNotPositioned
    ? 'hsl(var(--warning))'
    : 'hsl(var(--primary) / 0.7)';

  const config = viewConfig[currentView];
  const { DirectionIcon } = config;

  const getStatusInstruction = () => {
    if (isDetectionSupported && faceStatus) {
      if (!faceStatus.isDetected) return 'Position your face in the frame';
      if (!faceStatus.isCentered) return 'Center your face in the oval';
      if (!faceStatus.isSized) return 'Move closer to the camera';
      if (isWellPositioned) return config.instruction;
    }
    return config.instruction;
  };

  const borderClass = isWellPositioned
    ? 'border-success'
    : isDetectedButNotPositioned
    ? 'border-warning'
    : 'border-primary';

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Corner bracket markers */}
      <div className={cn('absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 rounded-tl-lg transition-colors duration-300', borderClass)} />
      <div className={cn('absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 rounded-tr-lg transition-colors duration-300', borderClass)} />
      <div className={cn('absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 rounded-bl-lg transition-colors duration-300', borderClass)} />
      <div className={cn('absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 rounded-br-lg transition-colors duration-300', borderClass)} />

      {/* Face guide SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn('w-56 h-72 transition-all duration-300', isCapturing && 'animate-pulse-ring')}>
          {currentView === 'front' && <FrontFaceIcon color={faceIconColor} />}
          {currentView === 'left' && <LeftFaceIcon color={faceIconColor} />}
          {currentView === 'right' && <RightFaceIcon color={faceIconColor} />}
        </div>
      </div>

      {/* Face detection status chip */}
      {isDetectionSupported && faceStatus && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300',
              isWellPositioned
                ? 'bg-success/20 text-success'
                : faceStatus.isDetected
                ? 'bg-warning/20 text-warning'
                : 'bg-destructive/20 text-destructive',
            )}
          >
            {isWellPositioned ? (
              <>
                <Check size={18} />
                <span className="text-sm font-semibold">
                  {autoCaptureProgress > 0 ? `Hold still… ${Math.round(autoCaptureProgress)}%` : 'Perfect position!'}
                </span>
              </>
            ) : faceStatus.isDetected ? (
              <>
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">Adjust position</span>
              </>
            ) : (
              <>
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">No face detected</span>
              </>
            )}
          </div>

          {autoCaptureProgress > 0 && (
            <div className="w-48 h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${autoCaptureProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Direction indicator + instruction banner */}
      <div className="absolute bottom-28 left-0 right-0 flex flex-col items-center gap-2 px-6">
        {/* Direction arrow icon */}
        {DirectionIcon && (
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300',
              isWellPositioned ? 'bg-success/90' : 'bg-primary/90',
            )}
          >
            <DirectionIcon
              className={isWellPositioned ? 'text-success-foreground' : 'text-primary-foreground'}
            />
          </div>
        )}

        {/* Main instruction text */}
        <div className="text-center">
          <p
            className={cn(
              'text-xl font-bold px-5 py-2 rounded-full inline-block backdrop-blur-sm transition-colors duration-300',
              isWellPositioned
                ? 'bg-success/85 text-success-foreground'
                : 'bg-primary/85 text-primary-foreground',
            )}
          >
            {getStatusInstruction()}
          </p>
          <p className="mt-1 text-sm font-medium text-white drop-shadow-md">
            {config.subInstruction}
          </p>
        </div>
      </div>

      {/* Scan line when capturing */}
      {isCapturing && (
        <div className="absolute inset-x-20 top-20 bottom-40 overflow-hidden">
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-success to-transparent animate-scan-line" />
        </div>
      )}
    </div>
  );
}
