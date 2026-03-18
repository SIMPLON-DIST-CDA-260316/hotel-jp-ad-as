CREATE TABLE "hotel" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"city" varchar(50) NOT NULL,
	"address" varchar(255) NOT NULL,
	"description" text,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "image" (
	"id" serial PRIMARY KEY NOT NULL,
	"link" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"suite_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" varchar(50) NOT NULL,
	"content" text,
	"visitor_email" varchar(255),
	"user_id" integer,
	CONSTRAINT "contact_check" CHECK ("message"."visitor_email" IS NOT NULL OR "message"."user_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"id" serial PRIMARY KEY NOT NULL,
	"date_begin" date NOT NULL,
	"date_end" date NOT NULL,
	"status" varchar(20) DEFAULT 'confirmed' NOT NULL,
	"user_id" integer NOT NULL,
	"suite_id" integer NOT NULL,
	CONSTRAINT "date_check" CHECK ("reservation"."date_end" > "reservation"."date_begin"),
	CONSTRAINT "status_check" CHECK ("reservation"."status" IN ('confirmed', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "suite" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"hotel_id" integer NOT NULL,
	CONSTRAINT "price_check" CHECK ("suite"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" text NOT NULL,
	"role" varchar(20) DEFAULT 'client' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "role_check" CHECK ("user"."role" IN ('client', 'admin', 'manager'))
);
--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_suite_id_suite_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."suite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_suite_id_suite_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."suite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suite" ADD CONSTRAINT "suite_hotel_id_hotel_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;