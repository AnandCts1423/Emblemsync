# 🚀 EmblemHealth Component Tracker - Local Setup Guide

**Complete step-by-step instructions to run the FastAPI backend locally.**

---

## 📋 Prerequisites

- **Python 3.11+** installed on your system
- **pip** (Python package manager)
- **Git** (for cloning repositories)

---

## 🔧 Step-by-Step Setup

### **Step 1: Navigate to Backend Directory**

```bash
cd c:\Users\2388004\TASK\emblemsight\backend-fastapi
```

### **Step 2: Create Virtual Environment**

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# You should see (venv) in your terminal prompt
```

### **Step 3: Install Dependencies**

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt
```

### **Step 4: Set Up Environment Variables**

The `.env` file is already created with local development settings. You can review it:

```bash
# View current environment settings
type .env
```

### **Step 5: Initialize Database**

```bash
# Initialize Alembic (first time only)
alembic init migrations

# Create initial migration
alembic revision --autogenerate -m "Initial database schema"

# Apply migrations to create database
alembic upgrade head
```

### **Step 6: Seed Demo Data**

```bash
# Run the seed script to populate database with demo data
python seed.py
```

You should see output like:
```
🌱 Seeding database with demo data...
👥 Creating users...
   ✅ Created user: Admin User (admin@emblemhealth.com)
   ✅ Created user: John Manager (john.manager@emblemhealth.com)
   ...
🎉 Database seeding completed successfully!
```

### **Step 7: Start the Server**

```bash
# Start development server
python main.py
```

**Alternative method:**
```bash
# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ Verify Installation

Once the server starts, you should see:

```
🏥 EmblemHealth Component Tracker v1.0.0 starting up...
📊 Database: sqlite:///./dev.db  
🌐 CORS enabled for: http://localhost:3000, http://localhost:5173
🚀 Ready to serve requests!
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### **Test the API:**

1. **Open your browser** and go to: http://localhost:8000
2. **API Documentation**: http://localhost:8000/docs
3. **Health Check**: http://localhost:8000/healthz

---

## 🔐 Login Credentials

The seed script creates these test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@emblemhealth.com | admin123 | admin |
| john.manager@emblemhealth.com | manager123 | manager |
| alice.dev@emblemhealth.com | dev123 | user |
| bob.arch@emblemhealth.com | arch123 | user |

---

## 🧪 Run Tests

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run tests with coverage
pytest --cov=. --cov-report=html
```

---

## 📊 Available API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user

### **Components**
- `GET /api/components/` - List components (with filtering)
- `POST /api/components/` - Create component
- `GET /api/components/{id}` - Get component
- `PUT /api/components/{id}` - Update component
- `DELETE /api/components/{id}` - Delete component

### **Towers**
- `GET /api/towers/` - List towers
- `POST /api/towers/` - Create tower
- `GET /api/towers/{id}` - Get tower

### **File Upload**
- `POST /api/files/upload-preview` - Upload and preview file
- `POST /api/files/upload-save` - Upload and save to database

### **Analytics**
- `GET /api/analytics/summary` - Analytics summary
- `GET /api/analytics/trends` - Monthly trends  
- `GET /api/analytics/tower-performance` - Tower performance

### **WebSocket**
- `WS /ws/activities?token={jwt_token}` - Real-time activity feed
- `GET /ws/status` - WebSocket connection status

---

## 🔍 Testing the API

### **1. Get JWT Token**

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@emblemhealth.com",
       "password": "admin123"
     }'
```

### **2. Use Token for Authenticated Requests**

```bash
# Replace {TOKEN} with the access_token from login response
curl -X GET "http://localhost:8000/api/components/" \
     -H "Authorization: Bearer {TOKEN}"
```

### **3. Test File Upload**

```bash
# Upload a CSV file for preview
curl -X POST "http://localhost:8000/api/files/upload-preview" \
     -H "Authorization: Bearer {TOKEN}" \
     -F "file=@sample.csv"
```

### **4. Test Analytics**

```bash
curl -X GET "http://localhost:8000/api/analytics/summary" \
     -H "Authorization: Bearer {TOKEN}"
```

---

## 📁 Project Structure

```
backend-fastapi/
├── main.py                 # FastAPI application
├── config.py              # Configuration settings
├── database.py            # Database connection
├── models.py              # SQLAlchemy models
├── schemas.py             # Pydantic schemas
├── crud.py                # Database operations
├── auth.py                # Authentication utilities
├── websocket_manager.py   # WebSocket connection manager
├── file_processor.py      # File processing utilities
├── seed.py                # Database seeding script
├── routers/               # API route handlers
│   ├── auth.py
│   ├── users.py
│   ├── towers.py
│   ├── components.py
│   ├── releases.py
│   ├── activities.py
│   ├── websocket.py
│   ├── files.py
│   └── analytics.py
├── tests/                 # Unit tests
├── migrations/            # Alembic migrations
├── uploads/               # File upload directory
├── dev.db                 # SQLite database file
├── requirements.txt       # Python dependencies
└── README.md             # Documentation
```

---

## 🛠️ Development Commands

```bash
# Format code with Black
black .

# Sort imports
isort .

# Run linting
flake8 .

# Create new migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Apply new migrations
alembic upgrade head

# Reset database (delete all data)
rm dev.db
alembic upgrade head
python seed.py
```

---

## 🐛 Troubleshooting

### **Issue: Import errors**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies  
pip install -r requirements.txt
```

### **Issue: Database errors**
```bash
# Reset database
rm dev.db
alembic upgrade head
python seed.py
```

### **Issue: Port already in use**
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

### **Issue: Permission errors on Windows**
```bash
# Run as administrator or check file permissions
```

---

## 🌐 WebSocket Testing

You can test WebSocket connections using browser console:

```javascript
// Connect to WebSocket (replace TOKEN with actual JWT)
const ws = new WebSocket('ws://localhost:8000/ws/activities?token=YOUR_JWT_TOKEN');

ws.onmessage = function(event) {
    console.log('Message received:', JSON.parse(event.data));
};

ws.send('ping');
```

---

## 📈 Next Steps

1. **Backend is now running** on http://localhost:8000
2. **API documentation** available at http://localhost:8000/docs
3. **Ready for frontend integration** (Steps 4-6 of the plan)
4. **WebSocket support enabled** for real-time features
5. **File upload functionality** for CSV/Excel/JSON processing
6. **Comprehensive analytics** with business intelligence

---

🎉 **Your FastAPI backend is now ready for the EmblemHealth Component Tracker!**

**The backend includes all features from Steps 1-3:**
- ✅ **Step 1**: FastAPI backend with JWT auth, RBAC, CRUD operations
- ✅ **Step 2**: WebSocket broadcasting and file upload with preview  
- ✅ **Step 3**: Analytics endpoints with trends and tower performance

**Ready to proceed with Steps 4-6 (Frontend development)!**
