CREATE TABLE submission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participant(id) ON DELETE CASCADE,
    data JSONB NOT NULL
);