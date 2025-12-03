-- Add unique constraint on local_id for upsert operations
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_local_id_key UNIQUE (local_id);