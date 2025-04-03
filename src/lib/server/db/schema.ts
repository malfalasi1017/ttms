import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Optional: Define an enum for status for better type safety
export const ticketStatusEnum = pgEnum('ticket_status', [
	'issued',
	'paid',
	'contested',
	'cancelled'
]);

export const tickets = pgTable('tickets', {
	// Renamed from 'user' to 'tickets'
	id: serial('id').primaryKey(),
	licensePlate: text('license_plate').notNull(),
	driverName: text('driver_name').notNull(),
	violationType: text('violation_type').notNull(),
	fineAmount: integer('fine_amount').notNull(), // Renamed fineAmmount -> fineAmount (camelCase)
	dateIssued: timestamp('date_issued', { withTimezone: true }).defaultNow().notNull(), // Added defaultNow() and timezone option
	status: ticketStatusEnum('status').notNull().default('issued') // Use the enum, add a default
});

// Define types for convenience (optional but recommended)
export type Ticket = typeof tickets.$inferSelect; // return type when queried
export type NewTicket = typeof tickets.$inferInsert; // insert type
