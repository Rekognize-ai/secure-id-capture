import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Shield, Search, Clock, MoreHorizontal, UserCog, FileText, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';

type UserProfile = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  badge_number: string | null;
  department: string | null;
  role?: 'admin' | 'officer' | 'supervisor';
};

export default function AdminSettings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      if (profileError) throw profileError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      const usersWithRoles = (profileData || []).map(profile => ({
        ...profile,
        role: rolesData?.find(r => r.user_id === profile.user_id)?.role || 'officer',
      }));

      setUsers(usersWithRoles as UserProfile[]);
    } catch (error) {
      logger.error('Failed to load users', error);
      toast.error('Failed to load users');
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
      fetchUsers();
    } catch (error) {
      logger.error('Failed to update role', error);
      toast.error('Failed to update role');
    }
  }

  const filteredUsers = users.filter(u => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) ||
           u.badge_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-primary text-primary-foreground">Super Admin</Badge>;
      case 'supervisor': return <Badge className="bg-accent text-accent-foreground">Facility Admin</Badge>;
      default: return <Badge variant="secondary">Officer</Badge>;
    }
  };

  // Mock audit log entries
  const auditLogs = [
    { date: '2026-03-27T14:23:00', action: 'Role Updated', detail: 'Officer Martinez → Facility Admin', user: 'Admin Rodriguez' },
    { date: '2026-03-27T11:05:00', action: 'Face Search', detail: 'Image uploaded for match search', user: 'Officer Smith' },
    { date: '2026-03-26T16:40:00', action: 'Enrollment Deleted', detail: 'INM-001087 removed from records', user: 'Admin Rodriguez' },
    { date: '2026-03-26T09:12:00', action: 'User Created', detail: 'New officer account registered', user: 'System' },
    { date: '2026-03-25T15:30:00', action: 'Enrollment Created', detail: 'INM-001200 enrolled at Central', user: 'Officer Williams' },
    { date: '2026-03-25T08:45:00', action: 'Password Reset', detail: 'Password reset requested', user: 'Officer Davis' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings & Access Control</h1>
        <p className="text-sm text-muted-foreground">Manage users, roles, and system configuration</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> User Roles
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Clock className="h-4 w-4" /> Audit Logs
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* User Roles */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or badge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Badge #</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name || ''} {user.last_name || ''}
                        {!user.first_name && !user.last_name && <span className="text-muted-foreground">Unnamed</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{user.badge_number || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{user.department || '—'}</TableCell>
                      <TableCell>{getRoleBadge(user.role || 'officer')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'officer')}>
                              Set as Officer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'supervisor')}>
                              Set as Facility Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.user_id, 'admin')}>
                              Set as Super Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.date), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-2xs">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{log.detail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Session Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Session Timeout</span>
                  <span className="text-sm font-medium text-foreground">30 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Failed Logins</span>
                  <span className="text-sm font-medium text-foreground">5 attempts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Password Expiry</span>
                  <span className="text-sm font-medium text-foreground">90 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Audit Log Retention</span>
                  <span className="text-sm font-medium text-foreground">1 year</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Search History</span>
                  <span className="text-sm font-medium text-foreground">90 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Image Storage</span>
                  <span className="text-sm font-medium text-foreground">Indefinite</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
