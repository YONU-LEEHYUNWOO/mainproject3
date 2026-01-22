from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User

DATABASE_URL = "sqlite:///./care_assistant.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def enable_location_sharing(user_id):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            print(f"User {user_id} ({user.username}) found.")
            print(f"Current location_sharing_enabled: {user.location_sharing_enabled}")
            
            user.location_sharing_enabled = True
            db.commit()
            print(f"Updated location_sharing_enabled to True.")
        else:
            print(f"User {user_id} not found.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    enable_location_sharing(2)
