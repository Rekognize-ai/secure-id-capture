-- Add created_by column to track who created each enrollment
ALTER TABLE public.enrollments 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow public delete access" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public insert access" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public read access" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public update access" ON public.enrollments;

-- Officers can create enrollments (and the created_by must be themselves)
CREATE POLICY "Officers can create enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Officers can view their own enrollments
CREATE POLICY "Officers can view own enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Officers can update their own enrollments
CREATE POLICY "Officers can update own enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Supervisors can view all enrollments
CREATE POLICY "Supervisors can view all enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'supervisor') OR has_role(auth.uid(), 'admin'));

-- Supervisors can update all enrollments
CREATE POLICY "Supervisors can update all enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'supervisor') OR has_role(auth.uid(), 'admin'));

-- Admins can delete enrollments
CREATE POLICY "Admins can delete enrollments"
ON public.enrollments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));