# SmartParking

Full-stack smart parking app with React + Vite frontend and Express + MongoDB backend.

## What is implemented

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access (`user`, `admin`)
- MongoDB persistence using Mongoose models
- Parking slot search and booking flow
- Booking actions: create, extend, cancel
- Dashboard stats + recent bookings
- Slot favorites (save/unsave + dedicated Favorites page)
- Favorites sorting/filtering (price, city, availability)
- Favorite-only switch in Find Parking
- Range slider filters for price in Favorites and Find Parking
- Additional sorting by distance and free slots
- Per-user recently viewed slots panel on Dashboard
- Persistent per-user UI preferences (filters + theme)
- Admin dashboard for slot management (create, edit, delete)

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs

## Setup

1. Install dependencies:

```bash
npm install
```

2. (Optional but recommended) copy env file:

```bash
copy .env.example .env
```

3. Ensure MongoDB is running locally (default URI):

- `mongodb://127.0.0.1:27017/smartparking`

4. Start frontend + backend:

```bash
npm run dev
```

5. Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

## Seed Accounts

Backend auto-seeds on first run:

- Admin:
  - username: `admin`
  - password: `1234`
- User:
  - username: `shimpi`
  - password: `1234`

## Scripts

- `npm run dev` -> run frontend and backend together
- `npm run dev:client` -> run only frontend
- `npm run dev:server` -> run backend with watch mode
- `npm run start:server` -> run backend without watch
- `npm run build` -> production build for frontend
- `npm run lint` -> lint code

## API (high level)

### Public
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/health`

### Auth required (Bearer token)
- `GET /api/slots`
- `GET /api/favorites`
- `POST /api/favorites/:slotId`
- `GET /api/recent-slots`
- `POST /api/recent-slots/:slotId`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/:bookingCode/extend`
- `PATCH /api/bookings/:bookingCode/cancel`
- `GET /api/dashboard`

### Admin only
- `GET /api/admin/slots`
- `POST /api/admin/slots`
- `PATCH /api/admin/slots/:id`
- `DELETE /api/admin/slots/:id`
- `GET /api/admin/schedule?weekOffset=<int>`
- `GET /api/admin/analytics`
- `GET /api/admin/bookings/:bookingCode`

## Notes

- If `JWT_SECRET` is not set, backend uses a development fallback secret and prints a warning.
- Keep `JWT_SECRET` set in real deployments.

## Schedule UX Prototype

The requested schedule IA/wireframe prototype is available as a standalone interactive screen.

1. Start app with `npm run dev`
2. Open `http://localhost:5173/#schedule-prototype`

Related files:
- `docs/schedule-wireframe-spec.md`
- `docs/schedule-accessibility-checklist.md`
- `src/prototypes/ScheduleLayoutPrototype.jsx`
- `src/prototypes/ScheduleLayoutPrototype.css`

## Production Schedule Components

Reusable schedule components used in the admin area:

- `src/components/schedule/AdminScheduleBoard.jsx`
- `src/components/schedule/ScheduleHeader.jsx`
- `src/components/schedule/ScheduleGrid.jsx`
- `src/components/schedule/ScheduleDetailDrawer.jsx`
- `src/components/schedule/ScheduleAnalytics.jsx`
- `src/components/schedule/ScheduleBoard.css`

Admin booking record is now a dedicated full-screen deep-link route:

- `/#admin-booking/<bookingCode>`
