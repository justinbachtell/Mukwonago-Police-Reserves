ALTER TABLE "application" ADD COLUMN "driver_license" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "resume" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "driver_license" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "street_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "zip_code" text NOT NULL;