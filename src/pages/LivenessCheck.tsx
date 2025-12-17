import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '@/context/EnrollmentContext';
import { useCamera } from '@/hooks/useCamera';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { PageHeader } from '@/components/PageHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Eye, MoveHorizontal, Check, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LivenessStep = 'blink' | 'turn' | 'complete';

const instructions: Record<LivenessStep, { icon: React.ElementType; text: string; subtext: string }> = {
  blink: {
    icon: Eye,
    text: 'Blink Your Eyes',
    subtext: 'Slowly blink 2-3 times while looking at the camera',
  },
  turn: {
    icon: MoveHorizontal,
    text: 'Turn Your Head',
    subtext: 'Slowly turn your head left and right',
  },
  complete: {
    icon: Check,
    text: 'Liveness Verified',
    subtext: 'Your identity has been confirmed',
  },
};

export default function LivenessCheck() {
  const navigate = useNavigate();
  const { currentEnrollment, setLivenessVerified } = useEnrollment();
  const { videoRef, isReady, startCamera, error } = useCamera();

  const [currentStep, setCurrentStep] = useState<LivenessStep>('blink');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { facePosition, isSupported } = useFaceDetection({
    videoRef,
    enabled: isReady && !error && currentStep !== 'complete',
  });

  const faceRef = useRef(facePosition);
  useEffect(() => {
    faceRef.current = facePosition;
  }, [facePosition]);

  const stepRef = useRef<LivenessStep>(currentStep);
  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  const progressRef = useRef(0);
  const lookStartRef = useRef<number | null>(null);
  const turnSeenRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Redirect if no enrollment in progress
  useEffect(() => {
    if (!currentEnrollment) {
      navigate('/');
    }
  }, [currentEnrollment, navigate]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Liveness engine (basic): require a stable forward-facing face, then left+right movement
  useEffect(() => {
    if (!isReady || !!error) return;
    if (!isSupported) return;

    const LOOK_STRAIGHT_MS = 1800;
    const TURN_LEFT_THRESHOLD = 0.35;
    const TURN_RIGHT_THRESHOLD = 0.65;

    const id = window.setInterval(() => {
      const step = stepRef.current;
      if (step === 'complete') return;

      const fp = faceRef.current;

      const setProgressIfChanged = (next: number) => {
        const clamped = Math.max(0, Math.min(100, next));
        if (Math.abs(clamped - progressRef.current) >= 1) {
          progressRef.current = clamped;
          setProgress(clamped);
        }
      };

      if (step === 'blink') {
        const isFacingLikely =
          !!fp.boundingBox &&
          fp.boundingBox.width / Math.max(1e-6, fp.boundingBox.height) > 0.55;

        if (!fp.isWellPositioned || !isFacingLikely) {
          lookStartRef.current = null;
          setIsProcessing(false);
          setProgressIfChanged(0);
          return;
        }

        setIsProcessing(true);

        if (lookStartRef.current === null) {
          lookStartRef.current = Date.now();
        }

        const elapsed = Date.now() - lookStartRef.current;
        setProgressIfChanged((elapsed / LOOK_STRAIGHT_MS) * 100);

        if (progressRef.current >= 100) {
          lookStartRef.current = null;
          turnSeenRef.current = { left: false, right: false };
          setIsProcessing(false);
          setProgress(0);
          progressRef.current = 0;
          setCurrentStep('turn');
        }
        return;
      }

      if (step === 'turn') {
        if (!fp.isDetected || !fp.boundingBox) {
          setIsProcessing(false);
          setProgressIfChanged(0);
          turnSeenRef.current = { left: false, right: false };
          return;
        }

        setIsProcessing(true);

        const centerX = fp.boundingBox.x + fp.boundingBox.width / 2;
        if (centerX < TURN_LEFT_THRESHOLD) {
          turnSeenRef.current.left = true;
        }
        if (centerX > TURN_RIGHT_THRESHOLD) {
          turnSeenRef.current.right = true;
        }

        const nextProgress =
          ((turnSeenRef.current.left ? 1 : 0) + (turnSeenRef.current.right ? 1 : 0)) * 50;

        setProgressIfChanged(nextProgress);

        if (nextProgress >= 100) {
          setIsProcessing(false);
          setCurrentStep('complete');
          setLivenessVerified(true);
        }
      }
    }, 120);

    return () => window.clearInterval(id);
  }, [isReady, error, isSupported, setLivenessVerified]);

  const handleContinue = () => {
    navigate('/enrollment-review');
  };

  const handleRetry = () => {
    lookStartRef.current = null;
    turnSeenRef.current = { left: false, right: false };
    progressRef.current = 0;

    setIsProcessing(false);
    setCurrentStep('blink');
    setProgress(0);
  };

  const Icon = instructions[currentStep].icon;

  const isFacingLikely =
    !!facePosition.boundingBox &&
    facePosition.boundingBox.width / Math.max(1e-6, facePosition.boundingBox.height) > 0.55;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader 
        title="Liveness Check"
        subtitle="Verify you are a real person"
      />

      <main className="flex-1 flex flex-col">
        {/* Camera view */}
        <div className="relative flex-1 bg-black overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-destructive mb-4">{error}</p>
                <PrimaryButton variant="outline" onClick={startCamera}>
                  Retry Camera
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

              {/* Face guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  'w-64 h-80 border-4 rounded-[50%] transition-all duration-500',
                  currentStep === 'complete' 
                    ? 'border-success bg-success/10' 
                    : isProcessing 
                      ? 'border-info animate-pulse' 
                      : 'border-primary/60'
                )}>
                  {currentStep === 'complete' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center animate-check-bounce">
                        <Check size={40} className="text-success-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <div className="bg-card/95 backdrop-blur rounded-2xl p-6 max-w-sm mx-auto">
                  <div className={cn(
                    'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                    currentStep === 'complete' ? 'bg-success' : 'bg-primary'
                  )}>
                    <Icon size={32} className={currentStep === 'complete' ? 'text-success-foreground' : 'text-primary-foreground'} />
                  </div>
                  
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {instructions[currentStep].text}
                  </h2>
                  <p className="text-muted-foreground">
                    {instructions[currentStep].subtext}
                  </p>

                  {currentStep !== 'complete' && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {!isSupported
                        ? 'Liveness checks are not supported on this device/browser.'
                        : !facePosition.isDetected
                          ? 'No face detected — look directly at the camera.'
                          : currentStep === 'blink' && (!facePosition.isWellPositioned || !isFacingLikely)
                            ? 'Look straight at the camera and center your face in the oval.'
                            : currentStep === 'turn' && progress < 100
                              ? 'Turn left, then right until the bar completes.'
                              : 'Hold still…'}
                    </p>
                  )}

                  {/* Progress bar */}
                  {isProcessing && currentStep !== 'complete' && (
                    <div className="mt-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-200 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-card border-t border-border safe-bottom">
          {currentStep === 'complete' ? (
            <PrimaryButton
              variant="success"
              size="xl"
              fullWidth
              icon={<ArrowRight size={22} />}
              iconPosition="right"
              onClick={handleContinue}
            >
              Continue to Review
            </PrimaryButton>
          ) : (
            <PrimaryButton
              variant="ghost"
              size="lg"
              fullWidth
              icon={<RefreshCw size={18} />}
              onClick={handleRetry}
              disabled={isProcessing}
            >
              Start Over
            </PrimaryButton>
          )}
        </div>
      </main>
    </div>
  );
}
