import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	try {
		const initalTickets = await db.query.tickets.findMany({
			orderBy: [desc(tickets.dateIssued)]
		});

		return {
			tickets: initalTickets
		};
	} catch (e: any) {
		console.error('Error fetching tickets:', e);
		if (e.status >= 400 && e.status < 600) {
			throw e;
		}
		throw error(500, 'Internal Server Error');
	}
};
