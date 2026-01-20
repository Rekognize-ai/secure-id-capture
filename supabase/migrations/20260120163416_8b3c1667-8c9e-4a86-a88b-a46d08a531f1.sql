-- Drop existing admin update policy
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

-- Create new policy that prevents admins from modifying their own role
CREATE POLICY "Admins can update other users roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND auth.uid() != user_id  -- Cannot modify own role
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND auth.uid() != user_id  -- Cannot modify own role
);