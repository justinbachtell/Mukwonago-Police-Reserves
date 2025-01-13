-- Create a temporary column to store the current values
ALTER TABLE "training" ADD COLUMN "training_type_temp" text;

-- Copy the current values to the temporary column
UPDATE "training" SET "training_type_temp" = "training_type";

-- Drop the old column
ALTER TABLE "training" DROP COLUMN "training_type";

-- Create the enum type
DO $$ BEGIN
    CREATE TYPE "training_type" AS ENUM (
        'firearms',
        'defensive_tactics',
        'emergency_vehicle_operations',
        'first_aid',
        'legal_updates',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the new column with the enum type
ALTER TABLE "training" ADD COLUMN "training_type" "training_type" NOT NULL DEFAULT 'other';

-- Copy the data back (with proper type casting)
UPDATE "training" 
SET "training_type" = CASE "training_type_temp"
    WHEN 'firearms' THEN 'firearms'::training_type
    WHEN 'defensive_tactics' THEN 'defensive_tactics'::training_type
    WHEN 'emergency_vehicle_operations' THEN 'emergency_vehicle_operations'::training_type
    WHEN 'first_aid' THEN 'first_aid'::training_type
    WHEN 'legal_updates' THEN 'legal_updates'::training_type
    ELSE 'other'::training_type
END;

-- Drop the temporary column
ALTER TABLE "training" DROP COLUMN "training_type_temp";

-- Add the is_locked column
ALTER TABLE "training" ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false; 