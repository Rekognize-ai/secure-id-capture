import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchAdminRecords, type AdminRecord } from '@/services/adminRecordsService';
import { format } from 'date-fns';

const PAGE_SIZE = 15;

export default function InmateRecords() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortField, setSortField] = useState<'createdAt' | 'updatedAt' | 'lastName'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRecords(await fetchAdminRecords());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const blocks = useMemo(
    () => Array.from(new Set(records.map(r => r.prisonBlock).filter(Boolean))) as string[],
    [records]
  );

  const filtered = useMemo(() => {
    const result = records.filter(r => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.localId.toLowerCase().includes(q) ||
        (r.employeeId || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchType = typeFilter === 'all' || r.type === typeFilter;
      const matchGender = genderFilter === 'all' || r.gender === genderFilter;
      return matchSearch && matchStatus && matchType && matchGender;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'lastName') cmp = a.lastName.localeCompare(b.lastName);
      else cmp = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [records, search, statusFilter, typeFilter, genderFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      uploaded: 'bg-success text-success-foreground',
      uploading: 'bg-info text-info-foreground',
      pending: 'bg-warning text-warning-foreground',
      failed: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={`${map[status] || ''} capitalize text-2xs`}>{status}</Badge>;
  };

  const exportCSV = () => {
    const headers = ['Record ID', 'Type', 'First Name', 'Last Name', 'Gender', 'Block', 'Cell', 'Enrolled', 'Status'];
    const rows = filtered.map(r => [
      r.localId,
      r.type,
      r.firstName,
      r.lastName,
      r.gender,
      r.prisonBlock || '',
      r.cellNumber || '',
      format(new Date(r.createdAt), 'yyyy-MM-dd'),
      r.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enrollment Records</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading records…' : `${filtered.length} of ${records.length} records`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2" disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or record ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[140px] h-9"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inmate">Inmate</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[120px] h-9"><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {blocks.length > 0 && (
            <p className="text-2xs text-muted-foreground mt-3">
              Blocks on record: {blocks.join(', ')}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-foreground flex-1">{error}</p>
          <Button variant="outline" size="sm" onClick={load}>Retry</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px]">Record ID</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('lastName')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Full Name <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Gender</TableHead>
              <TableHead className="hidden lg:table-cell">Block / Cell</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Enrolled <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('updatedAt')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Updated <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2 align-middle" /> Querying database…
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  {records.length === 0
                    ? 'No enrollment records in the database yet.'
                    : 'No records match your search criteria.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(record => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/inmates/${record.id}`)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{record.localId}</TableCell>
                  <TableCell className="font-medium">{record.lastName}, {record.firstName}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize text-muted-foreground">{record.type}</TableCell>
                  <TableCell className="hidden md:table-cell capitalize text-muted-foreground">{record.gender || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {record.prisonBlock ? `${record.prisonBlock}${record.cellNumber ? ` · ${record.cellNumber}` : ''}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(record.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{statusBadge(record.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(record.updatedAt), 'MMM d')}</TableCell>
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
