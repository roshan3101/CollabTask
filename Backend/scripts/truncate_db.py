#!/usr/bin/env python3
"""
Script to truncate all database tables.
WARNING: This will delete ALL data from the database!

Usage:
    python scripts/truncate_db.py                  # Uses .env file
    python scripts/truncate_db.py --prod           # Uses .env.prod file
    python scripts/truncate_db.py --confirm        # Skip confirmation prompt
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment before importing app modules
from dotenv import load_dotenv

def main():
    # Parse arguments
    use_prod = "--prod" in sys.argv
    skip_confirm = "--confirm" in sys.argv
    
    # Load appropriate env file
    if use_prod:
        load_dotenv(".env.prod", override=True)
        print("Using PRODUCTION database (.env.prod)")
    else:
        load_dotenv(".env", override=True)
        print("Using development database (.env)")
    
    # Now import app modules (after env is loaded)
    from app.core.config import settings
    
    print(f"\nDatabase: {settings.POSTGRES_DB}")
    print(f"Host: {settings.POSTGRES_HOST}")
    print(f"User: {settings.POSTGRES_USER}\n")
    
    if not skip_confirm:
        print("=" * 50)
        print("WARNING: This will DELETE ALL DATA from the database!")
        print("=" * 50)
        confirm = input("\nType 'DELETE ALL' to confirm: ")
        if confirm != "DELETE ALL":
            print("Cancelled.")
            sys.exit(0)
    
    asyncio.run(truncate_all_tables())

async def truncate_all_tables():
    from tortoise import Tortoise
    from app.core.db import TORTOISE_ORM
    
    print("\nConnecting to database...")
    await Tortoise.init(TORTOISE_ORM)
    
    conn = Tortoise.get_connection("default")
    
    # Get all table names
    result = await conn.execute_query("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'aerich'
    """)
    
    tables = [row['tablename'] for row in result[1]]
    
    if not tables:
        print("No tables found.")
        await Tortoise.close_connections()
        return
    
    print(f"\nFound {len(tables)} tables: {', '.join(tables)}")
    print("\nTruncating tables...")
    
    # Disable foreign key checks and truncate
    try:
        # Truncate all tables in one command with CASCADE
        table_list = ', '.join(f'"{t}"' for t in tables)
        await conn.execute_query(f"TRUNCATE TABLE {table_list} RESTART IDENTITY CASCADE")
        print(f"✓ Truncated all tables")
    except Exception as e:
        print(f"✗ Error: {e}")
        # Try one by one
        for table in tables:
            try:
                await conn.execute_query(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE')
                print(f"  ✓ Truncated: {table}")
            except Exception as e:
                print(f"  ✗ Failed to truncate {table}: {e}")
    
    await Tortoise.close_connections()
    print("\n✓ Done!")

if __name__ == "__main__":
    main()
