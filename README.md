# Smart Parking System

A smart parking management system with separate frontend and backend for easy deployment.

## Project Structure

```
smartparking1/
├── frontend/          # React + Vite frontend (deploy to Vercel)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/           # Express + Node backend (deploy to Render)
│   ├── server/
│   │   ├── index.js
│   │   ├── models/
│   │   ├── middleware/
│   │   └── data/
│   ├── package.json
│   ├── Dockerfile
│   └── render.yaml
└── smartparking1/     # Old monolithic structure (can be deleted)
```

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Set **Root Directory** to `frontend`
6. Set **Build Command** to `npm run build`
7. Set **Output Directory** to `dist`
8. Add environment variable `VITE_API_URL` with your backend URL (e.g., `https://your-backend.onrender.com`)
9. Click Deploy

### Backend (Render)

1. Go to [Render](https://render.com)
2. Click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Set **Root Directory** to `backend`
6. Set **Dockerfile Path** to `Dockerfile`
7. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT tokens
   - `PORT`: 5000
8. Click Deploy

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Server port (default: 5000)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (e.g., `http://localhost:5000` for local, `https://your-backend.onrender.com` for production)

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/slots` - Get all parking slots
- `POST /api/bookings` - Create a booking
- `GET /api/bookings` - Get user bookings
- `DELETE /api/bookings/:id` - Cancel a booking

## Tech Stack

### Frontend
- React 19
- Vite
- TypeScript
- Leaflet (maps)
- React Leaflet

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs

## License

MIT
