ALTER TABLE field_work_records
    ADD COLUMN IF NOT EXISTS account_name TEXT NOT NULL DEFAULT '';
