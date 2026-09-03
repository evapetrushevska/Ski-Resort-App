# Ski Resort API

Backend for the Information System for Ski Resort Booking and Resource Management — built with Express and MySQL.

## Tech Stack
- Node.js
- Express
- MySQL
- JWT (jsonwebtoken) for authentication
- bcrypt for password hashing

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root with your database credentials:
   ```
   PORT=30049
   DB_HOST=localhost
   DB_USER=studenti
   DB_PASS=S039C8R7
   DB_DATABASE=SISIII2026_89231091
   JWT_SECRET=
   ```

3. Start the server:
   ```
   npm run dev
   ```

## Roles

The system supports three roles:
- **visitor** — books ski passes, lessons, and equipment rentals
- **instructor** — views their teaching schedule and accepts/declines lesson requests
- **admin** — manages slopes, weather, equipment, and views dashboard statistics

Visitor and instructor accounts are created through registration. Admin accounts are assigned manually in the database.

## API Overview

| Route | Description |
|---|---|
| `POST /auth/register` | Register a new visitor or instructor account |
| `POST /auth/login` | Log in and receive a JWT token |
| `GET /slopes` | List all slopes with weather info |
| `POST /slopes` | Add a new slope (admin only) |
| `PUT /slopes/:id/status` | Open or close a slope (admin only) |
| `PUT /slopes/:id/weather` | Update weather for a slope (admin only) |
| `GET /equipment` | List all equipment |
| `POST /equipment` | Add new equipment (admin only) |
| `PUT /equipment/:id/status` | Update equipment status (admin only) |
| `POST /passes` | Book a ski pass (visitor/instructor) |
| `GET /passes/my` | View your own passes |
| `DELETE /passes/:id` | Cancel a pass |
| `POST /rentals` | Book equipment (visitor/instructor) |
| `GET /rentals/my` | View your own rentals |
| `DELETE /rentals/:id` | Cancel a rental |
| `GET /instructors` | List all instructors |
| `POST /lessons` | Request a lesson (visitor only) |
| `GET /lessons/my` | View your own lessons |
| `GET /lessons/instructor-schedule` | View your teaching schedule (instructor only) |
| `PUT /lessons/:id/respond` | Accept or decline a lesson (instructor only) |
| `GET /lessons/all` | View all lessons (admin only, read-only) |
| `DELETE /lessons/:id` | Cancel a lesson |
| `GET /admin/summary` | Live dashboard statistics (admin only) |
| `POST /admin/reports` | Generate and save a report (admin only) |
| `GET /admin/reports` | View report history (admin only) |

## Folder Structure
- `src/db` — database connection and query functions
- `src/routes` — API route definitions
- `src/authToken.js` (in `src/db`) — JWT verification and admin-role middleware
- `server.js` — application entry point