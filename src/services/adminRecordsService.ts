import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type AdminRecord = {
  id: string;
  localId: string;
  type: 'inmate' | 'staff';
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string | null;
  prisonBlock: string | null;
  cellNumber: string | null;
  admissionDate: string | null;
  department: string | null;
  position: string | null;
  employeeId: string | null;
  status: string;
  livenessVerified: boolean;
  imageFront: string | null;
  imageLeft: string | null;
  imageRight: string | null;
  qualityFront: string;
  qualityLeft: string;
  qualityRight: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
};

const SELECT_COLUMNS =
  'id, local_id, type, first_name, last_name, gender, date_of_birth, prison_block, cell_number, admission_date, department, position, employee_id, status, liveness_verified, image_front, image_left, image_right, quality_front, quality_left, quality_right, created_at, updated_at, synced_at';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): AdminRecord {
  return {
    id: row.id,
    localId: row.local_id,
    type: row.type,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender || '',
    dateOfBirth: row.date_of_birth,
    prisonBlock: row.prison_block,
    cellNumber: row.cell_number,
    admissionDate: row.admission_date,
    department: row.department,
    position: row.position,
    employeeId: row.employee_id,
    status: row.status || 'pending',
    livenessVerified: !!row.liveness_verified,
    imageFront: row.image_front,
    imageLeft: row.image_left,
    imageRight: row.image_right,
    qualityFront: row.quality_front || 'pending',
    qualityLeft: row.quality_left || 'pending',
    qualityRight: row.quality_right || 'pending',
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    syncedAt: row.synced_at,
  };
}

// Fetch all enrollment records visible to the signed-in admin/officer
export async function fetchAdminRecords(): Promise<AdminRecord[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching admin records', error);
    throw new Error('Unable to load records from the database.');
  }

  return (data || []).map(mapRow);
}

// Fetch a single record by database id
export async function fetchAdminRecord(id: string): Promise<AdminRecord | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select(SELECT_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    logger.error('Error fetching admin record', error);
    throw new Error('Unable to load this record from the database.');
  }

  return data ? mapRow(data) : null;
}
