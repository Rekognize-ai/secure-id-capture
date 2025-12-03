import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '@/context/EnrollmentContext';
import { PageHeader } from '@/components/PageHeader';
import { InputField } from '@/components/InputField';
import { Dropdown } from '@/components/Dropdown';
import { DatePicker } from '@/components/DatePicker';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Camera } from 'lucide-react';
import { EnrollmentFormData } from '@/types/enrollment';
import { format } from 'date-fns';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const departmentOptions = [
  { value: 'security', label: 'Security' },
  { value: 'administration', label: 'Administration' },
  { value: 'medical', label: 'Medical' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'education', label: 'Education' },
  { value: 'kitchen', label: 'Kitchen / Food Services' },
];

export default function EnrollmentForm() {
  const navigate = useNavigate();
  const { currentEnrollment, enrollmentType, updateFormData } = useEnrollment();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const form = (currentEnrollment?.form || {}) as Partial<EnrollmentFormData>;
  const isStaff = enrollmentType === 'staff';

  // Redirect if no enrollment type selected
  useEffect(() => {
    if (!enrollmentType) {
      navigate('/');
    }
  }, [enrollmentType, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!form.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!form.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (isStaff) {
      if (!form.employeeId?.trim()) {
        newErrors.employeeId = 'Employee ID is required';
      }
      if (!form.department) {
        newErrors.department = 'Department is required';
      }
    } else {
      if (!form.prisonBlock?.trim()) {
        newErrors.prisonBlock = 'Prison block is required';
      }
      if (!form.admissionDate) {
        newErrors.admissionDate = 'Admission date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (validateForm()) {
      navigate('/facial-capture');
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader 
        title={isStaff ? 'Staff Enrollment' : 'Inmate Enrollment'}
        subtitle="Enter personal information"
        backTo="/"
      />

      <main className="flex-1 px-4 py-6 overflow-auto">
        <div className="space-y-5 max-w-lg mx-auto">
          {/* Personal Information */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Personal Information
            </h2>

            <div className="space-y-4">
              <InputField
                label="First Name"
                value={form.firstName || ''}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                error={errors.firstName}
                placeholder="Enter first name"
                autoComplete="given-name"
              />

              <InputField
                label="Last Name"
                value={form.lastName || ''}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                error={errors.lastName}
                placeholder="Enter last name"
                autoComplete="family-name"
              />

              <Dropdown
                label="Gender"
                options={genderOptions}
                value={form.gender || ''}
                onChange={(value) => updateFormData({ gender: value as any })}
                error={errors.gender}
                placeholder="Select gender"
              />

              <DatePicker
                label="Date of Birth"
                value={form.dateOfBirth || ''}
                onChange={(value) => updateFormData({ dateOfBirth: value })}
                error={errors.dateOfBirth}
                max={today}
              />
            </div>
          </section>

          {/* Location / Assignment */}
          <section className="pt-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {isStaff ? 'Employment Details' : 'Location Details'}
            </h2>

            <div className="space-y-4">
              {isStaff ? (
                <>
                  <InputField
                    label="Employee ID"
                    value={form.employeeId || ''}
                    onChange={(e) => updateFormData({ employeeId: e.target.value })}
                    error={errors.employeeId}
                    placeholder="Enter employee ID"
                  />

                  <Dropdown
                    label="Department"
                    options={departmentOptions}
                    value={form.department || ''}
                    onChange={(value) => updateFormData({ department: value })}
                    error={errors.department}
                    placeholder="Select department"
                  />

                  <InputField
                    label="Position"
                    value={form.position || ''}
                    onChange={(e) => updateFormData({ position: e.target.value })}
                    placeholder="Enter position (optional)"
                  />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Prison Block"
                      value={form.prisonBlock || ''}
                      onChange={(e) => updateFormData({ prisonBlock: e.target.value })}
                      error={errors.prisonBlock}
                      placeholder="e.g., A"
                    />

                    <InputField
                      label="Cell Number"
                      value={form.cellNumber || ''}
                      onChange={(e) => updateFormData({ cellNumber: e.target.value })}
                      placeholder="e.g., 101"
                    />
                  </div>

                  <DatePicker
                    label="Admission Date"
                    value={form.admissionDate || ''}
                    onChange={(value) => updateFormData({ admissionDate: value })}
                    error={errors.admissionDate}
                    max={today}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom action */}
      <div className="p-4 bg-card border-t border-border safe-bottom">
        <PrimaryButton
          variant="primary"
          size="xl"
          fullWidth
          icon={<Camera size={22} />}
          onClick={handleProceed}
        >
          Proceed to Facial Capture
        </PrimaryButton>
      </div>
    </div>
  );
}
