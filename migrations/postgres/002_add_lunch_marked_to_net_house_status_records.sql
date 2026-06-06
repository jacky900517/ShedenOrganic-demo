ALTER TABLE net_house_status_records
    ADD COLUMN IF NOT EXISTS lunch_marked INTEGER NOT NULL DEFAULT 0;
