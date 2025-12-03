import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '@/hooks/useCamera';
import { PageHeader } from '@/components/PageHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CameraOverlay } from '@/components/CameraOverlay';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Search, RotateCcw, Check, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type VerificationState = 'capture' | 'processing' | 'match' | 'no-match';

interface VerificationResult {
  match: boolean;
  confidence: number;
  matchedId?: string | null;
  matchedName?: string | null;
}

export default function VerifyIdentity() {
  const navigate = useNavigate();
  const { videoRef, isReady, isLoading, error, startCamera, captureImage, switchCamera } = useCamera();
  
  const [state, setState] = useState<VerificationState>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    startCamera();
  }, []);

  const handleCapture = async () => {
    const base64 = captureImage();
    if (!base64) return;

    setCapturedImage(base64);
    setState('processing');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-identity', {
        body: { imageBase64: base64 }
      });
      
      if (fnError) {
        throw new Error(fnError.message || 'Verification failed');
      }
      
      if (data?.success && data?.data) {
        setResult(data.data);
        setState(data.data.match ? 'match' : 'no-match');
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setState('no-match');
      setResult({ match: false, confidence: 0 });
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
    setState('capture');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader 
        title="Verify Identity"
        subtitle="Scan face to verify enrollment"
        backTo="/"
        rightElement={
          state === 'capture' && (
            <button
              onClick={switchCamera}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Switch camera"
            >
              <RotateCcw size={20} />
            </button>
          )
        }
      />

      <main className="flex-1 flex flex-col">
        {/* Camera / Result view */}
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
          ) : capturedImage ? (
            // Show captured image with result
            <div className="absolute inset-0">
              <img 
                src={capturedImage} 
                alt="Captured for verification"
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 bg-black/50" />

              {/* Result overlay */}
              {state === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-primary-foreground">
                    <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-xl font-semibold">Searching database...</p>
                    <p className="text-sm opacity-80">Please wait</p>
                  </div>
                </div>
              ) : state === 'match' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-card/95 backdrop-blur rounded-2xl p-8 max-w-sm mx-4 text-center">
                    <div className="w-20 h-20 bg-success rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Check size={40} className="text-success-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-success mb-2">Match Found</h2>
                    <p className="text-muted-foreground mb-4">
                      Identity verified successfully
                    </p>
                    
                    {result && (
                      <div className="bg-muted rounded-lg p-4 space-y-2">
                        {result.matchedName && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-semibold text-foreground">
                              {result.matchedName}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-semibold text-foreground">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        {result.matchedId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ID</span>
                            <span className="font-mono font-semibold text-foreground">
                              {result.matchedId}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-card/95 backdrop-blur rounded-2xl p-8 max-w-sm mx-4 text-center">
                    <div className="w-20 h-20 bg-destructive rounded-full mx-auto mb-4 flex items-center justify-center">
                      <X size={40} className="text-destructive-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-destructive mb-2">No Match</h2>
                    <p className="text-muted-foreground mb-4">
                      No matching enrollment found in the system
                    </p>
                    
                    {result && (
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-semibold text-foreground">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Live camera view
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-primary-foreground">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}

              {isReady && (
                <CameraOverlay currentView="front" />
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-card border-t border-border safe-bottom">
          {state === 'capture' ? (
            <PrimaryButton
              variant="primary"
              size="xl"
              fullWidth
              icon={<Search size={24} />}
              onClick={handleCapture}
              disabled={!isReady || isLoading}
            >
              Capture & Verify
            </PrimaryButton>
          ) : state === 'processing' ? (
            <PrimaryButton
              variant="secondary"
              size="xl"
              fullWidth
              disabled
              loading
            >
              Processing...
            </PrimaryButton>
          ) : (
            <div className="flex gap-3">
              <PrimaryButton
                variant="outline"
                size="lg"
                icon={<ArrowLeft size={18} />}
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Home
              </PrimaryButton>
              <PrimaryButton
                variant="primary"
                size="lg"
                icon={<RefreshCw size={18} />}
                onClick={handleReset}
                className="flex-[2]"
              >
                Verify Another
              </PrimaryButton>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
