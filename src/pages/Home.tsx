import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useEnrollment } from '@/context/EnrollmentContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { UserPlus, ShieldCheck, RefreshCw, Users, Fingerprint, LogOut, UserCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { pendingEnrollments, setEnrollmentType } = useEnrollment();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [officerName, setOfficerName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();
      if (data) {
        const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
        setOfficerName(name || null);
      }
    }
    fetchProfile();
  }, [user]);

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      navigate('/auth', { replace: true });
    }
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
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <StatusBadge 
                variant="pending" 
                label={`${pendingCount} pending`}
                size="md"
              />
            )}
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Settings size={20} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <UserCircle size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
            <Fingerprint size={36} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {officerName ? `Welcome, ${officerName}` : 'Prison Enrollment'}
            </h1>
            <p className="text-primary-foreground/80">Enrollment System</p>
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
