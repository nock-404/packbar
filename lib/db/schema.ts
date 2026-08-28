import { pgTable, pgEnum, uuid, text, integer, boolean, date, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { AnyPgColumn } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export const shareModeEnum = pgEnum('share_mode', ['off', 'read', 'edit'])

export const lists = pgTable('lists', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	coverImage: text('cover_image'),
	destination: text('destination'),
	tripDate: date('trip_date', { mode: 'string' }),
	tripEnd: date('trip_end', { mode: 'string' }),
	lastMinuteMailSentAt: timestamp('last_minute_mail_sent_at', { withTimezone: true, mode: 'date' }),
	shareToken: text('share_token').unique(),
	shareMode: shareModeEnum('share_mode').notNull().default('off'),
	isTemplate: boolean('is_template').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
})

export const categories = pgTable('categories', {
	id: uuid('id').primaryKey().defaultRandom(),
	listId: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
	parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
})

export const uploads = pgTable('uploads', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
})

export const persons = pgTable('persons', {
	id: uuid('id').primaryKey().defaultRandom(),
	listId: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
})

export const items = pgTable('items', {
	id: uuid('id').primaryKey().defaultRandom(),
	categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	quantity: integer('quantity'),
	note: text('note'),
	lastMinute: boolean('last_minute').notNull().default(false),
	packed: boolean('packed').notNull().default(false),
	personId: uuid('person_id').references(() => persons.id, { onDelete: 'set null' }),
	sortOrder: integer('sort_order').notNull().default(0),
})

export const listsRelations = relations(lists, ({ many }) => ({
	categories: many(categories),
	persons: many(persons),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	list: one(lists, { fields: [categories.listId], references: [lists.id] }),
	parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'subcategories' }),
	children: many(categories, { relationName: 'subcategories' }),
	items: many(items),
}))

export const itemsRelations = relations(items, ({ one }) => ({
	category: one(categories, { fields: [items.categoryId], references: [categories.id] }),
	person: one(persons, { fields: [items.personId], references: [persons.id] }),
}))

export const personsRelations = relations(persons, ({ one }) => ({
	list: one(lists, { fields: [persons.listId], references: [lists.id] }),
}))

export type List = typeof lists.$inferSelect
export type NewList = typeof lists.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type Person = typeof persons.$inferSelect
export type NewPerson = typeof persons.$inferInsert
export type Upload = typeof uploads.$inferSelect
export type NewUpload = typeof uploads.$inferInsert
export type ShareMode = List['shareMode']
