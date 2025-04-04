import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const ticketStatusEnum = pgEnum('ticket_status', [
	'issued',
	'paid',
	'contested',
	'cancelled'
]);

export const tickets = pgTable('tickets', {
	id: serial('id').primaryKey(),
	licensePlate: text('license_plate').notNull(),
	driverName: text('driver_name').notNull(),
	violationType: text('violation_type').notNull(),
	fineAmount: integer('fine_amount').notNull(),
	dateIssued: timestamp('date_issued', { withTimezone: true }).defaultNow().notNull(),
	status: ticketStatusEnum('status').notNull().default('issued')
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
