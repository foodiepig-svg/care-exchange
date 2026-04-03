"""
Care Exchange — Demo Seed Data

Creates demo accounts for each user role with realistic test data.

Run locally:
    cd backend
    export FLASK_APP=app.py
    python -m seed_demo_data

Or from project root:
    cd backend && python -m seed_demo_data
"""

import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Demo accounts — one per role.  Password: Demo@1234
DEMO_ACCOUNTS = [
    {
        "email": "participant@demo.com",
        "password": "Demo@1234",
        "full_name": "Alex Thompson",
        "role": "participant",
        "phone": "+61 400 111 001",
        "ndis_number": "NDIS-2024-001-0001",
        "plan_number": "PLAN-78945",
        "date_of_birth": "1985-06-15",
        "emergency_contact": "Michael Thompson",
        "emergency_phone": "+61 412 111 002",
    },
    {
        "email": "family@demo.com",
        "password": "Demo@1234",
        "full_name": "Sarah Mitchell",
        "role": "family",
        "phone": "+61 412 222 002",
        "relationship": "Daughter",
    },
    {
        "email": "provider@demo.com",
        "password": "Demo@1234",
        "full_name": "James Chen",
        "role": "provider",
        "phone": "+61 455 333 003",
        "organisation_name": "BrightMind Allied Health",
        "abn": "12345678901",
        "contact_name": "James Chen",
        "contact_email": "provider@demo.com",
        "contact_phone": "+61 455 333 003",
        "service_types": "Physiotherapy,Occupational Therapy",
        "location": "Brisbane QLD 4000",
    },
    {
        "email": "coordinator@demo.com",
        "password": "Demo@1234",
        "full_name": "Emily Rodriguez",
        "role": "coordinator",
        "phone": "+61 490 444 004",
        "organisation": "Adelaide NDIS Services",
    },
]


def create_demo_data(app, db):
    """Create all demo accounts and related test data."""
    from models.user import User
    from models.participant import Participant
    from models.provider import Provider
    from models.coordinator import Coordinator
    from models.goal import Goal
    from models.referral import Referral

    created = []
    errors = []

    for acct in DEMO_ACCOUNTS:
        existing = User.query.filter_by(email=acct["email"]).first()
        if existing:
            print(f"  [SKIP] {acct['email']} — already exists")
            created.append(existing)
            continue

        try:
            # Create user
            user = User(
                email=acct["email"],
                full_name=acct["full_name"],
                role=acct["role"],
                email_verified=True,
                verified_at=datetime.utcnow(),
                verification_token=None,
            )
            user.set_password(acct["password"])
            db.session.add(user)
            db.session.flush()  # Get user.id

            # Create role-specific profile
            if acct["role"] == "participant":
                participant = Participant(
                    user_id=user.id,
                    date_of_birth=datetime.strptime(acct["date_of_birth"], "%Y-%m-%d").date()
                        if acct.get("date_of_birth") else None,
                    ndis_number=acct.get("ndis_number"),
                    plan_number=acct.get("plan_number"),
                    emergency_contact=acct.get("emergency_contact"),
                    emergency_phone=acct.get("emergency_phone"),
                    goals="[]",
                    care_plans="[]",
                )
                db.session.add(participant)
                db.session.flush()

                # Create sample goals
                goals_data = [
                    ("Improve mobility", "Walk 500m without assistance", "health",
                     datetime.utcnow().date() + timedelta(days=90), 60),
                    ("Meal preparation", "Prepare meals independently 4 days a week", "daily_living",
                     datetime.utcnow().date() + timedelta(days=60), 30),
                    ("Social connection", "Attend community activities twice weekly", "social",
                     datetime.utcnow().date() + timedelta(days=120), 0),
                ]
                for title, desc, category, target, progress in goals_data:
                    goal = Goal(
                        participant_id=participant.id,
                        title=title,
                        description=desc,
                        category=category,
                        target_date=target,
                        status="active",
                        progress=progress,
                        created_by_id=user.id,
                    )
                    db.session.add(goal)

            elif acct["role"] == "provider":
                provider = Provider(
                    user_id=user.id,
                    organisation_name=acct.get("organisation_name", ""),
                    abn=acct.get("abn"),
                    contact_name=acct.get("contact_name"),
                    contact_email=acct.get("contact_email"),
                    contact_phone=acct.get("contact_phone"),
                    service_types=acct.get("service_types"),
                    location=acct.get("location"),
                )
                db.session.add(provider)

            elif acct["role"] == "family":
                # Family members don't have their own profile model —
                # they are linked to a participant via the referral system.
                # Link will be created after all users are set up.
                pass

            elif acct["role"] == "coordinator":
                coordinator = Coordinator(
                    user_id=user.id,
                    full_name=acct["full_name"],
                    organisation=acct.get("organisation"),
                )
                db.session.add(coordinator)

            db.session.commit()
            print(f"  [CREATED] {acct['email']}  ({acct['role']})")
            created.append(user)

        except Exception as e:
            db.session.rollback()
            print(f"  [ERROR] {acct['email']}: {e}")
            errors.append({"email": acct["email"], "error": str(e)})

    # ── Create referrals ─────────────────────────────────────────────────
    try:
        participant = User.query.filter_by(email="participant@demo.com").first()
        provider = User.query.filter_by(email="provider@demo.com").first()
        coordinator = User.query.filter_by(email="coordinator@demo.com").first()

        if participant and provider:
            # Referral 1 — Active
            ref1 = Referral(
                participant_id=participant.participant.id,
                provider_id=provider.provider.id,
                coordinator_id=coordinator.coordinator.id if coordinator else None,
                status="active",
                referral_reason="Participant requires ongoing physiotherapy and OT support to improve mobility and independence.",
                urgency="normal",
                notes="Initial referral. Participant has NDIS plan with capacity for 10 hrs/week of allied health.",
                sent_at=datetime.utcnow() - timedelta(days=7),
                responded_at=datetime.utcnow() - timedelta(days=5),
            )
            db.session.add(ref1)

            # Referral 2 — Pending
            ref2 = Referral(
                participant_id=participant.participant.id,
                provider_id=provider.provider.id,
                coordinator_id=coordinator.coordinator.id if coordinator else None,
                status="sent",
                referral_reason="Additional OT hours requested for kitchen safety assessment.",
                urgency="high",
                notes="Awaiting provider confirmation.",
                sent_at=datetime.utcnow() - timedelta(days=1),
            )
            db.session.add(ref2)

            db.session.commit()
            print(f"  [CREATED] Referrals between participant and provider")
    except Exception as e:
        db.session.rollback()
        print(f"  [WARN] Could not create referrals: {e}")

    return created, errors


def run():
    """CLI entry point."""
    is_production = os.environ.get("FLASK_ENV") == "production" or \
                    ".onrender.com" in os.environ.get("RENDER_EXTERNAL_URL", "")

    if is_production:
        print("ERROR: Do not run seed data in production.")
        sys.exit(1)

    from app import create_app, db
    app = create_app()
    with app.app_context():
        print("\n=== Care Exchange — Demo Seed Data ===\n")
        created, errors = create_demo_data(app, db)
        print(f"\nDone. {len(created)} accounts created, {len(errors)} errors.\n")
        print("Demo accounts:")
        print("  participant@demo.com  / Demo@1234  (Participant — has goals & NDIS plan)")
        print("  family@demo.com        / Demo@1234  (Family — linked via referral)")
        print("  provider@demo.com     / Demo@1234  (Provider — BrightMind Allied Health)")
        print("  coordinator@demo.com / Demo@1234  (Coordinator — Adelaide NDIS Services)")
        print()


if __name__ == "__main__":
    run()
