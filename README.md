### Hotel Pro: Enterprise Property Management & Reservation System

Hotel Pro is a production-ready, full-stack web application designed for modern hospitality businesses. Built on the MERN stack with a strict Model-View-Controller (MVC) architecture, the system provides real-time room availability orchestration, strict double-booking protections via atomic concurrency locks, digital self-service check-in workflows, and an administrative dashboard for real-time occupancy and revenue tracking. 

###  Key System Features

* **Dynamic Room Catalog & Live Orchestration:** Real-time synchronization of room inventory across statuses (available, locked, occupied, maintenance).
* **Concurrency Protection (Double-Booking Prevention):** Implements an atomic document-locking mechanism using MongoDB workflows. Selecting a room secures a strict 10-minute hold window, automatically clearing via system timeouts if the check-out flow isn't completed.
* **Digital Self-Service Check-In:** Complete guest workflow allowing incoming visitors to digitally verify identity, confirm arrival, and view digital confirmation passes.
* **Automated Operational State Transitions:** Triggering a checkout automatically changes room status back to available instantly updating operational logs.
* **Granular Role-Based Access Control (RBAC):** Distinct router layers separating guest activities (browsing, locking, profiles) from administrative modules (CRUD inventory operations, system-wide transaction supervision).

### 🛠️ Architecture & Tech Stack

### Backend Structure

* **Runtime:** Node.js
* **Framework:** Express.js (Strict MVC organization)
* **Database Engine:** MongoDB with Mongoose Object Data Modeling (ODM)
* **Authentication Strategy:** Stateless JSON Web Tokens (JWT) along with salted bcryptjs password hashing

### Frontend Structure

* **Core Library:** React 18+ (Compiled via Vite layout engines)
* **Routing Control:** React Router DOM v6
* **UI/UX Styling:** Tailwind CSS UI frameworks
* **Data Integration Layer:** Axios instance networks utilizing unified configuration variables
* **Iconography Components:** Lucide React libraries

###  Project Structure

* **hotel-pro/** (Root Directory) 

  *  **backend/** — Core server workspace. 

    * config/ — Database setup & infrastructure configuration.
    * controllers/ — Core business logic for endpoints.
    * middleware/ — Security guards, session checks & RBAC layers.
    * models/ — Data schemas representing system entities.
    * routes/ — Endpoint mapping connecting client entry gateways.
    * seed/ — Mock ingestion logic for framework staging.
    * server.js — Main launchpad for the system engine.
      
  *  **frontend/** — Client rendering dashboard setup. 

    * **src/** — Dynamic asset folder tree. 

      * components/ — Shared structural layouts, loaders & layout elements.
      * context/ — State orchestration engines managing authorization globally.
      * hooks/ — Modular functional layout hook components.
      * pages/ — View interface panels containing system operational hubs.
      * utils/ — Interceptor setups managing core API connections.

###  System Installation & Environment Setup

### 1. Prerequisites

Ensure you have the latest stable versions of **Node.js** (v18+) and **MongoDB** installed on your system. 

### 2. Backend Installation & Configurations

Navigate to the backend server directory: 

bash

cd backend
npm install


Create a .env file in the root of your backend/ directory following this schema: 

env

PORT=5000
MONGO_URI=mongodb://localhost:27017/hotel_pro
JWT_SECRET=your_super_secure_jwt_production_secret_key
NODE_ENV=development

### 3. Database Seeding

Populate your database with default room layouts and an administrative profile for evaluation by running the seeding execution task: 

bash

npm run seed


### 4. Frontend Installation & Configurations

Open a new terminal window, navigate to your frontend directory, and run the installation script: 

bash

cd frontend
npm install

Create a .env file in the root of your frontend/ directory to anchor the API endpoint routing: 

env

VITE_API_URL=http://localhost:5000/api

###  Running the Application

### Launch the Backend Engine

From the backend/ workspace folder: 

bash

npm run dev


The server will boot and confirm connection bindings on http://localhost:5000. 

### Launch the Frontend Environment

From the frontend/ application folder: 

bash

npm run dev


Open your browser to the local address provided by Vite (typically http://localhost:5173) to interact with the operational dashboard interface. 

###  Quality & System Guardrails

* **Data Consistency Isolation:** Room matching operations utilize strict validations ensuring guest counts never bypass absolute maximum capacity boundaries.
* **Resilient Async Handlers:** Every asynchronous data pipeline is encapsulated within dedicated try-catch boundaries, ensuring standard JSON response structural integrity: { success: false, message: "Standard clear explanation string" }.
* **Token Expiring Monitors:** Router navigation guards monitor route requests, automatically scrubbing authentication cache stores and returning expired client sessions back to the login terminal immediately upon authorization failure.
