-- pg_net lets the database make HTTP calls (used to smoke-test Edge Functions from SQL).
create extension if not exists pg_net with schema extensions;
