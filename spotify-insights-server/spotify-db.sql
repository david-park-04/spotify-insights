CREATE DATABASE IF NOT EXISTS spotify;

USE spotify;

DROP TABLE IF EXISTS tokens;

CREATE TABLE tokens (
    user_id INT NOT NULL AUTO_INCREMENT,
    access_token TEXT NOT NULL,
    expiration TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id)
);

ALTER TABLE tokens AUTO_INCREMENT = 80001;

-- Testing database creation --
INSERT INTO 
    tokens (access_token, expiration)
    values ('access_token_1', '2024-12-06 15:30:00');

INSERT INTO 
    tokens (access_token, expiration)
    values ('access_token_2', '2024-12-06 15:30:00');

-- SELECT * FROM tokens;

DROP USER IF EXISTS 'spotify-read-only';
DROP USER IF EXISTS 'spotify-read-write';

CREATE USER 'spotify-read-only' IDENTIFIED BY 'abc123!!';
CREATE USER 'spotify-read-write' IDENTIFIED BY 'def456!!';

GRANT SELECT, SHOW VIEW ON spotify.*
    TO 'spotify-read-only';
GRANT SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER ON spotify.*
    TO 'spotify-read-write';

FLUSH PRIVILEGES;

-- Testing users --
USE spotify;

SELECT * FROM tokens;