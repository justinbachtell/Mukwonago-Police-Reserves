ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "is_assigned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "assigned_to" integer;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;