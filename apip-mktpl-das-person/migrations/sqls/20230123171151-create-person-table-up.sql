CREATE TABLE IF NOT EXISTS mktpl.person(
    id              uuid                PRIMARY KEY,
    given_name      varchar(64),
    middle_name     varchar(64),
    family_name     varchar(64),
    created_at      timestamptz(0),
    modified_at     timestamptz(0),
    deleted_at      timestamptz(0),
    created_by      uuid,
    modified_by     uuid,
    deleted_by      uuid
);