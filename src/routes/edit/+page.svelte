<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import TicketForm from '$lib/components/ticketForm.svelte';

	// Track states using Svelte 5 runes
	let loading = $state(true);
	let error = $state<string | null>(null);
	let ticketData = $state<any | null>(null);
	let isSubmitting = $state(false);

	// Get the ticket ID from the URL
	$effect(() => {
		const id = $page.url.searchParams.get('id');
		if (id) {
			fetchTicket(id);
		} else {
			error = 'No ticket ID provided';
			loading = false;
		}
	});

	/**
	 * Fetch ticket data from the API
	 */
	async function fetchTicket(id: string) {
		try {
			loading = true;
			error = null;

			const response = await fetch(`/api/tickets/${id}`);

			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('Ticket not found');
				}
				throw new Error(`Error: ${response.status}`);
			}

			ticketData = await response.json();

			// Format date for date input
			if (ticketData.dateIssued) {
				ticketData.dateIssued = new Date(ticketData.dateIssued).toISOString().split('T')[0];
			}
		} catch (err: any) {
			error = err.message || 'Failed to load ticket';
			console.error('Error fetching ticket:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Handle form submission for updating a ticket
	 */
	async function handleSubmit(submittedTicket: any) {
		try {
			isSubmitting = true;
			error = null;

			const id = $page.url.searchParams.get('id');
			if (!id) {
				throw new Error('No ticket ID provided');
			}

			const response = await fetch(`/api/tickets/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submittedTicket)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(errorData?.message || `Error: ${response.status}`);
			}

			// Redirect to home page after successful update
			goto('/');
		} catch (err: any) {
			console.error('Failed to update ticket:', err);
			error = err.message || 'Failed to update ticket. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Handle cancel button click
	 */
	function handleCancel() {
		goto('/');
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-6">
		<a href="/" class="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				class="mr-1"
				viewBox="0 0 16 16"
			>
				<path
					fill-rule="evenodd"
					d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
				/>
			</svg>
			Back to Tickets
		</a>
	</div>

	{#if error}
		<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
			<p class="font-bold">Error</p>
			<p>{error}</p>
			<div class="mt-4">
				<button
					class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
					onclick={() => goto('/')}
				>
					Return to Tickets
				</button>
			</div>
		</div>
	{:else if loading}
		<div class="flex justify-center p-8">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if isSubmitting}
		<div class="flex justify-center p-4">
			<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if ticketData}
		<TicketForm
			ticket={ticketData}
			isEditMode={true}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
		/>
	{/if}
</div>
