import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, CalendarDays, ScanFace, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { MOCK_INMATES, FACILITIES } from '@/data/mockAdminData';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardOverview() {
  const [dateRange, setDateRange] = useState('30');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const filtered = useMemo(() => {
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return MOCK_INMATES.filter(i => {
      const dateOk = new Date(i.enrollmentDate) >= cutoff;
      const facilityOk = facilityFilter === 'all' || i.facility === facilityFilter;
      return dateOk && facilityOk;
    });
  }, [dateRange, facilityFilter]);

  const stats = useMemo(() => ({
    totalEnrolled: MOCK_INMATES.length,
    totalFacilities: FACILITIES.length,
    thisMonth: filtered.length,
    today: MOCK_INMATES.filter(i => {
      const d = startOfDay(new Date());
      return new Date(i.enrollmentDate) >= d;
    }).length,
    byStatus: {
      active: MOCK_INMATES.filter(i => i.status === 'active').length,
      transferred: MOCK_INMATES.filter(i => i.status === 'transferred').length,
      released: MOCK_INMATES.filter(i => i.status === 'released').length,
      pending: MOCK_INMATES.filter(i => i.status === 'pending').length,
    },
  }), [filtered]);

  // Trend data
  const trendData = useMemo(() => {
    const days = parseInt(dateRange);
    const buckets = Math.min(days, 14);
    return Array.from({ length: buckets }, (_, i) => {
      const date = subDays(new Date(), buckets - 1 - i);
      const dayStart = startOfDay(date);
      const count = MOCK_INMATES.filter(m => {
        const ed = startOfDay(new Date(m.enrollmentDate));
        return ed.getTime() === dayStart.getTime();
      }).length;
      return { date: format(date, 'MMM d'), count };
    });
  }, [dateRange]);

  const facilityData = useMemo(() => {
    return FACILITIES.map(f => ({
      name: f.replace(/Correctional|Penitentiary|Detention Center|Facility/g, '').trim(),
      count: MOCK_INMATES.filter(i => i.facility === f).length,
    }));
  }, []);

  const statusColors = [
    { name: 'Active', value: stats.byStatus.active, color: 'hsl(var(--success))' },
    { name: 'Transferred', value: stats.byStatus.transferred, color: 'hsl(var(--info))' },
    { name: 'Released', value: stats.byStatus.released, color: 'hsl(var(--warning))' },
    { name: 'Pending', value: stats.byStatus.pending, color: 'hsl(var(--muted-foreground))' },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Enrollment overview and operational metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={facilityFilter} onValueChange={setFacilityFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Facilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              {FACILITIES.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Enrolled</p>
                <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{stats.totalEnrolled}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Facilities</p>
                <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{stats.totalFacilities}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Period</p>
                <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{stats.thisMonth}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</p>
                <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{stats.today}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusColors} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {statusColors.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {statusColors.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enrollments by Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={90} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recently Updated Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_INMATES.slice(0, 6).map(inmate => (
                <div key={inmate.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inmate.firstName} {inmate.lastName}</p>
                    <p className="text-xs text-muted-foreground">{inmate.inmateId} · {inmate.facility}</p>
                  </div>
                  <Badge variant={inmate.status === 'active' ? 'default' : 'secondary'} className="shrink-0 text-2xs capitalize">
                    {inmate.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
