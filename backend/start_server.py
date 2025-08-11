#!/usr/bin/env python3
"""
Startup script for EH Component Tracker Backend
This addresses any Flask-SocketIO startup issues
"""
import os
import sys

def start_backend():
    """Start the backend server with proper error handling"""
    try:
        print("🏥 EH Component Tracker - Backend Starting...")
        print("📊 Loading application...")
        
        # Import our app
        from app import app, socketio, init_db
        
        print("✅ App imported successfully")
        print("📦 Initializing database...")
        
        # Initialize database
        init_db()
        
        print("✅ Database initialized")
        print("🚀 Starting server...")
        print("🔗 API will be available at: http://localhost:5000")
        print("🌐 CORS enabled for frontend at: http://localhost:3000")
        print("📋 Upload endpoint: POST /api/upload")
        print("🗑️  Batch delete endpoint: POST /api/components/batch-delete")
        print("📊 Analytics endpoint: GET /api/analytics")
        print("⚡ WebSocket support: ENABLED")
        print("-" * 50)
        
        # Run with SocketIO
        socketio.run(
            app, 
            debug=False,  # Set to False for stability
            host='0.0.0.0', 
            port=5000,
            allow_unsafe_werkzeug=True  # For Flask-SocketIO compatibility
        )
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("💡 Try: pip install -r requirements.txt")
        return False
        
    except Exception as e:
        print(f"❌ Startup Error: {e}")
        print("💡 Check your Python environment and dependencies")
        return False

if __name__ == '__main__':
    start_backend()
