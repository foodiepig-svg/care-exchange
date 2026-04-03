import json, pytest
from app import db

BASE_URL = '/api/v1'

# -----------------------------------------------------------------
# Health check
# -----------------------------------------------------------------
def test_health_check(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == 'healthy'

# -----------------------------------------------------------------
# Auth: Register
# -----------------------------------------------------------------
def test_register_valid(client):
    res = client.post(f'{BASE_URL}/auth/register', json={
        'email': 'newuser@example.com',
        'password': 'securepass123',
        'full_name': 'New User',
        'role': 'participant'
    })
    assert res.status_code == 201
    data = res.get_json()
    # Registration no longer returns tokens - user must verify email first
    assert 'message' in data
    assert data['requires_verification'] == True
    assert data['email'] == 'newuser@example.com'

def test_register_invalid_email(client):
    res = client.post(f'{BASE_URL}/auth/register', json={
        'email': 'not-an-email',
        'password': 'securepass123',
        'full_name': 'Bad Email',
        'role': 'participant'
    })
    assert res.status_code == 400
    assert 'Invalid email' in res.get_json()['error']

def test_register_short_password(client):
    res = client.post(f'{BASE_URL}/auth/register', json={
        'email': 'shortpw@example.com',
        'password': '1234567',
        'full_name': 'Short PW',
        'role': 'participant'
    })
    assert res.status_code == 400
    assert 'at least 8 characters' in res.get_json()['error']

def test_register_missing_fields(client):
    for missing in ['email', 'password', 'full_name', 'role']:
        payload = {
            'email': 'missing@example.com',
            'password': 'password123',
            'full_name': 'Missing Field',
            'role': 'participant'
        }
        del payload[missing]
        res = client.post(f'{BASE_URL}/auth/register', json=payload)
        assert res.status_code == 400, f'Expected 400 when missing {missing}'

def test_register_duplicate_email(client):
    payload = {
        'email': 'dup@example.com',
        'password': 'password123',
        'full_name': 'First User',
        'role': 'participant'
    }
    client.post(f'{BASE_URL}/auth/register', json=payload)
    res = client.post(f'{BASE_URL}/auth/register', json=payload)
    assert res.status_code == 409
    assert 'already exists' in res.get_json()['error']

def test_register_all_roles(client):
    for role in ['participant', 'family', 'provider', 'coordinator']:
        res = client.post(f'{BASE_URL}/auth/register', json={
            'email': f'{role}@example.com',
            'password': 'password123',
            'full_name': f'{role.title()} User',
            'role': role
        })
        assert res.status_code == 201, f'Role {role} failed: {res.get_json()}'
        data = res.get_json()
        # Registration no longer returns user object - just confirmation
        assert data['requires_verification'] == True

def test_register_invalid_role(client):
    res = client.post(f'{BASE_URL}/auth/register', json={
        'email': 'badrole@example.com',
        'password': 'password123',
        'full_name': 'Bad Role',
        'role': 'admin'
    })
    assert res.status_code == 400

# -----------------------------------------------------------------
# Auth: Login
# -----------------------------------------------------------------
def test_login_valid_credentials(client, app):
    # Register first
    client.post(f'{BASE_URL}/auth/register', json={
        'email': 'login@example.com',
        'password': 'password123',
        'full_name': 'Login User',
        'role': 'participant'
    })
    # Verify the user's email
    with app.app_context():
        from models import User
        user = User.query.filter_by(email='login@example.com').first()
        user.email_verified = True
        user.verified_at = db.func.now()
        db.session.commit()
    # Now login should work
    res = client.post(f'{BASE_URL}/auth/login', json={
        'email': 'login@example.com',
        'password': 'password123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'access_token' in data
    assert data['user']['email'] == 'login@example.com'

def test_login_wrong_password(client):
    client.post(f'{BASE_URL}/auth/register', json={
        'email': 'wrongpw@example.com',
        'password': 'password123',
        'full_name': 'Wrong PW',
        'role': 'participant'
    })
    res = client.post(f'{BASE_URL}/auth/login', json={
        'email': 'wrongpw@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401
    assert 'Invalid email or password' in res.get_json()['error']

def test_login_nonexistent_user(client):
    res = client.post(f'{BASE_URL}/auth/login', json={
        'email': 'nobody@example.com',
        'password': 'password123'
    })
    assert res.status_code == 401

# -----------------------------------------------------------------
# Auth: /me
# -----------------------------------------------------------------
def test_me_with_valid_token(client, auth_headers):
    res = client.get(f'{BASE_URL}/auth/me', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['user']['email'] == 'testuser@example.com'

def test_me_without_token(client):
    res = client.get(f'{BASE_URL}/auth/me')
    assert res.status_code == 401

# -----------------------------------------------------------------
# Participants: /me GET
# -----------------------------------------------------------------
def test_participants_me_get(client, auth_headers):
    res = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert 'user' in data
    assert 'participant' in data
    assert data['user']['role'] == 'participant'

# -----------------------------------------------------------------
# Participants: /me PUT
# -----------------------------------------------------------------
def test_participants_me_update(client, auth_headers):
    res = client.put(f'{BASE_URL}/participants/me', headers=auth_headers, json={
        'full_name': 'Updated Name',
        'ndis_number': 'NDIS123456',
        'plan_number': 'PLAN789'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['user']['full_name'] == 'Updated Name'

    # Verify persisted
    res2 = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    assert res2.get_json()['participant']['ndis_number'] == 'NDIS123456'

def test_participants_me_update_care_plan(client, auth_headers):
    care_plan = [{'id': 1, 'title': 'Daily Living'}]
    res = client.put(f'{BASE_URL}/participants/me', headers=auth_headers, json={
        'care_plans': care_plan
    })
    assert res.status_code == 200

# -----------------------------------------------------------------
# Participants: /me/care-team
# -----------------------------------------------------------------
def test_participants_care_team_empty(client, auth_headers):
    res = client.get(f'{BASE_URL}/participants/me/care-team', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['care_team'] == []

# -----------------------------------------------------------------
# Messages: list threads (authenticated)
# -----------------------------------------------------------------
def test_messages_list_threads_authenticated(client, auth_headers):
    res = client.get(f'{BASE_URL}/messages/threads', headers=auth_headers)
    assert res.status_code == 200
    assert 'threads' in res.get_json()

def test_messages_list_threads_unauthenticated(client):
    res = client.get(f'{BASE_URL}/messages/threads')
    assert res.status_code == 401

# -----------------------------------------------------------------
# Messages: create thread
# -----------------------------------------------------------------
def test_messages_create_thread(client, auth_headers):
    # Need a participant to reference
    # Use the auth_headers participant (me)
    res = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = res.get_json()['participant']['id']

    res = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Test Thread',
        'participant_id': participant_id,
        'content': 'Hello world'
    })
    assert res.status_code == 201
    assert res.get_json()['thread']['topic'] == 'Test Thread'

def test_messages_create_thread_missing_fields(client, auth_headers):
    res = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Only Topic'
    })
    assert res.status_code == 400
    assert 'participant_id' in res.get_json()['error'] or 'required' in res.get_json()['error'].lower()


def test_messages_create_group_thread(client, auth_headers, auth_headers_provider):
    """Can create a group thread with multiple participants."""
    import time
    # Get participant
    res = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = res.get_json()['participant']['id']

    # Create group thread with provider as additional participant
    res = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Group Discussion',
        'participant_id': participant_id,
        'thread_type': 'group',
        'participant_ids': [auth_headers_provider['_cv_participant_id']] if '_cv_participant_id' in auth_headers_provider else [],
        'content': 'Hello group'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['thread']['topic'] == 'Group Discussion'
    assert data['thread']['thread_type'] == 'group'
    assert 'participant_ids' in data['thread']


def test_messages_list_group_thread_with_participants(client, auth_headers, auth_headers_provider):
    """Group threads list includes participant_ids."""
    import time
    # Create a group thread
    res = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = res.get_json()['participant']['id']

    client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Team Sync',
        'participant_id': participant_id,
        'thread_type': 'group',
        'participant_ids': [],
        'content': 'Planning session'
    })

    # List threads
    res = client.get(f'{BASE_URL}/messages/threads', headers=auth_headers)
    assert res.status_code == 200
    threads = res.get_json()['threads']
    group_threads = [t for t in threads if t.get('thread_type') == 'group']
    assert len(group_threads) > 0
    assert 'participant_ids' in group_threads[0]


# -------------------------------------------------------------------
# 4. Referrals
# -------------------------------------------------------------------

def _register_participant(client):
    """Helper: register a fresh participant and return (response, headers)."""
    import time
    email = f"participant{int(time.time()*1000)}@example.com"
    r = client.post(f'{BASE_URL}/auth/register', json={
        'email': email,
        'password': 'password123',
        'full_name': 'Test Participant',
        'role': 'participant'
    })
    token = r.get_json()['access_token']
    return r, {'Authorization': f'Bearer {token}'}


def _register_provider(client):
    """Helper: register a fresh provider and return (response, headers)."""
    import time
    email = f"provider{int(time.time()*1000)}@example.com"
    r = client.post(f'{BASE_URL}/auth/register', json={
        'email': email,
        'password': 'password123',
        'full_name': 'Test Provider',
        'role': 'provider',
        'organisation_name': 'Test Org',
        'abn': '12345678901'
    })
    token = r.get_json()['access_token']
    return r, {'Authorization': f'Bearer {token}'}


def test_referrals_create(client, auth_headers, auth_headers_provider):
    """Participant can create a referral to a provider."""
    # Get participant and provider IDs
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']

    prov = auth_headers_provider
    prov_user_resp = client.get(f'{BASE_URL}/participants/me', headers=prov)
    provider_id = prov_user_resp.get_json().get('user', {}).get('provider', {}).get('id')
    if not provider_id:
        # provider profile id lives on the provider row — look up via user_id
        from models import Provider
        with auth_headers['_cv_app'].app_context():
            p = Provider.query.first()
            provider_id = p.id if p else None

    if not provider_id:
        # skip if provider lookup failed — just check 201 on the endpoint
        pass

    res = client.post(f'{BASE_URL}/referrals', headers=auth_headers, json={
        'participant_id': participant_id,
        'provider_id': provider_id,
        'referral_reason': 'Support coordination needed',
        'urgency': 'normal'
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.get_json()}"
    data = res.get_json()
    assert data['referral']['status'] == 'sent'
    assert data['referral']['referral_reason'] == 'Support coordination needed'


def test_referrals_create_missing_fields(client, auth_headers):
    """Create referral without required fields returns 400."""
    res = client.post(f'{BASE_URL}/referrals', headers=auth_headers, json={
        'referral_reason': 'No IDs provided'
    })
    assert res.status_code == 400
    assert 'participant_id' in res.get_json().get('error', '') or 'required' in res.get_json().get('error', '').lower()


def test_referrals_list_as_participant(client, auth_headers):
    """Participant can list their referrals."""
    res = client.get(f'{BASE_URL}/referrals', headers=auth_headers)
    assert res.status_code == 200
    assert 'referrals' in res.get_json()


def test_referrals_list_as_provider(client, auth_headers_provider):
    """Provider can list referrals sent to them."""
    res = client.get(f'{BASE_URL}/referrals', headers=auth_headers_provider)
    assert res.status_code == 200
    assert 'referrals' in res.get_json()


def test_referrals_get_by_id(client, auth_headers):
    """Can fetch a single referral by ID."""
    # Create one first
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']
    from models import Provider
    with auth_headers['_cv_app'].app_context():
        p = Provider.query.first()
        provider_id = p.id if p else 1
    create = client.post(f'{BASE_URL}/referrals', headers=auth_headers, json={
        'participant_id': participant_id,
        'provider_id': provider_id,
        'referral_reason': 'Test referral',
        'urgency': 'low'
    })
    referral_id = create.get_json()['referral']['id']
    res = client.get(f'{BASE_URL}/referrals/{referral_id}', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['referral']['id'] == referral_id


def test_referrals_update_status(client, auth_headers):
    """Can update referral status through valid transitions."""
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']
    from models import Provider
    with auth_headers['_cv_app'].app_context():
        p = Provider.query.first()
        provider_id = p.id if p else 1
    create = client.post(f'{BASE_URL}/referrals', headers=auth_headers, json={
        'participant_id': participant_id,
        'provider_id': provider_id,
        'referral_reason': 'Status test',
        'urgency': 'normal'
    })
    referral_id = create.get_json()['referral']['id']

    # sent -> viewed
    res = client.put(f'{BASE_URL}/referrals/{referral_id}/status',
                     headers=auth_headers, json={'status': 'viewed'})
    assert res.status_code == 200
    assert res.get_json()['referral']['status'] == 'viewed'

    # viewed -> accepted
    res = client.put(f'{BASE_URL}/referrals/{referral_id}/status',
                     headers=auth_headers, json={'status': 'accepted'})
    assert res.status_code == 200
    assert res.get_json()['referral']['status'] == 'accepted'
    assert res.get_json()['referral']['responded_at'] is not None


def test_referrals_update_status_invalid_transition(client, auth_headers):
    """Invalid status transition is silently ignored (status stays unchanged)."""
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']
    from models import Provider
    with auth_headers['_cv_app'].app_context():
        p = Provider.query.first()
        provider_id = p.id if p else 1
    create = client.post(f'{BASE_URL}/referrals', headers=auth_headers, json={
        'participant_id': participant_id,
        'provider_id': provider_id,
        'referral_reason': 'Invalid transition test',
        'urgency': 'normal'
    })
    referral_id = create.get_json()['referral']['id']

    # draft cannot go directly to accepted
    res = client.put(f'{BASE_URL}/referrals/{referral_id}/status',
                     headers=auth_headers, json={'status': 'accepted'})
    # Returns 200 but status should be unchanged (draft)
    data = res.get_json()
    assert data['referral']['status'] == 'draft' or data['referral']['status'] == 'sent'


def test_referrals_get_by_token(app, client, auth_headers, auth_headers_provider):
    """Public endpoint: can fetch referral by token without auth."""
    # auth_headers and auth_headers_provider ensure participant/provider exist in DB
    from models import Referral, Participant, Provider
    with app.app_context():
        participant = Participant.query.first()
        provider = Provider.query.first()
        assert participant is not None, "Need at least one participant in DB"
        assert provider is not None, "Need at least one provider in DB"
        token = 'test-token-abc123'
        r = Referral(
            participant_id=participant.id,
            provider_id=provider.id,
            referral_link_token=token,
            referral_reason='Token test',
            status='sent'
        )
        db.session.add(r)
        db.session.commit()
    res = client.get(f'{BASE_URL}/referrals/link/{token}')
    assert res.status_code == 200
    assert res.get_json()['referral']['referral_link_token'] == token


# -------------------------------------------------------------------
# 5. Updates
# -------------------------------------------------------------------

def test_updates_create(client, auth_headers):
    """Provider can create a structured update on a referral."""
    # Get a referral to attach the update to
    refs = client.get(f'{BASE_URL}/referrals', headers=auth_headers)
    referral_id = refs.get_json()['referrals'][0]['id'] if refs.get_json()['referrals'] else 1

    res = client.post(f'{BASE_URL}/updates', headers=auth_headers, json={
        'referral_id': referral_id,
        'category': 'progress_note',
        'summary': 'Participant made good progress this week',
        'observations': 'Attendee was engaged and met all goals',
        'recommendations': 'Continue current support plan',
        'time_spent_minutes': 60
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.get_json()}"
    data = res.get_json()
    assert data['update']['category'] == 'progress_note'
    assert data['update']['summary'] == 'Participant made good progress this week'
    assert data['update']['time_spent_minutes'] == 60


def test_updates_create_invalid_category(client, auth_headers):
    """Creating update with invalid category returns 400."""
    refs = client.get(f'{BASE_URL}/referrals', headers=auth_headers)
    referral_id = refs.get_json()['referrals'][0]['id'] if refs.get_json()['referrals'] else 1

    res = client.post(f'{BASE_URL}/updates', headers=auth_headers, json={
        'referral_id': referral_id,
        'category': 'not_a_valid_category',
        'summary': 'This should fail'
    })
    assert res.status_code == 400
    assert 'category' in res.get_json().get('error', '').lower()


def test_updates_create_missing_fields(client, auth_headers):
    """Creating update without referral_id or summary returns 400."""
    res = client.post(f'{BASE_URL}/updates', headers=auth_headers, json={
        'category': 'general'
    })
    assert res.status_code == 400


def test_updates_list(client, auth_headers):
    """Can list updates, optionally filtered by referral_id."""
    res = client.get(f'{BASE_URL}/updates', headers=auth_headers)
    assert res.status_code == 200
    assert 'updates' in res.get_json()


def test_updates_list_filtered_by_referral(client, auth_headers):
    """Can filter updates by referral_id."""
    refs = client.get(f'{BASE_URL}/referrals', headers=auth_headers)
    referral_id = refs.get_json()['referrals'][0]['id'] if refs.get_json()['referrals'] else 1
    res = client.get(f'{BASE_URL}/updates?referral_id={referral_id}', headers=auth_headers)
    assert res.status_code == 200
    assert 'updates' in res.get_json()


def test_updates_get_by_id(client, auth_headers):
    """Can fetch a single update by ID."""
    # Create one first
    refs = client.get(f'{BASE_URL}/referrals', headers=auth_headers)
    referral_id = refs.get_json()['referrals'][0]['id'] if refs.get_json()['referrals'] else 1
    create = client.post(f'{BASE_URL}/updates', headers=auth_headers, json={
        'referral_id': referral_id,
        'category': 'goal_update',
        'summary': 'Goal milestone reached',
        'observations': 'Participant achieved short-term goal',
        'recommendations': 'Move to next goal'
    })
    update_id = create.get_json()['update']['id']
    res = client.get(f'{BASE_URL}/updates/{update_id}', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['update']['id'] == update_id


def test_updates_unauthenticated(client):
    """Unauthenticated request to updates returns 401."""
    res = client.get(f'{BASE_URL}/updates')
    assert res.status_code == 401


# -------------------------------------------------------------------
# 6. Messages
# -------------------------------------------------------------------

def test_messages_list_threads(client, auth_headers):
    """Authenticated user can list their threads."""
    res = client.get(f'{BASE_URL}/messages/threads', headers=auth_headers)
    assert res.status_code == 200
    assert 'threads' in res.get_json()


def test_messages_create_thread(client, auth_headers):
    """Can create a new message thread with topic and participant."""
    # Get participant_id from auth_headers user
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']

    res = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Care plan review',
        'participant_id': participant_id,
        'content': 'Hi, I would like to discuss my care plan.'
    })
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.get_json()}"
    data = res.get_json()
    assert data['thread']['topic'] == 'Care plan review'
    assert data['thread']['participant_id'] == participant_id
    assert len(data['thread']['messages']) == 1  # initial message


def test_messages_create_thread_missing_fields(client, auth_headers):
    """Creating thread without topic or participant_id returns 400."""
    res = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Missing participant'
    })
    assert res.status_code == 400


def test_messages_get_thread(client, auth_headers):
    """Can fetch a thread with its messages."""
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']

    create = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Test thread',
        'participant_id': participant_id,
        'content': 'Hello'
    })
    thread_id = create.get_json()['thread']['id']

    res = client.get(f'{BASE_URL}/messages/threads/{thread_id}', headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data['thread']['id'] == thread_id
    assert 'messages' in data
    assert len(data['messages']) == 1


def test_messages_send_message(client, auth_headers):
    """Can send a message into an existing thread."""
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']

    create = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Chat thread',
        'participant_id': participant_id,
        'content': 'Initial message'
    })
    thread_id = create.get_json()['thread']['id']

    res = client.post(f'{BASE_URL}/messages/threads/{thread_id}', headers=auth_headers, json={
        'content': 'This is a follow-up message'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['message']['content'] == 'This is a follow-up message'
    assert data['message']['sender_id'] is not None


def test_messages_send_empty_content(client, auth_headers):
    """Sending message with empty content and no attachments returns 400."""
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']

    create = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Empty test',
        'participant_id': participant_id,
        'content': 'First'
    })
    thread_id = create.get_json()['thread']['id']

    res = client.post(f'{BASE_URL}/messages/threads/{thread_id}', headers=auth_headers, json={
        'content': ''
    })
    assert res.status_code == 400


def test_messages_create_with_attachment(client, auth_headers):
    """Can send a message with an inline base64 attachment."""
    import base64
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers)
    participant_id = me.get_json()['participant']['id']

    create = client.post(f'{BASE_URL}/messages/threads', headers=auth_headers, json={
        'topic': 'Attachment test',
        'participant_id': participant_id,
        'content': 'Sending a file'
    })
    thread_id = create.get_json()['thread']['id']

    # Create a small test image (1x1 transparent PNG)
    png_data = base64.b64encode(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82').decode()
    res = client.post(f'{BASE_URL}/messages/threads/{thread_id}', headers=auth_headers, json={
        'content': 'Check this out',
        'attachments': [{
            'filename': 'test.png',
            'mime_type': 'image/png',
            'data_base64': png_data
        }]
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['message']['content'] == 'Check this out'
    assert len(data['message']['attachments']) == 1
    att = data['message']['attachments'][0]
    assert att['filename'] == 'test.png'
    assert att['file_type'] == 'image/png'
    assert att['url'].startswith(f'/attachments/{thread_id}/')


def test_messages_unauthenticated(client):
    """Unauthenticated thread list returns 401."""
    res = client.get(f'{BASE_URL}/messages/threads')
    assert res.status_code == 401


# -------------------------------------------------------------------
# 7. Goals
# -------------------------------------------------------------------

def test_goals_list_empty(client, auth_headers):
    """Participant with no goals gets empty list."""
    res = client.get(f'{BASE_URL}/goals', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['goals'] == []


def test_goals_create(client, auth_headers):
    """Can create a goal with title and optional fields."""
    res = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={
        'title': 'Learn to use public transport independently',
        'description': 'Become confident using buses and trains',
        'category': 'transport',
        'target_date': '2026-12-31'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['goal']['title'] == 'Learn to use public transport independently'
    assert data['goal']['category'] == 'transport'
    assert data['goal']['status'] == 'active'
    assert data['goal']['progress'] == 0


def test_goals_create_minimal(client, auth_headers):
    """Can create a goal with only a title."""
    res = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'Simple goal'})
    assert res.status_code == 201
    assert res.get_json()['goal']['title'] == 'Simple goal'


def test_goals_create_missing_title(client, auth_headers):
    """Creating goal without title returns 400."""
    res = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'description': 'No title'})
    assert res.status_code == 400


def test_goals_list_after_create(client, auth_headers):
    """Goals appear in list after creation."""
    client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'Goal One'})
    client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'Goal Two'})
    res = client.get(f'{BASE_URL}/goals', headers=auth_headers)
    assert res.status_code == 200
    goals = res.get_json()['goals']
    assert len(goals) == 2
    titles = [g['title'] for g in goals]
    assert 'Goal One' in titles
    assert 'Goal Two' in titles


def test_goals_get_by_id(client, auth_headers):
    """Can fetch a single goal by ID."""
    create = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'My Goal'})
    goal_id = create.get_json()['goal']['id']
    res = client.get(f'{BASE_URL}/goals/{goal_id}', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['goal']['id'] == goal_id


def test_goals_update(client, auth_headers):
    """Can update goal title, description, status."""
    create = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'Original'})
    goal_id = create.get_json()['goal']['id']
    res = client.put(f'{BASE_URL}/goals/{goal_id}', headers=auth_headers, json={
        'title': 'Updated Title',
        'status': 'paused'
    })
    assert res.status_code == 200
    data = res.get_json()['goal']
    assert data['title'] == 'Updated Title'
    assert data['status'] == 'paused'


def test_goals_update_progress(client, auth_headers):
    """Can update goal progress via PATCH endpoint."""
    create = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'Progress Test'})
    goal_id = create.get_json()['goal']['id']
    res = client.patch(f'{BASE_URL}/goals/{goal_id}/progress', headers=auth_headers, json={'progress': 75})
    assert res.status_code == 200
    assert res.get_json()['goal']['progress'] == 75


def test_goals_update_progress_100_sets_completed(client, auth_headers):
    """Setting progress to 100 automatically sets status to completed."""
    create = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'Almost Done'})
    goal_id = create.get_json()['goal']['id']
    res = client.patch(f'{BASE_URL}/goals/{goal_id}/progress', headers=auth_headers, json={'progress': 100})
    assert res.status_code == 200
    assert res.get_json()['goal']['status'] == 'completed'


def test_goals_delete(client, auth_headers):
    """Can delete a goal."""
    create = client.post(f'{BASE_URL}/goals', headers=auth_headers, json={'title': 'To Delete'})
    goal_id = create.get_json()['goal']['id']
    res = client.delete(f'{BASE_URL}/goals/{goal_id}', headers=auth_headers)
    assert res.status_code == 200
    # Verify gone
    res2 = client.get(f'{BASE_URL}/goals/{goal_id}', headers=auth_headers)
    assert res2.status_code == 404


def test_goals_unauthenticated(client):
    """Unauthenticated goal access returns 401."""
    assert client.get(f'{BASE_URL}/goals').status_code == 401
    assert client.post(f'{BASE_URL}/goals', json={'title': 'X'}).status_code == 401


# -------------------------------------------------------------------
# 8. Care Plans
# -------------------------------------------------------------------

def test_care_plans_list_empty(client, auth_headers):
    """Participant with no care plans gets empty list."""
    res = client.get(f'{BASE_URL}/care-plans', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['care_plans'] == []


def test_care_plans_create(client, auth_headers):
    """Can create a care plan with title and optional fields."""
    res = client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={
        'title': 'April - June Support Plan',
        'description': 'Quarterly plan focused on daily living skills',
        'start_date': '2026-04-01',
        'end_date': '2026-06-30',
        'supports': [
            {'category': 'daily_living', 'description': 'Morning routine support', 'frequency': '5 days/week'},
            {'category': 'social', 'description': 'Community group access', 'frequency': 'weekly'},
        ]
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['care_plan']['title'] == 'April - June Support Plan'
    assert data['care_plan']['status'] == 'active'
    assert len(data['care_plan']['supports']) == 2


def test_care_plans_create_minimal(client, auth_headers):
    """Can create a care plan with only a title."""
    res = client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'Basic Plan'})
    assert res.status_code == 201
    assert res.get_json()['care_plan']['title'] == 'Basic Plan'


def test_care_plans_create_missing_title(client, auth_headers):
    """Creating care plan without title returns 400."""
    res = client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'description': 'No title'})
    assert res.status_code == 400


def test_care_plans_list(client, auth_headers):
    """Can list care plans."""
    client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'Plan A'})
    client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'Plan B'})
    res = client.get(f'{BASE_URL}/care-plans', headers=auth_headers)
    assert res.status_code == 200
    assert len(res.get_json()['care_plans']) == 2


def test_care_plans_list_filter_by_status(client, auth_headers):
    """Can filter care plans by status."""
    client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'Active Plan', 'status': 'active'})
    client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'Completed Plan', 'status': 'completed'})
    res = client.get(f'{BASE_URL}/care-plans?status=active', headers=auth_headers)
    plans = res.get_json()['care_plans']
    assert all(p['status'] == 'active' for p in plans)


def test_care_plans_get_by_id(client, auth_headers):
    """Can fetch a single care plan by ID."""
    create = client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'My Plan'})
    plan_id = create.get_json()['care_plan']['id']
    res = client.get(f'{BASE_URL}/care-plans/{plan_id}', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['care_plan']['id'] == plan_id


def test_care_plans_update(client, auth_headers):
    """Can update care plan fields."""
    create = client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'Original Plan'})
    plan_id = create.get_json()['care_plan']['id']
    res = client.put(f'{BASE_URL}/care-plans/{plan_id}', headers=auth_headers, json={
        'title': 'Updated Plan',
        'status': 'completed',
        'review_notes': 'Reviewed with support coordinator'
    })
    assert res.status_code == 200
    data = res.get_json()['care_plan']
    assert data['title'] == 'Updated Plan'
    assert data['status'] == 'completed'
    assert data['review_notes'] == 'Reviewed with support coordinator'


def test_care_plans_delete(client, auth_headers):
    """Can delete a care plan."""
    create = client.post(f'{BASE_URL}/care-plans', headers=auth_headers, json={'title': 'To Delete'})
    plan_id = create.get_json()['care_plan']['id']
    res = client.delete(f'{BASE_URL}/care-plans/{plan_id}', headers=auth_headers)
    assert res.status_code == 200
    res2 = client.get(f'{BASE_URL}/care-plans/{plan_id}', headers=auth_headers)
    assert res2.status_code == 404


def test_care_plans_unauthenticated(client):
    """Unauthenticated care plan access returns 401."""
    assert client.get(f'{BASE_URL}/care-plans').status_code == 401
    assert client.post(f'{BASE_URL}/care-plans', json={'title': 'X'}).status_code == 401

# -----------------------------------------------------------------
# Notifications
# -----------------------------------------------------------------

def test_notifications_list(client, auth_headers):
    res = client.get(f'{BASE_URL}/notifications', headers=auth_headers)
    assert res.status_code == 200
    assert 'notifications' in res.get_json()
    assert 'unread_count' in res.get_json()

def test_notifications_unread_count(client, auth_headers):
    res = client.get(f'{BASE_URL}/notifications/unread-count', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['unread_count'] == 0

def test_notifications_create(app, client, auth_headers):
    from models import Notification
    with app.app_context():
        n = Notification(user_id=auth_headers['_cv_app'].config.get('TEST_USER_ID', 1), type='referral_received', title='New referral', body='You have a new referral')
        db.session.add(n)
        db.session.commit()
    res = client.get(f'{BASE_URL}/notifications', headers=auth_headers)
    assert res.status_code == 200

def test_notifications_mark_read(client, auth_headers, app):
    from models import Notification
    with app.app_context():
        from models import User
        user = User.query.first()
        n = Notification(user_id=user.id, type='referral_received', title='Test', body='Test body')
        db.session.add(n)
        db.session.commit()
        notif_id = n.id
    res = client.patch(f'{BASE_URL}/notifications/{notif_id}/read', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['notification']['read'] == True

def test_notifications_mark_all_read(client, auth_headers, app):
    from models import Notification, User
    with app.app_context():
        user = User.query.first()
        for i in range(3):
            n = Notification(user_id=user.id, type='referral_received', title=f'Test {i}', body='body')
            db.session.add(n)
        db.session.commit()
    res = client.post(f'{BASE_URL}/notifications/read-all', headers=auth_headers)
    assert res.status_code == 200
    res2 = client.get(f'{BASE_URL}/notifications/unread-count', headers=auth_headers)
    assert res2.get_json()['unread_count'] == 0

def test_notifications_delete(client, auth_headers, app):
    from models import Notification, User
    with app.app_context():
        user = User.query.first()
        n = Notification(user_id=user.id, type='referral_received', title='To delete', body='body')
        db.session.add(n)
        db.session.commit()
        notif_id = n.id
    res = client.delete(f'{BASE_URL}/notifications/{notif_id}', headers=auth_headers)
    assert res.status_code == 200

def test_notifications_unauthenticated(client):
    assert client.get(f'{BASE_URL}/notifications').status_code == 401

# -----------------------------------------------------------------
# Documents
# -----------------------------------------------------------------

def test_documents_list_empty(client, auth_headers):
    res = client.get(f'{BASE_URL}/documents', headers=auth_headers)
    assert res.status_code == 200
    assert res.get_json()['documents'] == []

def test_documents_upload(client, auth_headers):
    import io
    data = {
        'file': (io.BytesIO(b'test file content'), 'test.pdf', 'application/pdf'),
        'title': 'Test Document',
        'category': 'report',
        'description': 'A test file'
    }
    res = client.post(f'{BASE_URL}/documents', headers=auth_headers, data=data, content_type='multipart/form-data')
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.get_json()}"
    doc = res.get_json()['document']
    assert doc['title'] == 'Test Document'
    assert doc['category'] == 'report'

def test_documents_upload_no_file(client, auth_headers):
    res = client.post(f'{BASE_URL}/documents', headers=auth_headers, json={'title': 'No file'})
    assert res.status_code == 400

def test_documents_upload_invalid_type(client, auth_headers):
    import io
    data = {
        'file': (io.BytesIO(b'executable'), 'evil.exe', 'application/octet-stream'),
        'title': 'Bad file'
    }
    res = client.post(f'{BASE_URL}/documents', headers=auth_headers, data=data, content_type='multipart/form-data')
    assert res.status_code == 400
    assert 'not allowed' in res.get_json().get('error', '').lower()

def test_documents_delete(client, auth_headers):
    import io
    data = {'file': (io.BytesIO(b'test'), 'test.pdf', 'application/pdf'), 'title': 'To delete'}
    res = client.post(f'{BASE_URL}/documents', headers=auth_headers, data=data, content_type='multipart/form-data')
    doc_id = res.get_json()['document']['id']
    res2 = client.delete(f'{BASE_URL}/documents/{doc_id}', headers=auth_headers)
    assert res2.status_code == 200

def test_documents_unauthenticated(client):
    assert client.get(f'{BASE_URL}/documents').status_code == 401

# -----------------------------------------------------------------
# Consents
# -----------------------------------------------------------------

def test_consents_list(client, auth_headers):
    res = client.get(f'{BASE_URL}/consents', headers=auth_headers)
    assert res.status_code == 200
    assert 'consents' in res.get_json()

def test_consents_grant(client, auth_headers, auth_headers_provider):
    me = client.get(f'{BASE_URL}/participants/me', headers=auth_headers_provider)
    provider_user_id = me.get_json().get('user', {}).get('provider', {}).get('user_id')
    if not provider_user_id:
        from models import Provider
        with auth_headers['_cv_app'].app_context():
            p = Provider.query.first()
            provider_user_id = p.user_id if p else 1
    res = client.post(f'{BASE_URL}/consents', headers=auth_headers, json={
        'granted_to_id': provider_user_id,
        'data_categories': ['care_plans', 'goals']
    })
    assert res.status_code == 201, f"got {res.status_code}: {res.get_json()}"
    data = res.get_json()
    assert data['consent']['data_categories'] == ['care_plans', 'goals']
    assert data['consent']['active'] == True

def test_consents_grant_invalid_category(client, auth_headers):
    res = client.post(f'{BASE_URL}/consents', headers=auth_headers, json={
        'granted_to_id': 1,
        'data_categories': ['invalid_category']
    })
    assert res.status_code == 400

def test_consents_revoke(client, auth_headers, auth_headers_provider, app):
    from models import Consent, Provider
    with app.app_context():
        p = Provider.query.first()
        from models import Participant
        part = Participant.query.first()
        if part and p:
            import json
            c = Consent(participant_id=part.id, granted_to_id=p.user_id, data_categories=json.dumps(['care_plans']))
            db.session.add(c)
            db.session.commit()
            consent_id = c.id
            res = client.delete(f'{BASE_URL}/consents/{consent_id}', headers=auth_headers)
            assert res.status_code == 200
            assert res.get_json()['consent']['active'] == False

def test_consents_unauthenticated(client):
    assert client.get(f'{BASE_URL}/consents').status_code == 401

# -----------------------------------------------------------------
# Password Reset
# -----------------------------------------------------------------

def test_forgot_password(client):
    res = client.post(f'{BASE_URL}/auth/forgot-password', json={'email': 'test@example.com'})
    assert res.status_code == 200

def test_forgot_password_missing_email(client):
    res = client.post(f'{BASE_URL}/auth/forgot-password', json={})
    assert res.status_code == 400

def test_reset_password_invalid_token(client):
    res = client.post(f'{BASE_URL}/auth/reset-password', json={'token': 'invalid', 'new_password': 'password123'})
    assert res.status_code == 400
    assert 'invalid' in res.get_json().get('error', '').lower()

def test_reset_password_success(client, auth_headers):
    import hashlib, secrets
    app = auth_headers['_cv_app']
    with app.app_context():
        from models import User
        user = User.query.filter_by(email='testuser@example.com').first()
        assert user is not None, "testuser@example.com not found in DB"
        token = secrets.token_urlsafe(32)
        user.reset_token = hashlib.sha256(token.encode()).hexdigest()
        from datetime import datetime, timedelta
        user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
    res = client.post(f'{BASE_URL}/auth/reset-password', json={'token': token, 'new_password': 'newpassword456'})
    assert res.status_code == 200
    login = client.post(f'{BASE_URL}/auth/login', json={'email': 'testuser@example.com', 'password': 'newpassword456'})
    assert login.status_code == 200

def test_reset_password_too_short(client):
    res = client.post(f'{BASE_URL}/auth/reset-password', json={'token': 'some-token', 'new_password': 'short'})
    assert res.status_code == 400
