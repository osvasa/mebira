ALTER TABLE posts ALTER COLUMN bathrooms TYPE numeric(3,1)
  USING bathrooms::numeric(3,1);
