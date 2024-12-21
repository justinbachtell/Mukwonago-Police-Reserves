ALTER TABLE "user" ALTER COLUMN "driver_license" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "street_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "zip_code" DROP NOT NULL;