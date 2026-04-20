import { pgEnum, pgSchema, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRole = pgEnum('user_role', ['user', 'admin']);

const authSchema = pgSchema('auth');
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  role: userRole('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});