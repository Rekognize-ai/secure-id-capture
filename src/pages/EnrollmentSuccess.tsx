import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEnrollment } from '@/context/EnrollmentContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Check, UserPlus, Home } from 'lucide-react';

export default function EnrollmentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetEnrollment, setEnrollmentType } = useEnrollment();

  const localId = location.state?.localId || 'PES-UNKNOWN';

  // Reset enrollment state on mount
  useEffect(() => {
    resetEnrollment();
  }, [resetEnrollment]);

  const handleEnrollAnother = () => {
    setEnrollmentType('inmate');
    navigate('/enrollment-form');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <div className="text-center max-w-sm mx-auto">
        {/* Success icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-success/20 rounded-full mx-auto flex items-center justify-center">
            <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center animate-check-bounce">
              <Check size={48} className="text-success-foreground" strokeWidth={3} />
            </div>
          </div>
          
          {/* Decorative rings */}
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-success/30 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Success message */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Enrollment Completed
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Successfully
        </p>

        {/* Local ID */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <p className="text-sm text-muted-foreground mb-1">
            Temporary Local ID
          </p>
          <p className="text-xl font-mono font-bold text-primary">
            {localId}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This ID will be replaced with a permanent ID after sync
          </p>
        </div>

        {/* Info notice */}
        <div className="bg-info/10 border border-info/30 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> This enrollment has been saved locally and will be uploaded to the server when network connection is available.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <PrimaryButton
            variant="primary"
            size="xl"
            fullWidth
            icon={<UserPlus size={22} />}
            onClick={handleEnrollAnother}
          >
            Enroll Another
          </PrimaryButton>

          <PrimaryButton
            variant="ghost"
            size="lg"
            fullWidth
            icon={<Home size={20} />}
            onClick={handleBackHome}
          >
            Back to Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
