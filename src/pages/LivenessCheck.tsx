import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '@/context/EnrollmentContext';
import { useCamera } from '@/hooks/useCamera';
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

  // Redirect if no enrollment in progress
  useEffect(() => {
    if (!currentEnrollment) {
      navigate('/');
    }
  }, [currentEnrollment, navigate]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  }, []);

  // Simulate liveness detection progress
  const simulateLivenessDetection = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }

    // Move to next step
    if (currentStep === 'blink') {
      setCurrentStep('turn');
      setProgress(0);
      setIsProcessing(false);
    } else if (currentStep === 'turn') {
      setCurrentStep('complete');
      setLivenessVerified(true);
      setIsProcessing(false);
    }
  }, [currentStep, setLivenessVerified]);

  // Auto-start detection when camera is ready
  useEffect(() => {
    if (isReady && currentStep !== 'complete' && !isProcessing) {
      const timer = setTimeout(() => {
        simulateLivenessDetection();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isReady, currentStep, isProcessing, simulateLivenessDetection]);

  const handleContinue = () => {
    navigate('/enrollment-review');
  };

  const handleRetry = () => {
    setCurrentStep('blink');
    setProgress(0);
  };

  const Icon = instructions[currentStep].icon;

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
