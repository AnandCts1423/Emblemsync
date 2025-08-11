# EmblemHealth Component Tracker - FastAPI Backend

A modern FastAPI backend for the EmblemHealth Component Tracker MVP with SQLite database, JWT authentication, and comprehensive CRUD operations.

## 🚀 Features

- **FastAPI Framework** - Modern, fast web framework for building APIs
- **SQLAlchemy 2.0** - Latest ORM with type hints and modern patterns
- **SQLite Database** - Local development with single file database
- **Alembic Migrations** - Database schema versioning and migrations
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **RBAC Authorization** - Role-based access control (user, manager, admin)
- **Comprehensive CRUD** - Full create, read, update, delete operations
- **Unit Tests** - Complete test suite with pytest and in-memory database
- **API Documentation** - Auto-generated OpenAPI/Swagger documentation

## 📋 Requirements

- Python 3.11+
- pip (Python package manager)

## 🔧 Local Development Setup

### 1. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy environment template
copy .env.example .env

# Edit .env file with your settings (optional for local development)
```

### 4. Initialize Database with Alembic

```bash
# Initialize Alembic (first time only)
alembic init migrations

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. Start the Server

```bash
# Development server with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Running Tests

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests in verbose mode
pytest -v
```

## 📊 Database Schema

### Users
- `id` (Primary Key)
- `name` - User display name
- `email` - Unique email address
- `password_hash` - Hashed password
- `role` - User role (user, manager, admin)
- `is_active` - Account status
- `last_active` - Last login timestamp
- `created_at` - Account creation timestamp

### Towers
- `id` (Primary Key)
- `name` - Tower name (unique)
- `description` - Tower description
- `ownership` - Owning team/department
- `created_at` - Creation timestamp

### Components
- `id` (Primary Key)
- `name` - Component name
- `slug` - URL-friendly identifier (unique)
- `description` - Component description
- `tower_id` - Foreign key to towers
- `status` - Component status (planning, development, testing, deployed)
- `complexity` - Complexity level (low, medium, high)
- `tech_stack` - JSON field for technology information
- `created_by` - Foreign key to users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Releases
- `id` (Primary Key)
- `component_id` - Foreign key to components
- `version` - Release version
- `released_at` - Release timestamp
- `notes` - Release notes
- `created_at` - Creation timestamp

### Activities
- `id` (Primary Key)
- `user_id` - Foreign key to users
- `component_id` - Foreign key to components (nullable)
- `action_type` - Type of action performed
- `meta` - JSON field for additional metadata
- `created_at` - Activity timestamp

### Files
- `id` (Primary Key)
- `component_id` - Foreign key to components
- `filename` - Original filename
- `content_type` - MIME type
- `path` - File storage path
- `file_size` - File size in bytes
- `uploaded_by` - Foreign key to users
- `uploaded_at` - Upload timestamp

## 🔐 Authentication & Authorization

### User Registration
```bash
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@emblemhealth.com",
  "password": "securepassword123",
  "role": "user"
}
```

### User Login
```bash
POST /api/auth/login
{
  "email": "john@emblemhealth.com",
  "password": "securepassword123"
}
```

### Using JWT Tokens
Include the access token in the Authorization header:
```bash
Authorization: Bearer <access_token>
```

### User Roles
- **user** - Basic access to components and towers
- **manager** - Can manage components and users in their domain
- **admin** - Full system access

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update current user

### Users (Admin only)
- `GET /api/users/` - List all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Towers
- `GET /api/towers/` - List towers
- `POST /api/towers/` - Create tower
- `GET /api/towers/{id}` - Get tower by ID
- `PUT /api/towers/{id}` - Update tower
- `DELETE /api/towers/{id}` - Delete tower

### Components
- `GET /api/components/` - List components (with filtering)
- `POST /api/components/` - Create component
- `GET /api/components/{id}` - Get component by ID
- `PUT /api/components/{id}` - Update component
- `DELETE /api/components/{id}` - Delete component
- `GET /api/components/{id}/releases` - Get component releases

### Releases
- `GET /api/releases/` - List releases
- `POST /api/releases/` - Create release
- `GET /api/releases/{id}` - Get release by ID
- `PUT /api/releases/{id}` - Update release
- `DELETE /api/releases/{id}` - Delete release

### Activities
- `GET /api/activities/` - List activities (with filtering)

### Health Check
- `GET /` - API information
- `GET /healthz` - Health check

## 🔍 Query Parameters

### Components Filtering
```bash
GET /api/components/?tower_id=1&status=deployed&complexity=high&search=auth&skip=0&limit=50
```

### Activities Filtering
```bash
GET /api/activities/?user_id=1&component_id=1&action_type=component_created&skip=0&limit=20
```

## 🛠️ Development Commands

```bash
# Format code with Black
black .

# Sort imports with isort
isort .

# Lint with flake8
flake8 .

# Type checking with mypy (if installed)
mypy .

# Generate new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./dev.db` |
| `SECRET_KEY` | JWT secret key | Required |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `DEBUG` | Debug mode | `false` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000,http://localhost:5173` |

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm dev.db
alembic upgrade head
```

### Migration Issues
```bash
# Reset migrations
rm -rf migrations/versions/*
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Permission Issues
```bash
# Ensure proper file permissions
chmod 644 dev.db
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---

🏥 **EmblemHealth Component Tracker - Built with FastAPI**
