import { relations } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const rolesEnum = pgEnum('role', ['admin', 'member', 'guest']);

export const positionsEnum = pgEnum('position', ['officer', 'reserve', 'admin', 'staff']);

export const applicationStatusEnum = pgEnum('status', ['pending', 'approved', 'rejected']);

export const equipmentConditionEnum = pgEnum('condition', ['new', 'good', 'fair', 'poor', 'damaged/broken']);

export const priorExperienceEnum = pgEnum('prior_experience', ['none', 'less_than_1_year', '1_to_3_years', 'more_than_3_years']);

export const availabilityEnum = pgEnum('availability', ['weekdays', 'weekends', 'both', 'flexible']);

export const equipmentCategoryEnum = pgEnum('equipment_category', ['uniform', 'gear', 'communication', 'safety', 'other']);

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone: text('phone'),
  driver_license: text('driver_license'),
  driver_license_state: text('driver_license_state'),
  street_address: text('street_address'),
  city: text('city'),
  state: text('state'),
  zip_code: text('zip_code'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  clerk_id: text('clerk_id').notNull(),
  role: rolesEnum('role').notNull().default('guest'),
  position: positionsEnum('position').notNull().default('reserve'),
}, table => [
  unique('user_email_unique').on(table.email),
  unique('user_clerk_id_unique').on(table.clerk_id),
]).enableRLS();

export const emergencyContact = pgTable('emergency_contact', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => user.id).notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  relationship: text('relationship').notNull(),
  is_current: boolean('is_current').notNull().default(true),
  street_address: text('street_address'),
  city: text('city'),
  state: text('state'),
  zip_code: text('zip_code'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}).enableRLS();

export const uniformSizes = pgTable('uniform_sizes', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => user.id).notNull(),
  shirt_size: varchar('shirt_size', { length: 10 }).notNull(),
  pant_size: varchar('pant_size', { length: 10 }).notNull(),
  shoe_size: varchar('shoe_size', { length: 10 }).notNull(),
  notes: text('notes'),
  is_current: boolean('is_current').notNull().default(true),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}).enableRLS();

export const application = pgTable('application', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => user.id).notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  driver_license: text('driver_license').notNull(),
  street_address: text('street_address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip_code: text('zip_code').notNull(),
  prior_experience: priorExperienceEnum('prior_experience').notNull(),
  availability: availabilityEnum('availability').notNull(),
  resume: text('resume'),
  position: positionsEnum('position').notNull().default('reserve'),
  status: applicationStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}).enableRLS();

export const equipment = pgTable('equipment', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  serial_number: text('serial_number'),
  purchase_date: timestamp('purchase_date', { mode: 'string' }),
  notes: text('notes'),
  is_assigned: boolean('is_assigned').notNull().default(false),
  assigned_to: integer('assigned_to').references(() => user.id),
  created_at: timestamp('created_at', { mode: 'string' }).notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).notNull(),
}).enableRLS();

export const assignedEquipment = pgTable('assigned_equipment', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => user.id).notNull(),
  equipment_id: integer('equipment_id').references(() => equipment.id).notNull(),
  condition: equipmentConditionEnum('condition').notNull(),
  checked_out_at: timestamp('checked_out_at', { mode: 'string' }).notNull(),
  checked_in_at: timestamp('checked_in_at', { mode: 'string' }),
  expected_return_date: timestamp('expected_return_date', { mode: 'string' }),
  notes: text('notes'),
  created_at: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}).enableRLS();

export const userRelations = relations(user, ({ many, one }) => ({
  applications: many(application),
  emergencyContacts: many(emergencyContact),
  assignedEquipment: many(assignedEquipment),
  currentUniformSizes: one(uniformSizes, {
    fields: [user.id],
    references: [uniformSizes.user_id],
    relationName: 'currentUniformSizes',
  }),
  currentAssignedEquipment: one(assignedEquipment, {
    fields: [user.id],
    references: [assignedEquipment.user_id],
    relationName: 'currentAssignedEquipment',
  }),
}));

export const uniformSizesRelations = relations(uniformSizes, ({ one }) => ({
  user: one(user, {
    fields: [uniformSizes.user_id],
    references: [user.id],
  }),
}));

export const applicationRelations = relations(application, ({ one }) => ({
  user: one(user, {
    fields: [application.user_id],
    references: [user.id],
  }),
}));

export const equipmentRelations = relations(equipment, ({ many, one }) => ({
  assignments: many(assignedEquipment),
  assignedTo: one(user, {
    fields: [equipment.assigned_to],
    references: [user.id],
  }),
}));

export const assignedEquipmentRelations = relations(assignedEquipment, ({ one }) => ({
  user: one(user, {
    fields: [assignedEquipment.user_id],
    references: [user.id],
  }),
  equipment: one(equipment, {
    fields: [assignedEquipment.equipment_id],
    references: [equipment.id],
  }),
}));

export const emergencyContactRelations = relations(emergencyContact, ({ one }) => ({
  user: one(user, {
    fields: [emergencyContact.user_id],
    references: [user.id],
  }),
}));
