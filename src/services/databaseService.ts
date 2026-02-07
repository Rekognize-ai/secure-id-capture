import { supabase } from '@/integrations/supabase/client';
import { EnrollmentRecord, SyncStatus, EnrollmentType, Gender, ImageQuality } from '@/types/enrollment';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

type DbEnrollment = Tables<'enrollments'>;
type DbEnrollmentInsert = TablesInsert<'enrollments'>;

// Convert database record to app record
function dbToAppRecord(db: DbEnrollment): EnrollmentRecord {
  return {
    id: db.id,
    localId: db.local_id,
    type: db.type as EnrollmentType,
    form: {
      firstName: db.first_name,
      lastName: db.last_name,
      gender: (db.gender || '') as Gender | '',
      dateOfBirth: db.date_of_birth || '',
      prisonBlock: db.prison_block || '',
      cellNumber: db.cell_number || '',
      admissionDate: db.admission_date || '',
      employeeId: db.employee_id || undefined,
      department: db.department || undefined,
      position: db.position || undefined,
    },
    images: {
      front: db.image_front,
      left: db.image_left,
      right: db.image_right,
    },
    imageQualities: {
      front: (db.quality_front || 'pending') as ImageQuality,
      left: (db.quality_left || 'pending') as ImageQuality,
      right: (db.quality_right || 'pending') as ImageQuality,
    },
    livenessVerified: db.liveness_verified || false,
    timestamp: db.created_at || new Date().toISOString(),
    status: (db.status || 'pending') as SyncStatus,
    error: db.error_message || undefined,
  };
}

// Convert app record to database insert
function appToDbRecord(record: EnrollmentRecord): DbEnrollmentInsert {
  return {
    local_id: record.localId,
    type: record.type,
    first_name: record.form.firstName,
    last_name: record.form.lastName,
    gender: record.form.gender || null,
    date_of_birth: record.form.dateOfBirth || null,
    prison_block: record.form.prisonBlock || null,
    cell_number: record.form.cellNumber || null,
    admission_date: record.form.admissionDate || null,
    employee_id: record.form.employeeId || null,
    department: record.form.department || null,
    position: record.form.position || null,
    image_front: record.images.front,
    image_left: record.images.left,
    image_right: record.images.right,
    quality_front: record.imageQualities.front,
    quality_left: record.imageQualities.left,
    quality_right: record.imageQualities.right,
    liveness_verified: record.livenessVerified,
    status: record.status,
    error_message: record.error || null,
  };
}

// Get all enrollment records from database
export async function getEnrollmentRecords(): Promise<EnrollmentRecord[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching enrollment records', error);
    return [];
  }

  return (data || []).map(dbToAppRecord);
}

// Save an enrollment record
export async function saveEnrollmentRecord(record: EnrollmentRecord): Promise<void> {
  // Get current user for RLS compliance
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to save enrollment records');
  }

  const dbRecord = {
    ...appToDbRecord(record),
    created_by: user.id,
  };
  
  const { error } = await supabase
    .from('enrollments')
    .upsert(dbRecord, { onConflict: 'local_id' });

  if (error) {
    logger.error('Error saving enrollment record', error);
    throw new Error('Failed to save enrollment record');
  }
}

// Update record status
export async function updateRecordStatus(id: string, status: SyncStatus, errorMsg?: string): Promise<void> {
  const updateData: { status: SyncStatus; error_message?: string | null; synced_at?: string | null } = { 
    status,
    error_message: errorMsg || null,
  };
  
  if (status === 'uploaded') {
    updateData.synced_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('enrollments')
    .update(updateData)
    .eq('id', id);

  if (error) {
    logger.error('Error updating record status', error);
  }
}

// Get pending enrollments count
export async function getPendingCount(): Promise<number> {
  const { count, error } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'failed']);

  if (error) {
    logger.error('Error getting pending count', error);
    return 0;
  }

  return count || 0;
}

// Get records by status
export async function getRecordsByStatus(status: SyncStatus): Promise<EnrollmentRecord[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching records by status', error);
    return [];
  }

  return (data || []).map(dbToAppRecord);
}

// Delete record
export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting record', error);
  }
}

// Clear images from a record after sync (security)
export async function clearRecordImages(id: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .update({
      image_front: null,
      image_left: null,
      image_right: null,
    })
    .eq('id', id);

  if (error) {
    logger.error('Error clearing record images', error);
  }
}
