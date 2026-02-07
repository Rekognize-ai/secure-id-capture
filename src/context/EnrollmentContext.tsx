import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  EnrollmentRecord, 
  EnrollmentFormData, 
  EnrollmentType, 
  CapturedImage,
  EnrollmentContextType 
} from '@/types/enrollment';
import { 
  saveEnrollmentRecord as saveToDb, 
  getEnrollmentRecords as getFromDb,
} from '@/services/databaseService';
import { 
  generateLocalId,
  saveDraft,
  getDraft,
  clearDraft 
} from '@/services/storageService';
import { logger } from '@/lib/logger';

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

const initialFormData: EnrollmentFormData = {
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  prisonBlock: '',
  cellNumber: '',
  admissionDate: '',
  employeeId: '',
  department: '',
  position: '',
};

export function EnrollmentProvider({ children }: { children: React.ReactNode }) {
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType | null>(null);
  const [currentEnrollment, setCurrentEnrollment] = useState<Partial<EnrollmentRecord> | null>(null);
  const [pendingEnrollments, setPendingEnrollments] = useState<EnrollmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load pending enrollments on mount
  useEffect(() => {
    refreshPendingEnrollments();
  }, []);

  // Restore draft on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      setCurrentEnrollment(draft.enrollment);
      setEnrollmentType(draft.type);
    }
  }, []);

  // Auto-save draft when enrollment changes
  useEffect(() => {
    if (currentEnrollment && enrollmentType) {
      saveDraft({ enrollment: currentEnrollment, type: enrollmentType });
    }
  }, [currentEnrollment, enrollmentType]);

  const refreshPendingEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await getFromDb();
      setPendingEnrollments(records);
    } catch (error) {
      logger.error('Error refreshing enrollments', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetEnrollmentType = useCallback((type: EnrollmentType) => {
    setEnrollmentType(type);
    setCurrentEnrollment({
      id: generateLocalId(),
      type,
      form: { ...initialFormData },
      images: { front: null, left: null, right: null },
      imageQualities: { front: 'pending', left: 'pending', right: 'pending' },
      livenessVerified: false,
      timestamp: new Date().toISOString(),
      status: 'pending',
      localId: generateLocalId(),
    });
  }, []);

  const updateFormData = useCallback((data: Partial<EnrollmentFormData>) => {
    setCurrentEnrollment(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        form: { ...prev.form, ...data } as EnrollmentFormData,
      };
    });
  }, []);

  const addCapturedImage = useCallback((image: CapturedImage) => {
    setCurrentEnrollment(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        images: {
          ...prev.images,
          [image.view]: image.base64,
        },
        imageQualities: {
          ...prev.imageQualities,
          [image.view]: image.quality,
        },
      };
    });
  }, []);

  const setLivenessVerified = useCallback((verified: boolean) => {
    setCurrentEnrollment(prev => {
      if (!prev) return prev;
      return { ...prev, livenessVerified: verified };
    });
  }, []);

  const submitEnrollment = useCallback(async (): Promise<string> => {
    if (!currentEnrollment || !enrollmentType) {
      throw new Error('No enrollment in progress');
    }

    const record: EnrollmentRecord = {
      id: currentEnrollment.id || generateLocalId(),
      type: enrollmentType,
      form: currentEnrollment.form as EnrollmentFormData,
      images: currentEnrollment.images as { front: string | null; left: string | null; right: string | null },
      imageQualities: currentEnrollment.imageQualities as { front: any; left: any; right: any },
      livenessVerified: currentEnrollment.livenessVerified || false,
      timestamp: new Date().toISOString(),
      status: 'pending',
      localId: currentEnrollment.localId || generateLocalId(),
    };

    await saveToDb(record);
    clearDraft();
    await refreshPendingEnrollments();
    
    return record.localId;
  }, [currentEnrollment, enrollmentType, refreshPendingEnrollments]);

  const resetEnrollment = useCallback(() => {
    setCurrentEnrollment(null);
    setEnrollmentType(null);
    clearDraft();
  }, []);

  return (
    <EnrollmentContext.Provider
      value={{
        currentEnrollment,
        enrollmentType,
        setEnrollmentType: handleSetEnrollmentType,
        updateFormData,
        addCapturedImage,
        setLivenessVerified,
        submitEnrollment,
        resetEnrollment,
        pendingEnrollments,
        refreshPendingEnrollments,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}
