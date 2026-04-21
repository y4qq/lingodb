import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userRole = pgEnum('user_role', ['user', 'admin']);
export const moderationStatus = pgEnum('moderation_status', ['pending', 'approved', 'rejected']);

const authSchema = pgSchema('auth');
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  role: userRole('role').notNull().default('user'),
  ...timestamps,
}).enableRLS();

export const languages = pgTable('languages', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  ...timestamps,
}).enableRLS();

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  ...timestamps,
}).enableRLS();

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  baseLanguageId: uuid('base_language_id').notNull().references(() => languages.id),
  targetLanguageId: uuid('target_language_id').notNull().references(() => languages.id),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  isPublished: boolean('is_published').notNull().default(false),
  isFree: boolean('is_free').notNull().default(true),
  ...timestamps,
}, (t) => [
  unique('courses_base_target_key').on(t.baseLanguageId, t.targetLanguageId),
  check('courses_base_not_target_check', sql`${t.baseLanguageId} <> ${t.targetLanguageId}`),
]).enableRLS();

// Deferrable unique `(course_id, position)` is added in the companion migration
// to support transactional reordering.
export const packs = pgTable('packs', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  isFree: boolean('is_free').notNull().default(true),
  ...timestamps,
}, (t) => [
  unique('packs_course_slug_key').on(t.courseId, t.slug),
  index('packs_course_position_idx').on(t.courseId, t.position),
]).enableRLS();

// Deferrable unique `(pack_id, position)` is added in the companion migration.
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  packId: uuid('pack_id').notNull().references(() => packs.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  ...timestamps,
}, (t) => [
  unique('lessons_pack_slug_key').on(t.packId, t.slug),
  index('lessons_pack_position_idx').on(t.packId, t.position),
]).enableRLS();

export const lessonAudioVersions = pgTable('lesson_audio_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  audioPath: text('audio_path').notNull(),
  audioDurationSeconds: integer('audio_duration_seconds'),
  isCurrent: boolean('is_current').notNull().default(false),
  ...timestamps,
}, (t) => [
  unique('lesson_audio_versions_lesson_label_key').on(t.lessonId, t.label),
  uniqueIndex('lesson_audio_versions_one_current_per_lesson_idx')
    .on(t.lessonId)
    .where(sql`${t.isCurrent}`),
]).enableRLS();

export const lessonTags = pgTable('lesson_tags', {
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  ...timestamps,
}, (t) => [
  primaryKey({ columns: [t.lessonId, t.tagId], name: 'lesson_tags_pkey' }),
  index('lesson_tags_tag_id_idx').on(t.tagId),
]).enableRLS();

export const lessonDependencies = pgTable('lesson_dependencies', {
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  requiredPackId: uuid('required_pack_id').notNull().references(() => packs.id, { onDelete: 'cascade' }),
  ...timestamps,
}, (t) => [
  primaryKey({ columns: [t.lessonId, t.requiredPackId], name: 'lesson_dependencies_pkey' }),
  index('lesson_dependencies_required_pack_id_idx').on(t.requiredPackId),
]).enableRLS();

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  parentCommentId: uuid('parent_comment_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id),
  packId: uuid('pack_id').references(() => packs.id),
  lessonId: uuid('lesson_id').references(() => lessons.id),
  audioVersionId: uuid('audio_version_id').references(() => lessonAudioVersions.id, { onDelete: 'cascade' }),
  timepointSeconds: integer('timepoint_seconds'),
  body: text('body').notNull(),
  moderationStatus: moderationStatus('moderation_status').notNull().default('pending'),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  moderatedBy: uuid('moderated_by').references(() => users.id),
  ...timestamps,
}, (t) => [
  check('comments_body_length_check', sql`char_length(${t.body}) between 1 and 4000`),
  check(
    'comments_target_integrity_check',
    sql`
      (${t.parentCommentId} IS NULL
        AND num_nonnulls(${t.courseId}, ${t.packId}, ${t.lessonId}) = 1
        AND (${t.audioVersionId} IS NOT NULL) = (${t.lessonId} IS NOT NULL)
        AND (${t.timepointSeconds} IS NULL OR ${t.lessonId} IS NOT NULL))
      OR
      (${t.parentCommentId} IS NOT NULL
        AND ${t.courseId} IS NULL AND ${t.packId} IS NULL AND ${t.lessonId} IS NULL
        AND ${t.audioVersionId} IS NULL AND ${t.timepointSeconds} IS NULL)
    `,
  ),
  index('comments_moderation_queue_idx')
    .on(t.moderationStatus, t.createdAt.desc())
    .where(sql`${t.parentCommentId} IS NULL`),
  index('comments_lesson_thread_idx')
    .on(t.lessonId, t.audioVersionId, t.moderationStatus)
    .where(sql`${t.parentCommentId} IS NULL`),
  index('comments_parent_comment_id_idx').on(t.parentCommentId),
  index('comments_course_id_idx').on(t.courseId),
  index('comments_pack_id_idx').on(t.packId),
]).enableRLS();
