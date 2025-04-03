CREATE TYPE "public"."ticket_status" AS ENUM('issued', 'paid', 'contested', 'cancelled');--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"license_plate" text NOT NULL,
	"driver_name" text NOT NULL,
	"violation_type" text NOT NULL,
	"fine_amount" integer NOT NULL,
	"date_issued" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "ticket_status" DEFAULT 'issued' NOT NULL
);
