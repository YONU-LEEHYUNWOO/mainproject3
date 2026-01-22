
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

print("Attempting to import routers.favorites...")
try:
    import routers.favorites
    print("Successfully imported routers.favorites")
except Exception as e:
    print(f"Failed to import routers.favorites: {e}")
    import traceback
    traceback.print_exc()

print("\nChecking database models...")
try:
    from models import FavoritePlace
    print("Successfully imported FavoritePlace from models")
except Exception as e:
    print(f"Failed to import FavoritePlace from models: {e}")
    import traceback
    traceback.print_exc()
