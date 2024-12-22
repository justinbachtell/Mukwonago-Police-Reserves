ALTER TABLE "emergency_contact" ADD COLUMN "is_current" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "emergency_contact" ADD COLUMN "street_address" text;--> statement-breakpoint
ALTER TABLE "emergency_contact" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "emergency_contact" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "emergency_contact" ADD COLUMN "zip_code" text;