CREATE DATABASE tokens;

USE tokens;

DROP TABLE IF EXISTS tokens;

CREATE TABLE tokens(
    user_id INT NOT NULL AUTO_INCREMENT,
    access_token TEXT NOT NULL,
    expiration TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id)
);

ALTER TABLE tokens AUTO_INCREMENT = 80001;