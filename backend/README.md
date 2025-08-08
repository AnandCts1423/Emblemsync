# EH Component Tracker - Backend API

## 🏥 Healthcare Component Management System Backend

A comprehensive Flask-based REST API for managing healthcare technology components, built specifically for EmblemHealth Component Tracker.

## 🚀 Features

### Core Functionality
- **Component CRUD Operations** - Create, Read, Update, Delete components
- **File Upload Support** - CSV, JSON, Excel file processing
- **Advanced Search & Filtering** - Multi-criteria component discovery
- **Analytics & Reporting** - Dashboard analytics and insights
- **Data Export** - CSV export functionality
- **RESTful API Design** - Standard HTTP methods and status codes

### Healthcare-Specific Features
- **Component Status Tracking** - Development lifecycle management
- **Tower-Based Organization** - Architectural component grouping
- **Complexity Assessment** - Simple, Medium, Complex categorization
- **Release Date Management** - Timeline and planning support
- **Owner Assignment** - Team and individual responsibility tracking

## 🛠️ Technology Stack

- **Framework:** Flask 2.3.3
- **Database:** SQLite with SQLAlchemy ORM
- **File Processing:** Pandas, OpenPyXL
- **CORS Support:** Flask-CORS
- **Data Validation:** JSON Schema validation
- **Security:** Werkzeug security utilities

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Instructions

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the application:**
   ```bash
   python app.py
   ```

### Quick Start (Windows)
Simply run the provided batch file:
```bash
start.bat
```

## 🔌 API Endpoints

### Health Check
- `GET /` - API health status

### Component Management
- `GET /api/components` - Get all components (with filtering)
- `POST /api/components` - Create new component
- `PUT /api/components/<id>` - Update component
- `DELETE /api/components/<id>` - Delete component

### File Operations
- `POST /api/upload` - Upload CSV/JSON/Excel files
- `GET /api/export` - Export components to CSV

### Analytics
- `GET /api/analytics` - Get dashboard analytics data

## 📊 Database Schema

### Component Model
```python
{
    "id": "integer (primary key)",
    "componentId": "string (unique)",
    "name": "string",
    "version": "string",
    "description": "text",
    "tower": "string",
    "status": "string",
    "complexity": "string",
    "owner": "string",
    "releaseDate": "date",
    "lastUpdated": "datetime",
    "createdAt": "datetime"
}
```

### Status Values
- In Development
- In Progress
- Testing
- Completed
- Deployed
- Planning

### Complexity Values
- Simple
- Medium
- Complex

## 🔍 API Usage Examples

### Get Components with Filtering
```bash
GET /api/components?search=auth&tower=Security&status=Deployed
```

### Create Component
```bash
POST /api/components
Content-Type: application/json

{
    "name": "Patient Portal API",
    "version": "1.0.0",
    "description": "API for patient portal access",
    "tower": "Frontend",
    "status": "In Development",
    "complexity": "Medium",
    "owner": "Frontend Team",
    "releaseDate": "2024-06-15"
}
```

### Upload File
```bash
POST /api/upload
Content-Type: multipart/form-data

file: [CSV/JSON/Excel file]
```

## 🛡️ Security Features

- **File Upload Validation** - Only allowed file types
- **Input Sanitization** - SQL injection prevention
- **Error Handling** - Secure error responses
- **CORS Configuration** - Restricted to frontend origin

## 📈 Sample Data

The API automatically creates sample healthcare components on first run:
- Patient Authentication Service
- Electronic Health Records API
- Patient Notification System
- Billing Integration Module
- Provider Dashboard

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV` - Development/Production mode
- `DATABASE_URL` - Database connection string
- `MAX_CONTENT_LENGTH` - File upload size limit

### File Upload Settings
- **Supported Formats:** CSV, JSON, Excel (.xlsx, .xls)
- **Maximum File Size:** 16MB
- **Upload Directory:** `uploads/` (auto-created)

## 🚨 Error Handling

The API provides comprehensive error handling with:
- **HTTP Status Codes** - Standard REST responses
- **Error Messages** - Descriptive error information
- **Validation Errors** - Field-level validation feedback
- **Database Rollback** - Transaction safety

## 📝 Logging

- **Request Logging** - All API requests logged
- **Error Logging** - Detailed error information
- **Database Operations** - SQL query logging (debug mode)

## 🔄 Development

### Running in Development Mode
```bash
python app.py
```
- Auto-reload on code changes
- Debug mode enabled
- Detailed error messages

### Database Reset
Delete `eh_components.db` file to reset database and regenerate sample data.

## 📋 API Testing

Use tools like:
- **Postman** - GUI API testing
- **curl** - Command line testing
- **Browser** - GET requests testing

### Example curl Commands
```bash
# Get all components
curl http://localhost:5000/api/components

# Create component
curl -X POST http://localhost:5000/api/components \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Component","tower":"General"}'

# Get analytics
curl http://localhost:5000/api/analytics
```

## 🤝 Integration with Frontend

The API is designed to work seamlessly with the EH Component Tracker React frontend:
- **CORS enabled** for http://localhost:3000
- **JSON responses** compatible with frontend models
- **File upload** matches frontend dropzone requirements
- **Search filtering** supports frontend filter components

## 📞 Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Ensure Python 3.8+ is being used
4. Check that no other service is using port 5000

## 🔮 Future Enhancements

Planned features:
- **Authentication & Authorization** - User management
- **PostgreSQL Support** - Production database
- **API Rate Limiting** - Request throttling
- **Audit Logging** - Change tracking
- **Backup & Recovery** - Data protection
- **API Documentation** - Swagger/OpenAPI integration
