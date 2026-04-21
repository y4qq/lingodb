CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"course_id" uuid,
	"pack_id" uuid,
	"lesson_id" uuid,
	"audio_version_id" uuid,
	"timepoint_seconds" integer,
	"body" text NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"moderated_at" timestamp with time zone,
	"moderated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_body_length_check" CHECK (char_length("comments"."body") between 1 and 4000),
	CONSTRAINT "comments_target_integrity_check" CHECK (
      ("comments"."parent_comment_id" IS NULL
        AND num_nonnulls("comments"."course_id", "comments"."pack_id", "comments"."lesson_id") = 1
        AND ("comments"."audio_version_id" IS NOT NULL) = ("comments"."lesson_id" IS NOT NULL)
        AND ("comments"."timepoint_seconds" IS NULL OR "comments"."lesson_id" IS NOT NULL))
      OR
      ("comments"."parent_comment_id" IS NOT NULL
        AND "comments"."course_id" IS NULL AND "comments"."pack_id" IS NULL AND "comments"."lesson_id" IS NULL
        AND "comments"."audio_version_id" IS NULL AND "comments"."timepoint_seconds" IS NULL)
    )
);
--> statement-breakpoint
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_language_id" uuid NOT NULL,
	"target_language_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug"),
	CONSTRAINT "courses_base_target_key" UNIQUE("base_language_id","target_language_id"),
	CONSTRAINT "courses_base_not_target_check" CHECK ("courses"."base_language_id" <> "courses"."target_language_id")
);
--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "languages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lesson_audio_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"label" text NOT NULL,
	"audio_path" text NOT NULL,
	"audio_duration_seconds" integer,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_audio_versions_lesson_label_key" UNIQUE("lesson_id","label")
);
--> statement-breakpoint
ALTER TABLE "lesson_audio_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lesson_dependencies" (
	"lesson_id" uuid NOT NULL,
	"required_pack_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_dependencies_pkey" PRIMARY KEY("lesson_id","required_pack_id")
);
--> statement-breakpoint
ALTER TABLE "lesson_dependencies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lesson_tags" (
	"lesson_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_tags_pkey" PRIMARY KEY("lesson_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "lesson_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pack_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lessons_pack_slug_key" UNIQUE("pack_id","slug")
);
--> statement-breakpoint
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packs_course_slug_key" UNIQUE("course_id","slug")
);
--> statement-breakpoint
ALTER TABLE "packs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_audio_version_id_lesson_audio_versions_id_fk" FOREIGN KEY ("audio_version_id") REFERENCES "public"."lesson_audio_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_base_language_id_languages_id_fk" FOREIGN KEY ("base_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_target_language_id_languages_id_fk" FOREIGN KEY ("target_language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_audio_versions" ADD CONSTRAINT "lesson_audio_versions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_dependencies" ADD CONSTRAINT "lesson_dependencies_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_dependencies" ADD CONSTRAINT "lesson_dependencies_required_pack_id_packs_id_fk" FOREIGN KEY ("required_pack_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_tags" ADD CONSTRAINT "lesson_tags_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_tags" ADD CONSTRAINT "lesson_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packs" ADD CONSTRAINT "packs_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_moderation_queue_idx" ON "comments" USING btree ("moderation_status","created_at" DESC NULLS LAST) WHERE "comments"."parent_comment_id" IS NULL;--> statement-breakpoint
CREATE INDEX "comments_lesson_thread_idx" ON "comments" USING btree ("lesson_id","audio_version_id","moderation_status") WHERE "comments"."parent_comment_id" IS NULL;--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "comments_course_id_idx" ON "comments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "comments_pack_id_idx" ON "comments" USING btree ("pack_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_audio_versions_one_current_per_lesson_idx" ON "lesson_audio_versions" USING btree ("lesson_id") WHERE "lesson_audio_versions"."is_current";--> statement-breakpoint
CREATE INDEX "lesson_dependencies_required_pack_id_idx" ON "lesson_dependencies" USING btree ("required_pack_id");--> statement-breakpoint
CREATE INDEX "lesson_tags_tag_id_idx" ON "lesson_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "lessons_pack_position_idx" ON "lessons" USING btree ("pack_id","position");--> statement-breakpoint
CREATE INDEX "packs_course_position_idx" ON "packs" USING btree ("course_id","position");