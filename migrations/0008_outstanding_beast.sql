ALTER TABLE "user" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_name" text NOT NULL;