-- Enable uuid-ossp extension for UUID v7 support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create UUID v7 function (time-sortable UUIDs)
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID
AS $$
DECLARE
  unix_ts_ms BIGINT;
  uuid_bytes TEXT;
BEGIN
  unix_ts_ms = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  uuid_bytes = 
    LPAD(TO_HEX(unix_ts_ms), 12, '0') ||
    LPAD(TO_HEX((RANDOM() * 65535)::INT), 4, '0') ||
    '7' ||
    LPAD(TO_HEX((RANDOM() * 4095)::INT), 3, '0') ||
    LPAD(TO_HEX((RANDOM() * 1099511627775)::BIGINT), 12, '0');
  RETURN uuid_bytes::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;
