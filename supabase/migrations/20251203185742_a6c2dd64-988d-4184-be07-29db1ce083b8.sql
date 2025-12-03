-- Create enum types
CREATE TYPE public.enrollment_type AS ENUM ('inmate', 'staff');
CREATE TYPE public.sync_status AS ENUM ('pending', 'uploading', 'uploaded', 'failed');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE public.image_quality AS ENUM ('good', 'fair', 'poor', 'pending');

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT NOT NULL,
  type enrollment_type NOT NULL,
  
  -- Form data
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender gender_type,
  date_of_birth DATE,
  prison_block TEXT,
  cell_number TEXT,
  admission_date DATE,
  
  -- Staff-specific fields
  employee_id TEXT,
  department TEXT,
  position TEXT,
  
  -- Images (stored as base64 or storage URLs)
  image_front TEXT,
  image_left TEXT,
  image_right TEXT,
  
  -- Image qualities
  quality_front image_quality DEFAULT 'pending',
  quality_left image_quality DEFAULT 'pending',
  quality_right image_quality DEFAULT 'pending',
  
  -- Verification
  liveness_verified BOOLEAN DEFAULT false,
  
  -- Sync status
  status sync_status DEFAULT 'pending',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now - can add auth later)
CREATE POLICY "Allow public read access" 
ON public.enrollments FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.enrollments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.enrollments FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.enrollments FOR DELETE 
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_enrollments_status ON public.enrollments(status);
CREATE INDEX idx_enrollments_local_id ON public.enrollments(local_id);
CREATE INDEX idx_enrollments_type ON public.enrollments(type);