Read me for Phoneme Activity Builder:
This is a Next.js (App Router) application for generating phoneme based Wordle and WordSearch activities. It includes full CRUD support (editing based operations), Prisma ORM, SQLite database, and Docker containerisation.
Tech Stack
-Next.js 14 (App Router)
-React + TypeScript
-Created using: npx create-next-app . (assignment requirement)
-Prisma ORM
-SQLite database
-Node.js 20
-Docker (Debian-based image)

Overview
This application allows teachers and educators to create phoneme based literacy activities:
•	Wordle puzzles
•	WordSearch grids
•	Saved activities
•	Editable activities
•	Printable HTML versions
The app supports full CRUD operations and stores activities in a SQLite database using Prisma ORM.

You can: Create phoneme-based Wordle activities, Create phoneme-based WordSearch activities, Save activities to the database, Edit existing activities, Delete activities, Load saved activities, Generate printable HTML versions and Fully containerised with Docker


How to Use the App:
Create an Activity
1.	Navigate to the Activities page
2.	Click “Create Activity”
3.	Enter phonemes, words, or puzzle details
4.	Save the activity
Edit an Activity
1.	Open an existing activity
2.	Modify fields
3.	Save changes
Generate Wordle / WordSearch
1.	Choose activity
2.	Click “Generate Wordle” or “Generate WordSearch”
3.	View or export the generated puzzle
Delete an Activity
1.	Open the activity
2.	Click “Delete”


Database
The project uses Prisma + SQLite.
Connection string:
Code
DATABASE_URL="file:./prisma/dev.db"
Why SQLite?
•	Lightweight
•	Easy to embed in Docker
•	No external server required
•	Recommended in assignment brief
•	Familiar from previous coursework
Database Rework
During development, the database schema was redesigned multiple times to support:
•	cleaner Activity model
•	better Wordle/WordSearch separation
•	simpler CRUD operations
•	easier Prisma migrations
API Routing
Activities API
Code
POST   /api/activities      # Create
GET    /api/activities      # Read all
GET    /api/activities/:id  # Read one
PUT    /api/activities/:id  # Update
DELETE /api/activities/:id  # Delete
Wordle / WordSearch Generation
Code
POST /api/wordle
POST /api/wordsearch
Project Structure
Code
phoneme-activity-builder/
│
├── prisma/
│   ├── schema.prisma
│   ├── dev.db
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── activities/
│   │   │   │   ├── route.ts
│   │   │   └── wordle/
│   │   │       └── route.ts
│   │   ├── activities/
│   │   │   ├── page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── page.tsx
│
├── public/
├── Dockerfile
├── package.json
├── .env.example
└── README.md
Running the App Locally
Have the app folder and code on your computer or a usb
npm install
npm run dev
go to the provided link
Running the App in Docker
Build the Docker image
Code
docker build -t phoneme-activity-builder .
Run the container
Code
docker run -p 3000:3000 phoneme-activity-builder
Access the app
Code
http://localhost:3000


Automated Testing (Playwright)
Install Playwright
Code
npx playwright install
Run tests
Code
npx playwright test --headed
Test Coverage
Create Wordle Activity

Play & Export Wordle

Create Word Search Activity

Play Word Search

✔ All tests passed successfully.

Accessibility Testing (Lighthouse)
Scores
Wordle Create Page: 95

WordSearch Create Page: 94

All other pages: 99–100

Issues Identified
Touch targets slightly small

Some form labels missing explicit htmlFor

Minor colour contrast issues

Focus ring visibility improvements

Conclusion
The app meets WCAG AA in most areas and is highly accessible.

Performance Testing (JMeter)
Final Error Rates
Load Level	Threads	Requests	Error Rate
100× load	100	162	0%
1000× load	1000	22,742	68.7%
10,000 requests	1000×10 loops	24,742	60.65%


Interpretation
The system handles normal and moderate load extremely well

Under extreme load, the system degrades gracefully

No crashes, no corrupted data

Behaviour is consistent with Node.js + SQLite limitations