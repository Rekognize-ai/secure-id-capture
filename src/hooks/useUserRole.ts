import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AppRole = 'admin' | 'officer' | 'supervisor';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } else {
        setRole(data?.role ?? 'officer');
      }
      setLoading(false);
    }

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isSupervisor = role === 'supervisor' || role === 'admin';

  return { role, isAdmin, isSupervisor, loading };
}
