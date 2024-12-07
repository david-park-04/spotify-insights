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

INSERT INTO 
    tokens (access_token, expiration)
    values ('access_token_1', '2024-12-06 15:30:00');

SELECT * FROM tokens;
