CREATE POLICY "Allow session creation"
ON session
FOR INSERT
TO anon
WITH CHECK (true);