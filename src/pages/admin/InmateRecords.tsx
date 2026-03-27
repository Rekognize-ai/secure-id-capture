import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_INMATES, FACILITIES, type MockInmate } from '@/data/mockAdminData';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

export default function InmateRecords() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortField, setSortField] = useState<'enrollmentDate' | 'lastUpdated' | 'lastName'>('enrollmentDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = MOCK_INMATES.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !q || i.firstName.toLowerCase().includes(q) || i.lastName.toLowerCase().includes(q) || i.inmateId.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || i.status === statusFilter;
      const matchFacility = facilityFilter === 'all' || i.facility === facilityFilter;
      const matchGender = genderFilter === 'all' || i.gender === genderFilter;
      return matchSearch && matchStatus && matchFacility && matchGender;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'lastName') cmp = a.lastName.localeCompare(b.lastName);
      else cmp = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, facilityFilter, genderFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-success text-success-foreground',
      transferred: 'bg-info text-info-foreground',
      released: 'bg-warning text-warning-foreground',
      pending: 'bg-muted text-muted-foreground',
    };
    return <Badge className={`${map[status] || ''} capitalize text-2xs`}>{status}</Badge>;
  };

  const exportCSV = () => {
    const headers = ['Inmate ID', 'First Name', 'Last Name', 'Gender', 'Facility', 'Cell Block', 'Enrollment Date', 'Status'];
    const rows = filtered.map(i => [i.inmateId, i.firstName, i.lastName, i.gender, i.facility, i.cellBlock, format(new Date(i.enrollmentDate), 'yyyy-MM-dd'), i.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inmate-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inmate Records</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} records found</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or inmate ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={facilityFilter} onValueChange={(v) => { setFacilityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px] h-9"><SelectValue placeholder="Facility" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {FACILITIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[120px] h-9"><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[110px]">Inmate ID</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('lastName')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Full Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Gender</TableHead>
              <TableHead className="hidden lg:table-cell">Facility</TableHead>
              <TableHead className="hidden lg:table-cell">Cell Block</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('enrollmentDate')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Enrolled <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('lastUpdated')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Updated <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No records match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(inmate => (
                <TableRow
                  key={inmate.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/inmates/${inmate.id}`)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{inmate.inmateId}</TableCell>
                  <TableCell className="font-medium">{inmate.lastName}, {inmate.firstName}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize text-muted-foreground">{inmate.gender}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{inmate.facility}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{inmate.cellBlock}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(inmate.enrollmentDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{statusBadge(inmate.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(inmate.lastUpdated), 'MMM d')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
