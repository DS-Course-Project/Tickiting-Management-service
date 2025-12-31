ALTER TABLE "ticket" ALTER COLUMN "description" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "comment" text DEFAULT '';