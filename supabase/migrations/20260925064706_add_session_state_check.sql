ALTER TABLE session
ADD CONSTRAINT session_state_check
CHECK (state IN ('active', 'paused'));