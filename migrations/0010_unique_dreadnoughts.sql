ALTER TABLE "equipment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipment" RENAME COLUMN "available_quantity" TO "purchase_date";--> statement-breakpoint
ALTER TABLE "equipment" RENAME COLUMN "quantity" TO "notes";--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "equipment" DROP COLUMN "category";