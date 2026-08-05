# Ski Resort API

Backend for the Information System for Ski Resort Booking and Resource Management — built with Express and MySQL.

## Tech Stack
- Node.js
- Express
- MySQL

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root with your database credentials:
   ```
   PORT=
   DB_HOST=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   ```

3. Start the server:
   ```
   npm start
   ```

## Folder Structure
- `src/config` — database connection setup
- `src/controllers` — request handling logic
- `src/middleware` — auth checks, error handling
- `src/models` — MySQL models
- `src/routes` — API route definitions
- `src/services` — reusable business logic
