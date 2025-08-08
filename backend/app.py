#!/usr/bin/env python3
"""
EH Component Tracker - Flask Backend API
Healthcare Component Management System
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from datetime import datetime, date
import os
import json
import csv
import uuid
from io import BytesIO
import traceback

# Initialize Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = 'emblemhealth-component-tracker-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eh_components.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, origins=["http://localhost:3000"])

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database Models
class Component(db.Model):
    """Component data model for healthcare technology components"""
    
    id = db.Column(db.Integer, primary_key=True)
    component_id = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    version = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    tower = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='In Development')
    complexity = db.Column(db.String(50), nullable=False, default='Medium')
    owner = db.Column(db.String(100), nullable=False)
    release_date = db.Column(db.Date)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert component to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'componentId': self.component_id,
            'name': self.name,
            'version': self.version,
            'description': self.description,
            'tower': self.tower,
            'status': self.status,
            'complexity': self.complexity,
            'owner': self.owner,
            'releaseDate': self.release_date.isoformat() if self.release_date else None,
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

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
        '1': 'Simple',
        'medium': 'Medium',
        'moderate': 'Medium',
        'med': 'Medium',
        '2': 'Medium',
        'high': 'Complex',
        'complex': 'Complex',
        'hard': 'Complex',
        'difficult': 'Complex',
        '3': 'Complex'
    }
    return complexity_mapping.get(complexity_str, 'Medium')

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
def get_components():
    """Get all components with optional filtering"""
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        tower = request.args.get('tower', '').strip()
        status = request.args.get('status', '').strip()
        complexity = request.args.get('complexity', '').strip()
        year = request.args.get('year', '').strip()
        month = request.args.get('month', '').strip()
        
        # Start with base query
        query = Component.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Component.name.ilike(f'%{search}%'),
                    Component.description.ilike(f'%{search}%'),
                    Component.component_id.ilike(f'%{search}%'),
                    Component.owner.ilike(f'%{search}%')
                )
            )
        
        if tower:
            query = query.filter(Component.tower == tower)
        
        if status:
            query = query.filter(Component.status == status)
        
        if complexity:
            query = query.filter(Component.complexity == complexity)
        
        if year:
            query = query.filter(db.extract('year', Component.release_date) == int(year))
        
        if month:
            query = query.filter(db.extract('month', Component.release_date) == int(month))
        
        # Execute query
        components = query.order_by(Component.last_updated.desc()).all()
        
        return jsonify({
            'success': True,
            'components': [component.to_dict() for component in components],
            'count': len(components)
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
        
        # Create new component
        component = Component(
            component_id=component_id,
            name=data.get('name', ''),
            version=data.get('version', '1.0.0'),
            description=data.get('description', ''),
            tower=data.get('tower', 'General'),
            status=normalize_status(data.get('status')),
            complexity=normalize_complexity(data.get('complexity')),
            owner=data.get('owner', 'Unknown'),
            release_date=release_date
        )
        
        db.session.add(component)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'component': component.to_dict(),
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
        
        return jsonify({
            'success': True,
            'component': component.to_dict(),
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
    """Delete a component"""
    try:
        component = Component.query.get_or_404(component_id)
        db.session.delete(component)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Component deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and component data import"""
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
        
        # Read file data
        if file_ext == 'csv':
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                components_data = list(reader)
        elif file_ext == 'json':
            with open(filepath, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
                if isinstance(json_data, list):
                    components_data = json_data
                else:
                    components_data = [json_data]
        elif file_ext in ['xlsx', 'xls']:
            # For Excel files, we'll skip for now or add a simple error message
            os.remove(filepath)
            return jsonify({
                'success': False,
                'error': 'Excel files not supported yet. Please use CSV or JSON format.'
            }), 400
        
        # Clean up uploaded file
        os.remove(filepath)
        
        # Process data
        created_count = 0
        updated_count = 0
        errors = []
        
        for index, row_data in enumerate(components_data):
            try:
                # Extract data from row
                component_data = {
                    'componentId': str(row_data.get('componentId', row_data.get('component_id', f"COMP-{uuid.uuid4().hex[:8].upper()}"))),
                    'name': str(row_data.get('name', row_data.get('component_name', f"Component {index + 1}"))),
                    'version': str(row_data.get('version', '1.0.0')),
                    'description': str(row_data.get('description', '')),
                    'tower': str(row_data.get('tower', 'General')),
                    'status': normalize_status(row_data.get('status', 'In Development')),
                    'complexity': normalize_complexity(row_data.get('complexity', 'Medium')),
                    'owner': str(row_data.get('owner', 'Unknown')),
                }
                
                # Handle release date
                release_date = None
                if 'releaseDate' in row_data or 'release_date' in row_data:
                    date_value = row_data.get('releaseDate', row_data.get('release_date'))
                    if date_value and date_value.strip():
                        try:
                            release_date = datetime.strptime(date_value, '%Y-%m-%d').date()
                        except:
                            try:
                                release_date = datetime.strptime(date_value, '%m/%d/%Y').date()
                            except:
                                pass
                
                # Check if component exists
                existing = Component.query.filter_by(component_id=component_data['componentId']).first()
                
                if existing:
                    # Update existing component
                    existing.name = component_data['name']
                    existing.version = component_data['version']
                    existing.description = component_data['description']
                    existing.tower = component_data['tower']
                    existing.status = component_data['status']
                    existing.complexity = component_data['complexity']
                    existing.owner = component_data['owner']
                    existing.release_date = release_date
                    existing.last_updated = datetime.utcnow()
                    updated_count += 1
                else:
                    # Create new component
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
                    db.session.add(component)
                    created_count += 1
                
            except Exception as row_error:
                errors.append(f"Row {index + 1}: {str(row_error)}")
        
        # Commit all changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'File processed successfully',
            'created': created_count,
            'updated': updated_count,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Upload failed: {str(e)}'
        }), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data for dashboard"""
    try:
        # Basic counts
        total_components = Component.query.count()
        
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
        
        # Tower distribution
        tower_counts = db.session.query(
            Component.tower,
            db.func.count(Component.id)
        ).group_by(Component.tower).all()
        
        # Recent activity
        recent_components = Component.query.order_by(
            Component.last_updated.desc()
        ).limit(10).all()
        
        # Monthly release trends (last 12 months)
        monthly_releases = db.session.query(
            db.extract('year', Component.release_date).label('year'),
            db.extract('month', Component.release_date).label('month'),
            db.func.count(Component.id).label('count')
        ).filter(
            Component.release_date.isnot(None)
        ).group_by(
            db.extract('year', Component.release_date),
            db.extract('month', Component.release_date)
        ).order_by(
            db.extract('year', Component.release_date),
            db.extract('month', Component.release_date)
        ).all()
        
        return jsonify({
            'success': True,
            'analytics': {
                'totalComponents': total_components,
                'statusDistribution': {status: count for status, count in status_counts},
                'complexityDistribution': {complexity: count for complexity, count in complexity_counts},
                'towerDistribution': {tower: count for tower, count in tower_counts},
                'recentComponents': [comp.to_dict() for comp in recent_components],
                'monthlyReleases': [
                    {
                        'year': int(year) if year else None,
                        'month': int(month) if month else None,
                        'count': count
                    } for year, month, count in monthly_releases
                ]
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/export', methods=['GET'])
def export_components():
    """Export components to CSV"""
    try:
        components = Component.query.all()
        
        # Create CSV data
        output = BytesIO()
        
        # Write CSV headers and data
        csv_content = "componentId,name,version,description,tower,status,complexity,owner,releaseDate,lastUpdated,createdAt\n"
        
        for component in components:
            csv_content += f"{component.component_id},{component.name},{component.version},\"{component.description}\",{component.tower},{component.status},{component.complexity},{component.owner},{component.release_date.isoformat() if component.release_date else ''},{component.last_updated.isoformat() if component.last_updated else ''},{component.created_at.isoformat() if component.created_at else ''}\n"
        
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
                    'name': 'Patient Authentication Service',
                    'version': '2.1.0',
                    'description': 'Secure authentication service for patient portal access',
                    'tower': 'Security',
                    'status': 'Deployed',
                    'complexity': 'Complex',
                    'owner': 'Security Team',
                    'release_date': datetime(2024, 3, 15).date()
                },
                {
                    'component_id': 'EHR-002',
                    'name': 'Electronic Health Records API',
                    'version': '3.0.1',
                    'description': 'Core API for managing electronic health records',
                    'tower': 'Healthcare',
                    'status': 'In Progress',
                    'complexity': 'Complex',
                    'owner': 'EHR Team',
                    'release_date': datetime(2024, 4, 20).date()
                },
                {
                    'component_id': 'NOTIFY-003',
                    'name': 'Patient Notification System',
                    'version': '1.5.2',
                    'description': 'Automated notification system for patient communications',
                    'tower': 'Communication',
                    'status': 'Completed',
                    'complexity': 'Medium',
                    'owner': 'Communication Team',
                    'release_date': datetime(2024, 2, 10).date()
                },
                {
                    'component_id': 'BILL-004',
                    'name': 'Billing Integration Module',
                    'version': '2.0.0',
                    'description': 'Integration module for third-party billing systems',
                    'tower': 'Finance',
                    'status': 'Testing',
                    'complexity': 'Complex',
                    'owner': 'Finance Team',
                    'release_date': datetime(2024, 5, 1).date()
                },
                {
                    'component_id': 'DASH-005',
                    'name': 'Provider Dashboard',
                    'version': '1.8.0',
                    'description': 'Healthcare provider dashboard for patient management',
                    'tower': 'Frontend',
                    'status': 'In Development',
                    'complexity': 'Medium',
                    'owner': 'UI/UX Team',
                    'release_date': datetime(2024, 6, 15).date()
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
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)
