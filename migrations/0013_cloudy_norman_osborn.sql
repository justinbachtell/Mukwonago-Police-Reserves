ALTER TABLE "equipment_assignment" RENAME TO "assigned_equipment";--> statement-breakpoint
ALTER TABLE "assigned_equipment" DROP CONSTRAINT "equipment_assignment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "assigned_equipment" DROP CONSTRAINT "equipment_assignment_equipment_id_equipment_id_fk";
--> statement-breakpoint
ALTER TABLE "assigned_equipment" ADD CONSTRAINT "assigned_equipment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assigned_equipment" ADD CONSTRAINT "assigned_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;