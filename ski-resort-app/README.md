# Ski Resort App

Frontend for the Information System for Ski Resort Booking and Resource Management — built with React and Vite.

## Tech Stack
- React
- Vite
- React Router

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set the backend API URL in `src/config/api.js`:
   ```js
   export const API_URL = "http://[SERVER_ADDRESS]:30049";
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The app will run on the port and host configured in `vite.config.js`.

## Roles and Views

The interface adapts based on the logged-in user's role:

- **Visitor** — books ski passes, lessons, and equipment rentals; views and cancels their own bookings
- **Instructor** — views their teaching schedule and accepts/declines lesson requests; can only book adult ski passes
- **Admin** — adds and manages slopes and equipment, opens/closes slopes, and views the dashboard with booking, revenue, lesson, and equipment statistics; cannot make bookings

Registration lets a new user choose between the visitor and instructor role. Admin accounts are assigned manually in the database.

## Folder Structure
- `src/pages` — one component per page (Home, Login, Register, Slopes, Equipment, Passes, Lessons, Admin)
- `src/components` — shared components (Menu)
- `src/routes` — route definitions (AppRouter)
- `src/config` — API base URL configuration
- `src/index.css` — global styling

## Notes

- The logged-in user's token and profile are stored in the browser's `localStorage` after login and cleared on logout.
- Payment on the passes page is simulated for demonstration purposes only; no real payment processing takes place.