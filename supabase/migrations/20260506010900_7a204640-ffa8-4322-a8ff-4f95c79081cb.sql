select cron.schedule(
  'run-automations-daily',
  '0 9 * * *',
  $$
  select net.http_post(
    url:='https://wlhgebzljhitdpoijpsh.supabase.co/functions/v1/run-automations',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsaGdlYnpsamhpdGRwb2lqcHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1OTI0NzEsImV4cCI6MjA5MzE2ODQ3MX0.T7xO7CZM7b-OsxsUgufC07mt44_VOY0imIqZ7IE5fIw"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);