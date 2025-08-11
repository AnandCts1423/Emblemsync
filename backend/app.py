#!/usr/bin/env python3
"""
EH Component Tracker - Flask Backend API
Healthcare Component Management System
"""

from flask import Flask, request, jsonify, send_file
import pandas as pd
import openpyxl
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
from werkzeug.utils import secure_filename
from datetime import datetime, date
import os
import json
import csv
import uuid
from io import BytesIO
import traceback
import threading
import time

# Initialize Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'emblemhealth-component-tracker-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eh_components.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'connect_args': {
        'timeout': 60,  # Increase timeout for large operations
        'check_same_thread': False  # Allow multi-threading
    }
}
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # Increase to 100MB for large files

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, origins=["http://localhost:3000"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000"], async_mode='threading')

# Active users tracking for real-time collaboration
active_users = {}
user_activities = []

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class Component(db.Model):
    __tablename__ = 'components'
    
    id = db.Column(db.Integer, primary_key=True)
    component_id = db.Column(db.String(50), unique=True, nullable=False)
    tower_name = db.Column(db.String(100), nullable=False, index=True)  # EDL, etc
    app_group = db.Column(db.String(100), nullable=False, index=True)   # Tableau, etc
    complexity = db.Column(db.String(50), nullable=False, index=True)   # Low/Medium/High
    component_name = db.Column(db.String(200), nullable=False, index=True)  # config.json, etc
    component_type = db.Column(db.String(100), nullable=False, index=True)  # JSON, etc
    month = db.Column(db.String(20), nullable=False, index=True)        # June, etc
    year = db.Column(db.Integer, nullable=False, index=True)            # 2025, etc
    change_type = db.Column(db.String(50), nullable=False, index=True)  # New, Update, etc
    
    # Additional metadata
    description = db.Column(db.Text, nullable=True)
    owner = db.Column(db.String(100), nullable=True)
    release_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'componentId': self.component_id,
            'towerName': self.tower_name,
            'appGroup': self.app_group,
            'complexity': self.complexity,
            'componentName': self.component_name,
            'componentType': self.component_type,
            'month': self.month,
            'year': self.year,
            'changeType': self.change_type,
            'description': self.description,
            'owner': self.owner,
            'releaseDate': self.release_date.isoformat() if self.release_date else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else None
        }

# Real-time helper functions
def broadcast_component_update(action, component_data, user_id=None):
    """Broadcast component updates to all connected clients"""
    socketio.emit('component_update', {
        'action': action,  # 'create', 'update', 'delete'
        'component': component_data,
        'user_id': user_id,
        'timestamp': datetime.utcnow().isoformat()
    })

def save_components_to_csv(components_data, filename_prefix="components"):
    """Save components data to CSV file in uploads folder"""
    try:
        import pandas as pd
        from datetime import datetime
        
        # Create uploads directory if it doesn't exist
        uploads_dir = app.config['UPLOAD_FOLDER']
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"{filename_prefix}_{timestamp}.csv"
        csv_filepath = os.path.join(uploads_dir, csv_filename)
        
        # Convert to DataFrame and save
        df = pd.DataFrame(components_data)
        df.to_csv(csv_filepath, index=False, encoding='utf-8')
        
        print(f"📁 CSV saved: {csv_filepath}")
        return csv_filepath, csv_filename
        
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")
        return None, None

def broadcast_user_activity(user_id, activity, details=None):
    """Broadcast user activity to all connected clients"""
    activity_data = {
        'user_id': user_id,
        'activity': activity,
        'details': details,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    # Store in recent activities (keep last 50)
    user_activities.append(activity_data)
    if len(user_activities) > 50:
        user_activities.pop(0)
    
    socketio.emit('user_activity', activity_data)

def broadcast_upload_progress(user_id, progress, total=None, message=None):
    """Broadcast file upload progress to specific user"""
    socketio.emit('upload_progress', {
        'progress': progress,
        'total': total,
        'message': message,
        'timestamp': datetime.utcnow().isoformat()
    }, room=user_id)

def safe_get_field(row_data, *field_names, default=''):
    """Safely get field value from row data with multiple possible field names"""
    for field_name in field_names:
        if field_name in row_data and row_data[field_name] not in [None, '', 'nan', 'NaN']:
            return str(row_data[field_name]).strip()
    return default

def broadcast_analytics_update():
    """Broadcast analytics data update to all clients"""
    try:
        # Get fresh analytics data
        total_components = Component.query.count()
        towers = db.session.query(Component.tower_name).distinct().count()
        
        # Status distribution
        status_counts = db.session.query(
            Component.status, 
            db.func.count(Component.id)
        ).group_by(Component.status).all()
        
        # Complexity distribution  
        complexity_counts = db.session.query(
            Component.complexity,
            db.func.count(Component.id)
        ).group_by(Component.complexity).all()
        
        analytics_data = {
            'totalComponents': total_components,
            'totalTowers': towers,
            'statusDistribution': dict(status_counts),
            'complexityDistribution': dict(complexity_counts),
            'lastUpdated': datetime.utcnow().isoformat()
        }
        
        socketio.emit('analytics_update', analytics_data)
    except Exception as e:
        print(f"Error broadcasting analytics update: {e}")

# Utility functions
def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    ALLOWED_EXTENSIONS = {'csv', 'json', 'xlsx', 'xls'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def normalize_status(status_value):
    """Normalize status values from various formats"""
    if not status_value:
        return 'In Development'
    
    status_str = str(status_value).strip().lower()
    status_mapping = {
        'completed': 'Completed',
        'complete': 'Completed',
        'done': 'Completed',
        'finished': 'Completed',
        'in progress': 'In Progress',
        'in-progress': 'In Progress',
        'inprogress': 'In Progress',
        'progress': 'In Progress',
        'in development': 'In Development',
        'in-development': 'In Development',
        'development': 'In Development',
        'dev': 'In Development',
        'planning': 'Planning',
        'planned': 'Planning',
        'testing': 'Testing',
        'test': 'Testing',
        'deployed': 'Deployed',
        'deploy': 'Deployed',
        'production': 'Deployed',
        'prod': 'Deployed'
    }
    return status_mapping.get(status_str, 'In Development')

def normalize_complexity(complexity_value):
    """Normalize complexity values from various formats"""
    if not complexity_value:
        return 'Medium'
    
    complexity_str = str(complexity_value).strip().lower()
    complexity_mapping = {
        'low': 'Simple',
        'simple': 'Simple',
        'easy': 'Simple',
        'basic': 'Simple',
        '1': 'Simple',
        'medium': 'Medium',
        'moderate': 'Medium',
        'med': 'Medium',
        'intermediate': 'Medium',
        'mid': 'Medium',
        '2': 'Medium',
        'high': 'Complex',
        'complex': 'Complex',
        'hard': 'Complex',
        'difficult': 'Complex',
        'advanced': 'Complex',
        '3': 'Complex'
    }
    return complexity_mapping.get(complexity_str, 'Medium')

def normalize_status_upload(status_value):
    """Normalize status values for upload processing (3 statuses)"""
    if not status_value:
        return 'Planned'
    
    status_str = str(status_value).strip().lower()
    status_mapping = {
        'released': 'Released',
        'live': 'Released',
        'production': 'Released',
        'deployed': 'Released',
        'complete': 'Released',
        'done': 'Released',
        'finished': 'Released',
        'in development': 'In Development',
        'in-development': 'In Development',
        'development': 'In Development',
        'dev': 'In Development',
        'in progress': 'In Development',
        'in-progress': 'In Development',
        'inprogress': 'In Development',
        'progress': 'In Development',
        'active': 'In Development',
        'working': 'In Development',
        'planned': 'Planned',
        'pending': 'Planned',
        'future': 'Planned',
        'scheduled': 'Planned',
        'upcoming': 'Planned'
    }
    return status_mapping.get(status_str, 'Planned')

def validate_and_fix_upload_component(component_data):
    """Auto-fix and validate component data from upload - be forgiving!"""
    warnings = []
    
    # Auto-fix required fields with smart defaults
    tower_name = component_data.get('towerName', '').strip()
    if not tower_name:
        component_data['towerName'] = 'General'
        warnings.append('Auto-filled missing Tower Name with "General"')
    
    app_group = component_data.get('appGroup', '').strip()
    if not app_group:
        component_data['appGroup'] = 'Default Team'
        warnings.append('Auto-filled missing App Group with "Default Team"')
    
    component_type = component_data.get('componentType', '').strip()
    if not component_type:
        component_data['componentType'] = f"Component-{str(uuid.uuid4())[:8]}"
        warnings.append('Auto-generated Component Type name')
    
    # Auto-fix complexity
    complexity = component_data.get('complexity', '')
    if not complexity or complexity not in ['Simple', 'Medium', 'Complex']:
        component_data['complexity'] = 'Medium'
        if complexity:
            warnings.append(f'Invalid complexity "{complexity}" changed to "Medium"')
    
    # Auto-fix status  
    status = component_data.get('status', '')
    if not status or status not in ['Released', 'In Development', 'Planned']:
        component_data['status'] = 'Planned'
        if status:
            warnings.append(f'Invalid status "{status}" changed to "Planned"')
    
    # Auto-fix year
    year = component_data.get('year')
    try:
        year = int(year) if year else datetime.now().year
        if year < 2020 or year > 2030:
            year = datetime.now().year
    except (ValueError, TypeError):
        year = datetime.now().year
    component_data['year'] = year
    
    # Auto-fix month
    month = component_data.get('month')
    try:
        month = int(month) if month else datetime.now().month
        if month < 1 or month > 12:
            month = datetime.now().month
    except (ValueError, TypeError):
        month = datetime.now().month
    component_data['month'] = month
    
    return warnings  # Return warnings instead of errors

# API Routes

@app.route('/', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'message': 'EH Component Tracker API is running',
        'version': '1.0.0',
        'status': 'healthy'
    })

@app.route('/api/components', methods=['GET'])
def get_all_components():
    """Get all components with pagination, filtering, and real-time updates"""
    try:
        # Get query parameters for pagination and filtering
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))  # Show more per page
        search = request.args.get('search', '')
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Additional filters for the new structure
        tower_filter = request.args.get('tower', '')
        complexity_filter = request.args.get('complexity', '')
        change_type_filter = request.args.get('change_type', '')
        year_filter = request.args.get('year', '')
        month_filter = request.args.get('month', '').strip()
        month = request.args.get('month', '').strip()
        
        # Start with base query
        query = Component.query
        
        # Apply advanced search filters
        if search:
            query = query.filter(
                db.or_(
                    Component.component_name.ilike(f'%{search}%'),
                    Component.component_type.ilike(f'%{search}%'),
                    Component.tower_name.ilike(f'%{search}%'),
                    Component.app_group.ilike(f'%{search}%'),
                    Component.description.ilike(f'%{search}%'),
                    Component.component_id.ilike(f'%{search}%'),
                    Component.owner.ilike(f'%{search}%'),
                    Component.change_type.ilike(f'%{search}%')
                )
            )
        
        # Apply specific filters
        if tower_filter:
            query = query.filter(Component.tower_name.ilike(f'%{tower_filter}%'))
        
        if complexity_filter:
            query = query.filter(Component.complexity == complexity_filter)
        
        if change_type_filter:
            query = query.filter(Component.change_type == change_type_filter)
        
        if year_filter:
            query = query.filter(Component.year == int(year_filter))
        
        if month_filter:
            query = query.filter(Component.month.ilike(f'%{month_filter}%'))
        
        # Apply sorting
        if hasattr(Component, sort_by):
            sort_column = getattr(Component, sort_by)
            if sort_order.lower() == 'asc':
                query = query.order_by(sort_column.asc())
            else:
                query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(Component.created_at.desc())
        
        # Execute paginated query
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        components = pagination.items
        
        return jsonify({
            'success': True,
            'components': [component.to_dict() for component in components],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next
            },
            'count': len(components),
            'total': pagination.total
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/components', methods=['POST'])
def create_component():
    """Create a new component"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Generate unique component ID if not provided
        component_id = data.get('componentId') or f"COMP-{uuid.uuid4().hex[:8].upper()}"
        
        # Parse release date
        release_date = None
        if data.get('releaseDate'):
            try:
                release_date = datetime.strptime(data['releaseDate'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Create new component with new structure
        component = Component(
            component_id=component_id,
            tower_name=data.get('towerName', 'General'),
            app_group=data.get('appGroup', 'Default Team'),
            complexity=data.get('complexity', 'Medium'),
            component_name=data.get('componentName', 'New Component'),
            component_type=data.get('componentType', 'Component'),
            month=data.get('month', datetime.now().strftime('%B')),
            year=data.get('year', datetime.now().year),
            change_type=data.get('changeType', 'New'),
            description=data.get('description', ''),
            owner=data.get('owner', 'System'),
            release_date=release_date
        )
        
        db.session.add(component)
        db.session.commit()
        
        # Real-time broadcasting
        component_data = component.to_dict()
        broadcast_component_update('create', component_data, request.headers.get('User-ID'))
        broadcast_user_activity(request.headers.get('User-ID', 'anonymous'), 'created_component', f"Created component: {component.component_name}")
        broadcast_analytics_update()
        
        return jsonify({
            'success': True,
            'component': component_data,
            'message': 'Component created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/components/<int:component_id>', methods=['PUT'])
def update_component(component_id):
    """Update an existing component"""
    try:
        component = Component.query.get_or_404(component_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Update fields
        if 'name' in data:
            component.name = data['name']
        if 'version' in data:
            component.version = data['version']
        if 'description' in data:
            component.description = data['description']
        if 'tower' in data:
            component.tower = data['tower']
        if 'status' in data:
            component.status = normalize_status(data['status'])
        if 'complexity' in data:
            component.complexity = normalize_complexity(data['complexity'])
        if 'owner' in data:
            component.owner = data['owner']
        if 'releaseDate' in data and data['releaseDate']:
            try:
                component.release_date = datetime.strptime(data['releaseDate'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        component.last_updated = datetime.utcnow()
        db.session.commit()
        
        # Real-time broadcasting
        component_data = component.to_dict()
        broadcast_component_update('update', component_data, request.headers.get('User-ID'))
        broadcast_user_activity(request.headers.get('User-ID', 'anonymous'), 'updated_component', f"Updated component: {component.name}")
        broadcast_analytics_update()
        
        return jsonify({
            'success': True,
            'component': component_data,
            'message': 'Component updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/components/<int:component_id>', methods=['DELETE'])
def delete_component(component_id):
    """Delete a specific component"""
    try:
        component = Component.query.get_or_404(component_id)
        component_name = component.name
        
        db.session.delete(component)
        db.session.commit()
        
        # Real-time broadcasting
        user_id = request.headers.get('User-ID', 'anonymous')
        broadcast_user_activity(user_id, 'component_deleted', component_name)
        broadcast_analytics_update()
        
        return jsonify({
            'success': True,
            'message': f'Component "{component_name}" deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/upload/preview', methods=['POST'])
def upload_preview():
    """Handle file upload and return preview data without saving to database"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'Invalid file'}), 400
        
        # Save temporary file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process file data (same logic as main upload)
        components_data = []
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        if file_ext == 'csv':
            df = pd.read_csv(filepath, encoding='utf-8')
            df = df.fillna('')
            components_data = df.to_dict('records')
        elif file_ext in ['xlsx', 'xls']:
            df = pd.read_excel(filepath)
            df = df.fillna('')
            components_data = df.to_dict('records')
        elif file_ext == 'json':
            with open(filepath, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
                components_data = json_data if isinstance(json_data, list) else [json_data]
        
        # Clean up temp file
        os.remove(filepath)
        
        # Process and validate preview data
        preview_data = []
        for index, row_data in enumerate(components_data[:100]):  # Limit preview to 100 rows
            try:
                processed_row = {
                    'towerName': safe_get_field(row_data, 'towerName', 'tower_name', 'Tower Name', 'Tower', default='General'),
                    'appGroup': safe_get_field(row_data, 'appGroup', 'app_group', 'App Group', 'Application', default='Default Team'),
                    'complexity': safe_get_field(row_data, 'complexity', 'Complexity', default='Medium'),
                    'componentName': safe_get_field(row_data, 'componentName', 'component_name', 'Component Name', 'name', 'Name'),
                    'componentType': safe_get_field(row_data, 'componentType', 'component_type', 'Component Type', 'type', 'Type', default='Component'),
                    'month': safe_get_field(row_data, 'month', 'Month', default=datetime.now().strftime('%B')),
                    'year': int(safe_get_field(row_data, 'year', 'Year', default=datetime.now().year)),
                    'changeType': safe_get_field(row_data, 'changeType', 'change_type', 'Change Type', default='New'),
                    'description': safe_get_field(row_data, 'description', 'Description', default=''),
                    'owner': safe_get_field(row_data, 'owner', 'Owner', default='System')
                }
                preview_data.append(processed_row)
            except Exception as e:
                continue
        
        return jsonify({
            'success': True,
            'message': f'Preview loaded: {len(preview_data)} components processed',
            'previewData': preview_data,
            'totalRows': len(components_data),
            'previewRows': len(preview_data)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload/save', methods=['POST'])
def save_upload_data():
    """Save preview data to database and CSV file"""
    try:
        data = request.get_json()
        if not data or 'components' not in data:
            return jsonify({'success': False, 'error': 'No components data provided'}), 400
        
        components_data = data['components']
        created_count = 0
        updated_count = 0
        errors = []
        
        print(f"💾 Saving {len(components_data)} components to database...")
        
        for index, comp_data in enumerate(components_data):
            try:
                # Generate unique component ID
                component_id = comp_data.get('componentId') or f"COMP-{datetime.now().strftime('%Y%m%d')}-{index+1:04d}"
                
                # Check if component exists
                existing = Component.query.filter_by(component_id=component_id).first()
                
                if existing:
                    # Update existing
                    existing.tower_name = comp_data['towerName']
                    existing.app_group = comp_data['appGroup']
                    existing.complexity = comp_data['complexity']
                    existing.component_name = comp_data['componentName']
                    existing.component_type = comp_data['componentType']
                    existing.month = comp_data['month']
                    existing.year = comp_data['year']
                    existing.change_type = comp_data['changeType']
                    existing.description = comp_data.get('description', '')
                    existing.owner = comp_data.get('owner', 'System')
                    existing.last_updated = datetime.utcnow()
                    updated_count += 1
                else:
                    # Create new
                    new_component = Component(
                        component_id=component_id,
                        tower_name=comp_data['towerName'],
                        app_group=comp_data['appGroup'],
                        complexity=comp_data['complexity'],
                        component_name=comp_data['componentName'],
                        component_type=comp_data['componentType'],
                        month=comp_data['month'],
                        year=comp_data['year'],
                        change_type=comp_data['changeType'],
                        description=comp_data.get('description', ''),
                        owner=comp_data.get('owner', 'System')
                    )
                    db.session.add(new_component)
                    created_count += 1
                    
            except Exception as row_error:
                errors.append(f"Row {index+1}: {str(row_error)}")
                continue
        
        # Commit all changes
        db.session.commit()
        
        # Save to CSV file
        csv_path, csv_filename = save_components_to_csv(components_data, "uploaded_components")
        
        # Broadcast real-time update
        user_id = request.headers.get('User-ID', 'anonymous')
        broadcast_user_activity(user_id, 'bulk_upload_completed', f"Uploaded {created_count + updated_count} components")
        broadcast_analytics_update()
        
        # Send completion notification
        socketio.emit('upload_complete', {
            'created': created_count,
            'updated': updated_count,
            'totalRows': len(components_data),
            'csvFile': csv_filename,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': f'Successfully saved {created_count + updated_count} components',
            'created': created_count,
            'updated': updated_count,
            'errors': errors[:10],  # Show first 10 errors only
            'csvFile': csv_filename
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Legacy upload endpoint - processes and saves file directly"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process file based on extension
        components_data = []
        file_ext = filename.rsplit('.', 1)[1].lower()
        
        # Read file data with memory optimization
        components_data = []
        
        if file_ext == 'csv':
            print(f"📄 Reading CSV file: {filename}")
            try:
                # Use pandas for better memory handling of large CSVs
                df = pd.read_csv(filepath, encoding='utf-8')
                # Convert to dict but handle NaN values
                df = df.fillna('')  # Replace NaN with empty strings
                components_data = df.to_dict('records')
                print(f"✅ Successfully loaded {len(components_data)} rows from CSV")
            except Exception as csv_error:
                # Fallback to standard CSV reader
                print(f"⚠️  Pandas failed, using standard CSV reader: {csv_error}")
                with open(filepath, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    components_data = list(reader)
        elif file_ext == 'json':
            print(f"📋 Reading JSON file: {filename}")
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    json_data = json.load(f)
                    if isinstance(json_data, list):
                        components_data = json_data
                    else:
                        components_data = [json_data]
                    print(f"✅ Successfully loaded {len(components_data)} rows from JSON")
            except json.JSONDecodeError as json_error:
                os.remove(filepath)
                return jsonify({
                    'success': False,
                    'error': f'Invalid JSON format: {str(json_error)}'
                }), 400
        elif file_ext in ['xlsx', 'xls']:
            print(f"📊 Reading Excel file: {filename}")
            try:
                # Read Excel with memory optimization
                df = pd.read_excel(filepath)
                # Handle NaN values and convert to dict
                df = df.fillna('')  # Replace NaN with empty strings
                components_data = df.to_dict('records')
                print(f"✅ Successfully loaded {len(components_data)} rows from Excel")
            except Exception as excel_error:
                os.remove(filepath)
                return jsonify({
                    'success': False,
                    'error': f'Error reading Excel file: {str(excel_error)}'
                }), 400
        
        # Clean up uploaded file
        os.remove(filepath)
        
        # Process data in optimized batches for large datasets
        created_count = 0
        updated_count = 0
        errors = []
        batch_size = 100  # Process in batches of 100 for better performance
        
        print(f"📊 Processing {len(components_data)} rows in batches of {batch_size}...")
        
        # Pre-process all data first to avoid database locks
        processed_components = []
        
        for index, row_data in enumerate(components_data):
            if index % 500 == 0 and index > 0:
                print(f"📝 Pre-processed {index}/{len(components_data)} rows...")
            try:
                # Handle different data structures (from frontend upload vs direct API)
                if 'towerName' in row_data:  # Frontend upload format
                    upload_data = {
                        'towerName': str(row_data.get('towerName', '')).strip(),
                        'appGroup': str(row_data.get('appGroup', '')).strip(),
                        'componentType': str(row_data.get('componentType', '')).strip(),
                        'complexity': str(row_data.get('complexity', 'Medium')),
                        'status': str(row_data.get('status', 'Planned')),
                        'year': row_data.get('year', datetime.now().year),
                        'month': row_data.get('month', datetime.now().month)
                    }
                    
                    # Auto-fix and validate upload data (be forgiving!)
                    warnings = validate_and_fix_upload_component(upload_data)
                    if warnings:
                        # Log warnings but don't skip the row - just continue processing
                        print(f"Row {index + 1} warnings: {', '.join(warnings)}")
                    
                    # Transform to component format
                    component_data = {
                        'componentId': f"COMP-{uuid.uuid4().hex[:8].upper()}",
                        'name': upload_data['componentType'],
                        'version': '1.0.0',
                        'description': row_data.get('description', f"Component from {upload_data['towerName']} - {upload_data['appGroup']}"),
                        'tower': upload_data['towerName'],
                        'status': normalize_status_upload(upload_data['status']),
                        'complexity': normalize_complexity(upload_data['complexity']),
                        'owner': upload_data['appGroup']
                    }
                    
                    # Handle release date from year/month
                    try:
                        release_date = datetime(upload_data['year'], upload_data['month'], 1).date()
                    except (ValueError, TypeError):
                        release_date = datetime.now().date()
                        
                else:  # Direct API format (CSV/Excel/JSON)
                    # Handle multiple field name variations - be very flexible!
                    def safe_get_field(data, *field_names, default=''):
                        """Safely get field from data with multiple possible names"""
                        for field in field_names:
                            if field in data and data[field] and str(data[field]).strip():
                                return str(data[field]).strip()
                        return default
                    
                    component_name = safe_get_field(row_data, 
                                                  'name', 'component_name', 'componentName', 'Component Name',
                                                  'componentType', 'Component Type', 'component_type',
                                                  'comp_name', 'CompName', 'COMPONENT_NAME', 'NAME',
                                                  default=f"Component-{index + 1}")
                    
                    tower_name = safe_get_field(row_data, 
                                              'tower', 'towerName', 'Tower Name', 'tower_name',
                                              'Tower', 'TOWER', 'tower_name', 'TowerName',
                                              default='General')
                    
                    owner_name = safe_get_field(row_data, 
                                              'owner', 'appGroup', 'App Group', 'app_group',
                                              'Owner', 'OWNER', 'team', 'Team', 'responsible',
                                              'AppGroup', 'application_group', 'app_team',
                                              default='Default Team')
                    
                    complexity_val = safe_get_field(row_data, 
                                                   'complexity', 'Complexity', 'COMPLEXITY',
                                                   'comp_complexity', 'level', 'difficulty',
                                                   default='Medium')
                    
                    status_val = safe_get_field(row_data, 
                                              'status', 'Status', 'STATUS', 'state',
                                              'State', 'current_status', 'phase',
                                              default='Planned')
                                              
                    description_val = safe_get_field(row_data, 
                                                    'description', 'Description', 'DESCRIPTION',
                                                    'desc', 'Desc', 'summary', 'Summary',
                                                    'details', 'notes', 'comment',
                                                    default=f"Component from {tower_name} - {owner_name}")
                    
                    component_data = {
                        'componentId': str(row_data.get('componentId') or 
                                         row_data.get('component_id') or 
                                         row_data.get('ID') or 
                                         f"COMP-{uuid.uuid4().hex[:8].upper()}"),
                        'name': component_name,
                        'version': str(row_data.get('version') or row_data.get('Version') or '1.0.0'),
                        'description': description_val,
                        'tower': tower_name,
                        'status': normalize_status_upload(status_val),
                        'complexity': normalize_complexity(complexity_val),
                        'owner': owner_name
                    }
                    
                    # Handle release date
                    release_date = None
                    if 'releaseDate' in row_data or 'release_date' in row_data:
                        date_value = row_data.get('releaseDate', row_data.get('release_date'))
                        if date_value and str(date_value).strip():
                            try:
                                release_date = datetime.strptime(str(date_value), '%Y-%m-%d').date()
                            except:
                                try:
                                    release_date = datetime.strptime(str(date_value), '%Y/%m/%d').date()
                                except:
                                    release_date = datetime.now().date()
                    else:
                        release_date = datetime.now().date()
                
                # Check if component exists (optimize by checking in batch later)
                component = Component(
                    component_id=component_data['componentId'],
                    name=component_data['name'],
                    version=component_data['version'],
                    description=component_data['description'],
                    tower=component_data['tower'],
                    status=component_data['status'],
                    complexity=component_data['complexity'],
                    owner=component_data['owner'],
                    release_date=release_date
                )
                processed_components.append(('create', component, index + 1))
                    
            except Exception as row_error:
                # Log the error but don't fail completely - be resilient!
                error_msg = f"Row {index + 1}: {str(row_error)} (Skipped this row, continuing...)"
                errors.append(error_msg)
                print(f"⚠️  Upload warning - {error_msg}")  # Log to console for debugging
                continue  # Skip this row but keep processing others
        
        print(f"✅ Pre-processing complete! Ready to save {len(processed_components)} components...")
        
        # Now batch process the database operations for better performance
        batch_count = 0
        for i in range(0, len(processed_components), batch_size):
            batch = processed_components[i:i+batch_size]
            batch_count += 1
            
            try:
                print(f"💾 Saving batch {batch_count}/{(len(processed_components) + batch_size - 1) // batch_size}...")
                
                for action, component_or_data, row_num in batch:
                    if action == 'update':
                        # component_or_data is (existing_component, component_data, release_date)
                        existing, comp_data, rel_date = component_or_data
                        existing.name = comp_data['name']
                        existing.version = comp_data['version']
                        existing.description = comp_data['description']
                        existing.tower = comp_data['tower']
                        existing.status = comp_data['status']
                        existing.complexity = comp_data['complexity']
                        existing.owner = comp_data['owner']
                        existing.release_date = rel_date
                        existing.last_updated = datetime.utcnow()
                        updated_count += 1
                    else:  # create
                        db.session.add(component_or_data)
                        created_count += 1
                
                # Commit each batch
                db.session.commit()
                
            except Exception as batch_error:
                print(f"❌ Batch {batch_count} failed: {batch_error}")
                db.session.rollback()
                # Try individual inserts for this batch
                for action, component_or_data, row_num in batch:
                    try:
                        if action == 'create':
                            db.session.add(component_or_data)
                        db.session.commit()
                        if action == 'create':
                            created_count += 1
                        else:
                            updated_count += 1
                    except:
                        errors.append(f"Row {row_num}: Failed to save component")
                        db.session.rollback()
        
        print(f"🎉 Bulk processing complete! Created: {created_count}, Updated: {updated_count}")
        
        # Real-time broadcasting for bulk upload
        user_id = request.headers.get('User-ID', 'anonymous')
        broadcast_user_activity(user_id, 'bulk_upload_completed', f"Uploaded {created_count + updated_count} components")
        broadcast_analytics_update()
        
        # Send final progress update with detailed stats
        socketio.emit('upload_complete', {
            'created': created_count,
            'updated': updated_count,
            'totalRows': len(components_data),
            'successRate': (created_count + updated_count) / len(components_data) * 100 if components_data else 0,
            'errors': errors[:5],  # Show first 5 errors
            'totalErrors': len(errors),
            'message': f'Bulk upload completed: {created_count + updated_count}/{len(components_data)} components processed successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Prepare success message with detailed statistics
        total_processed = created_count + updated_count
        total_rows = len(components_data)
        success_rate = (total_processed / total_rows * 100) if total_rows > 0 else 0
        
        message = f"File processed successfully! "
        message += f"Processed {total_processed}/{total_rows} rows ({success_rate:.1f}% success rate). "
        message += f"Created: {created_count}, Updated: {updated_count}"
        
        if errors:
            message += f", Warnings/Errors: {len(errors)}"
            
        return jsonify({
            'success': True,
            'message': message,
            'data': {
                'created': created_count,
                'updated': updated_count,
                'totalRows': total_rows,
                'successfulRows': total_processed,
                'errors': errors[:10],  # Limit errors shown to first 10
                'totalErrors': len(errors)
            },
            'created': created_count,  # Keep for backward compatibility
            'updated': updated_count,  # Keep for backward compatibility
            'errors': errors[:10] if len(errors) <= 10 else errors[:10] + [f"... and {len(errors) - 10} more warnings"]
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get real-time analytics data for dashboard"""
    try:
        # Basic counts
        total_components = Component.query.count()
        
        # Complexity distribution (updated structure)
        complexity_counts = db.session.query(
            Component.complexity,
            db.func.count(Component.id)
        ).group_by(Component.complexity).all()
        
        # Tower distribution
        tower_counts = db.session.query(
            Component.tower_name,
            db.func.count(Component.id)
        ).group_by(Component.tower_name).order_by(db.func.count(Component.id).desc()).limit(10).all()
        
        # Change type distribution
        change_type_counts = db.session.query(
            Component.change_type,
            db.func.count(Component.id)
        ).group_by(Component.change_type).all()
        
        # Monthly release data
        monthly_releases = db.session.query(
            Component.month,
            Component.year,
            db.func.count(Component.id)
        ).group_by(Component.month, Component.year).order_by(Component.year.desc(), Component.month).all()
        
        # Component type usage
        component_type_usage = db.session.query(
            Component.component_type,
            db.func.count(Component.id)
        ).group_by(Component.component_type).order_by(db.func.count(Component.id).desc()).limit(10).all()
        
        # App Group distribution  
        app_group_counts = db.session.query(
            Component.app_group,
            db.func.count(Component.id)
        ).group_by(Component.app_group).order_by(db.func.count(Component.id).desc()).limit(10).all()
        
        # Recent activity
        recent_components = Component.query.order_by(
            Component.last_updated.desc()
        ).limit(10).all()
        
        return jsonify({
            'success': True,
            'analytics': {
                'totalComponents': total_components,
                'complexityDistribution': {complexity: count for complexity, count in complexity_counts},
                'towerDistribution': {tower: count for tower, count in tower_counts},
                'changeTypeDistribution': {change_type: count for change_type, count in change_type_counts},
                'appGroupDistribution': {app_group: count for app_group, count in app_group_counts},
                'componentTypeUsage': {comp_type: count for comp_type, count in component_type_usage},
                'recentComponents': [comp.to_dict() for comp in recent_components],
                'monthlyReleases': [
                    {
                        'month': month,
                        'year': int(year) if year else None,
                        'count': count
                    } for month, year, count in monthly_releases
                ],
                'lastUpdated': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Advanced Search Endpoint
@app.route('/api/search/components', methods=['GET'])
def advanced_search_components():
    """Advanced search for components with multiple criteria"""
    try:
        # Get search parameters
        component_name = request.args.get('componentName', '')
        component_type = request.args.get('componentType', '')
        tower_name = request.args.get('towerName', '')
        app_group = request.args.get('appGroup', '')
        complexity = request.args.get('complexity', '')
        change_type = request.args.get('changeType', '')
        month = request.args.get('month', '')
        year = request.args.get('year', '')
        owner = request.args.get('owner', '')
        
        # Pagination
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        
        # Build query
        query = Component.query
        
        # Apply filters
        if component_name:
            query = query.filter(Component.component_name.ilike(f'%{component_name}%'))
        if component_type:
            query = query.filter(Component.component_type.ilike(f'%{component_type}%'))
        if tower_name:
            query = query.filter(Component.tower_name.ilike(f'%{tower_name}%'))
        if app_group:
            query = query.filter(Component.app_group.ilike(f'%{app_group}%'))
        if complexity:
            query = query.filter(Component.complexity == complexity)
        if change_type:
            query = query.filter(Component.change_type.ilike(f'%{change_type}%'))
        if month:
            query = query.filter(Component.month.ilike(f'%{month}%'))
        if year:
            query = query.filter(Component.year == int(year))
        if owner:
            query = query.filter(Component.owner.ilike(f'%{owner}%'))
        
        # Execute paginated search
        pagination = query.order_by(Component.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'components': [comp.to_dict() for comp in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next
            },
            'resultsFound': pagination.total
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Batch Delete Endpoint
@app.route('/api/components/batch', methods=['DELETE'])
def batch_delete_components():
    """Delete multiple components at once"""
    try:
        data = request.get_json()
        if not data or 'componentIds' not in data:
            return jsonify({'success': False, 'error': 'No component IDs provided'}), 400
        
        component_ids = data['componentIds']
        if not isinstance(component_ids, list) or len(component_ids) == 0:
            return jsonify({'success': False, 'error': 'Invalid component IDs'}), 400
        
        # Find components to delete
        components_to_delete = Component.query.filter(
            Component.component_id.in_(component_ids)
        ).all()
        
        if not components_to_delete:
            return jsonify({'success': False, 'error': 'No components found'}), 404
        
        # Store data for broadcasting before deletion
        deleted_components = [comp.to_dict() for comp in components_to_delete]
        deleted_count = len(components_to_delete)
        
        # Delete components
        for component in components_to_delete:
            db.session.delete(component)
        
        db.session.commit()
        
        # Broadcast real-time updates
        user_id = request.headers.get('User-ID', 'anonymous')
        for comp_data in deleted_components:
            broadcast_component_update('delete', comp_data, user_id)
        
        broadcast_user_activity(user_id, 'batch_delete_completed', f"Deleted {deleted_count} components")
        broadcast_analytics_update()
        
        # Send batch completion notification
        socketio.emit('batch_delete_complete', {
            'deletedCount': deleted_count,
            'componentIds': component_ids,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return jsonify({
            'success': True,
            'message': f'Successfully deleted {deleted_count} components',
            'deletedCount': deleted_count,
            'deletedComponents': deleted_components
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export', methods=['GET'])
def export_components():
    """Export components to CSV"""
    try:
        components = Component.query.all()
        
        # Create CSV data
        output = BytesIO()
        
        # Write CSV headers and data with new structure
        csv_content = "componentId,towerName,appGroup,complexity,componentName,componentType,month,year,changeType,description,owner,releaseDate,lastUpdated,createdAt\n"
        
        for component in components:
            csv_content += f"{component.component_id},{component.tower_name},{component.app_group},{component.complexity},\"{component.component_name}\",{component.component_type},{component.month},{component.year},{component.change_type},\"{component.description or ''}\",{component.owner or ''},{component.release_date.isoformat() if component.release_date else ''},{component.last_updated.isoformat() if component.last_updated else ''},{component.created_at.isoformat() if component.created_at else ''}\n"
        
        output.write(csv_content.encode('utf-8'))
        output.seek(0)
        
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name='eh_components_export.csv'
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 🎉 SURPRISE ANALYTICS PAGE - Advanced Business Intelligence
@app.route('/api/analytics/surprise', methods=['GET'])
def get_surprise_analytics():
    """🚀 Advanced analytics with AI-like insights for business intelligence"""
    try:
        from sqlalchemy import func, case, distinct
        current_year = datetime.now().year
        current_month = datetime.now().strftime('%B')
        
        # 📊 Component Velocity & Productivity Analysis
        velocity_analysis = db.session.query(
            Component.tower_name,
            func.count(Component.id).label('total_components'),
            func.count(distinct(Component.app_group)).label('app_groups_involved'),
            func.count(distinct(Component.component_type)).label('tech_diversity'),
            func.avg(
                case(
                    (Component.complexity == 'Low', 1),
                    (Component.complexity == 'Medium', 2),
                    (Component.complexity == 'High', 3),
                    else_=2
                )
            ).label('avg_complexity_score')
        ).group_by(Component.tower_name).all()
        
        # 🔥 Hot Component Types (trending technologies)
        trending_tech = db.session.query(
            Component.component_type,
            func.count(Component.id).label('usage_frequency'),
            func.count(distinct(Component.tower_name)).label('adoption_breadth'),
            func.count(
                case(
                    (Component.change_type == 'New', 1)
                )
            ).label('new_implementations')
        ).group_by(Component.component_type).order_by(
            func.count(Component.id).desc()
        ).limit(8).all()
        
        # 💡 Innovation Index (New vs Updated ratio per tower)
        innovation_index = db.session.query(
            Component.tower_name,
            func.count(
                case((Component.change_type == 'New', 1))
            ).label('new_count'),
            func.count(
                case((Component.change_type.in_(['Update', 'Enhancement']), 1))
            ).label('update_count'),
            func.count(Component.id).label('total')
        ).group_by(Component.tower_name).all()
        
        # 🎯 Complexity Distribution Insights
        complexity_matrix = db.session.query(
            Component.tower_name,
            Component.complexity,
            func.count(Component.id).label('count')
        ).group_by(Component.tower_name, Component.complexity).all()
        
        # 📈 Release Momentum (Components by month trends)
        release_momentum = db.session.query(
            Component.month,
            Component.year,
            func.count(Component.id).label('components_count'),
            func.count(distinct(Component.tower_name)).label('towers_active')
        ).filter(Component.year >= current_year - 1).group_by(
            Component.month, Component.year
        ).order_by(Component.year.desc(), Component.month).all()
        
        # 🏆 Top Performers (Most productive owners/teams)
        top_performers = db.session.query(
            Component.owner,
            func.count(Component.id).label('components_delivered'),
            func.count(distinct(Component.tower_name)).label('cross_tower_work'),
            func.count(distinct(Component.component_type)).label('tech_versatility'),
            func.avg(
                case(
                    (Component.complexity == 'Low', 1),
                    (Component.complexity == 'Medium', 2), 
                    (Component.complexity == 'High', 3),
                    else_=2
                )
            ).label('avg_complexity_handled')
        ).filter(Component.owner != 'System').group_by(
            Component.owner
        ).order_by(func.count(Component.id).desc()).limit(10).all()
        
        # 🔍 Risk Assessment (High complexity components)
        risk_assessment = db.session.query(
            Component.tower_name,
            func.count(
                case((Component.complexity == 'High', 1))
            ).label('high_complexity_count'),
            func.count(Component.id).label('total_components')
        ).group_by(Component.tower_name).all()
        
        # 📊 Technology Stack Analysis
        tech_stack_analysis = db.session.query(
            Component.app_group,
            func.count(distinct(Component.component_type)).label('tech_stack_diversity'),
            func.count(Component.id).label('total_implementations'),
            func.count(distinct(Component.tower_name)).label('tower_coverage')
        ).group_by(Component.app_group).order_by(
            func.count(Component.id).desc()
        ).limit(12).all()
        
        # 🚀 Calculate Business Intelligence Insights
        total_components = Component.query.count()
        active_towers = db.session.query(func.count(distinct(Component.tower_name))).scalar()
        tech_diversity = db.session.query(func.count(distinct(Component.component_type))).scalar()
        
        # Innovation Score Calculation
        new_components = Component.query.filter(Component.change_type == 'New').count()
        innovation_score = (new_components / total_components * 100) if total_components > 0 else 0
        
        return jsonify({
            'success': True,
            'surpriseAnalytics': {
                # 📊 Executive Summary
                'executiveSummary': {
                    'totalComponents': total_components,
                    'activeTowers': active_towers,
                    'techDiversity': tech_diversity,
                    'innovationScore': round(innovation_score, 2),
                    'analysisTimestamp': datetime.utcnow().isoformat()
                },
                
                # 🏗️ Tower Performance Matrix
                'towerVelocityMatrix': [
                    {
                        'towerName': row.tower_name,
                        'totalComponents': row.total_components,
                        'appGroupsInvolved': row.app_groups_involved,
                        'techDiversity': row.tech_diversity,
                        'avgComplexityScore': round(float(row.avg_complexity_score), 2) if row.avg_complexity_score else 2.0,
                        'velocityIndex': round((row.total_components * row.tech_diversity) / max(row.app_groups_involved, 1), 2)
                    } for row in velocity_analysis
                ],
                
                # 🔥 Technology Trends
                'trendingTechnologies': [
                    {
                        'componentType': row.component_type,
                        'usageFrequency': row.usage_frequency,
                        'adoptionBreadth': row.adoption_breadth,
                        'newImplementations': row.new_implementations,
                        'trendScore': round((row.usage_frequency * row.adoption_breadth) / 10, 2)
                    } for row in trending_tech
                ],
                
                # 💡 Innovation Index
                'innovationIndex': [
                    {
                        'towerName': row.tower_name,
                        'newComponents': row.new_count,
                        'updatedComponents': row.update_count,
                        'totalComponents': row.total,
                        'innovationRatio': round((row.new_count / max(row.total, 1)) * 100, 2)
                    } for row in innovation_index
                ],
                
                # 📈 Release Momentum
                'releaseMomentum': [
                    {
                        'month': row.month,
                        'year': row.year,
                        'componentsCount': row.components_count,
                        'towersActive': row.towers_active,
                        'momentum': round((row.components_count * row.towers_active) / 10, 2)
                    } for row in release_momentum
                ],
                
                # 🏆 Performance Leaderboard
                'topPerformers': [
                    {
                        'owner': row.owner,
                        'componentsDelivered': row.components_delivered,
                        'crossTowerWork': row.cross_tower_work,
                        'techVersatility': row.tech_versatility,
                        'avgComplexityHandled': round(float(row.avg_complexity_handled), 2) if row.avg_complexity_handled else 2.0,
                        'performanceScore': round(
                            (row.components_delivered * row.tech_versatility * row.cross_tower_work) / 10, 2
                        )
                    } for row in top_performers
                ],
                
                # 🔍 Risk Heatmap
                'riskAssessment': [
                    {
                        'towerName': row.tower_name,
                        'highComplexityCount': row.high_complexity_count,
                        'totalComponents': row.total_components,
                        'riskPercentage': round((row.high_complexity_count / max(row.total_components, 1)) * 100, 2)
                    } for row in risk_assessment
                ],
                
                # 🛠️ Technology Stack Intelligence
                'techStackAnalysis': [
                    {
                        'appGroup': row.app_group,
                        'techStackDiversity': row.tech_stack_diversity,
                        'totalImplementations': row.total_implementations,
                        'towerCoverage': row.tower_coverage,
                        'maturityScore': round(
                            (row.tech_stack_diversity * row.tower_coverage) / max(row.total_implementations, 1) * 100, 2
                        )
                    } for row in tech_stack_analysis
                ]
            },
            'message': '🎉 Advanced Business Intelligence Ready!',
            'dataFreshness': 'Real-time',
            'aiInsights': [
                f"🚀 Innovation Score: {round(innovation_score, 1)}% - {'Excellent' if innovation_score > 70 else 'Good' if innovation_score > 40 else 'Needs Improvement'}",
                f"🏗️ Active Towers: {active_towers} towers driving development",
                f"🛠️ Tech Diversity: {tech_diversity} different component types in use",
                f"📊 Total Components: {total_components} components under management"
            ]
        })
        
    except Exception as e:
        print(f"❌ Surprise Analytics Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# WebSocket Event Handlers
@socketio.on('connect')
def handle_connect(auth):
    """Handle client connection"""
    user_id = request.sid
    active_users[user_id] = {
        'id': user_id,
        'connected_at': datetime.utcnow(),
        'last_activity': datetime.utcnow()
    }
    
    # Join user to their personal room for targeted messages
    join_room(user_id)
    
    # Broadcast user connection
    broadcast_user_activity(user_id, 'connected', 'User connected to the system')
    
    # Send current active users count
    emit('user_count_update', {'count': len(active_users)})
    
    # Send recent activities to new user
    emit('recent_activities', {'activities': user_activities[-10:]})
    
    print(f"User {user_id} connected. Total users: {len(active_users)}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    user_id = request.sid
    if user_id in active_users:
        # Broadcast user disconnection
        broadcast_user_activity(user_id, 'disconnected', 'User disconnected from the system')
        
        # Remove from active users
        del active_users[user_id]
        
        # Leave personal room
        leave_room(user_id)
        
        # Update user count
        socketio.emit('user_count_update', {'count': len(active_users)})
        
        print(f"User {user_id} disconnected. Total users: {len(active_users)}")

@socketio.on('user_activity')
def handle_user_activity(data):
    """Handle user activity tracking"""
    user_id = request.sid
    activity = data.get('activity', 'unknown')
    details = data.get('details')
    
    # Update user last activity
    if user_id in active_users:
        active_users[user_id]['last_activity'] = datetime.utcnow()
    
    # Broadcast the activity
    broadcast_user_activity(user_id, activity, details)

@socketio.on('request_analytics_update')
def handle_analytics_request():
    """Handle request for fresh analytics data"""
    broadcast_analytics_update()

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

# Database initialization
def init_db():
    """Initialize database with sample data"""
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if we need sample data
        if Component.query.count() == 0:
            print("Creating sample data...")
            
            sample_components = [
                {
                    'component_id': 'AUTH-001',
                    'tower_name': 'Security',
                    'app_group': 'Authentication',
                    'complexity': 'High',
                    'component_name': 'Patient Authentication Service',
                    'component_type': 'API Service',
                    'month': 'March',
                    'year': 2024,
                    'change_type': 'New',
                    'description': 'Secure authentication service for patient portal access',
                    'owner': 'Security Team',
                    'release_date': datetime(2024, 3, 15).date()
                },
                {
                    'component_id': 'EHR-002',
                    'tower_name': 'Healthcare',
                    'app_group': 'Electronic Health Records',
                    'complexity': 'High',
                    'component_name': 'EHR Core API',
                    'component_type': 'REST API',
                    'month': 'April',
                    'year': 2024,
                    'change_type': 'Enhancement',
                    'description': 'Core API for managing electronic health records',
                    'owner': 'EHR Team',
                    'release_date': datetime(2024, 4, 20).date()
                },
                {
                    'component_id': 'BILL-003',
                    'tower_name': 'Finance',
                    'app_group': 'Billing System',
                    'complexity': 'Medium',
                    'component_name': 'Billing Integration Service',
                    'component_type': 'Integration Service',
                    'month': 'May',
                    'year': 2024,
                    'change_type': 'New',
                    'description': 'Integration service for healthcare billing systems',
                    'owner': 'Finance Team',
                    'release_date': datetime(2024, 5, 1).date()
                },
                {
                    'component_id': 'DASH-005',
                    'tower_name': 'Frontend',
                    'app_group': 'Provider Portal',
                    'complexity': 'Medium',
                    'component_name': 'Provider Dashboard',
                    'component_type': 'React Component',
                    'month': 'June',
                    'year': 2024,
                    'change_type': 'Update',
                    'description': 'Healthcare provider dashboard for patient management',
                    'owner': 'UI/UX Team',
                    'release_date': datetime(2024, 6, 15).date()
                },
                {
                    'component_id': 'EDL-001',
                    'tower_name': 'EDL',
                    'app_group': 'Tableau',
                    'complexity': 'Low',
                    'component_name': 'config.json',
                    'component_type': 'JSON',
                    'month': 'June',
                    'year': 2025,
                    'change_type': 'New',
                    'description': 'Configuration file for Tableau dashboard',
                    'owner': 'Data Team',
                    'release_date': datetime(2025, 6, 1).date()
                }
            ]
            
            for comp_data in sample_components:
                component = Component(**comp_data)
                db.session.add(component)
            
            db.session.commit()
            print("Sample data created successfully!")

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    print("🏥 EH Component Tracker API Server Starting...")
    print("🔗 API Documentation: http://localhost:5000")
    print("🌐 CORS enabled for: http://localhost:3000")
    print("📊 Database: SQLite (eh_components.db)")
    print("⚡ Real-time WebSocket support enabled")
    print("🚀 Ready for real-time collaboration!")
    
    # Run the application with SocketIO
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
