"""File processing utilities for component uploads."""

import os
import pandas as pd
import json
from typing import Dict, List, Any, Optional, Tuple
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

# Supported file types
ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls', '.json'}
ALLOWED_MIME_TYPES = {
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
}


def is_allowed_file(filename: str, content_type: str = None) -> bool:
    """Check if file type is allowed."""
    if not filename:
        return False
    
    # Check file extension
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check MIME type if provided
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        return False
    
    return True


def validate_file_size(file_size: int, max_size: int = 10 * 1024 * 1024) -> bool:
    """Validate file size (default 10MB limit)."""
    return file_size <= max_size


def process_csv_file(file_content: bytes, filename: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Process CSV file and return data with validation errors."""
    try:
        # Read CSV with pandas
        df = pd.read_csv(BytesIO(file_content))
        
        # Convert to records
        records = df.to_dict('records')
        
        # Clean and validate records
        processed_records = []
        errors = []
        
        for idx, record in enumerate(records):
            try:
                processed_record = clean_component_record(record, idx + 1)
                if processed_record:
                    processed_records.append(processed_record)
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        return processed_records, errors
        
    except Exception as e:
        logger.error(f"Error processing CSV file {filename}: {e}")
        return [], [f"Failed to process CSV file: {str(e)}"]


def process_excel_file(file_content: bytes, filename: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Process Excel file and return data with validation errors."""
    try:
        # Read Excel with pandas
        df = pd.read_excel(BytesIO(file_content), engine='openpyxl')
        
        # Convert to records
        records = df.to_dict('records')
        
        # Clean and validate records
        processed_records = []
        errors = []
        
        for idx, record in enumerate(records):
            try:
                processed_record = clean_component_record(record, idx + 1)
                if processed_record:
                    processed_records.append(processed_record)
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        return processed_records, errors
        
    except Exception as e:
        logger.error(f"Error processing Excel file {filename}: {e}")
        return [], [f"Failed to process Excel file: {str(e)}"]


def process_json_file(file_content: bytes, filename: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Process JSON file and return data with validation errors."""
    try:
        # Parse JSON
        data = json.loads(file_content.decode('utf-8'))
        
        # Handle different JSON structures
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict):
            if 'components' in data:
                records = data['components']
            elif 'data' in data:
                records = data['data']
            else:
                records = [data]
        else:
            return [], ["Invalid JSON structure. Expected list or object with 'components' or 'data' key."]
        
        # Clean and validate records
        processed_records = []
        errors = []
        
        for idx, record in enumerate(records):
            try:
                processed_record = clean_component_record(record, idx + 1)
                if processed_record:
                    processed_records.append(processed_record)
            except Exception as e:
                errors.append(f"Item {idx + 1}: {str(e)}")
        
        return processed_records, errors
        
    except json.JSONDecodeError as e:
        return [], [f"Invalid JSON format: {str(e)}"]
    except Exception as e:
        logger.error(f"Error processing JSON file {filename}: {e}")
        return [], [f"Failed to process JSON file: {str(e)}"]


def clean_component_record(record: Dict[str, Any], row_num: int) -> Optional[Dict[str, Any]]:
    """Clean and validate a single component record."""
    if not record or all(pd.isna(v) if v is not None else True for v in record.values()):
        return None  # Skip empty rows
    
    cleaned = {}
    
    # Map various field names to our schema
    field_mappings = {
        'name': ['name', 'component_name', 'componentName', 'Component Name', 'title'],
        'slug': ['slug', 'identifier', 'id', 'component_id', 'componentId'],
        'description': ['description', 'desc', 'details', 'summary'],
        'tower_name': ['tower', 'tower_name', 'towerName', 'Tower', 'domain', 'area'],
        'status': ['status', 'state', 'phase', 'stage'],
        'complexity': ['complexity', 'level', 'difficulty', 'size'],
        'tech_stack': ['tech_stack', 'techStack', 'technology', 'technologies', 'stack']
    }
    
    # Extract and clean fields
    for our_field, possible_names in field_mappings.items():
        value = None
        for name in possible_names:
            if name in record and record[name] is not None and not pd.isna(record[name]):
                value = str(record[name]).strip()
                break
        
        if our_field == 'name' and not value:
            raise ValueError("Component name is required")
        
        if our_field == 'slug' and not value and cleaned.get('name'):
            # Generate slug from name
            value = cleaned['name'].lower().replace(' ', '-').replace('_', '-')
            value = ''.join(c for c in value if c.isalnum() or c == '-')
        
        if our_field == 'status' and not value:
            value = 'planning'  # Default status
        
        if our_field == 'complexity' and not value:
            value = 'medium'  # Default complexity
        
        if our_field == 'tech_stack' and value:
            # Try to parse as JSON, otherwise use as string
            try:
                if value.startswith('{') or value.startswith('['):
                    cleaned[our_field] = json.loads(value)
                else:
                    # Convert string to simple object
                    technologies = [tech.strip() for tech in value.split(',')]
                    cleaned[our_field] = {"technologies": technologies}
            except json.JSONDecodeError:
                cleaned[our_field] = {"description": value}
        elif our_field == 'tech_stack':
            cleaned[our_field] = None
        else:
            cleaned[our_field] = value
    
    # Validate required fields
    if not cleaned.get('name'):
        raise ValueError("Component name is required")
    
    if not cleaned.get('slug'):
        raise ValueError("Component slug could not be generated")
    
    # Validate status values
    valid_statuses = ['planning', 'development', 'testing', 'deployed', 'deprecated']
    if cleaned.get('status') and cleaned['status'].lower() not in valid_statuses:
        cleaned['status'] = 'planning'
    else:
        cleaned['status'] = cleaned.get('status', 'planning').lower()
    
    # Validate complexity values
    valid_complexities = ['low', 'medium', 'high']
    if cleaned.get('complexity') and cleaned['complexity'].lower() not in valid_complexities:
        cleaned['complexity'] = 'medium'
    else:
        cleaned['complexity'] = cleaned.get('complexity', 'medium').lower()
    
    return cleaned


def process_uploaded_file(
    file_content: bytes, 
    filename: str, 
    content_type: str
) -> Tuple[List[Dict[str, Any]], List[str], Dict[str, Any]]:
    """Process uploaded file and return components data, errors, and metadata."""
    
    # Validate file
    if not is_allowed_file(filename, content_type):
        return [], ["File type not supported. Please upload CSV, Excel, or JSON files."], {}
    
    if not validate_file_size(len(file_content)):
        return [], ["File size exceeds 10MB limit."], {}
    
    # Get file extension
    _, ext = os.path.splitext(filename.lower())
    
    # Process based on file type
    if ext == '.csv':
        components, errors = process_csv_file(file_content, filename)
    elif ext in ['.xlsx', '.xls']:
        components, errors = process_excel_file(file_content, filename)
    elif ext == '.json':
        components, errors = process_json_file(file_content, filename)
    else:
        return [], ["Unsupported file type"], {}
    
    # Generate metadata
    metadata = {
        "filename": filename,
        "content_type": content_type,
        "file_size": len(file_content),
        "total_rows": len(components) + len(errors),
        "valid_rows": len(components),
        "error_rows": len(errors),
        "success_rate": len(components) / (len(components) + len(errors)) * 100 if (len(components) + len(errors)) > 0 else 0
    }
    
    return components, errors, metadata
