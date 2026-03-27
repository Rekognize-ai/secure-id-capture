import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { MOCK_INMATES, FACILITIES } from '@/data/mockAdminData';
import { format, subDays, startOfDay } from 'date-fns';

export default function Reports() {
  const [dateRange, setDateRange] = useState('90');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const trendData = useMemo(() => {
    const days = parseInt(dateRange);
    const buckets = Math.min(days, 30);
    return Array.from({ length: buckets }, (_, i) => {
      const date = subDays(new Date(), buckets - 1 - i);
      const dayStart = startOfDay(date);
      const count = MOCK_INMATES.filter(m => {
        const ed = startOfDay(new Date(m.enrollmentDate));
        return ed.getTime() === dayStart.getTime();
      }).length;
      return { date: format(date, 'MMM d'), enrollments: count };
    });
  }, [dateRange]);

  const facilityData = useMemo(() =>
    FACILITIES.map(f => ({
      name: f.split(' ')[0],
      count: MOCK_INMATES.filter(i => i.facility === f).length,
    })),
    []
  );

  const genderData = [
    { name: 'Male', value: MOCK_INMATES.filter(i => i.gender === 'male').length, color: 'hsl(var(--primary))' },
    { name: 'Female', value: MOCK_INMATES.filter(i => i.gender === 'female').length, color: 'hsl(var(--info))' },
  ];

  const statusData = [
    { name: 'Active', value: MOCK_INMATES.filter(i => i.status === 'active').length, color: 'hsl(var(--success))' },
    { name: 'Transferred', value: MOCK_INMATES.filter(i => i.status === 'transferred').length, color: 'hsl(var(--info))' },
    { name: 'Released', value: MOCK_INMATES.filter(i => i.status === 'released').length, color: 'hsl(var(--warning))' },
    { name: 'Pending', value: MOCK_INMATES.filter(i => i.status === 'pending').length, color: 'hsl(var(--muted-foreground))' },
  ].filter(s => s.value > 0);

  // Mock face search activity
  const searchActivity = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      date: format(subDays(new Date(), 13 - i), 'MMM d'),
      searches: Math.floor(Math.random() * 12) + 1,
    })),
    []
  );

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Enrollment metrics and operational data</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={facilityFilter} onValueChange={setFacilityFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="All Facilities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              {FACILITIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Enrollments Over Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Enrollments Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Facility */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enrollments by Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By Gender */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enrollments by Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {genderData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {genderData.map(g => (
                <div key={g.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-xs text-muted-foreground">{g.name} ({g.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Enrollments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Face Search Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Face Search Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="searches" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
