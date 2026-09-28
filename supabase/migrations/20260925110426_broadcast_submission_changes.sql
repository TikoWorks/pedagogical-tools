CREATE OR REPLACE FUNCTION broadcast_submission_created()
RETURNS trigger
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'session:' || NEW.session_id::text,
    'submission_created',
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER broadcast_submission_created_trigger
AFTER INSERT ON public.submission
FOR EACH ROW
EXECUTE FUNCTION broadcast_submission_created();