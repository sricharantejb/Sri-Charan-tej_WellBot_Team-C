import sqlite3
import os

db_path = 'c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\instance\\site.db'
if not os.path.exists(db_path):
    # Try alternate location if instance folder is different
    db_path = 'c:\\Users\\Sai shashank\\Downloads\\wellbot\\backend\\site.db'

print(f"Connecting to {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Add columns to recovery_plans
    print("Adding veg_diet to recovery_plans...")
    cursor.execute("ALTER TABLE recovery_plans ADD COLUMN veg_diet TEXT")
except sqlite3.OperationalError as e:
    print(f"veg_diet possibly exists: {e}")

try:
    print("Adding non_veg_diet to recovery_plans...")
    cursor.execute("ALTER TABLE recovery_plans ADD COLUMN non_veg_diet TEXT")
except sqlite3.OperationalError as e:
    print(f"non_veg_diet possibly exists: {e}")

conn.commit()
conn.close()
print("Migration completed.")
