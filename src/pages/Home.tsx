import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useEnrollment } from '@/context/EnrollmentContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { UserPlus, ShieldCheck, RefreshCw, Users, Fingerprint } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { pendingEnrollments, setEnrollmentType } = useEnrollment();

  const pendingCount = pendingEnrollments.filter(
    r => r.status === 'pending' || r.status === 'failed'
  ).length;

  const handleEnrollInmate = () => {
    setEnrollmentType('inmate');
    navigate('/enrollment-form');
  };

  const handleEnrollStaff = () => {
    setEnrollmentType('staff');
    navigate('/enrollment-form');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 pt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <StatusBadge 
            variant={isOnline ? 'online' : 'offline'} 
            size="md"
          />
          {pendingCount > 0 && (
            <StatusBadge 
              variant="pending" 
              label={`${pendingCount} pending`}
              size="md"
            />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
            <Fingerprint size={36} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Prison Enrollment</h1>
            <p className="text-primary-foreground/80">System</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 -mt-6">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Enrollment Options
          </h2>

          <PrimaryButton
            variant="primary"
            size="xl"
            fullWidth
            icon={<UserPlus size={24} />}
            onClick={handleEnrollInmate}
          >
            Enroll Inmate
          </PrimaryButton>

          <PrimaryButton
            variant="outline"
            size="xl"
            fullWidth
            icon={<Users size={24} />}
            onClick={handleEnrollStaff}
          >
            Enroll Staff
          </PrimaryButton>

          <div className="pt-4 border-t border-border mt-6">
            <PrimaryButton
              variant="secondary"
              size="lg"
              fullWidth
              icon={<ShieldCheck size={22} />}
              onClick={() => navigate('/verify')}
            >
              Verify Identity
            </PrimaryButton>
          </div>
        </div>

        {/* Sync section */}
        <div className="mt-6 bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Sync Status
            </h2>
            <StatusBadge 
              variant={isOnline ? 'online' : 'offline'}
              label={isOnline ? 'Connected' : 'Offline Mode'}
              size="sm"
            />
          </div>

          {pendingCount > 0 ? (
            <p className="text-muted-foreground mb-4">
              You have <span className="font-semibold text-foreground">{pendingCount}</span> enrollment{pendingCount !== 1 ? 's' : ''} waiting to sync.
            </p>
          ) : (
            <p className="text-muted-foreground mb-4">
              All enrollments are synced.
            </p>
          )}

          <PrimaryButton
            variant="ghost"
            size="md"
            fullWidth
            icon={<RefreshCw size={18} />}
            onClick={() => navigate('/sync')}
          >
            Manage Sync ({pendingEnrollments.length} records)
          </PrimaryButton>
        </div>

        {/* Offline notice */}
        {!isOnline && (
          <div className="mt-6 bg-warning/10 border border-warning/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Offline Mode Enabled</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enrollments will be saved locally and synced when connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Prison Enrollment System v1.0
        </p>
      </footer>
    </div>
  );
}
