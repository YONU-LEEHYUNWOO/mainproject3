import sys
import os

# Add parent directory to path to allow importing models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User

# Use absolute path to ensure we hit the right DB
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "care_assistant.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

print(f"Connecting to database at: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_and_fix_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users.")
        for user in users:
            print(f"[User ID: {user.id}] {user.username} (Type: {user.user_type}) - Sharing Enabled: {user.location_sharing_enabled}")
            
            # Fix specifically for ID 2 (Parent) or any parent
            if user.id == 2 or user.user_type == 'parent':
                if not user.location_sharing_enabled:
                    print(f"  -> Enabling location sharing for User {user.id}...")
                    user.location_sharing_enabled = True
                    db.commit()
                    db.refresh(user)
                    print(f"  -> New state: {user.location_sharing_enabled}")
                else:
                    print(f"  -> Already enabled.")
                    
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_and_fix_users()
