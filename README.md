# Task Management App

## Prerequisites
- Node.js (v16+)
- npm (v8+)
- MongoDB (Community Server or Cloud)
- Git

## Setup

### 1. Clone and install
```bash
git clone <repository-url>
cd task-manager

# Backend setup
cd backend
npm install

# Create .env file for backend
echo 'MONGOURI="mongodb://username:password@127.0.0.1:27017/your_database"' > .env
echo "PORT1=5000" >> .env

# Frontend setup
cd ../frontend
npm install

# Create .env file for frontend
echo "VITE_API_PORT=5000" > .env
echo "VITE_API_URL=http://localhost:5000" >> .env
```

### 2. Running the Application (Order Matters!)

**Step 1: Start MongoDB**
```bash
# Windows (if MongoDB installed as service)
net start MongoDB

# macOS/Linux (if MongoDB installed locally)
mongod

# Or use MongoDB Compass/Atlas if using cloud database
```

**Step 2: Start Backend Server**
```bash
cd backend
node index.js
```

**Step 3: Start Frontend Development Server**
```bash
# In a new terminal
cd frontend
npm run dev
```

**For Production Frontend Build:**
```bash
cd frontend
npm run build
```

## Key Files Structure
```
task-manager/
├── backend/
│   ├── .env
│   ├── package.json
│   └── (other backend files)
├── frontend/
│   ├── .env
│   ├── package.json
│   └── (other frontend files)
└── README.md
```

## Environment Variables

### Backend (.env)
```env
MONGOURI="mongodb://username:password@127.0.0.1:27017/your_database"
PORT1=5000
```

### Frontend (.env)
```env
VITE_API_PORT=5000
VITE_API_URL=http://localhost:5000
```

## Development
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173` (Vite default port)

## Startup Order (Important!)
1. **MongoDB** - Must be running first
2. **Backend Server** - Connects to MongoDB
3. **Frontend** - Connects to Backend API

## Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd ../backend
npm start
```

## Troubleshooting

### Common Errors and Solutions

1. **MongoDB Connection Issues:**
   - **Error:** `MongoNetworkError` or `ECONNREFUSED`
   - **Cause:** MongoDB service not running
   - **Solution:** Start MongoDB service before backend

2. **Backend Port Issues:**
   - **Error:** `Port 5000 already in use`
   - **Cause:** Another service using the same port
   - **Solution:** Change `PORT1` in backend `.env` file

3. **Frontend API Connection:**
   - **Error:** `Network Error` or `CORS Error`
   - **Cause:** Backend not running or wrong API URL
   - **Solution:** Ensure backend is running and check `VITE_API_URL`

4. **Environment Variables Not Loading:**
   - **Cause:** `.env` files missing or incorrectly formatted
   - **Solution:** Verify `.env` files exist in correct directories with proper syntax

5. **Database Authentication:**
   - **Error:** `Authentication failed`
   - **Cause:** Wrong MongoDB credentials
   - **Solution:** Update `MONGOURI` with correct username/password

6. **Node Version Issues:**
   - **Error:** Package compatibility errors
   - **Cause:** Using older Node.js version
   - **Solution:** Update to Node.js v16 or higher

### General Troubleshooting Steps:
- Restart all services in correct order
- Check all `.env` files are properly configured
- Verify MongoDB is accessible
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## .gitignore
```
# Environment variables
.env
# Node modules
node_modules/
# Cache
.cache/
# Build directories
dist/
build/
```

## Available Commands

| Location | Command | Action |
|----------|---------|--------|
| Backend | `node index.js` | Start backend server |
| Frontend | `npm run dev` | Start development server |
| Frontend | `npm run build` | Create production build |

---
