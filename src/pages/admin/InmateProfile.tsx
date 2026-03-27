import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Calendar, Shield, FileText, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MOCK_INMATES } from '@/data/mockAdminData';
import { format } from 'date-fns';

export default function InmateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inmate = MOCK_INMATES.find(i => i.id === id);

  if (!inmate) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Record Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">The requested inmate record does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/inmates')}>
          Back to Records
        </Button>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    active: 'bg-success text-success-foreground',
    transferred: 'bg-info text-info-foreground',
    released: 'bg-warning text-warning-foreground',
    pending: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/inmates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{inmate.firstName} {inmate.lastName}</h1>
          <p className="text-sm text-muted-foreground">{inmate.inmateId}</p>
        </div>
        <Badge className={`${statusColor[inmate.status]} capitalize`}>{inmate.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="space-y-6">
          {/* Photo */}
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-muted-foreground/40" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{inmate.firstName} {inmate.lastName}</h2>
              <p className="text-sm text-muted-foreground">{inmate.inmateId}</p>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Facility Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Facility</p>
                  <p className="text-sm font-medium text-foreground">{inmate.facility}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Cell Assignment</p>
                  <p className="text-sm font-medium text-foreground">{inmate.cellBlock} · {inmate.cellNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Admission Date</p>
                  <p className="text-sm font-medium text-foreground">{format(new Date(inmate.admissionDate), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biographic Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Biographic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">First Name</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{inmate.firstName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Name</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{inmate.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{inmate.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{format(new Date(inmate.dateOfBirth), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inmate ID</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 font-mono">{inmate.inmateId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`${statusColor[inmate.status]} capitalize mt-0.5`}>{inmate.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Face Enrollment Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {['Front', 'Left Profile', 'Right Profile'].map((angle) => (
                  <div key={angle} className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center mb-2">
                      <User className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs text-muted-foreground">{angle}</p>
                    <Badge variant="secondary" className="text-2xs mt-1">Captured</Badge>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Enrollment Date</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{format(new Date(inmate.enrollmentDate), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{format(new Date(inmate.lastUpdated), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {inmate.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Notes & Remarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{inmate.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inmate.auditTrail.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.user} · {format(new Date(entry.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
