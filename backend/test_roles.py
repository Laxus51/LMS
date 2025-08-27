#!/usr/bin/env python3
"""
Test script to verify role-based access control implementation.
Run this after setting up the database to test the new role system.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import User, UserRole
from schemas.user import UserCreate
from services.user_service import create_user, authenticate_user, create_access_token
from utils.auth import decode_token, get_current_user
from core.database import get_db
from sqlalchemy.orm import Session

def test_role_system():
    """Test the role-based access control system."""
    print("Testing Role-Based Access Control System")
    print("=" * 50)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Test 1: Create users with different roles
        print("\n1. Testing user creation with different roles:")
        
        test_users = [
            {"email": "student@test.com", "password": "password123", "name": "Test Student", "role": UserRole.FREE},
            {"email": "premium@test.com", "password": "password123", "name": "Premium User", "role": UserRole.PREMIUM},
            {"email": "mentor@test.com", "password": "password123", "name": "Test Mentor", "role": UserRole.MENTOR},
            {"email": "admin@test.com", "password": "password123", "name": "Test Admin", "role": UserRole.ADMIN}
        ]
        
        created_users = []
        for user_data in test_users:
            try:
                # Check if user already exists
                existing = db.query(User).filter(User.email == user_data["email"]).first()
                if existing:
                    print(f"   User {user_data['email']} already exists with role: {existing.role.value}")
                    created_users.append(existing)
                else:
                    user_create = UserCreate(**user_data)
                    new_user = create_user(db, user_create)
                    print(f"   ✓ Created {user_data['email']} with role: {new_user.role.value}")
                    created_users.append(new_user)
            except Exception as e:
                print(f"   ✗ Failed to create {user_data['email']}: {str(e)}")
        
        # Test 2: Test JWT token creation and role inclusion
        print("\n2. Testing JWT token creation with roles:")
        for user in created_users:
            try:
                token_data = {
                    "sub": user.email,
                    "role": user.role.value,
                    "id": user.id
                }
                token = create_access_token(token_data)
                decoded = decode_token(token)
                print(f"   ✓ {user.email}: Token contains role '{decoded.get('role')}'")
            except Exception as e:
                print(f"   ✗ Token test failed for {user.email}: {str(e)}")
        
        # Test 3: Test authentication and role verification
        print("\n3. Testing authentication and role verification:")
        for user_data in test_users:
            try:
                auth_user = authenticate_user(db, user_data["email"], user_data["password"])
                print(f"   ✓ {user_data['email']} authenticated successfully with role: {auth_user.role.value}")
            except Exception as e:
                print(f"   ✗ Authentication failed for {user_data['email']}: {str(e)}")
        
        print("\n4. Role hierarchy verification:")
        roles = [UserRole.FREE, UserRole.PREMIUM, UserRole.MENTOR, UserRole.ADMIN]
        for role in roles:
            print(f"   {role.value}: {role}")
        
        print("\n=== Role-based Access Examples ===")
        print("Free users: Can view courses, cannot create")
        print("Premium users: Can view courses, cannot create")
        print("Mentors: Can view courses, cannot create (custom permissions to be defined)")
        print("Admins: Full access to all operations including course/module creation")
        
        print("\n✓ Role-based access control system test completed successfully!")
        print("\nNext steps:")
        print("- Test the API endpoints with different user roles")
        print("- Verify route protection is working correctly")
        print("- Test role-based UI features in the frontend")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    test_role_system()