DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'Users' AND column_name = 'checkAccountGG') THEN
      ALTER TABLE "Users" ADD COLUMN "checkAccountGG" BOOLEAN;
   END IF;
END $$;
