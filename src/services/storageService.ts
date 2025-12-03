import { EnrollmentRecord, SyncStatus } from '@/types/enrollment';

const STORAGE_KEY = 'prison_enrollment_records';
const FORM_DRAFT_KEY = 'prison_enrollment_draft';

// Generate a unique local ID
export function generateLocalId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `PES-${timestamp}-${randomStr}`.toUpperCase();
}

// Get all enrollment records from local storage
export function getEnrollmentRecords(): EnrollmentRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading enrollment records:', error);
    return [];
  }
}

// Save an enrollment record
export function saveEnrollmentRecord(record: EnrollmentRecord): void {
  try {
    const records = getEnrollmentRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving enrollment record:', error);
    throw new Error('Failed to save enrollment record');
  }
}

// Update record status
export function updateRecordStatus(id: string, status: SyncStatus, error?: string): void {
  try {
    const records = getEnrollmentRecords();
    const record = records.find(r => r.id === id);
    
    if (record) {
      record.status = status;
      if (error) record.error = error;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  } catch (error) {
    console.error('Error updating record status:', error);
  }
}

// Get pending enrollments count
export function getPendingCount(): number {
  const records = getEnrollmentRecords();
  return records.filter(r => r.status === 'pending' || r.status === 'failed').length;
}

// Get records by status
export function getRecordsByStatus(status: SyncStatus): EnrollmentRecord[] {
  return getEnrollmentRecords().filter(r => r.status === status);
}

// Delete record after successful sync
export function deleteRecord(id: string): void {
  try {
    const records = getEnrollmentRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting record:', error);
  }
}

// Clear images from a record after sync (security)
export function clearRecordImages(id: string): void {
  try {
    const records = getEnrollmentRecords();
    const record = records.find(r => r.id === id);
    
    if (record) {
      record.images = { front: null, left: null, right: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  } catch (error) {
    console.error('Error clearing record images:', error);
  }
}

// Draft form management
export function saveDraft(data: any): void {
  try {
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

export function getDraft(): any | null {
  try {
    const data = localStorage.getItem(FORM_DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading draft:', error);
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(FORM_DRAFT_KEY);
}
