"""Seed script to populate database with demo data."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, create_tables
import models
import schemas
import crud
from auth import get_password_hash
import json

def seed_database():
    """Seed database with demo data."""
    print("🌱 Seeding database with demo data...")
    
    # Create tables if they don't exist
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(models.User).count() > 0:
            print("⚠️ Database already contains data. Skipping seed.")
            return
        
        # Create users
        print("👥 Creating users...")
        users_data = [
            {
                "name": "Admin User",
                "email": "admin@emblemhealth.com",
                "password": "admin123",
                "role": "admin"
            },
            {
                "name": "John Manager",
                "email": "john.manager@emblemhealth.com", 
                "password": "manager123",
                "role": "manager"
            },
            {
                "name": "Alice Developer",
                "email": "alice.dev@emblemhealth.com",
                "password": "dev123",
                "role": "user"
            },
            {
                "name": "Bob Architect", 
                "email": "bob.arch@emblemhealth.com",
                "password": "arch123",
                "role": "user"
            }
        ]
        
        created_users = []
        for user_data in users_data:
            user = models.User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            created_users.append(user)
            print(f"   ✅ Created user: {user.name} ({user.email})")
        
        # Create towers
        print("🏗️ Creating towers...")
        towers_data = [
            {
                "name": "Authentication & Security",
                "description": "Identity management, authentication, and security services",
                "ownership": "Security Team"
            },
            {
                "name": "Healthcare Services",
                "description": "Core healthcare business logic and patient services",
                "ownership": "Healthcare Team"
            },
            {
                "name": "Member Portal",
                "description": "Member-facing web and mobile applications",
                "ownership": "Frontend Team"
            },
            {
                "name": "Data & Analytics",
                "description": "Data processing, analytics, and business intelligence",
                "ownership": "Data Team"
            },
            {
                "name": "Integration Platform",
                "description": "API gateway, integrations, and third-party connections",
                "ownership": "Platform Team"
            }
        ]
        
        created_towers = []
        for tower_data in towers_data:
            tower = models.Tower(**tower_data)
            db.add(tower)
            db.commit()
            db.refresh(tower)
            created_towers.append(tower)
            print(f"   ✅ Created tower: {tower.name}")
        
        # Create components
        print("🧩 Creating components...")
        components_data = [
            {
                "name": "OAuth 2.0 Service",
                "slug": "oauth2-service",
                "description": "Centralized OAuth 2.0 authentication service for all applications",
                "tower_id": created_towers[0].id,
                "status": "deployed",
                "complexity": "high",
                "tech_stack": {"technologies": ["Node.js", "Redis", "PostgreSQL", "Docker"]},
                "created_by": created_users[0].id
            },
            {
                "name": "Member Registration API",
                "slug": "member-registration-api",
                "description": "API for new member registration and onboarding",
                "tower_id": created_towers[1].id,
                "status": "deployed", 
                "complexity": "medium",
                "tech_stack": {"technologies": ["Python", "FastAPI", "SQLAlchemy", "Celery"]},
                "created_by": created_users[1].id
            },
            {
                "name": "Claims Processing Engine",
                "slug": "claims-processing-engine",
                "description": "Automated claims processing and validation system",
                "tower_id": created_towers[1].id,
                "status": "testing",
                "complexity": "high",
                "tech_stack": {"technologies": ["Java", "Spring Boot", "Kafka", "MongoDB"]},
                "created_by": created_users[2].id
            },
            {
                "name": "Member Dashboard",
                "slug": "member-dashboard",
                "description": "React-based member portal dashboard",
                "tower_id": created_towers[2].id,
                "status": "development",
                "complexity": "medium",
                "tech_stack": {"technologies": ["React", "TypeScript", "Chakra UI", "React Query"]},
                "created_by": created_users[2].id
            },
            {
                "name": "Mobile App Core",
                "slug": "mobile-app-core",
                "description": "Core functionality for iOS and Android mobile applications",
                "tower_id": created_towers[2].id,
                "status": "planning",
                "complexity": "high",
                "tech_stack": {"technologies": ["React Native", "Redux", "Firebase", "WebRTC"]},
                "created_by": created_users[3].id
            },
            {
                "name": "Claims Analytics Dashboard",
                "slug": "claims-analytics-dashboard",
                "description": "Business intelligence dashboard for claims analysis",
                "tower_id": created_towers[3].id,
                "status": "deployed",
                "complexity": "medium",
                "tech_stack": {"technologies": ["Python", "Streamlit", "Pandas", "Plotly"]},
                "created_by": created_users[1].id
            },
            {
                "name": "Data Pipeline Manager",
                "slug": "data-pipeline-manager",
                "description": "ETL pipeline orchestration and data transformation",
                "tower_id": created_towers[3].id,
                "status": "deployed",
                "complexity": "high",
                "tech_stack": {"technologies": ["Apache Airflow", "Python", "Spark", "Hadoop"]},
                "created_by": created_users[0].id
            },
            {
                "name": "Third-Party Integration Hub",
                "slug": "third-party-integration-hub",
                "description": "Centralized hub for managing external API integrations",
                "tower_id": created_towers[4].id,
                "status": "development",
                "complexity": "medium",
                "tech_stack": {"technologies": ["Node.js", "Express", "RabbitMQ", "Docker"]},
                "created_by": created_users[3].id
            },
            {
                "name": "API Gateway",
                "slug": "api-gateway",
                "description": "Enterprise API gateway with rate limiting and authentication",
                "tower_id": created_towers[4].id,
                "status": "deployed",
                "complexity": "high",
                "tech_stack": {"technologies": ["Kong", "Lua", "Redis", "Prometheus"]},
                "created_by": created_users[0].id
            },
            {
                "name": "Notification Service",
                "slug": "notification-service",
                "description": "Multi-channel notification system (email, SMS, push)",
                "tower_id": created_towers[4].id,
                "status": "testing",
                "complexity": "medium",
                "tech_stack": {"technologies": ["Python", "Celery", "Redis", "SendGrid", "Twilio"]},
                "created_by": created_users[1].id
            }
        ]
        
        created_components = []
        for comp_data in components_data:
            component = models.Component(**comp_data)
            db.add(component)
            db.commit()
            db.refresh(component)
            created_components.append(component)
            print(f"   ✅ Created component: {component.name}")
        
        # Create releases
        print("🚀 Creating releases...")
        releases_data = [
            {
                "component_id": created_components[0].id,
                "version": "2.1.0",
                "released_at": datetime.utcnow() - timedelta(days=30),
                "notes": "Added support for refresh tokens and improved security"
            },
            {
                "component_id": created_components[0].id,
                "version": "2.1.1",
                "released_at": datetime.utcnow() - timedelta(days=15),
                "notes": "Bug fixes and performance improvements"
            },
            {
                "component_id": created_components[1].id,
                "version": "1.3.0",
                "released_at": datetime.utcnow() - timedelta(days=45),
                "notes": "Enhanced validation and error handling"
            },
            {
                "component_id": created_components[5].id,
                "version": "3.2.0",
                "released_at": datetime.utcnow() - timedelta(days=20),
                "notes": "Added real-time dashboard updates and new chart types"
            },
            {
                "component_id": created_components[6].id,
                "version": "1.0.0",
                "released_at": datetime.utcnow() - timedelta(days=60),
                "notes": "Initial release with core ETL functionality"
            },
            {
                "component_id": created_components[6].id,
                "version": "1.1.0",
                "released_at": datetime.utcnow() - timedelta(days=25),
                "notes": "Added support for real-time streaming data"
            },
            {
                "component_id": created_components[8].id,
                "version": "4.5.0",
                "released_at": datetime.utcnow() - timedelta(days=40),
                "notes": "Major update with improved rate limiting and monitoring"
            },
            {
                "component_id": created_components[8].id,
                "version": "4.5.1",
                "released_at": datetime.utcnow() - timedelta(days=10),
                "notes": "Security patches and bug fixes"
            }
        ]
        
        for release_data in releases_data:
            release = models.Release(**release_data)
            db.add(release)
            db.commit()
            db.refresh(release)
            print(f"   ✅ Created release: v{release.version} for {created_components[release.component_id-1].name}")
        
        # Create activities
        print("📝 Creating activities...")
        activities_data = [
            {
                "user_id": created_users[0].id,
                "component_id": created_components[0].id,
                "action_type": "component_created",
                "meta": {"component_name": created_components[0].name},
                "created_at": datetime.utcnow() - timedelta(days=90)
            },
            {
                "user_id": created_users[1].id,
                "component_id": created_components[1].id,
                "action_type": "component_updated",
                "meta": {"component_name": created_components[1].name, "changes": {"status": "deployed"}},
                "created_at": datetime.utcnow() - timedelta(days=50)
            },
            {
                "user_id": created_users[2].id,
                "component_id": created_components[2].id,
                "action_type": "release_created",
                "meta": {"component_name": created_components[2].name, "version": "1.0.0"},
                "created_at": datetime.utcnow() - timedelta(days=35)
            },
            {
                "user_id": created_users[0].id,
                "component_id": created_components[8].id,
                "action_type": "component_updated",
                "meta": {"component_name": created_components[8].name, "changes": {"complexity": "high"}},
                "created_at": datetime.utcnow() - timedelta(days=5)
            }
        ]
        
        for activity_data in activities_data:
            activity = models.Activity(**activity_data)
            db.add(activity)
            db.commit()
            print(f"   ✅ Created activity: {activity.action_type}")
        
        print("\n🎉 Database seeding completed successfully!")
        print(f"   👥 {len(created_users)} users created")
        print(f"   🏗️ {len(created_towers)} towers created")
        print(f"   🧩 {len(created_components)} components created")
        print(f"   🚀 {len(releases_data)} releases created")
        print(f"   📝 {len(activities_data)} activities created")
        
        print("\n🔐 Login credentials:")
        for user_data in users_data:
            print(f"   {user_data['email']} / {user_data['password']} ({user_data['role']})")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
