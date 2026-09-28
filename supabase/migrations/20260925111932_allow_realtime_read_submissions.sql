CREATE POLICY "Allow anonymous submission reads"
ON public.submission
FOR SELECT
TO anon
USING (true);