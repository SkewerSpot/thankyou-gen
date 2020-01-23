-- Up
CREATE TABLE IF NOT EXISTS unique_codes (
    code TEXT PRIMARY KEY,
    generated_date TEXT 
);

-- Down
DROP TABLE unique_codes;