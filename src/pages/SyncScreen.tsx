import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useEnrollment } from '@/context/EnrollmentContext';
import { PageHeader } from '@/components/PageHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { SyncCard } from '@/components/SyncCard';
import { syncRecords } from '@/services/apiService';
import { updateRecordStatus, clearRecordImages, deleteRecord } from '@/services/databaseService';
import { RefreshCw, CloudOff, Cloud, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SyncScreen() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const { pendingEnrollments, refreshPendingEnrollments } = useEnrollment();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Refresh on mount
  useEffect(() => {
    refreshPendingEnrollments();
  }, [refreshPendingEnrollments]);

  const pendingCount = pendingEnrollments.filter(r => r.status === 'pending').length;
  const failedCount = pendingEnrollments.filter(r => r.status === 'failed').length;
  const uploadedCount = pendingEnrollments.filter(r => r.status === 'uploaded').length;

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('No network connection. Please connect to the internet and try again.');
      return;
    }

    const recordsToSync = pendingEnrollments.filter(
      r => r.status === 'pending' || r.status === 'failed'
    );

    if (recordsToSync.length === 0) {
      toast.info('No records to sync');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    // Mark all as uploading
    await Promise.all(recordsToSync.map(record => 
      updateRecordStatus(record.id, 'uploading')
    ));
    await refreshPendingEnrollments();

    try {
      const { synced, failed } = await syncRecords(recordsToSync);

      // Update progress
      const total = synced.length + failed.length;
      setSyncProgress(100);

      // Update statuses
      await Promise.all([
        ...synced.map(async (id) => {
          await updateRecordStatus(id, 'uploaded');
          // Security: Clear images after successful sync
          await clearRecordImages(id);
        }),
        ...failed.map(({ id, error }) => 
          updateRecordStatus(id, 'failed', error)
        )
      ]);

      await refreshPendingEnrollments();

      if (synced.length > 0) {
        toast.success(`Successfully synced ${synced.length} enrollment(s)`);
      }
      if (failed.length > 0) {
        toast.error(`${failed.length} enrollment(s) failed to sync`);
      }
    } catch (error) {
      toast.error('Sync failed. Please try again.');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleRetry = async (id: string) => {
    const record = pendingEnrollments.find(r => r.id === id);
    if (!record) return;

    await updateRecordStatus(id, 'uploading');
    await refreshPendingEnrollments();

    const { synced, failed } = await syncRecords([record]);

    if (synced.length > 0) {
      await updateRecordStatus(id, 'uploaded');
      await clearRecordImages(id);
      toast.success('Record synced successfully');
    } else {
      await updateRecordStatus(id, 'failed', failed[0]?.error);
      toast.error('Sync failed');
    }

    await refreshPendingEnrollments();
  };

  const handleClearUploaded = async () => {
    const uploadedRecords = pendingEnrollments.filter(r => r.status === 'uploaded');
    await Promise.all(uploadedRecords.map(record => deleteRecord(record.id)));
    await refreshPendingEnrollments();
    toast.success('Cleared uploaded records');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader 
        title="Sync Records"
        subtitle={`${pendingEnrollments.length} total records`}
        backTo="/"
        rightElement={
          <StatusBadge 
            variant={isOnline ? 'online' : 'offline'}
            size="sm"
          />
        }
      />

      <main className="flex-1 px-4 py-6 overflow-auto">
        {/* Network status card */}
        <div className={`rounded-xl p-4 mb-6 ${isOnline ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-success/20' : 'bg-warning/20'}`}>
              {isOnline ? <Wifi size={20} className="text-success" /> : <WifiOff size={20} className="text-warning" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isOnline ? 'Connected' : 'Offline Mode'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isOnline 
                  ? 'Ready to sync records to server' 
                  : 'Records will sync when connection is restored'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-success">{uploadedCount}</p>
            <p className="text-xs text-muted-foreground">Uploaded</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-destructive">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>

        {/* Sync progress */}
        {isSyncing && (
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Syncing...</span>
              <span className="text-sm text-muted-foreground">{syncProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Records list */}
        {pendingEnrollments.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">All Records</h2>
              {uploadedCount > 0 && (
                <button 
                  onClick={handleClearUploaded}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear uploaded
                </button>
              )}
            </div>
            
            {pendingEnrollments.map(record => (
              <SyncCard 
                key={record.id} 
                record={record} 
                onRetry={handleRetry}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">All Synced</h3>
            <p className="text-muted-foreground">No pending enrollments</p>
          </div>
        )}
      </main>

      {/* Actions */}
      <div className="p-4 bg-card border-t border-border safe-bottom">
        <PrimaryButton
          variant="primary"
          size="xl"
          fullWidth
          icon={<RefreshCw size={22} />}
          onClick={handleSync}
          loading={isSyncing}
          disabled={!isOnline || (pendingCount === 0 && failedCount === 0)}
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </PrimaryButton>
      </div>
    </div>
  );
}
