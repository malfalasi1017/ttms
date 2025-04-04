# Traffic Ticket Management System (TTMS)

A modern traffic ticket management application built with SvelteKit and TypeScript, designed to help law enforcement agencies and administrative staff efficiently manage traffic violations.

## Features

- 📋 Complete CRUD operations for traffic tickets
- 🔍 Search functionality for license plates and driver names
- 🔄 Sort tickets by date or fine amount
- 🏷️ Filter by ticket status (issued, paid, contested, cancelled)
- 💰 Track fines and payment status
- 🛡️ Error handling and validation
- 📱 Responsive design for all devices

## Technology Stack

- **Frontend**: SvelteKit 2.x with Svelte 5 Runes
- **Styling**: TailwindCSS
- **Database**: SQLite (via Drizzle ORM)
- **API**: RESTful API endpoints
- **Date Handling**: date-fns

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ttms.git
   cd ttms
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npm run db:setup
   ```

4. Generate test data (optional):
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development Server

Start the development server with:

```bash
# Standard development server
npm run dev

# Open browser automatically
npm run dev -- --open
```

The application will be available at `http://localhost:5173`.

### Production Build

Create a production-ready build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Database Schema

The application uses the following main data structure:

```typescript
interface Ticket {
	id: number;
	licensePlate: string;
	driverName: string;
	violationType: string;
	fineAmount: number;
	dateIssued: Date;
	status: 'issued' | 'paid' | 'contested' | 'cancelled';
}
```

## API Endpoints

The application provides the following API endpoints:

- `GET /api/tickets` - Get all tickets (with optional filtering)
- `GET /api/tickets/:id` - Get a specific ticket
- `POST /api/tickets` - Create a new ticket
- `PUT /api/tickets/:id` - Update an existing ticket
- `DELETE /api/tickets/:id` - Delete a ticket

Query parameters for filtering:

- `query` - Search by license plate or driver name
- `status` - Filter by ticket status
- `sortBy` - Sort by field (dateIssued, fineAmount)
- `sortOrder` - Sort direction (asc, desc)

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Make sure your database file has the proper permissions.
- **API Not Responding**: Check that you're running both the client and server.
- **Styling Issues**: Clear your browser cache to ensure CSS updates are applied.

### Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Developed with ❤️ by Mohammed Alfalasi
