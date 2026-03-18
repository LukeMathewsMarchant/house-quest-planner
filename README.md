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
<img width="741" height="431" alt="image" src="https://github.com/user-attachments/assets/7a9bb034-c288-4498-97a8-dd8827d670b5" />

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


### Saved Homes Search
The Listings page includes a search bar that allows users to filter their saved homes.

### Behavior
The search input is displayed at the top of the Listings page.
The list of saved homes is filtered based on the entered search term.
Searches are case‑insensitive and support partial matches.

### Searchable fields
Saved homes are matched against the following fields:

* Street address
* City
* State
* ZIP code
* Zillow URL
* Bedrooms
* Bathrooms
* Square footage
* Price

If the search term appears in any of these fields, the home is included in the results.
Empty states

If no homes have been saved, users are prompted to add their first house.
If homes exist but none match the search term, a message is displayed indicating that no matching homes were found and suggesting a different search.

### Responsive layout
The search bar and action buttons are responsive and adapt for smaller screens.
The “Add House” action remains accessible on both desktop and mobile layouts.

### isting Link Parsing and Auto‑Fill
When adding a house, users can paste a listing URL and have address fields automatically populated.

### Supported listing sources
The Add House form supports links from common real‑estate platforms, including:

* Zillow
* Realtor.com
* Redfin
* Trulia
* Homes.com
* Apartments.com
* HotPads
* Roofstock
* Zumper

### Behavior
When a user pastes a listing URL into the Zillow/Web listing link field, the application attempts to extract address details from the URL.
If address information is found, the following fields are populated automatically:

* Street address
*  City
* State
* ZIP code


Users can review and edit any auto‑filled values before saving.

### Address parsing logic
URLs are parsed based on known URL patterns for supported platforms.
Hyphen‑delimited address slugs are interpreted to identify street name, city, state, and ZIP code where possible.
If only partial information can be extracted (for example, state and ZIP only), those fields are filled and the remaining fields are left unchanged.

### Fallback behavior
If the URL format is unsupported or no address information can be extracted, no fields are auto‑filled.
Users may always enter address details manually.

### Form usage
The listing link field accepts any valid URL.
Auto‑filling occurs when the link value changes.
Parsed data is used only to assist with form entry and does not override manually edited fields after submission.


## Saved Home Cards
Each saved home is displayed as a card on the Listings page, providing a summary of the property along with key budgeting and management actions.

### Displayed information
Each home card may include:
*   Street address and location details
*   Estimated down payment progress
*   Remaining savings needed based on the user’s goals
*   Price and affordability indicators
*   External listing link (when available)

Information is presented in a compact, scannable layout for quick comparison across homes.

### Listing links
*   If a listing URL is available, the card includes an **Open Listing** action.
*   The link opens the original listing in a new tab.
*   The label is generic and applies to any supported listing provider, not just Zillow.

### Actions
Each card provides basic management actions:
*   **Edit** — Opens the edit modal for the selected home.
*   **Delete** — Removes the home from the user’s saved list after confirmation.

### Animations
*   Cards use subtle motion effects when displayed.
*   Animation variants are applied consistently across cards to maintain visual continuity without affecting functionality.

### Responsive behavior
*   Card layout adapts to different screen sizes.
*   Actions and content remain accessible on both desktop and mobile views.


## Savings Plan and Profile Updates
User savings preferences and planning details can be updated from the profile or onboarding flow. These values are used to tailor affordability calculations and saved home comparisons.

### Supported profile fields
The following optional fields are stored as part of the user’s progress data:
*   **Desired ZIP codes** — Used to focus home searches and recommendations on preferred areas.
    *   Empty or whitespace‑only input is treated as unset.
*   **Monthly contribution goal** — Represents the amount the user plans to save each month.
    *   If not provided, the contribution goal is left unset.

### Update behavior
*   When profile changes are submitted, the user’s progress data is updated.
*   On a successful update:
    *   The cached progress data is refreshed to reflect the latest values.
    *   Dependent views (such as saved homes and affordability calculations) immediately reflect the updated plan.
    *   A confirmation message is shown to the user indicating the profile has been saved.

### User feedback
*   A success message confirms that the latest savings and planning numbers have been applied.
*   Updates do not require a page refresh, allowing users to continue working without interruption.


## Affordability Calculations
The application includes a set of helper functions used to calculate down payments, remaining savings, and estimated savings timelines. These values are used throughout the app to compare saved homes against a user’s financial progress.

### Down payment calculation
The down payment amount is calculated using the home price and the user’s selected down payment percentage.
*   If the price or percentage is missing or invalid, the result defaults to `0`.
*   The returned value represents the total cash required for the down payment.
This calculation is used when displaying affordability details for each saved home.

### Remaining savings
Remaining savings represents how much more money the user needs to save to reach the required down payment.
*   If no saved amount is available, the calculation assumes `0` saved.
*   The result is never negative; once the down payment is met, the remaining amount is `0`.
This value is used to determine progress and timeline estimates.

### Affordability timeline
An estimated timeline is calculated based on:
*   Remaining savings needed
*   The user’s monthly contribution goal

#### Behavior
*   If no additional savings are needed, or if the monthly contribution goal is not set, no timeline is returned.
*   The total time required is calculated in months and broken down into:
    *   Years
    *   Remaining months
*   A human‑readable label is generated (for example: `8 months` or `1 year 3 months`).

#### Returned values
When available, the timeline includes:
*   `months` — total months required
*   `years` — full years portion
*   `remainingMonths` — leftover months after full years
*   `label` — formatted string for display in the UI





