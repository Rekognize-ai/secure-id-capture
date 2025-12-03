import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '@/context/EnrollmentContext';
import { PageHeader } from '@/components/PageHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { User, Calendar, Building2, Check, Edit, Send, Camera, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function EnrollmentReview() {
  const navigate = useNavigate();
  const { currentEnrollment, enrollmentType, submitEnrollment } = useEnrollment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no enrollment in progress
  useEffect(() => {
    if (!currentEnrollment) {
      navigate('/');
    }
  }, [currentEnrollment, navigate]);

  if (!currentEnrollment) return null;

  const form = currentEnrollment.form || {};
  const images = currentEnrollment.images || {};
  const qualities = currentEnrollment.imageQualities || {};
  const isStaff = enrollmentType === 'staff';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const localId = await submitEnrollment();
      navigate('/enrollment-success', { state: { localId } });
    } catch (error) {
      toast.error('Failed to save enrollment. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    navigate('/enrollment-form');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not provided';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader 
        title="Review Enrollment"
        subtitle="Verify all information before submitting"
      />

      <main className="flex-1 px-4 py-6 overflow-auto">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Photos section */}
          <section className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Camera size={18} className="text-primary" />
              <h2 className="font-semibold text-foreground">Captured Photos</h2>
            </div>

            <div className="flex justify-center gap-3">
              {(['front', 'left', 'right'] as const).map((view) => (
                <div key={view} className="text-center">
                  <div className={cn(
                    'w-20 h-24 rounded-lg overflow-hidden border-2 mb-2',
                    images[view] ? 'border-success' : 'border-muted'
                  )}>
                    {images[view] ? (
                      <img 
                        src={images[view]!} 
                        alt={`${view} view`}
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Camera size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{view}</p>
                  {qualities[view] && qualities[view] !== 'pending' && (
                    <StatusBadge 
                      variant={qualities[view] === 'good' ? 'success' : qualities[view] === 'fair' ? 'warning' : 'failed'}
                      label={qualities[view]}
                      size="sm"
                      showIcon={false}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Liveness status */}
          <section className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h2 className="font-semibold text-foreground">Liveness Check</h2>
              </div>
              <StatusBadge 
                variant={currentEnrollment.livenessVerified ? 'success' : 'warning'}
                label={currentEnrollment.livenessVerified ? 'Verified' : 'Not Verified'}
              />
            </div>
          </section>

          {/* Personal information */}
          <section className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-primary" />
              <h2 className="font-semibold text-foreground">Personal Information</h2>
            </div>

            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Full Name</dt>
                <dd className="font-medium text-foreground">
                  {form.firstName} {form.lastName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gender</dt>
                <dd className="font-medium text-foreground capitalize">
                  {form.gender || 'Not provided'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date of Birth</dt>
                <dd className="font-medium text-foreground">
                  {formatDate(form.dateOfBirth || '')}
                </dd>
              </div>
            </dl>
          </section>

          {/* Location / Employment details */}
          <section className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-4">
              {isStaff ? (
                <Building2 size={18} className="text-primary" />
              ) : (
                <Building2 size={18} className="text-primary" />
              )}
              <h2 className="font-semibold text-foreground">
                {isStaff ? 'Employment Details' : 'Location Details'}
              </h2>
            </div>

            <dl className="space-y-3">
              {isStaff ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Employee ID</dt>
                    <dd className="font-medium text-foreground">
                      {form.employeeId || 'Not provided'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Department</dt>
                    <dd className="font-medium text-foreground capitalize">
                      {form.department || 'Not provided'}
                    </dd>
                  </div>
                  {form.position && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Position</dt>
                      <dd className="font-medium text-foreground">
                        {form.position}
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Prison Block</dt>
                    <dd className="font-medium text-foreground">
                      Block {form.prisonBlock || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cell Number</dt>
                    <dd className="font-medium text-foreground">
                      {form.cellNumber || 'Not assigned'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Admission Date</dt>
                    <dd className="font-medium text-foreground">
                      {formatDate(form.admissionDate || '')}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>
        </div>
      </main>

      {/* Actions */}
      <div className="p-4 bg-card border-t border-border safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <PrimaryButton
            variant="outline"
            size="lg"
            icon={<Edit size={18} />}
            onClick={handleEdit}
            className="flex-1"
          >
            Edit Info
          </PrimaryButton>
          
          <PrimaryButton
            variant="primary"
            size="lg"
            icon={<Send size={18} />}
            onClick={handleSubmit}
            loading={isSubmitting}
            className="flex-[2]"
          >
            Submit Enrollment
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
