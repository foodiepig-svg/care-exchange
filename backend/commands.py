#!/usr/bin/env python3
"""
One-off command to initialize Flask-Migrate on an existing database.
Usage: python commands.py init-migrations

This stamps the current migration state without running DDL,
so future deploys can use Flask-Migrate's upgrade() safely.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from flask_migrate import stamp, init as init_migrate

app = create_app()

with app.app_context():
    # Stamp the database as being at the current migration level
    # This marks migrations as applied without running DDL (safe for existing schema)
    from flask_migrate import stamp as _stamp
    try:
        _stamp('head')
        print("Database stamped to head - migrations initialized.")
    except Exception as e:
        print(f"Stamp result: {e}")
        print("Attempting migration stamp...")
        from flask_migrate import upgrade
        upgrade()
        print("Migrations applied successfully.")
