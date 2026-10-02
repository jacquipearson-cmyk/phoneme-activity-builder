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
