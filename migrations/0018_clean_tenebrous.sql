ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_out_at" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "checked_in_at" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ALTER COLUMN "expected_return_date" SET DEFAULT CURRENT_DATE;--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "purchase_date" SET DEFAULT CURRENT_DATE;