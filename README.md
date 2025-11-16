# ChronoBank: Community Time Bank API

[cloudflarebutton]

A Cloudflare Worker backend providing a secure, escrow-based API for a community skill exchange platform, powered by Supabase.

This project implements a secure, serverless backend for a community time-banking platform called ChronoBank. Built on Cloudflare Workers, it serves as a robust API gateway that interfaces with a Supabase PostgreSQL database. The system is designed around an escrow-based model for skill and time exchange, ensuring fair and secure transactions between members. The worker handles all business logic, including member registration, authentication via JWT, creation of service offers, handling of service requests, and managing the entire escrow lifecycle from creation to confirmation, dispute, and resolution. All state-mutating operations are transactional and idempotent, leveraging Supabase RPC functions for maximum security and data integrity. The architecture strictly separates read and write operations, using different Supabase clients with distinct privilege levels to enforce security policies.

## Key Features

- **Secure Escrow System**: Ensures fair and safe exchange of services and time credits.
- **Serverless Architecture**: Built on Cloudflare Workers for high performance and scalability.
- **Supabase Integration**: Leverages Supabase for its powerful PostgreSQL database and authentication.
- **JWT Authentication**: Secure, token-based authentication for all protected endpoints.
- **Transactional & Idempotent**: All write operations use Supabase RPCs and idempotency keys to guarantee data integrity.
- **Role-Based Access**: Strict separation of read (anon key) and write (service role key) operations for enhanced security.
- **Automated Cron Jobs**: Handles periodic tasks like auto-releasing escrows and system reconciliation.

## Technology Stack

- **Backend**: [Cloudflare Workers](https://workers.cloudflare.com/), [Hono](https://hono.dev/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: [hono/jwt](https://hono.dev/middlewares/jwt)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Bun](https://bun.sh/)
- **Deployment**: [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Project Structure

The project is a monorepo containing the Cloudflare Worker backend.

- `worker/`: Contains the source code for the Cloudflare Worker.
  - `index.ts`: The entry point for the worker, responsible for routing and middleware.
  - `*.routes.ts`: Route definitions for different API resources.
- `shared/`: Contains shared types and interfaces used by both the worker and potentially a frontend client.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh/docs/installation) (v1.0 or higher)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (authenticated with your Cloudflare account)
- A [Supabase](https://supabase.com/) account and a project with the required database schema loaded.

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chronobank_api
```

### 2. Install Dependencies

This project uses Bun for package management.

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.dev.vars` file in the root of the project for local development. You will need to get these values from your Supabase project dashboard.

```ini
# .dev.vars

SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
JWT_SECRET="generate-a-strong-random-secret"
```

**Note**: `JWT_SECRET` should be a long, random, and securely generated string.

### 4. Run the Development Server

Start the local development server, which will use the variables from your `.dev.vars` file.

```bash
bun dev
```

The API will be available at `http://localhost:8787`.

## API Endpoints

The worker exposes the following endpoints. All request and response bodies are in JSON format.

- `POST /auth/register`: Register a new member.
- `POST /auth/login`: Log in and receive a JWT.
- `POST /member`: Create or update a member profile (authenticated).
- `GET /offers`: List all available service offers.
- `POST /offers-create`: Create a new service offer (authenticated).
- `GET /requests`: List service requests (authenticated).
- `POST /request-accept`: Accept a service request, creating an escrow.
- `POST /escrow/confirm`: Confirm completion of a service and release credits.
- `POST /escrow/dispute`: Open a dispute for an escrowed transaction.
- `POST /admin/disputes/resolve`: (Admin) Resolve a dispute.
- `POST /cron/auto-release`: (Cron) Automatically release completed escrows.
- `POST /cron/reconcile`: (Cron) Reconcile system credit balances.
- `POST /cron/cleanup-idempotency`: (Cron) Clean up old idempotency keys.

## Deployment

This project is designed for deployment to Cloudflare Workers.

### 1. Configure Secrets

Before deploying, you must add your Supabase credentials and JWT secret as secrets to your Cloudflare Worker.

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put JWT_SECRET
```

Wrangler will prompt you to enter the value for each secret.

### 2. Deploy

Deploy the worker to your Cloudflare account using the following command:

```bash
bun deploy
```

Alternatively, deploy with one click:

[cloudflarebutton]

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.