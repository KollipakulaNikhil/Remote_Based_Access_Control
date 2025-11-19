-- Add 'moderator' to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderator';

-- Allow users to insert their own role during signup (needed for signup flow)
CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add RLS policy to allow users to update their own auth_data for re-enrollment
DROP POLICY IF EXISTS "Users can update their own auth data" ON public.auth_data;
CREATE POLICY "Users can update their own auth data"
ON public.auth_data
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());