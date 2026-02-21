## Project info

NOTE FOR GRADERS: The database schema differs slightly from the ERD. As we began making the system, we realized there were some fields that we had not accounted for in the ERD and so we added them in the schema to make the app function correctly.


App Summary. This application helps young professionals who want to buy their first home but feel overwhelmed by the financial and logistical steps involved. Many first‑time buyers struggle to understand how much they need to save, what homes fit their budget, and how to prepare for the buying process. Our primary user is a young professional seeking a simple, personalized, and confidence‑building guide to homeownership. The app provides a money‑saving dashboard to help users track their progress toward a down payment. It also includes a personal account area where users can store their information and receive tailored recommendations. A budget‑filtered house listings page shows realistic home options based on what the user can afford. Additionally, an educational video library offers financial and home‑buying advice, with filters that let users explore topics at their own pace. Together, these features make the path to homeownership feel more approachable, organized, and achievable. (Abbie)


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
PostgreSQL – Relational database storing user info, budgets, house listings, and preferences (Abbie)

Architecture Diagram. Include a system architecture diagram showing the user, frontend, backend, database, and any external services, with labeled arrows indicating how the components communicate. (Ryan)


Prerequisites. List all required software needed to run the project locally (e.g., Node.js, PostgreSQL, and psql available in the system PATH). Provide links to official installation instructions and include commands to verify installation. (Grant)
Installation and Setup. Provide clear step-by-step instructions for installing dependencies, creating the database, running schema.sql and seed.sql, and configuring environment variables if required. (Grant)


Here is how you can run the application
From the root directory type “cd backend” in the terminal
Then type “npm install”
Then “npm run dev” this will start the backend
Then open a separate terminal (while the other is still running)
From the root type “cd frontend” if you are currently in the backend folder you can type “cd ..” to get back to the root
Then type “npm install”
Then type “npm run dev”
Then you can open the application at http://localhost:8080/
We actually went ahead and created several features connecting to the database because it made more sense from a cohesive ux experience. The first is account creation and signing in. 
Click “Sign in” in the top right corner or the big “Start your journey” button
Then click “create account”
Enter email, password, and zip then click create account
Enter personalized plan information.
Amount Saved
Maximum home price
Down payment percentage
Monthly income and monthly expenses
Credit Score
Timeline
Preferred areas
Then click create my plan
Then the system will take you to the dashboard and you can see that the data has been saved
You can refresh the page and it will stay the same
Enter a contribution amount and click add
You can see it updates the savings progress. You can refresh the page and it will stay the same
You can also click on profile and update any of the information there and click save changes and it will persist.
For more testing you can click sign out.
Then sign in with the credentials you made
You will see that all of the information you entered earlier is still there. 



