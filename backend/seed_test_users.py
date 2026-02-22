"""
Seed script to create test users for each role.
Run: python seed_test_users.py
"""
from core.database import SessionLocal, engine
from models.user import User, UserRole
from models.mentor_session import MentorProfile
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_users():
    db = SessionLocal()
    
    test_users = [
        {
            "name": "Free User",
            "email": "free@test.com",
            "password": "test123",
            "role": UserRole.FREE,
        },
        {
            "name": "Premium User",
            "email": "premium@test.com",
            "password": "test123",
            "role": UserRole.PREMIUM,
        },
        {
            "name": "Mentor User",
            "email": "mentor@test.com",
            "password": "test123",
            "role": UserRole.MENTOR,
        },
        {
            "name": "Admin User",
            "email": "admin@test.com",
            "password": "test123",
            "role": UserRole.ADMIN,
        },
    ]
    
    created = []
    skipped = []
    
    try:
        for user_data in test_users:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if existing:
                # Update password to the known test password
                existing.hashed_password = hash_password(user_data["password"])
                skipped.append(user_data["email"])
                continue
            
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                hashed_password=hash_password(user_data["password"]),
                role=user_data["role"],
                auth_method="email"
            )
            db.add(user)
            db.flush()  # Get the user ID
            
            # Create mentor profile for the mentor user
            if user_data["role"] == UserRole.MENTOR:
                mentor_profile = MentorProfile(
                    user_id=user.id,
                    bio="Experienced software engineer with 10+ years in web development and cloud computing.",
                    expertise_areas="Web Development, Cloud Computing, Python, JavaScript",
                    hourly_rate=75.0,
                    years_experience=10,
                    is_accepting_sessions=True,
                    min_session_duration=30,
                    max_session_duration=120
                )
                db.add(mentor_profile)
            
            created.append(user_data["email"])
        
        db.commit()
        
        print("\n" + "=" * 50)
        print("  TEST USERS SEEDED SUCCESSFULLY")
        print("=" * 50)
        
        if created:
            print(f"\n✅ Created {len(created)} user(s):")
            for email in created:
                print(f"   - {email}")
        
        if skipped:
            print(f"\n⏭️  Skipped {len(skipped)} (already exist):")
            for email in skipped:
                print(f"   - {email}")
        
        print("\n" + "-" * 50)
        print("  LOGIN CREDENTIALS (password: test123)")
        print("-" * 50)
        print(f"  FREE:    free@test.com     / test123")
        print(f"  PREMIUM: premium@test.com  / test123")
        print(f"  MENTOR:  mentor@test.com   / test123")
        print(f"  ADMIN:   admin@test.com    / test123")
        print("=" * 50 + "\n")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
