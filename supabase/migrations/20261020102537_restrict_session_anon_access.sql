REVOKE ALL PRIVILEGES ON TABLE public.session FROM anon;

REVOKE SELECT (id, state) ON TABLE public.session FROM anon;

GRANT SELECT (id, state) ON TABLE public.session TO anon;

CREATE POLICY "Allow anonymous session state reads"
ON public.session
FOR SELECT
TO anon
USING (true);