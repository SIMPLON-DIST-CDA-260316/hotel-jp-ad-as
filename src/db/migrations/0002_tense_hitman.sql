ALTER TABLE "image" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "image" ALTER COLUMN "suite_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "image" ADD COLUMN "hotel_id" integer;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_hotel_id_hotel_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_owner_check" CHECK ("image"."suite_id" IS NOT NULL OR "image"."hotel_id" IS NOT NULL);