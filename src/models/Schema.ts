import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
  uuid
} from 'drizzle-orm/pg-core'

export const rolesEnum = pgEnum('role', ['admin', 'member', 'guest'])

export const positionsEnum = pgEnum('position', [
  'candidate',
  'officer',
  'reserve',
  'admin',
  'staff',
  'dispatcher'
])

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'denied'
])

export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'approved',
  'rejected'
])

export const equipmentConditionEnum = pgEnum('equipment_condition', [
  'new',
  'good',
  'fair',
  'poor',
  'damaged/broken'
])

export const priorExperienceEnum = pgEnum('prior_experience', [
  'none',
  'less_than_1_year',
  '1_to_3_years',
  'more_than_3_years'
])

export const availabilityEnum = pgEnum('availability', [
  'weekdays',
  'weekends',
  'both',
  'flexible'
])

export const equipmentCategoryEnum = pgEnum('equipment_category', [
  'uniform',
  'gear',
  'communication',
  'safety',
  'other'
])

export const completionStatusEnum = pgEnum('completion_status', [
  'completed',
  'incomplete',
  'excused',
  'unexcused'
])

export const eventTypesEnum = pgEnum('event_type', [
  'school_event',
  'community_event',
  'fair',
  'other'
])

export const policyTypeEnum = pgEnum('policy_type', [
  'introduction',
  'rules_and_job_descriptions',
  'personnel',
  'arrests_and_enforcement',
  'use_of_force',
  'patrol',
  'administrative',
  'police_records',
  'equipment',
  'investigations',
  'special_circumstances',
  'community_and_community_relations',
  'other'
])

export const trainingTypeEnum = pgEnum('training_type', [
  'active_shooter_response',
  'defensive_and_arrest_tactics',
  'emergency_vehicle_operations',
  'firearms',
  'first_aid',
  'legal_updates',
  'patrol_tactics',
  'radar_and_lidar',
  'taser',
  'traffic_control',
  'use_of_force',
  'other'
])

export const notificationTypesEnum = pgEnum('notification_type', [
  'application_submitted',
  'application_approved',
  'application_rejected',
  'event_created',
  'event_updated',
  'event_signup',
  'event_signup_reminder',
  'training_created',
  'training_updated',
  'training_signup',
  'training_signup_reminder',
  'equipment_assigned',
  'equipment_returned',
  'equipment_return_reminder',
  'policy_created',
  'policy_updated',
  'policy_reminder',
  'event_reminder',
  'training_reminder',
  'general',
  'announcement'
])

export const user = pgTable('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone: text('phone'),
  position: positionsEnum('position').notNull().default('reserve'),
  radio_number: text('radio_number'),
  role: rolesEnum('role').notNull().default('guest'),
  driver_license: text('driver_license'),
  driver_license_state: text('driver_license_state'),
  state: text('state'),
  street_address: text('street_address'),
  callsign: text('callsign'),
  city: text('city'),
  status: userStatusEnum('status').notNull().default('active'),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  zip_code: text('zip_code')
}).enableRLS()

export const emergencyContact = pgTable('emergency_contact', {
  city: text('city'),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  email: text('email'),
  first_name: text('first_name').notNull(),
  id: serial('id').primaryKey(),
  is_current: boolean('is_current').notNull().default(true),
  last_name: text('last_name').notNull(),
  phone: text('phone').notNull(),
  relationship: text('relationship').notNull(),
  state: text('state'),
  street_address: text('street_address'),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  user_id: uuid('user_id')
    .references(() => user.id)
    .notNull(),
  zip_code: text('zip_code')
}).enableRLS()

export const uniformSizes = pgTable('uniform_sizes', {
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  id: serial('id').primaryKey(),
  is_current: boolean('is_current').notNull().default(true),
  notes: text('notes'),
  pant_size: varchar('pant_size', { length: 10 }).notNull(),
  shirt_size: varchar('shirt_size', { length: 10 }).notNull(),
  shoe_size: varchar('shoe_size', { length: 10 }).notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  user_id: uuid('user_id')
    .references(() => user.id)
    .notNull()
}).enableRLS()

export const application = pgTable('application', {
  availability: availabilityEnum('availability').notNull(),
  city: text('city').notNull(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  driver_license: text('driver_license').notNull(),
  driver_license_state: text('driver_license_state').notNull(),
  email: text('email').notNull(),
  first_name: text('first_name').notNull(),
  id: serial('id').primaryKey(),
  last_name: text('last_name').notNull(),
  phone: text('phone').notNull(),
  position: positionsEnum('position').notNull().default('reserve'),
  prior_experience: priorExperienceEnum('prior_experience').notNull(),
  resume: text('resume'),
  state: text('state').notNull(),
  status: applicationStatusEnum('status').notNull().default('pending'),
  street_address: text('street_address').notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  user_id: uuid('user_id')
    .references(() => user.id)
    .notNull(),
  zip_code: text('zip_code').notNull()
}).enableRLS()

export const equipment = pgTable('equipment', {
  assigned_to: uuid('assigned_to').references(() => user.id),
  created_at: timestamp('created_at', {
    mode: 'string',
    withTimezone: true
  }).notNull(),
  description: text('description'),
  id: serial('id').primaryKey(),
  is_assigned: boolean('is_assigned').notNull().default(false),
  is_obsolete: boolean('is_obsolete').notNull().default(false),
  name: text('name').notNull(),
  notes: text('notes'),
  purchase_date: timestamp('purchase_date', {
    mode: 'string',
    withTimezone: true
  }).default(sql`now()`),
  serial_number: text('serial_number'),
  updated_at: timestamp('updated_at', {
    mode: 'string',
    withTimezone: true
  }).notNull()
}).enableRLS()

export const assignedEquipment = pgTable('assigned_equipment', {
  checked_in_at: timestamp('checked_in_at', { mode: 'string' }),
  checked_out_at: timestamp('checked_out_at', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  condition: equipmentConditionEnum('condition').notNull(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  equipment_id: integer('equipment_id')
    .references(() => equipment.id)
    .notNull(),
  expected_return_date: timestamp('expected_return_date', { mode: 'string' }),
  id: serial('id').primaryKey(),
  notes: text('notes'),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  user_id: uuid('user_id')
    .references(() => user.id)
    .notNull()
}).enableRLS()

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  event_date: timestamp('event_date', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  event_type: eventTypesEnum('event_type').default('community_event').notNull(),
  event_location: text('event_location').notNull(),
  event_name: text('event_name').notNull(),
  event_start_time: timestamp('event_start_time', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  event_end_time: timestamp('event_end_time', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  notes: text('notes'),
  min_participants: integer('min_participants').notNull().default(1),
  max_participants: integer('max_participants').notNull().default(5),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  last_reminder_sent: timestamp('last_reminder_sent')
}).enableRLS()

export const eventAssignments = pgTable(
  'event_assignments',
  {
    id: serial('id').primaryKey(),
    event_id: integer('event_id')
      .references(() => events.id)
      .notNull(),
    user_id: uuid('user_id')
      .references(() => user.id)
      .notNull(),
    completion_status: completionStatusEnum('completion_status'),
    completion_notes: text('completion_notes'),
    created_at: timestamp('created_at', {
      mode: 'string',
      withTimezone: true
    })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', {
      mode: 'string',
      withTimezone: true
    })
      .defaultNow()
      .notNull()
  },
  table => [
    unique('event_assignment_event_user').on(table.event_id, table.user_id)
  ]
).enableRLS()

export const training = pgTable('training', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  training_date: timestamp('training_date', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  training_location: text('training_location').notNull(),
  training_type: trainingTypeEnum('training_type').notNull(),
  training_instructor: text('training_instructor'),
  instructor_id: uuid('instructor_id').references(() => user.id),
  training_start_time: timestamp('training_start_time', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  training_end_time: timestamp('training_end_time', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  is_locked: boolean('is_locked').notNull().default(false),
  min_participants: integer('min_participants').notNull().default(1),
  max_participants: integer('max_participants').notNull().default(10),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  last_reminder_sent: timestamp('last_reminder_sent')
}).enableRLS()

export const trainingAssignments = pgTable(
  'training_assignments',
  {
    id: serial('id').primaryKey(),
    training_id: integer('training_id')
      .references(() => training.id)
      .notNull(),
    user_id: uuid('user_id')
      .references(() => user.id)
      .notNull(),
    completion_status: completionStatusEnum('completion_status'),
    completion_notes: text('completion_notes'),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull()
  },
  table => [
    unique('training_assignment_training_user').on(
      table.training_id,
      table.user_id
    )
  ]
).enableRLS()

export const policies = pgTable('policies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  policy_type: policyTypeEnum('policy_type').notNull(),
  policy_number: text('policy_number').notNull(),
  policy_url: text('policy_url').notNull(),
  effective_date: timestamp('effective_date', {
    mode: 'string',
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  is_active: boolean('is_active').default(true),
  last_reminder_sent: timestamp('last_reminder_sent')
}).enableRLS()

export const policyCompletion = pgTable('policy_completion', {
  id: serial('id').primaryKey(),
  policy_id: integer('policy_id')
    .references(() => policies.id)
    .notNull(),
  user_id: uuid('user_id')
    .references(() => user.id)
    .notNull(),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull()
}).enableRLS()

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  type: notificationTypesEnum('type').notNull(),
  message: text('message').notNull(),
  url: text('url'),
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull()
}).enableRLS()

export const notificationRecipients = pgTable(
  'notification_recipients',
  {
    id: serial('id').primaryKey(),
    notification_id: integer('notification_id')
      .references(() => notifications.id)
      .notNull(),
    user_id: uuid('user_id')
      .references(() => user.id)
      .notNull(),
    is_read: boolean('is_read').notNull().default(false),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull()
  },
  table => [
    unique('notification_recipient_user').on(
      table.notification_id,
      table.user_id
    )
  ]
).enableRLS()

export const userRelations = relations(user, ({ many, one }) => ({
  applications: many(application),
  assignedEquipment: many(assignedEquipment),
  currentAssignedEquipment: one(assignedEquipment, {
    fields: [user.id],
    references: [assignedEquipment.user_id],
    relationName: 'currentAssignedEquipment'
  }),
  currentUniformSizes: one(uniformSizes, {
    fields: [user.id],
    references: [uniformSizes.user_id],
    relationName: 'currentUniformSizes'
  }),
  emergencyContacts: many(emergencyContact),
  eventAssignments: many(eventAssignments),
  trainingAssignments: many(trainingAssignments),
  notificationRecipients: many(notificationRecipients)
}))

export const uniformSizesRelations = relations(uniformSizes, ({ one }) => ({
  user: one(user, {
    fields: [uniformSizes.user_id],
    references: [user.id]
  })
}))

export const applicationRelations = relations(application, ({ one }) => ({
  user: one(user, {
    fields: [application.user_id],
    references: [user.id]
  })
}))

export const equipmentRelations = relations(equipment, ({ many, one }) => ({
  assignedTo: one(user, {
    fields: [equipment.assigned_to],
    references: [user.id]
  }),
  assignments: many(assignedEquipment)
}))

export const assignedEquipmentRelations = relations(
  assignedEquipment,
  ({ one }) => ({
    equipment: one(equipment, {
      fields: [assignedEquipment.equipment_id],
      references: [equipment.id]
    }),
    user: one(user, {
      fields: [assignedEquipment.user_id],
      references: [user.id]
    })
  })
)

export const emergencyContactRelations = relations(
  emergencyContact,
  ({ one }) => ({
    user: one(user, {
      fields: [emergencyContact.user_id],
      references: [user.id]
    })
  })
)

export const eventRelations = relations(events, ({ many }) => ({
  assignments: many(eventAssignments)
}))

export const eventAssignmentRelations = relations(
  eventAssignments,
  ({ one }) => ({
    event: one(events, {
      fields: [eventAssignments.event_id],
      references: [events.id]
    }),
    user: one(user, {
      fields: [eventAssignments.user_id],
      references: [user.id]
    })
  })
)

export const trainingAssignmentRelations = relations(
  trainingAssignments,
  ({ one }) => ({
    training: one(training, {
      fields: [trainingAssignments.training_id],
      references: [training.id]
    }),
    user: one(user, {
      fields: [trainingAssignments.user_id],
      references: [user.id]
    })
  })
)

export const trainingRelations = relations(training, ({ many, one }) => ({
  assignments: many(trainingAssignments),
  instructor: one(user, {
    fields: [training.instructor_id],
    references: [user.id],
    relationName: 'instructor'
  })
}))

export const policyCompletionRelations = relations(
  policyCompletion,
  ({ one }) => ({
    policy: one(policies, {
      fields: [policyCompletion.policy_id],
      references: [policies.id]
    }),
    user: one(user, {
      fields: [policyCompletion.user_id],
      references: [user.id]
    })
  })
)

export const policyRelations = relations(policies, ({ many }) => ({
  completions: many(policyCompletion)
}))

export const notificationRelations = relations(notifications, ({ many }) => ({
  recipients: many(notificationRecipients)
}))

export const notificationRecipientRelations = relations(
  notificationRecipients,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationRecipients.notification_id],
      references: [notifications.id]
    }),
    user: one(user, {
      fields: [notificationRecipients.user_id],
      references: [user.id]
    })
  })
)
