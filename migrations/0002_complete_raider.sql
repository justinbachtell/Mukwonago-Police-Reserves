ALTER TABLE "events" ADD COLUMN "min_participants" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "max_participants" integer DEFAULT 2 NOT NULL;