import { getEnrollmentRecords, clearRecordImages } from '@/services/storageService';

const IMAGE_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clears biometric images from localStorage records that are:
 * - Older than 24 hours, OR
 * - Already successfully synced (status === 'uploaded')
 *
 * This prevents sensitive biometric data from persisting
 * indefinitely in the browser.
 */
export function cleanupExpiredImages(): void {
  try {
    const records = getEnrollmentRecords();
    const cutoff = Date.now() - IMAGE_RETENTION_MS;

    records.forEach(record => {
      const hasImages = record.images.front || record.images.left || record.images.right;
      if (!hasImages) return;

      const recordTime = new Date(record.timestamp).getTime();
      const isExpired = recordTime < cutoff;
      const isSynced = record.status === 'uploaded';

      if (isExpired || isSynced) {
        clearRecordImages(record.id);
      }
    });
  } catch {
    // Fail silently - cleanup is best-effort
  }
}
