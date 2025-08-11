# 🏥 EmblemHealth Component Tracker - Frontend

A modern React 18 + TypeScript frontend application with real-time WebSocket capabilities for healthcare technology component management.

![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Backend Server** running on `http://localhost:5000`

### Installation & Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will run on `http://localhost:3000`

## 🏗️ Architecture

### **Tech Stack**
- **React 18** with TypeScript for type safety
- **Framer Motion** for smooth animations
- **Socket.IO Client** for real-time communication
- **React Router DOM** for navigation
- **Recharts** for data visualization
- **Lucide React** for modern icons

### **Project Structure**

```
frontend/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   └── emblemhealth-logo*.svg # Brand logos
├── src/                       # Source code
│   ├── components/            # Reusable UI components
│   │   ├── Layout/           # Navigation layout
│   │   ├── RealTimeStatus.tsx # Live connection status
│   │   ├── RealTimeActivityFeed.tsx # Live activity stream
│   │   ├── LiveProgressIndicator.tsx # Upload progress
│   │   └── EmblemHealthLogo.tsx # Brand logo
│   ├── context/              # React contexts
│   │   ├── ThemeContext.tsx  # Theme management
│   │   ├── DataContext.tsx   # API & data management
│   │   └── WebSocketContext.tsx # Real-time communication
│   ├── pages/                # Application pages
│   │   ├── HomePage.tsx      # Landing page
│   │   ├── DashboardPage.tsx # Analytics dashboard
│   │   ├── SearchPage.tsx    # Advanced search
│   │   ├── ViewAllPage.tsx   # Data table with CRUD
│   │   ├── UploadPage.tsx    # File upload
│   │   ├── AnalyticsPage.tsx # Performance metrics
│   │   ├── UpdatePage.tsx    # Component forms
│   │   └── SettingsPage.tsx  # User preferences
│   ├── services/             # API integration
│   │   └── api.ts           # Backend service calls
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # Type interfaces
│   ├── styles/              # CSS styling
│   │   └── globals.css      # Global styles
│   ├── data/                # Development data
│   │   └── mockComponents.ts # Sample data
│   ├── App.tsx              # Main app component
│   └── index.tsx            # React entry point
├── package.json             # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # This file
```

## ✨ Features

### **🎨 Modern UI/UX**
- **Professional Glassmorphism Design** with EmblemHealth branding
- **Purple (#6B46C1) & Orange (#F59E0B)** color palette
- **Smooth Animations** with Framer Motion throughout
- **Responsive Design** works on all devices
- **Dark/Light Theme** toggle with localStorage persistence

### **⚡ Real-Time Features**
- **Live Connection Status** in header with user count
- **Real-Time Component Updates** across all users
- **Live Activity Feed** with user action tracking
- **Real-Time Upload Progress** with animated indicators
- **Instant Analytics Updates** without page refresh
- **Multi-User Collaboration** support

### **🏥 Healthcare-Focused Pages**

1. **HomePage** - EmblemHealth branded landing
2. **Dashboard** - Analytics with real-time tower cards and charts
3. **Search** - Advanced filtering with modal component details
4. **View All** - Complete data table with pagination, sorting, CRUD
5. **Upload** - Drag-and-drop file upload with real-time progress
6. **Analytics** - Performance metrics and trends
7. **Update** - Component forms with validation
8. **Settings** - Theme controls and preferences

### **🔧 Component Management**
- **Full CRUD Operations** - Create, Read, Update, Delete
- **Bulk File Upload** - CSV, JSON, Excel support
- **Advanced Search & Filter** - Multi-field filtering
- **Real-Time Data Sync** - Instant updates across users
- **Export Functionality** - CSV download capabilities

## 🔄 Real-Time System

### **WebSocket Integration**
```typescript
// Automatic real-time updates
useEffect(() => {
  // Listen for component changes
  window.addEventListener('component_update', handleUpdate);
  
  // Listen for user activities  
  window.addEventListener('user_activity', handleActivity);
  
  // Listen for analytics updates
  window.addEventListener('analytics_update', handleAnalytics);
}, []);
```

### **Data Flow**
1. User performs action → API call to backend
2. Backend broadcasts WebSocket event to all clients
3. Frontend receives event via WebSocketContext
4. Custom events update UI components instantly
5. All users see changes in real-time

## 🎯 Healthcare Features

### **Tower Organization**
- **Security** - HIPAA compliance, encryption
- **Healthcare** - Clinical systems, patient data
- **Communication** - Messaging, telehealth
- **Finance** - Billing, revenue cycle
- **Frontend** - Patient portals, web apps

### **Status Workflow**
- **In Development** → **In Progress** → **Testing** → **Completed** → **Deployed**

### **Complexity Assessment**
- **Simple** - Basic components
- **Medium** - Moderate complexity
- **Complex** - Advanced integrations

## 🚀 Development

### **Available Scripts**

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run analyze
```

### **Environment Configuration**

Create `.env` file in frontend root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=http://localhost:5000
```

## 🎨 Theming

### **EmblemHealth Brand Colors**
```css
--primary: #6B46C1;        /* Purple */
--secondary: #F59E0B;      /* Orange */
--success: #10B981;        /* Green */
--warning: #F59E0B;        /* Orange */
--error: #EF4444;          /* Red */
```

### **Theme Context**
```typescript
const { theme, toggleTheme, colors } = useTheme();
// Automatic dark/light mode with system preference detection
```

## 🔌 API Integration

### **Backend Connection**
- **REST API** for CRUD operations
- **WebSocket** for real-time updates
- **File Upload** with progress tracking
- **Error Handling** with retry logic

### **Service Layer**
```typescript
// Centralized API calls
import { apiService } from './services/api';

// Get all components
const response = await apiService.getComponents();

// Real-time updates via context
const { components, addComponent, updateComponent } = useData();
```

## 📱 Progressive Web App

- **PWA Ready** with manifest.json
- **Offline Capable** with service worker
- **App-like Experience** on mobile devices
- **EmblemHealth Branding** in app icons

## 🚀 Deployment

### **Production Build**

```bash
# Build optimized production bundle
npm run build

# Serve from build directory
# Upload build/ folder to your hosting provider
```

### **Environment Setup**
- **Development**: `http://localhost:3000`
- **API Backend**: `http://localhost:5000`
- **WebSocket**: Real-time connection to backend

## 🤝 Integration

### **Backend Requirements**
- Flask backend running on port 5000
- WebSocket support via Flask-SocketIO
- CORS enabled for localhost:3000
- All API endpoints properly configured

### **Real-Time Events**
- `component_update` - CRUD operations
- `user_activity` - User action tracking
- `analytics_update` - Dashboard refresh
- `upload_progress` - File upload status

---

**Built with ❤️ for EmblemHealth Healthcare Technology Teams**

*Professional component tracking with real-time collaboration*
