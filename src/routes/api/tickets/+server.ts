import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tickets, type NewTicket, type ticketStatusEnum } from '$lib/server/db/schema';

// POST /api/tickets Create a new ticket
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate the request body
		if (
			!body.licensePlate ||
			!body.driverName ||
			!body.violationType ||
			body.fineAmount == null ||
			!body.status
		) {
			throw error(400, 'Missing required ticket fields');
		}

		// Ensure amount is a number
		const fineAmount = parseInt(body.fineAmount, 10);
		if (isNaN(fineAmount)) {
			throw error(400, 'Invalid fineAmount. Must be a number.');
		}

		const newTicketData: NewTicket = {
			licensePlate: body.licensePlate,
			driverName: body.driverName,
			violationType: body.violationType,
			fineAmount: fineAmount,
			dateIssued: body.dateIssued ? new Date(body.dateIssued) : new Date(),
			status: body.status
		};

		const insertedTicket = await db.insert(tickets).values(newTicketData).returning();

		if (!insertedTicket || insertedTicket.length === 0) {
			throw error(500, 'Failed to create ticket in database');
		}

		return json(insertedTicket[0], { status: 201 });
	} catch (e: any) {
		console.error('Error creating ticket:', e);

		if (e.status >= 400 && e.status < 600) {
			throw e;
		}

		throw error(500, 'Internal Server Error');
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const allTicket = await db.query.tickets.findMany({
			orderBy: (tickets, { desc }) => [desc(tickets.dateIssued)]
		});

		return json(allTicket);
	} catch (e: any) {
		console.error('Error fetching tickets:', e);
		throw error(500, 'Internal Server Error');
	}
};
