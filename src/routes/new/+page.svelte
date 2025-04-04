<script lang="ts">
	import { goto } from '$app/navigation';
	import TicketForm from '$lib/components/ticketForm.svelte';

	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(submittedTicket: any) {
		try {
			isSubmitting = true;
			error = null;

			const response = await fetch('/api/tickets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submittedTicket)
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new Error(errorData?.message || `Error: ${response.status}`);
			}

			goto('/');
		} catch (err: any) {
			console.error('Failed to create ticket:', err);
			error = err.message || 'Failed to create ticket. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

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
			<p>{error}</p>
		</div>
	{/if}

	{#if isSubmitting}
		<div class="flex justify-center p-4">
			<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{/if}

	<TicketForm onSubmit={handleSubmit} onCancel={handleCancel} />
</div>
