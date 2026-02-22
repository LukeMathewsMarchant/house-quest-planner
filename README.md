## Project info

NOTE FOR GRADERS: The database schema differs slightly from the ERD. As we began making the system, we realized there were some fields that we had not accounted for in the ERD and so we added them in the schema to make the app function correctly.


App Summary. This application helps young professionals who want to buy their first home but feel overwhelmed by the financial and logistical steps involved. Many first‑time buyers struggle to understand how much they need to save, what homes fit their budget, and how to prepare for the buying process. Our primary user is a young professional seeking a simple, personalized, and confidence‑building guide to homeownership. The app provides a money‑saving dashboard to help users track their progress toward a down payment. It also includes a personal account area where users can store their information and receive tailored recommendations. A budget‑filtered house listings page shows realistic home options based on what the user can afford. Additionally, an educational video library offers financial and home‑buying advice, with filters that let users explore topics at their own pace. Together, these features make the path to homeownership feel more approachable, organized, and achievable. 


Tech Stack. Frontend Layer
HTML5 – Page structure and layout
CSS3 – Styling, layout, and responsive design
JavaScript – Client‑side interactivity
TypeScript – Type‑safe scripting for more reliable frontend logic
Vite – Frontend tooling for fast development and bundling
vite-env.d.ts – TypeScript environment declarations used by Vite
Backend Layer
Node.js – JavaScript runtime powering the server
Express.js – Backend framework for routing and API endpoints
server.js – Main server file that initializes Express, handles routes, and connects to the database
Environment Files:
.env – Stores sensitive configuration (DB URL, API keys)
.env.example – Template showing required environment variables
Database Layer
PostgreSQL – Relational database storing user info, budgets, house listings, and preferences

Architecture Diagram. Include a system architecture diagram showing the user, frontend, backend, database, and any external services, with labeled arrows indicating how the components communicate.
---

### Prerequisites

You need the following installed and available in your system PATH to run the project locally:

| Software | Purpose | Install | Verify |
|----------|---------|--------|--------|
| **Node.js** (v18 or later recommended) | JavaScript runtime for frontend and backend | [nodejs.org](https://nodejs.org/) | `node --version` |
| **npm** | Package manager (included with Node.js) | — | `npm --version` |
| **PostgreSQL** | Database server | [postgresql.org/download](https://www.postgresql.org/download/) | `psql --version` |
| **psql** | PostgreSQL client (run schema/seed scripts) | Included with PostgreSQL; ensure it’s on your PATH | `psql --version` |

- **Node.js**: Use the LTS installer for your OS. On macOS you can also use [Homebrew](https://brew.sh/): `brew install node`.
- **PostgreSQL**: Install the server and client tools. On macOS: `brew install postgresql@16` (or latest), then ensure `psql` is on your PATH (e.g. `export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"`).

After installing, run the verify commands above to confirm each tool is available.

---

### Installation and Setup

1. **Clone the repository** (if you haven’t already):
   ```bash
   git clone <your-repo-url>
   cd house-quest-planner
   ```

2. **Create the PostgreSQL database** (PostgreSQL must be running):
   ```bash
   createdb homebuyersHandbook
   ```
   If `createdb` is not in your PATH, use the full path to the PostgreSQL bin directory or connect as a superuser and run `CREATE DATABASE homebuyersHandbook;` in `psql`.

3. **Run the schema and seed scripts** (from the project root):
   ```bash
   psql -d homebuyersHandbook -f db/schema.sql
   psql -d homebuyersHandbook -f db/seed.sql
   ```
   If you need to specify a user or host: `psql -U your_username -d homebuyersHandbook -f db/schema.sql` (and similarly for `seed.sql`).

4. **Configure environment variables** for the backend:
   - Copy the example env file: `cp backend/.env.example backend/.env`
   - Edit `backend/.env` and set:
     - `DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/homebuyersHandbook` (use your PostgreSQL username and password)
     - `PORT=3001` (or another port if you prefer)

5. **Install dependencies** for backend and frontend:
   ```bash
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

---

### Running the Application

1. Start the backend (from the project root):
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Leave this terminal running.

2. In a **second terminal**, start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open the app in your browser at **http://localhost:8080/**.

---

### Verifying the Vertical Slice

We implemented several features that connect to the database. You can verify that data persists as follows.

**Account creation and sign-in**

- Click **Sign in** (top right) or the **Start your journey** button.
- Click **Create account**.
- Enter email, password, and zip, then click **Create account**.
- Enter plan details: Amount Saved, Maximum home price, Down payment %, Monthly income/expenses, Credit score, Timeline, Preferred areas. Click **Create my plan**.
- You should land on the dashboard with your data shown. **Refresh the page** — the data should still be there.

**Savings contribution (button that updates the database)**

- Enter a contribution amount and click **Add**.
- Confirm the savings progress updates. **Refresh the page** — the new total should persist.

**Profile updates**

- Go to **Profile**, change any information, and click **Save changes**. Changes should persist after refresh.

**Sign out and sign back in**

- Click **Sign out**, then sign in again with the same credentials. All previously entered information should still be there.



