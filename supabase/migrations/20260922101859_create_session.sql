CREATE TABLE session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    join_code VARCHAR NOT NULL UNIQUE,
    host_token VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    state VARCHAR NOT NULL 
);