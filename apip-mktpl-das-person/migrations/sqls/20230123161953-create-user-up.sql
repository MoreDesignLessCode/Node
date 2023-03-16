-- create person role
CREATE ROLE person_domain LOGIN PASSWORD '{0}';

GRANT CONNECT ON DATABASE apip TO person_domain;

GRANT TEMPORARY ON DATABASE apip TO person_domain;

GRANT USAGE ON SCHEMA mktpl TO person_domain;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA mktpl TO person_domain;