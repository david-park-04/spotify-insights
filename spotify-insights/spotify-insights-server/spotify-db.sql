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

-- INSERT INTO 
--     tokens (access_token, expiration)
--     values ('BQAr8kujUZ4M3UiifeD6E0iFjfP6zDsQ6GUCzWN0h78QU3cHULhq9EWUH1AGSB13QYnmioWJHF8FEBB9ZzzRz1kBftzKimUVrfT2xsJnBcbKEWT89ebPM-JJXsIsBfkWKThGBU6pp3vz4HC4QclNL6iWPLxTC7-Ku4Br6t1SSzmvtgB-n74sEcN1gA-l1cOj83ah-rfiOWX-VaJqu3ypbyKpR2aFEHlTGmi1fG2PIY1g0RDJKlU',
--   '2024-12-07T20:59:26.602Z');

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