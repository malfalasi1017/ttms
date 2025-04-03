import { json, error, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tickets, type NewTicket } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const ticketId = parseInt(params.id ?? '', 10);

	if (isNaN(ticketId)) {
		throw error(400, 'Invalid ticket ID');
	}

	try {
		const ticket = await db.query.tickets.findFirst({
			where: eq(tickets.id, ticketId)
		});

		if (!ticket) {
			throw error(404, `Ticket with ID ${ticketId} not found`);
		}

		return json(ticket);
	} catch (e: any) {
		console.error(`Error fetching ticket with ID ${ticketId}:`, e);
		if (e.status >= 400 && e.status < 600) {
			throw e;
		}
		throw error(500, 'Internal Server Error');
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const ticketId = parseInt(params.id ?? '', 10);

	if (isNaN(ticketId)) {
		throw error(400, 'Invalid ticket ID');
	}

	try {
		const body = await request.json();

		if (!body || Object.keys(body).length === 0) {
			throw error(400, 'Request body is empty. Nohing to udpate.');
		}

		const updateData: Partial<Omit<NewTicket, 'id'>> = {};

		if (body.licensePlate !== undefined) {
			updateData.licensePlate = body.licensePlate;
		}
		if (body.driverName !== undefined) {
			updateData.driverName = body.driverName;
		}
		if (body.violationType !== undefined) {
			updateData.violationType = body.violationType;
		}
		if (body.fineAmount !== undefined) {
			updateData.fineAmount = parseInt(body.fineAmount, 10);
		}
		if (body.dateIssued !== undefined) {
			updateData.dateIssued = new Date(body.dateIssued);
		}
		if (body.status !== undefined) {
			updateData.status = body.status;
		}

		if (Object.keys(updateData).length === 0) {
			throw error(400, 'No valid fields to update');
		}

		const updatedTicket = await db
			.update(tickets)
			.set(updateData)
			.where(eq(tickets.id, ticketId))
			.returning();

		if (!updatedTicket || updatedTicket.length === 0) {
			throw error(404, `Ticket with ID ${ticketId} not found`);
		}

		return json(updatedTicket[0]);
	} catch (e: any) {
		console.error(`Error updating ticket with ID ${ticketId}:`, e);

		if (e.status >= 400 && e.status < 600) {
			throw e;
		}

		throw error(500, 'Internal Server Error');
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const ticketId = parseInt(params.id ?? '', 10);

	if (isNaN(ticketId)) {
		throw error(400, 'Invalid ticket ID provided.');
	}

	try {
		const deletedTickets = await db
			.delete(tickets)
			.where(eq(tickets.id, ticketId))
			.returning({ deletedId: tickets.id });

		if (!deletedTickets || deletedTickets.length === 0) {
			throw error(404, `Ticket with ID ${ticketId} not found.`);
		}

		return new Response(null, { status: 204 });
	} catch (e: any) {
		console.error(`Error deleting ticket ${ticketId}:`, e);
		if (e.status >= 400 && e.status < 600) {
			throw e;
		}
		throw error(500, `An unexpected error occurred while deleting ticket ${ticketId}.`);
	}
};
