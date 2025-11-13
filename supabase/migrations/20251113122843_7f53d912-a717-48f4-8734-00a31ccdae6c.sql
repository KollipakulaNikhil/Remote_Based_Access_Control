-- Add status column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fired', 'blocked'));

-- Create index for better query performance
CREATE INDEX idx_user_roles_status ON public.user_roles(status);

-- Update RLS policies to exclude fired/blocked users from viewing
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Active users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid() AND status = 'active');

-- Update admin policies to include status management
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Admins can update roles and status" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to get user counts by role and status
CREATE OR REPLACE FUNCTION public.get_user_counts()
RETURNS TABLE(role app_role, status TEXT, count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role, status, COUNT(*)::BIGINT
  FROM public.user_roles
  GROUP BY role, status
$$;