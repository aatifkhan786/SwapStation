-- Allow users to insert their own role during signup (for demo purposes)
-- In production, this should be handled server-side
CREATE POLICY "Users can insert own role during signup"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());