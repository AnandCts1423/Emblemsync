"""Analytics endpoints for dashboard and reporting."""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, extract
from datetime import datetime, timedelta
from database import get_db
from auth import get_current_active_user
import models
import crud

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def get_analytics_summary(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get analytics summary with total counts and key metrics."""
    
    # Total counts
    total_components = crud.get_component_count(db)
    total_towers = crud.get_tower_count(db)
    total_users = db.query(models.User).count()
    total_releases = db.query(models.Release).count()
    
    # Active components (not deprecated)
    active_components = db.query(models.Component).filter(
        models.Component.status != "deprecated"
    ).count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_activities = db.query(models.Activity).filter(
        models.Activity.created_at >= thirty_days_ago
    ).count()
    
    # Innovation score (dummy calculation based on recent releases and updates)
    recent_releases = db.query(models.Release).filter(
        models.Release.released_at >= thirty_days_ago
    ).count()
    
    recent_updates = db.query(models.Activity).filter(
        and_(
            models.Activity.created_at >= thirty_days_ago,
            models.Activity.action_type.in_(["component_created", "component_updated"])
        )
    ).count()
    
    # Simple innovation score: (recent_releases * 10 + recent_updates * 5) / total_components
    innovation_score = round(
        ((recent_releases * 10 + recent_updates * 5) / max(total_components, 1)) * 100, 1
    )
    
    # Tech diversity count (unique technologies from tech_stack)
    components_with_tech = db.query(models.Component).filter(
        models.Component.tech_stack.isnot(None)
    ).all()
    
    unique_technologies = set()
    for component in components_with_tech:
        if component.tech_stack:
            if isinstance(component.tech_stack, dict):
                if "technologies" in component.tech_stack:
                    unique_technologies.update(component.tech_stack["technologies"])
                elif "description" in component.tech_stack:
                    # Parse description for technologies
                    tech_desc = str(component.tech_stack["description"]).lower()
                    common_techs = ["react", "python", "java", "javascript", "node", "angular", "vue", "django", "flask"]
                    for tech in common_techs:
                        if tech in tech_desc:
                            unique_technologies.add(tech.title())
    
    tech_diversity = len(unique_technologies)
    
    return {
        "total_components": total_components,
        "active_components": active_components,
        "total_towers": total_towers,
        "total_users": total_users,
        "total_releases": total_releases,
        "recent_activities": recent_activities,
        "innovation_score": innovation_score,
        "tech_diversity": tech_diversity,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/trends")
async def get_trends_analytics(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get monthly release trends and component creation trends."""
    
    # Monthly release trends (last 12 months)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    
    monthly_releases = db.query(
        extract('year', models.Release.released_at).label('year'),
        extract('month', models.Release.released_at).label('month'),
        func.count(models.Release.id).label('count')
    ).filter(
        models.Release.released_at >= twelve_months_ago
    ).group_by(
        extract('year', models.Release.released_at),
        extract('month', models.Release.released_at)
    ).order_by('year', 'month').all()
    
    # Format monthly releases
    release_trends = []
    for year, month, count in monthly_releases:
        month_name = [
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ][int(month)]
        release_trends.append({
            "period": f"{month_name} {int(year)}",
            "year": int(year),
            "month": int(month),
            "releases": count
        })
    
    # Monthly component creation trends
    monthly_components = db.query(
        extract('year', models.Component.created_at).label('year'),
        extract('month', models.Component.created_at).label('month'),
        func.count(models.Component.id).label('count')
    ).filter(
        models.Component.created_at >= twelve_months_ago
    ).group_by(
        extract('year', models.Component.created_at),
        extract('month', models.Component.created_at)
    ).order_by('year', 'month').all()
    
    # Format component creation trends
    component_trends = []
    for year, month, count in monthly_components:
        month_name = [
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ][int(month)]
        component_trends.append({
            "period": f"{month_name} {int(year)}",
            "year": int(year),
            "month": int(month),
            "components": count
        })
    
    # Status distribution over time
    status_trends = db.query(
        models.Component.status,
        func.count(models.Component.id).label('count')
    ).group_by(models.Component.status).all()
    
    status_distribution = [
        {"status": status, "count": count}
        for status, count in status_trends
    ]
    
    return {
        "monthly_releases": release_trends,
        "monthly_components": component_trends,
        "status_distribution": status_distribution,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/tower-performance")
async def get_tower_performance(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get tower performance metrics and velocity data."""
    
    # Components per tower
    tower_components = db.query(
        models.Tower.name.label('tower_name'),
        models.Tower.id.label('tower_id'),
        func.count(models.Component.id).label('component_count')
    ).outerjoin(
        models.Component, models.Tower.id == models.Component.tower_id
    ).group_by(
        models.Tower.id, models.Tower.name
    ).all()
    
    # Releases per tower (last 90 days)
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    
    tower_releases = db.query(
        models.Tower.name.label('tower_name'),
        func.count(models.Release.id).label('release_count')
    ).join(
        models.Component, models.Tower.id == models.Component.tower_id
    ).join(
        models.Release, models.Component.id == models.Release.component_id
    ).filter(
        models.Release.released_at >= ninety_days_ago
    ).group_by(
        models.Tower.name
    ).all()
    
    # Activity per tower (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    tower_activity = db.query(
        models.Tower.name.label('tower_name'),
        func.count(models.Activity.id).label('activity_count')
    ).join(
        models.Component, models.Tower.id == models.Component.tower_id
    ).join(
        models.Activity, models.Component.id == models.Activity.component_id
    ).filter(
        models.Activity.created_at >= thirty_days_ago
    ).group_by(
        models.Tower.name
    ).all()
    
    # Combine metrics by tower
    tower_metrics = {}
    
    # Initialize with component counts
    for tower_name, tower_id, component_count in tower_components:
        tower_metrics[tower_name] = {
            "tower_name": tower_name,
            "tower_id": tower_id,
            "component_count": component_count,
            "release_count": 0,
            "activity_count": 0,
            "velocity_score": 0
        }
    
    # Add release counts
    for tower_name, release_count in tower_releases:
        if tower_name in tower_metrics:
            tower_metrics[tower_name]["release_count"] = release_count
    
    # Add activity counts
    for tower_name, activity_count in tower_activity:
        if tower_name in tower_metrics:
            tower_metrics[tower_name]["activity_count"] = activity_count
    
    # Calculate velocity score (releases * 10 + activity * 2) / components
    for tower_name, metrics in tower_metrics.items():
        if metrics["component_count"] > 0:
            velocity = (metrics["release_count"] * 10 + metrics["activity_count"] * 2) / metrics["component_count"]
            metrics["velocity_score"] = round(velocity, 2)
        else:
            metrics["velocity_score"] = 0
    
    # Sort by velocity score descending
    sorted_towers = sorted(
        tower_metrics.values(),
        key=lambda x: x["velocity_score"],
        reverse=True
    )
    
    # Complexity distribution per tower
    complexity_by_tower = db.query(
        models.Tower.name.label('tower_name'),
        models.Component.complexity,
        func.count(models.Component.id).label('count')
    ).join(
        models.Component, models.Tower.id == models.Component.tower_id
    ).group_by(
        models.Tower.name, models.Component.complexity
    ).all()
    
    complexity_distribution = {}
    for tower_name, complexity, count in complexity_by_tower:
        if tower_name not in complexity_distribution:
            complexity_distribution[tower_name] = {}
        complexity_distribution[tower_name][complexity] = count
    
    return {
        "tower_performance": sorted_towers,
        "complexity_distribution": complexity_distribution,
        "metrics_period": {
            "releases": "last 90 days",
            "activity": "last 30 days"
        },
        "timestamp": datetime.utcnow().isoformat()
    }
