CREATE TABLE participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES session(id) ON DELETE CASCADE
);