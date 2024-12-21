CREATE TYPE "public"."availability" AS ENUM('weekdays', 'weekends', 'both');--> statement-breakpoint
CREATE TYPE "public"."prior_experience" AS ENUM('none', 'reserve', 'military', 'law enforcement');--> statement-breakpoint
ALTER TABLE "application" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "street_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "zip_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "prior_experience" "prior_experience" NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "availability" "availability" NOT NULL;