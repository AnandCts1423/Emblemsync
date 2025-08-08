# 🏥 EmblemHealth Component Tracker

A professional full-stack healthcare technology component management system built with React 18 + TypeScript frontend and Python Flask backend.

![EmblemHealth](https://img.shields.io/badge/EmblemHealth-Component%20Tracker-6B46C1?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-2.3.3-000000?style=for-the-badge&logo=flask&logoColor=white)

## 🌟 Overview

The EmblemHealth Component Tracker is a enterprise-grade web application designed for healthcare technology teams to manage, track, and analyze their software components throughout the entire development lifecycle. Built with modern technologies and professional healthcare branding.

### ✨ Key Features

- **📊 Real-time Dashboard** - Analytics with tower cards, pie charts, and performance metrics
- **🔍 Advanced Search** - Smart filtering with year/month search capabilities
- **📤 Bulk Operations** - Upload CSV/JSON/Excel files and export data
- **⚡ Live Updates** - Real-time component tracking with backend persistence
- **🎨 Professional UI** - Glassmorphism design with EmblemHealth color palette
- **🏥 Healthcare Focus** - Specialized for healthcare technology workflows
- **🔐 Full CRUD** - Complete component lifecycle management
- **📱 Responsive** - Works seamlessly on all devices

## 🏗️ Architecture

### Frontend (React 18 + TypeScript)
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: React Router DOM for navigation
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for modern iconography
- **Charts**: Recharts for data visualization
- **File Processing**: XLSX & PapaParse for data import/export
- **State Management**: Context API with localStorage persistence

### Backend (Python Flask)
- **Framework**: Flask 2.3.3 with SQLAlchemy ORM
- **Database**: SQLite for development, production-ready
- **API Design**: RESTful endpoints with comprehensive CRUD operations
- **File Processing**: Pandas for CSV/JSON/Excel handling
- **CORS**: Configured for frontend integration
- **Security**: Input validation, SQL injection prevention

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+ 
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/AnandCts1423/Emblemsync.git
cd Emblemsync
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd .

# Install Node dependencies
npm install

# Start React development server
npm start
```
Frontend will run on `http://localhost:3000`

### 4. Access Application
Open `http://localhost:3000` in your browser to access the EmblemHealth Component Tracker.

## 📁 Project Structure

```
emblemsight/
├── 📂 backend/                 # Python Flask API
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── start.bat              # Windows startup script
│   └── README.md              # Backend documentation
├── 📂 src/                    # React frontend source
│   ├── 📂 components/         # Reusable UI components
│   │   ├── Layout/            # Navigation and layout
│   │   └── EmblemHealthLogo.tsx # Custom SVG logo
│   ├── 📂 context/            # React contexts
│   │   ├── ThemeContext.tsx   # Theme management
│   │   └── DataContext.tsx    # Data state management
│   ├── 📂 pages/              # Application pages
│   │   ├── HomePage.tsx       # Landing page
│   │   ├── DashboardPage.tsx  # Analytics dashboard
│   │   ├── SearchPage.tsx     # Component search
│   │   ├── ViewAllPage.tsx    # Data table with CRUD
│   │   ├── UploadPage.tsx     # File upload
│   │   └── SettingsPage.tsx   # User preferences
│   ├── 📂 services/           # API integration
│   │   └── api.ts             # Backend service calls
│   ├── 📂 styles/             # CSS styling
│   │   └── globals.css        # Global styles
│   └── 📂 types/              # TypeScript definitions
│       └── index.ts           # Type interfaces
├── 📂 public/                 # Static assets
│   ├── index.html
│   └── favicon.ico
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## 🎨 Design System

### Brand Colors
- **Primary Purple**: `#6B46C1` - Main brand color
- **Secondary Orange**: `#F59E0B` - Accent and highlights
- **Professional Palette**: Carefully selected healthcare-appropriate colors

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### UI Framework
- **Design**: Modern glassmorphism with subtle gradients
- **Animations**: Smooth Framer Motion transitions
- **Layout**: Responsive grid system with flexible containers

## 🔧 API Endpoints

### Component Management
- `GET /api/components` - Retrieve all components with filtering
- `POST /api/components` - Create new component
- `PUT /api/components/<id>` - Update existing component
- `DELETE /api/components/<id>` - Delete component

### Data Operations
- `POST /api/upload` - Upload CSV/JSON/Excel files
- `GET /api/export` - Export components to CSV
- `GET /api/analytics` - Dashboard analytics data

### System
- `GET /` - Health check endpoint

## 🏥 Healthcare Features

### Tower Organization
Components are organized into healthcare-specific towers:
- **Security** - HIPAA compliance, encryption, access controls
- **Healthcare** - Clinical systems, patient data, medical devices
- **Communication** - Messaging, notifications, telehealth
- **Finance** - Billing, insurance, revenue cycle
- **Frontend** - Patient portals, web applications

### Status Workflow
- **In Development** → **In Progress** → **Testing** → **Completed** → **Deployed**

### Complexity Assessment
- **Simple** - Basic components with minimal dependencies
- **Medium** - Moderate complexity with some integrations  
- **Complex** - Advanced components with multiple system integrations

## 📊 Features Overview

### 🏠 HomePage
- EmblemHealth branded landing with hero section
- Key statistics and feature highlights
- Responsive design with smooth animations

### 📈 Dashboard
- Real-time component analytics
- Tower-based performance cards
- Interactive charts and visualizations
- Export functionality for reports

### 🔍 Search & Filter
- Advanced component search with multiple filters
- Smart date-based searches (year/month)
- Detailed component modals with full information
- Real-time results with highlighting

### 📋 Data Management
- Complete data table with sorting and pagination
- Bulk selection and operations
- Inline editing capabilities
- CSV export functionality

### 📤 File Upload
- Drag-and-drop file upload interface
- Support for CSV, JSON, and Excel formats
- Real-time processing with progress indicators
- Smart data mapping and validation

### ⚙️ Settings
- Light/dark theme toggle
- User preferences
- System information
- Configuration options

## 🛠️ Development

### Available Scripts

#### Frontend
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Check code quality

#### Backend
- `python app.py` - Start Flask development server
- `start.bat` - Windows startup script (includes venv activation)

### Environment Variables
Create `.env` file in root directory:
```
REACT_APP_API_URL=http://localhost:5000
FLASK_ENV=development
DATABASE_URL=sqlite:///components.db
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `build/` directory
3. Set environment variables for production API URL

### Backend (Railway/Heroku)
1. Push to Git repository
2. Configure Python buildpack
3. Set production environment variables
4. Deploy with auto-scaling enabled

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Standard configuration
- **Prettier**: Code formatting
- **Git**: Conventional commits

## 📜 License

This project is proprietary software developed for EmblemHealth. All rights reserved.

## 👥 Team

- **Frontend Development**: React 18 + TypeScript implementation
- **Backend Development**: Python Flask REST API
- **UI/UX Design**: EmblemHealth brand guidelines
- **DevOps**: CI/CD pipeline configuration

## 📞 Support

For technical support or questions:
- **GitHub Issues**: Submit bug reports and feature requests
- **Documentation**: Comprehensive API and component documentation
- **Wiki**: Setup guides and troubleshooting

---

<div align="center">

**Built with ❤️ for EmblemHealth Healthcare Technology Teams**

*Professional component tracking for better healthcare technology management*

</div>
