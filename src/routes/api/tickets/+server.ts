import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tickets, type NewTicket, type Ticket, ticketStatusEnum } from '$lib/server/db/schema';

import { eq, like, or, and, asc, desc, sql, type SQL } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		if (
			!body.licensePlate ||
			!body.driverName ||
			!body.violationType ||
			body.fineAmount == null ||
			!body.status
		) {
			throw error(400, 'Missing required ticket fields');
		}

		if (!ticketStatusEnum.enumValues.includes(body.status)) {
			throw error(
				400,
				`Invalid status value. Must be one of: ${ticketStatusEnum.enumValues.join(', ')}`
			);
		}

		const fineAmount = parseInt(body.fineAmount, 10);
		if (isNaN(fineAmount) || fineAmount < 0) {
			throw error(400, 'Invalid fineAmount. Must be a non-negative number.');
		}

		const newTicketData: NewTicket = {
			licensePlate: body.licensePlate.trim(),
			driverName: body.driverName.trim(),
			violationType: body.violationType.trim(),
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

		if (e && typeof e === 'object' && 'status' in e && typeof e.status === 'number') {
			throw e;
		}

		throw error(500, 'Internal Server Error creating ticket');
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams;
		const query = searchParams.get('query')?.trim();
		const status = searchParams.get('status');
		const sortBy = searchParams.get('sortBy') || 'dateIssued';
		const sortOrder = searchParams.get('sortOrder') || 'desc';

		const conditions: SQL[] = [];

		if (query) {
			const lowerCaseQuery = query.toLowerCase();
			conditions.push(
				or(
					like(sql<string>`LOWER(${tickets.licensePlate})`, `%${lowerCaseQuery}%`),
					like(sql<string>`LOWER(${tickets.driverName})`, `%${lowerCaseQuery}%`)
				)!
			);
		}

		if (
			status &&
			ticketStatusEnum.enumValues.includes(status as (typeof ticketStatusEnum.enumValues)[number])
		) {
			conditions.push(eq(tickets.status, status as (typeof ticketStatusEnum.enumValues)[number]));
		} else if (status) {
			console.warn(`Invalid status value received: ${status}`);
		}

		const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

		let orderByClause;
		const sortFunction = sortOrder === 'asc' ? asc : desc;

		switch (sortBy) {
			case 'fineAmount':
				orderByClause = sortFunction(tickets.fineAmount);
				break;
			case 'licensePlate':
				orderByClause = sortFunction(tickets.licensePlate);
				break;
			case 'driverName':
				orderByClause = sortFunction(tickets.driverName);
				break;
			case 'status':
				orderByClause = sortFunction(tickets.status);
				break;
			case 'dateIssued':
			default:
				orderByClause = sortFunction(tickets.dateIssued);
				break;
		}

		const fetchedTickets = await db.query.tickets.findMany({
			where: whereCondition,
			orderBy: [orderByClause]
		});

		return json(fetchedTickets);
	} catch (e: any) {
		console.error('Error fetching tickets:', e);
		throw error(500, 'Internal Server Error fetching tickets');
	}
};
