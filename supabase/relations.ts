import { relations } from "drizzle-orm";
import {
  comments,
  courses,
  languages,
  lessonAudioVersions,
  lessonDependencies,
  lessonTags,
  lessons,
  packs,
  tags,
  users,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  authoredComments: many(comments, { relationName: "comments_author" }),
  moderatedComments: many(comments, { relationName: "comments_moderator" }),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
  coursesAsBase: many(courses, { relationName: "courses_base_language" }),
  coursesAsTarget: many(courses, { relationName: "courses_target_language" }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  baseLanguage: one(languages, {
    fields: [courses.baseLanguageId],
    references: [languages.id],
    relationName: "courses_base_language",
  }),
  targetLanguage: one(languages, {
    fields: [courses.targetLanguageId],
    references: [languages.id],
    relationName: "courses_target_language",
  }),
  packs: many(packs),
  comments: many(comments),
}));

export const packsRelations = relations(packs, ({ one, many }) => ({
  course: one(courses, {
    fields: [packs.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  dependents: many(lessonDependencies),
  comments: many(comments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  pack: one(packs, {
    fields: [lessons.packId],
    references: [packs.id],
  }),
  audioVersions: many(lessonAudioVersions),
  tags: many(lessonTags),
  dependencies: many(lessonDependencies),
  comments: many(comments),
}));

export const lessonAudioVersionsRelations = relations(lessonAudioVersions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [lessonAudioVersions.lessonId],
    references: [lessons.id],
  }),
  comments: many(comments),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  lessons: many(lessonTags),
}));

export const lessonTagsRelations = relations(lessonTags, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonTags.lessonId],
    references: [lessons.id],
  }),
  tag: one(tags, {
    fields: [lessonTags.tagId],
    references: [tags.id],
  }),
}));

export const lessonDependenciesRelations = relations(lessonDependencies, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonDependencies.lessonId],
    references: [lessons.id],
  }),
  requiredPack: one(packs, {
    fields: [lessonDependencies.requiredPackId],
    references: [packs.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
    relationName: "comments_author",
  }),
  moderator: one(users, {
    fields: [comments.moderatedBy],
    references: [users.id],
    relationName: "comments_moderator",
  }),
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comments_replies",
  }),
  replies: many(comments, { relationName: "comments_replies" }),
  course: one(courses, {
    fields: [comments.courseId],
    references: [courses.id],
  }),
  pack: one(packs, {
    fields: [comments.packId],
    references: [packs.id],
  }),
  lesson: one(lessons, {
    fields: [comments.lessonId],
    references: [lessons.id],
  }),
  audioVersion: one(lessonAudioVersions, {
    fields: [comments.audioVersionId],
    references: [lessonAudioVersions.id],
  }),
}));
