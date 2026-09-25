SELECT cron.schedule(
  'delete-old-sessions',
  '0 * * * *',
  $$
    DELETE FROM session
    WHERE created_at < now() - interval '12 hours';
  $$
);