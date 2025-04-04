<script lang="ts">
	import type { PageData } from './$types';
	import type { Ticket } from '$lib/server/db/schema';
	import { format } from 'date-fns';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	let tickets = $state<Ticket[]>([]);
	let isLoading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	let searchQuery = $state('');
	let searchStatus = $state('');
	let sortBy = $state('dateIssued');
	let sortOrder = $state<'asc' | 'desc'>('desc');

	let debounceTimer = $state<number | null>(null);

	$effect(() => {
		if (data && data.tickets) {
			tickets = data.tickets;
		}
	});

	function debounceFetch() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = window.setTimeout(() => {
			fetchTickets();
		}, 300);
	}

	function clearMessages() {
		setTimeout(() => {
			errorMessage = '';
			successMessage = '';
		}, 3000);
	}

	async function fetchTickets() {
		isLoading = true;
		errorMessage = '';
		const params = new URLSearchParams();

		if (searchQuery) {
			params.set('query', searchQuery);
		}

		if (searchStatus) {
			params.set('status', searchStatus);
		}

		params.set('sortBy', sortBy);
		params.set('sortOrder', sortOrder);

		try {
			const response = await fetch(`/api/tickets?${params.toString()}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			tickets = result;
		} catch (error) {
			console.error('Failed to fetch tickets:', error);
			errorMessage = 'Failed to load tickets. Please try again.';
			tickets = [];
		} finally {
			isLoading = false;
		}
	}

	function handleSort(column: string) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'desc';
		}
		fetchTickets();
	}

	async function deleteTicket(id: string) {
		if (!confirm('Are you sure you want to delete this ticket?')) {
			return;
		}
		try {
			isLoading = true;
			const response = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
			if (!response.ok) {
				if (response.status === 404) throw new Error('Ticket not found.');
				throw new Error(`Failed to delete ticket (Status: ${response.status})`);
			}

			tickets = tickets.filter((t) => String(t.id) !== id);
			successMessage = 'Ticket deleted successfully';
			clearMessages();
		} catch (error) {
			console.error('Delete failed:', error);
			errorMessage = 'Failed to delete ticket.';
			clearMessages();
		} finally {
			isLoading = false;
		}
	}

	const statusOptions = ['', 'issued', 'paid', 'contested', 'cancelled'];
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-center text-3xl font-bold">Traffic Ticket Management</h1>

	{#if errorMessage}
		<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
			<p>{errorMessage}</p>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
			<p>{successMessage}</p>
		</div>
	{/if}

	<div class="mx-auto mb-6 max-w-2xl rounded-lg bg-white p-6 shadow-md">
		<div class="flex flex-wrap items-center gap-4">
			<input
				type="search"
				placeholder="Search license plate or driver name..."
				bind:value={searchQuery}
				oninput={debounceFetch}
				class="w-full rounded-md border border-gray-300 p-2 md:w-64"
			/>

			<select
				bind:value={searchStatus}
				onchange={debounceFetch}
				class="w-full rounded-md border border-gray-300 p-2 md:w-auto"
			>
				<option value="">All Statuses</option>
				{#each statusOptions as status}
					{#if status}
						<option value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
					{/if}
				{/each}
			</select>

			<a
				href="/new"
				class="w-full rounded-md bg-green-500 p-2 text-center text-white transition-colors hover:bg-green-600 md:ml-auto md:w-auto"
			>
				Add New Ticket
			</a>
		</div>
	</div>

	{#if isLoading}
		<div class="flex justify-center p-4">
			<div class="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{/if}

	<div class="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow-md">
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
					<tr class="border-b bg-gray-50">
						<th class="p-3 text-left font-medium text-gray-700">License Plate</th>
						<th class="p-3 text-left font-medium text-gray-700">Driver Name</th>
						<th class="p-3 text-left font-medium text-gray-700">Violation</th>
						<th class="p-3 text-left font-medium text-gray-700">
							<button
								type="button"
								class="flex cursor-pointer items-center border-0 bg-transparent p-0 font-medium"
								onclick={() => handleSort('fineAmount')}
							>
								Fine
								<span class="ml-1">
									{sortBy === 'fineAmount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
								</span>
							</button>
						</th>
						<th class="p-3 text-left font-medium text-gray-700">
							<button
								type="button"
								class="flex cursor-pointer items-center border-0 bg-transparent p-0 font-medium"
								onclick={() => handleSort('dateIssued')}
							>
								Date Issued
								<span class="ml-1">
									{sortBy === 'dateIssued' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
								</span>
							</button>
						</th>
						<th class="p-3 text-left font-medium text-gray-700">Status</th>
						<th class="p-3 text-left font-medium text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each tickets as ticket (ticket.id)}
						<tr class="border-b hover:bg-gray-50">
							<td class="p-3">{ticket.licensePlate}</td>
							<td class="p-3">{ticket.driverName}</td>
							<td class="p-3">{ticket.violationType}</td>
							<td class="p-3">${ticket.fineAmount}</td>
							<td class="p-3">{format(new Date(ticket.dateIssued), 'yyyy-MM-dd HH:mm')}</td>
							<td class="p-3">
								<span
									class={ticket.status === 'paid'
										? 'rounded-full bg-green-100 px-2 py-1 text-sm text-green-800'
										: ticket.status === 'contested'
											? 'rounded-full bg-orange-100 px-2 py-1 text-sm text-orange-800'
											: ticket.status === 'cancelled'
												? 'rounded-full bg-red-100 px-2 py-1 text-sm text-red-800'
												: 'rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800'}
								>
									{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
								</span>
							</td>
							<td class="flex space-x-2 p-3">
								<a
									href={`/edit?id=${ticket.id}`}
									class="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
								>
									Edit
								</a>
								<button
									type="button"
									onclick={() => deleteTicket(String(ticket.id))}
									class="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
								>
									Delete
								</button>
							</td>
						</tr>
					{:else}
						{#if !isLoading}
							<tr>
								<td colspan="7" class="p-8 text-center text-gray-500">
									No tickets found. Add a new ticket to get started.
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
