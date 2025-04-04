<script lang="ts">
	let { ticket = null, isEditMode = false, onSubmit = () => {}, onCancel = () => {} } = $props();

	const defaultTicket = {
		licensePlate: '',
		driverName: '',
		violationType: '',
		fineAmount: '',
		dateIssued: new Date().toISOString().split('T')[0],
		status: 'issued',
		notes: ''
	};

	let formData = $state(ticket ? { ...ticket } : { ...defaultTicket });
	let errors = $state({
		licensePlate: '',
		driverName: '',
		violationType: '',
		fineAmount: ''
	});

	const violationTypes = [
		'Speeding',
		'Running red light',
		'Illegal parking',
		'No valid license',
		'No insurance',
		'Driving under influence',
		'Reckless driving',
		'Other'
	];

	const statusOptions = ['issued', 'paid', 'contested', 'cancelled'];

	function validateForm() {
		errors = {
			licensePlate: '',
			driverName: '',
			violationType: '',
			fineAmount: ''
		};

		if (!formData.licensePlate) errors.licensePlate = 'License plate is required';
		if (!formData.driverName) errors.driverName = 'Driver name is required';
		if (!formData.violationType) errors.violationType = 'Violation type is required';

		if (!formData.fineAmount) {
			errors.fineAmount = 'Fine amount is required';
		} else {
			const fineValue = Number(formData.fineAmount);
			if (isNaN(fineValue)) {
				errors.fineAmount = 'Fine amount must be a number';
			} else if (fineValue <= 0) {
				errors.fineAmount = 'Fine amount must be a positive number';
			} else if (!Number.isInteger(fineValue)) {
				errors.fineAmount = 'Fine amount must be a whole number';
			}
		}

		return !Object.values(errors).some((error) => error !== '');
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		if (validateForm()) {
			const submittedTicket = {
				...formData,
				fineAmount: Number(formData.fineAmount),
				dateIssued: formData.dateIssued ? new Date(formData.dateIssued) : new Date()
			};

			onSubmit(submittedTicket);
		}
	}
</script>

<form onsubmit={handleSubmit} class="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
	<h2 class="mb-6 text-center text-2xl font-bold">{isEditMode ? 'Edit Ticket' : 'New Ticket'}</h2>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<label for="licensePlate" class="block font-medium">License Plate *</label>
			<input
				type="text"
				id="licensePlate"
				bind:value={formData.licensePlate}
				class="w-full rounded-md border p-2 {errors.licensePlate
					? 'border-red-500'
					: 'border-gray-300'}"
			/>
			{#if errors.licensePlate}
				<p class="text-sm text-red-500">{errors.licensePlate}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="driverName" class="block font-medium">Driver Name *</label>
			<input
				type="text"
				id="driverName"
				bind:value={formData.driverName}
				class="w-full rounded-md border p-2 {errors.driverName
					? 'border-red-500'
					: 'border-gray-300'}"
			/>
			{#if errors.driverName}
				<p class="text-sm text-red-500">{errors.driverName}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="violationType" class="block font-medium">Violation Type *</label>
			<select
				id="violationType"
				bind:value={formData.violationType}
				class="w-full rounded-md border p-2 {errors.violationType
					? 'border-red-500'
					: 'border-gray-300'}"
			>
				<option value="">Select a violation type</option>
				{#each violationTypes as type}
					<option value={type}>{type}</option>
				{/each}
			</select>
			{#if errors.violationType}
				<p class="text-sm text-red-500">{errors.violationType}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="fineAmount" class="block font-medium">Fine Amount ($) *</label>
			<input
				type="number"
				id="fineAmount"
				bind:value={formData.fineAmount}
				min="1"
				step="1"
				placeholder="Enter whole number amount"
				class="w-full rounded-md border p-2 {errors.fineAmount
					? 'border-red-500'
					: 'border-gray-300'}"
			/>
			{#if errors.fineAmount}
				<p class="text-sm text-red-500">{errors.fineAmount}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<label for="dateIssued" class="block font-medium">Date Issued</label>
			<input
				type="date"
				id="dateIssued"
				bind:value={formData.dateIssued}
				class="w-full rounded-md border border-gray-300 p-2"
			/>
		</div>

		{#if isEditMode}
			<div class="space-y-2">
				<label for="status" class="block font-medium">Status</label>
				<select
					id="status"
					bind:value={formData.status}
					class="w-full rounded-md border border-gray-300 p-2"
				>
					{#each statusOptions as status}
						<option value={status}>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="col-span-1 space-y-2 md:col-span-2">
			<label for="notes" class="block font-medium">Additional Notes</label>
			<textarea
				id="notes"
				bind:value={formData.notes}
				rows="3"
				class="w-full rounded-md border border-gray-300 p-2"
			></textarea>
		</div>
	</div>

	<div class="mt-6 flex justify-end gap-4">
		<button
			type="button"
			onclick={(event) => onCancel(event)}
			class="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
		>
			Cancel
		</button>
		<button
			type="submit"
			class="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
		>
			{isEditMode ? 'Update' : 'Create'} Ticket
		</button>
	</div>
</form>
