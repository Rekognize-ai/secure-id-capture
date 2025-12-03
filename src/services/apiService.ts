import { EnrollmentRecord } from '@/types/enrollment';

// API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.prison-enrollment.gov',
  timeout: 30000,
};

// Simulated network delay
const simulateDelay = (ms: number = 1500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
const mockResponses = {
  success: { success: true, message: 'Operation completed successfully' },
  error: { success: false, message: 'Network error occurred' },
};

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Submit enrollment to backend
export async function submitEnrollment(record: EnrollmentRecord): Promise<ApiResponse> {
  try {
    // Simulate API call
    await simulateDelay(2000);
    
    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        data: {
          serverId: `SRV-${Date.now()}`,
          enrollmentId: record.localId,
          processedAt: new Date().toISOString(),
        },
        message: 'Enrollment submitted successfully',
      };
    } else {
      throw new Error('Server temporarily unavailable');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Sync multiple records
export async function syncRecords(records: EnrollmentRecord[]): Promise<{
  synced: string[];
  failed: { id: string; error: string }[];
}> {
  const synced: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const record of records) {
    const result = await submitEnrollment(record);
    
    if (result.success) {
      synced.push(record.id);
    } else {
      failed.push({ id: record.id, error: result.error || 'Sync failed' });
    }
  }

  return { synced, failed };
}

// Check server status
export async function checkServerStatus(): Promise<ApiResponse<{ status: string }>> {
  try {
    await simulateDelay(500);
    
    return {
      success: true,
      data: { status: 'operational' },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Unable to reach server',
    };
  }
}

// Verify identity (placeholder)
export async function verifyIdentity(imageBase64: string): Promise<ApiResponse<{
  match: boolean;
  confidence: number;
  matchedId?: string;
}>> {
  try {
    await simulateDelay(2500);
    
    // Mock response
    const hasMatch = Math.random() > 0.3;
    
    return {
      success: true,
      data: {
        match: hasMatch,
        confidence: hasMatch ? 0.85 + Math.random() * 0.14 : 0.2 + Math.random() * 0.3,
        matchedId: hasMatch ? `PES-${Date.now().toString(36).toUpperCase()}` : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Verification failed',
    };
  }
}
