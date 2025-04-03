<script lang="ts">
	import type { PageData } from './$types';
	import type { Ticket } from '$lib/server/db/schema';

	import { onMount } from 'svelte';
	import { format } from 'date-fns';

	import { goto } from '$app/navigation';

	export let data: PageData;

	let tickets: Ticket[] = data.tickets || [];

	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';

	let searchLicensePlate = '';
	let searchDriverName = '';
	let searchStatus = '';
	let sortBy = 'dateIssued';
	let sortOrder = 'desc';

	let debounceTimer: number;
	function debounceFetch() {
		clearTimeout(debounceTimer);
		debounceTimer = window.setTimeout(() => {
			fetchTickets();
		}, 500); // Fetch 500ms after user stops typing
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
		if (searchLicensePlate) params.set('licensePlate', searchLicensePlate);
		if (searchDriverName) params.set('driverName', searchDriverName);
		if (searchStatus) params.set('status', searchStatus);
		params.set('sortBy', sortBy);
		params.set('sortOrder', sortOrder);

		try {
			const response = await fetch(`/api/tickets?${params.toString()}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			tickets = await response.json();
		} catch (error: any) {
			console.error('Failed to fetch tickets:', error);
			errorMessage = error.message || 'Failed to load tickets. Please try again.';
			tickets = [];
		} finally {
			isLoading = false;
		}
	}

	function handleSort(column: 'dateIssued' | 'fineAmount') {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'desc'; // Default to descending for new column
		}
		fetchTickets();
	}

	async function deleteTicket(id: number) {
		if (!confirm('Are you sure you want to delete this ticket?')) {
			return;
		}
		try {
			isLoading = true; // Optional: indicate loading during delete
			const response = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
			if (!response.ok) {
				if (response.status === 404) throw new Error('Ticket not found.');
				throw new Error(`Failed to delete ticket (Status: ${response.status})`);
			}
			// Remove from UI immediately or refetch list
			tickets = tickets.filter((t) => t.id !== id);
			// Or fetchTickets(); // To refresh the list from the server
		} catch (error: any) {
			console.error('Delete failed:', error);
			errorMessage = error.message || 'Failed to delete ticket.';
		} finally {
			isLoading = false;
		}
	}

	const statusOptions = ['', 'issued', 'paid', 'contested', 'cancelled'];
</script>

<h1>Traffic Ticket Management</h1>

{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

<div class="controls">
	<input
		type="search"
		placeholder="License Plate..."
		bind:value={searchLicensePlate}
		on:input={debounceFetch}
	/>
	<input
		type="search"
		placeholder="Driver Name..."
		bind:value={searchDriverName}
		on:input={debounceFetch}
	/>
	<select bind:value={searchStatus} on:change={fetchTickets}>
		<option value="">All Statuses</option>
		{#each statusOptions as status}
			{#if status}
				<option value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>{/if}
		{/each}
	</select>
	<a href="/tickets/new" class="button">Add New Ticket</a>
</div>

{#if isLoading}
	<p>Loading tickets...</p>
{/if}

<div class="table-container">
	<!-- For responsiveness -->
	<table>
		<thead>
			<tr>
				<th>License Plate</th>
				<th>Driver Name</th>
				<th>Violation</th>
				<th on:click={() => handleSort('fineAmount')} style="cursor: pointer;">
					Fine {sortBy === 'fineAmount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
				</th>
				<th on:click={() => handleSort('dateIssued')} style="cursor: pointer;">
					Date Issued {sortBy === 'dateIssued' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
				</th>
				<th>Status</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each tickets as ticket (ticket.id)}
				<tr>
					<td>{ticket.licensePlate}</td>
					<td>{ticket.driverName}</td>
					<td>{ticket.violationType}</td>
					<td>${ticket.fineAmount}</td>
					<td>{format(new Date(ticket.dateIssued), 'yyyy-MM-dd HH:mm')}</td>
					<td>{ticket.status}</td>
					<td>
						<a href="/tickets/{ticket.id}/edit">Edit</a>
						<button on:click={() => deleteTicket(ticket.id)}>Delete</button>
						<!-- Link to PDF Invoice API endpoint -->
						<a href="/api/tickets/{ticket.id}/invoice" target="_blank" rel="noopener noreferrer"
							>Invoice</a
						>
					</td>
				</tr>
			{:else}
				{#if !isLoading}
					<tr>
						<td colspan="7">No tickets found.</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* Basic Styling & Responsiveness */
	.controls {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}
	.table-container {
		overflow-x: auto;
	} /* Allow horizontal scroll on small screens */
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		border: 1px solid #ccc;
		padding: 8px;
		text-align: left;
	}
	th {
		background-color: #f2f2f2;
		cursor: pointer;
	}
	.error {
		color: red;
	}
	button,
	.button {
		/* Basic button styling */
		padding: 5px 10px;
		margin-left: 5px;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
		border: 1px solid #ccc;
		background-color: #eee;
	}
	.button {
		display: inline-block;
	}
	a {
		margin: 0 5px;
	}

	/* Add more sophisticated responsive styles with media queries or Tailwind */
	@media (max-width: 768px) {
		/* Example: stack controls vertically */
		.controls {
			flex-direction: column;
			align-items: stretch;
		}
		input,
		select,
		.button {
			width: 100%;
			box-sizing: border-box;
			margin-bottom: 5px;
		}
		/* Consider hiding less important columns or using a card layout */
	}
</style>
