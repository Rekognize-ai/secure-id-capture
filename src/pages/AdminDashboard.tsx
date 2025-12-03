import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, BarChart3, Search, Filter, MoreHorizontal, Shield, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Enrollment = {
  id: string;
  local_id: string;
  first_name: string;
  last_name: string;
  type: 'inmate' | 'staff';
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  created_at: string;
  prison_block?: string;
  department?: string;
};

type UserProfile = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  badge_number: string | null;
  department: string | null;
  role?: 'admin' | 'officer' | 'supervisor';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    pendingSync: 0,
    uploaded: 0,
    failed: 0,
    inmates: 0,
    staff: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;
      setEnrollments(enrollmentData || []);

      // Calculate stats
      const total = enrollmentData?.length || 0;
      const pending = enrollmentData?.filter(e => e.status === 'pending' || e.status === 'uploading').length || 0;
      const uploaded = enrollmentData?.filter(e => e.status === 'uploaded').length || 0;
      const failed = enrollmentData?.filter(e => e.status === 'failed').length || 0;
      const inmates = enrollmentData?.filter(e => e.type === 'inmate').length || 0;
      const staff = enrollmentData?.filter(e => e.type === 'staff').length || 0;

      // Fetch users with roles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) throw profileError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles = (profileData || []).map(profile => ({
        ...profile,
        role: rolesData?.find(r => r.user_id === profile.user_id)?.role || 'officer',
      }));

      setUsers(usersWithRoles);

      setStats({
        totalEnrollments: total,
        pendingSync: pending,
        uploaded,
        failed,
        inmates,
        staff,
        totalUsers: profileData?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: 'admin' | 'officer' | 'supervisor') {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('Role updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  }

  async function deleteEnrollment(id: string) {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Enrollment deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Failed to delete enrollment');
    }
  }

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.local_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredUsers = users.filter(u => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || 
           u.badge_number?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-success text-success-foreground">Synced</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'uploading':
        return <Badge className="bg-info text-info-foreground">Uploading</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary text-primary-foreground">Admin</Badge>;
      case 'supervisor':
        return <Badge className="bg-accent text-accent-foreground">Supervisor</Badge>;
      default:
        return <Badge variant="secondary">Officer</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage enrollments and users</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </header>

      <main className="p-4 pb-24 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Enrollments</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stats.totalEnrollments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Synced</span>
                  <span className="font-semibold text-success">{stats.uploaded}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all" 
                    style={{ width: `${stats.totalEnrollments ? (stats.uploaded / stats.totalEnrollments) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-warning">{stats.pendingSync}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="font-semibold text-destructive">{stats.failed}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enrollment Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Inmates</span>
                  <span className="font-semibold">{stats.inmates}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Staff</span>
                  <span className="font-semibold">{stats.staff}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="uploaded">Synced</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inmate">Inmate</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No enrollments found</div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.first_name} {enrollment.last_name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {enrollment.local_id.slice(0, 15)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {enrollment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(enrollment.status || 'pending')}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteEnrollment(enrollment.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or badge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Badge #</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name || ''} {user.last_name || ''}
                          {!user.first_name && !user.last_name && <span className="text-muted-foreground">No name</span>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.badge_number || '-'}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role || 'officer')}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <UserCog className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'officer')}>
                                Set as Officer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'supervisor')}>
                                Set as Supervisor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'admin')}>
                                Set as Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
