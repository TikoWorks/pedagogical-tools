DROP TRIGGER IF EXISTS broadcast_submission_created_trigger
ON public.submission;

DROP FUNCTION IF EXISTS broadcast_submission_created();