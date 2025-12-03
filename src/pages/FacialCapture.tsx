import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '@/context/EnrollmentContext';
import { useCamera } from '@/hooks/useCamera';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { PageHeader } from '@/components/PageHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CameraOverlay } from '@/components/CameraOverlay';
import { StatusBadge } from '@/components/StatusBadge';
import { CaptureView, ImageQuality } from '@/types/enrollment';
import { Camera, RotateCcw, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const captureSteps: { view: CaptureView; label: string }[] = [
  { view: 'front', label: 'Front View' },
  { view: 'left', label: 'Left Profile' },
  { view: 'right', label: 'Right Profile' },
];

// Simulate image quality assessment - boost quality if face was well positioned
function assessImageQuality(wasWellPositioned: boolean): ImageQuality {
  if (wasWellPositioned) {
    return Math.random() > 0.1 ? 'good' : 'fair';
  }
  const random = Math.random();
  if (random > 0.3) return 'good';
  if (random > 0.1) return 'fair';
  return 'poor';
}

export default function FacialCapture() {
  const navigate = useNavigate();
  const { currentEnrollment, addCapturedImage } = useEnrollment();
  const { videoRef, isReady, isLoading, error, startCamera, captureImage, switchCamera } = useCamera();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<Record<CaptureView, { base64: string; quality: ImageQuality } | null>>({
    front: null,
    left: null,
    right: null,
  });
  const [isCapturing, setIsCapturing] = useState(false);

  const currentView = captureSteps[currentStep].view;
  const currentCapture = capturedImages[currentView];

  // Face detection - only enabled when camera is ready and no capture for current view
  const { facePosition, isSupported: isFaceDetectionSupported } = useFaceDetection({
    videoRef,
    enabled: isReady && !currentCapture,
  });

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

  const allCaptured = Object.values(capturedImages).every(img => img !== null);

  const handleCapture = async () => {
    setIsCapturing(true);
    
    // Simulate capture delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const base64 = captureImage();
    if (base64) {
      const quality = assessImageQuality(facePosition.isWellPositioned);
      
      setCapturedImages(prev => ({
        ...prev,
        [currentView]: { base64, quality },
      }));

      addCapturedImage({
        view: currentView,
        base64,
        quality,
        timestamp: new Date().toISOString(),
      });

      // Auto-advance to next step if quality is acceptable
      if ((quality === 'good' || quality === 'fair') && currentStep < captureSteps.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 1000);
      }
    }
    
    setIsCapturing(false);
  };

  const handleRetake = () => {
    setCapturedImages(prev => ({
      ...prev,
      [currentView]: null,
    }));
  };

  const handleProceed = () => {
    navigate('/liveness-check');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader 
        title="Facial Capture"
        subtitle={`Step ${currentStep + 1} of ${captureSteps.length}`}
        rightElement={
          <button
            onClick={switchCamera}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Switch camera"
          >
            <RotateCcw size={20} />
          </button>
        }
      />

      <main className="flex-1 flex flex-col">
        {/* Camera view */}
        <div className="relative flex-1 bg-black overflow-hidden">
        {/* Always render video element to keep stream attached */}
          <video
            ref={videoRef}
            className={cn(
              "w-full h-full object-cover",
              currentCapture && "hidden"
            )}
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
          />

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-destructive mb-4">{error}</p>
                <PrimaryButton variant="outline" onClick={startCamera}>
                  Retry Camera
                </PrimaryButton>
              </div>
            </div>
          ) : currentCapture ? (
            // Show captured image overlay
            <div className="absolute inset-0">
              <img 
                src={currentCapture.base64} 
                alt={`Captured ${currentView} view`}
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 bg-black/30" />
              
              {/* Quality indicator */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <StatusBadge 
                  variant={currentCapture.quality === 'good' ? 'success' : currentCapture.quality === 'fair' ? 'warning' : 'failed'}
                  label={currentCapture.quality === 'good' ? 'Good Quality' : currentCapture.quality === 'fair' ? 'Fair - Acceptable' : 'Poor - Retry'}
                  size="lg"
                />
              </div>
            </div>
          ) : (
            // Live camera overlay
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-primary-foreground">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}

              {isReady && (
                <CameraOverlay 
                  currentView={currentView} 
                  isCapturing={isCapturing}
                  faceStatus={facePosition}
                  isDetectionSupported={isFaceDetectionSupported}
                />
              )}
            </>
          )}
        </div>

        {/* Step indicators */}
        <div className="bg-card border-t border-border px-4 py-3">
          <div className="flex justify-center gap-2 mb-3">
            {captureSteps.map((step, index) => {
              const capture = capturedImages[step.view];
              const isActive = index === currentStep;
              const isComplete = capture !== null;
              
              return (
                <button
                  key={step.view}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    !isActive && isComplete && 'bg-success/20'
                  )}
                >
                  {isComplete ? (
                    <Check size={16} className={isActive ? 'text-primary-foreground' : 'text-success'} />
                  ) : (
                    <span className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs',
                      isActive ? 'border-primary-foreground' : 'border-muted-foreground'
                    )}>
                      {index + 1}
                    </span>
                  )}
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-2">
            {captureSteps.map((step) => {
              const capture = capturedImages[step.view];
              return (
                <div
                  key={step.view}
                  className={cn(
                    'w-16 h-20 rounded-lg overflow-hidden border-2',
                    capture ? 'border-success' : 'border-muted bg-muted'
                  )}
                >
                  {capture ? (
                    <img 
                      src={capture.base64} 
                      alt={step.label}
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Camera size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-card border-t border-border safe-bottom space-y-3">
          {currentCapture ? (
            <div className="flex gap-3">
              <PrimaryButton
                variant="outline"
                size="lg"
                fullWidth
                icon={<RotateCcw size={20} />}
                onClick={handleRetake}
              >
                Retake
              </PrimaryButton>
              
              {currentStep < captureSteps.length - 1 ? (
                <PrimaryButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Next
                </PrimaryButton>
              ) : allCaptured && (
                <PrimaryButton
                  variant="success"
                  size="lg"
                  fullWidth
                  icon={<Check size={20} />}
                  onClick={handleProceed}
                >
                  Proceed
                </PrimaryButton>
              )}
            </div>
          ) : (
            <PrimaryButton
              variant="primary"
              size="xl"
              fullWidth
              icon={<Camera size={24} />}
              onClick={handleCapture}
              loading={isCapturing}
              disabled={!isReady || isLoading}
            >
              Capture {captureSteps[currentStep].label}
            </PrimaryButton>
          )}
        </div>
      </main>
    </div>
  );
}
