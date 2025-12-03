export type Gender = 'male' | 'female' | 'other';

export type EnrollmentType = 'inmate' | 'staff';

export type SyncStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export type CaptureView = 'front' | 'left' | 'right';

export type ImageQuality = 'good' | 'fair' | 'poor' | 'pending';

export interface CapturedImage {
  view: CaptureView;
  base64: string;
  quality: ImageQuality;
  timestamp: string;
}

export interface EnrollmentFormData {
  firstName: string;
  lastName: string;
  gender: Gender | '';
  dateOfBirth: string;
  prisonBlock: string;
  cellNumber: string;
  admissionDate: string;
  // Staff-specific fields
  employeeId?: string;
  department?: string;
  position?: string;
}

export interface EnrollmentRecord {
  id: string;
  type: EnrollmentType;
  form: EnrollmentFormData;
  images: {
    front: string | null;
    left: string | null;
    right: string | null;
  };
  imageQualities: {
    front: ImageQuality;
    left: ImageQuality;
    right: ImageQuality;
  };
  livenessVerified: boolean;
  timestamp: string;
  status: SyncStatus;
  localId: string;
  error?: string;
}

export interface EnrollmentContextType {
  currentEnrollment: Partial<EnrollmentRecord> | null;
  enrollmentType: EnrollmentType | null;
  setEnrollmentType: (type: EnrollmentType) => void;
  updateFormData: (data: Partial<EnrollmentFormData>) => void;
  addCapturedImage: (image: CapturedImage) => void;
  setLivenessVerified: (verified: boolean) => void;
  submitEnrollment: () => Promise<string>;
  resetEnrollment: () => void;
  pendingEnrollments: EnrollmentRecord[];
  refreshPendingEnrollments: () => void;
}
