import sqlite3
import os

db_paths = ['./care_assistant.db', '../care_assistant.db']
for path in db_paths:
    print(f"Checking {path}...")
    if os.path.exists(path):
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='parent_requests'")
        res = cursor.fetchone()
        print(f"Result for {path}: {res}")
        if res:
            cursor.execute("PRAGMA table_info(parent_requests)")
            print(f"Columns in {path}: {[row[1] for row in cursor.fetchall()]}")
        conn.close()
    else:
        print(f"File {path} does not exist.")
