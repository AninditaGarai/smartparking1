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

## Deployment Issues & Troubleshooting

### Issues Encountered During Deployment

#### 1. TypeScript Build Error in Vercel
**Error**: `error TS2688: Cannot find type definition file for 'node'`

**Cause**: Missing `@types/node` dependency in frontend package.json

**Fix**: Added `@types/node` to frontend devDependencies
```json
"devDependencies": {
  "@types/node": "^24.12.0",
  ...
}
```

#### 2. Express Wildcard Route Error
**Error**: `PathError [TypeError]: Missing parameter name at index 1: *`

**Cause**: Backend had wildcard route `app.get("*", ...)` for serving frontend, which is incompatible with newer Express versions when frontend/backend are separated

**Fix**: Removed frontend serving code from backend since they are now deployed separately
```javascript
// Removed these lines from backend/server/index.js:
// app.use(express.static(path.join(__dirname, "..", "dist")));
// app.get("*", (req, res, next) => { ... });
```

#### 3. Environment Variables Not Loading in Render
**Error**: `injected env (0) from .env` followed by deployment failure

**Cause**: `render.yaml` contained placeholder environment variables that shouldn't be in the file. Environment variables must be set in Render dashboard, not in YAML

**Fix**: Removed placeholder env vars from `render.yaml` and added instructions to set them in Render dashboard
```yaml
# Before (incorrect):
envVars:
  - key: MONGODB_URI
    value: REPLACE_WITH_YOUR_MONGODB_URI

# After (correct):
# IMPORTANT: Set these environment variables in the Render dashboard after import:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A strong secret key for JWT
# - PORT: 5000
```

#### 4. MongoDB Connection Error
**Error**: `Startup failed: connect ECONNREFUSED 127.0.0.1:27017`

**Cause**: `MONGODB_URI` environment variable not set in Render dashboard, causing fallback to localhost MongoDB which doesn't exist in production

**Fix**: Set actual MongoDB connection string in Render dashboard:
- Go to Render service → Settings → Environment Variables
- Add `MONGODB_URI` with your MongoDB Atlas connection string
- Add `JWT_SECRET` with a strong secret key
- Add `PORT` with value `5000`

### How to Set Up MongoDB Atlas (Required for Production)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user with username/password
4. Whitelist IP `0.0.0.0/0` for access
5. Get connection string from Database → Connect
6. Format: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/smartparking`
7. Add to Render as `MONGODB_URI` environment variable

### Current Deployment Status

- ✅ Frontend structure ready for Vercel
- ✅ Backend structure ready for Render
- ✅ TypeScript build issues resolved
- ✅ Routing errors fixed
- ✅ Environment variable configuration corrected
- ⏳ MongoDB connection setup required (user action needed)

### Next Steps for Successful Deployment

1. Set up MongoDB Atlas free tier
2. Add `MONGODB_URI` to Render environment variables
3. Add `JWT_SECRET` to Render environment variables
4. Add `PORT=5000` to Render environment variables
5. Deploy backend to Render
6. Get Render backend URL
7. Add `VITE_API_URL` to Vercel with backend URL
8. Deploy frontend to Vercel
