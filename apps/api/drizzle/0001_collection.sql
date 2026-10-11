CREATE TABLE "progress" (
	"user_id" text NOT NULL,
	"ladder_id" text NOT NULL,
	"text" text NOT NULL,
	"unlocked" integer NOT NULL,
	"best" integer,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "progress_user_id_ladder_id_pk" PRIMARY KEY("user_id","ladder_id")
);
--> statement-breakpoint
ALTER TABLE "ladders" DROP CONSTRAINT "ladders_date_unique";--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "comment" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_anonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_ladder_id_ladders_id_fk" FOREIGN KEY ("ladder_id") REFERENCES "public"."ladders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "solutions_updated_at_id_index" ON "solutions" USING btree ("updated_at","id");