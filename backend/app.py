# source venv/bin/activate
from dotenv import load_dotenv
import os
load_dotenv()
import boto3
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL 
from flask_cors import CORS
import random
import time
import hashlib
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'  # returns results as dictionaries

mysql = MySQL(app)

S3_BUCKET = os.getenv('S3_BUCKET')

comprehend = boto3.client('comprehend', region_name='us-east-1')

def get_similar_tickets(ticket_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT description FROM tickets WHERE id = %s", (ticket_id,))
    current_desc = cursor.fetchone()['description']
    cursor.execute("SELECT id, description, resolution_steps FROM tickets WHERE status = 'closed'")
    closed_tickets = cursor.fetchall()
    cursor.close()
    # Prepare texts
    texts = [t['description'] for t in closed_tickets]
    texts.insert(0, current_desc)
    # Compute similarity
    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform(texts)
    sim = cosine_similarity(tfidf[0:1], tfidf[1:])
    # Get top similar tickets
    top_indices = np.argsort(sim[0])[-3:][::-1]  # Top 3
    return [
        {
            'id': closed_tickets[i]['id'],
            'description': closed_tickets[i]['description'],
            'resolution_steps': closed_tickets[i]['resolution_steps']
        }
        for i in top_indices
    ]

@app.route('/tickets/<int:ticket_id>/similar', methods=['GET'])
def similar_tickets(ticket_id):
    similar = get_similar_tickets(ticket_id)
    return jsonify({"similar_tickets": similar})
    
def is_admin(user_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT role FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    cursor.close()
    return result and result['role'] == 'admin'

@app.route('/admin/tickets', methods=['GET'])
def admin_list_tickets():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM tickets")
    tickets = cursor.fetchall()
    cursor.close()
    return jsonify({'tickets': tickets}), 200

@app.route('/admin/tickets/<int:ticket_id>/assign', methods=['PUT'])
def assign_ticket(ticket_id):
    data = request.json
    assigned_to = data.get('assigned_to')
    status = data.get('status', 'in-progress')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "UPDATE tickets SET assigned_to=%s, status=%s, updated_at=NOW() WHERE id=%s",
            (assigned_to, status, ticket_id)
        )
        mysql.connection.commit()
        cursor.execute("SELECT * FROM tickets WHERE id=%s", (ticket_id,))
        ticket = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        ticket_dict = dict(zip(columns, ticket))
        cursor.close()
        return jsonify({"message": "Ticket assigned", "ticket": ticket_dict}), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": "Error assigning ticket", "error": str(e)}), 500
    
@app.route('/admin/tickets/<int:ticket_id>/status', methods=['PUT'])
def update_ticket_status(ticket_id):
    data = request.json
    status = data.get('status')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "UPDATE tickets SET status=%s, updated_at=NOW() WHERE id=%s",
            (status, ticket_id)
        )
        mysql.connection.commit()
        cursor.execute("SELECT * FROM tickets WHERE id=%s", (ticket_id,))
        ticket = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        ticket_dict = dict(zip(columns, ticket))
        cursor.close()
        return jsonify({"message": "Status updated", "ticket": ticket_dict}), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": "Error updating status", "error": str(e)}), 500

@app.route('/tickets', methods=['POST'])
def create_ticket():
    # Get form data (not JSON)
    title = request.form.get('title')
    subject = request.form.get('subject')
    category = request.form.get('category')
    description = request.form.get('description')
    created_by = request.form.get('created_by')  # User ID from session/token

    # Define keyword lists for each priority
    CRITICAL_KEYWORDS = [
        'urgent', 'emergency', 'critical', 'immediately', 'asap',
        'high priority', 'immediate attention', 'help', 'now',
        'urgently', 'critical issue', 'urgent help', 'urgent support',
        'serious', 'severe', 'fatal', 'blocker', 'outage', 'down',
        'not working', 'broken', 'failed', 'disaster', 'panic',
        'immediate fix', 'stop everything', 'drop everything',
        'top priority', 'must fix', 'urgent fix', 'urgent request'
    ]
    HIGH_KEYWORDS = [
        'important', 'need help', 'assistance', 'resolve', 'issue',
        'problem', 'stuck', 'can’t proceed', 'can’t continue', 'unable',
        'not responding', 'slow', 'error', 'bug', 'defect', 'fault',
        'malfunction', 'trouble', 'difficulty', 'concern', 'worry'
    ]
    LOW_KEYWORDS = [
        'suggestion', 'idea', 'improvement', 'enhancement', 'feature',
        'nice to have', 'when you can', 'not urgent', 'low priority',
        'minor', 'small', 'trivial', 'cosmetic', 'optional', 'later',
        'future', 'no rush', 'not important', 'not critical'
    ]

    # Default to medium
    priority = 'medium'

    if description:
        description_lower = description.lower()
        # Check for critical keywords first
        if any(keyword.lower() in description_lower for keyword in CRITICAL_KEYWORDS):
            priority = 'critical'
        # Then check for high keywords
        elif any(keyword.lower() in description_lower for keyword in HIGH_KEYWORDS):
            priority = 'high'
        # Then check for low keywords
        elif any(keyword.lower() in description_lower for keyword in LOW_KEYWORDS):
            priority = 'low'
        # If no keywords, use sentiment analysis
        else:
            try:
                sentiment = comprehend.detect_sentiment(Text=description, LanguageCode='en')
                print("Sentiment result:", sentiment)
                if sentiment['Sentiment'] == 'NEGATIVE':
                    priority = 'high'
                elif sentiment['Sentiment'] == 'POSITIVE':
                    priority = 'low'
                # Else, keep as medium
            except Exception as e:
                print(f"Error analyzing sentiment: {e}")

    # Create ticket in database
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO tickets (title, subject, category, description, created_by, priority) VALUES (%s, %s, %s, %s, %s, %s)",
            (title, subject, category, description, created_by, priority)
        )
        mysql.connection.commit()
        ticket_id = cursor.lastrowid
        cursor.close()

        # Handle file uploads
        files = request.files.getlist('files')
        for file in files:
            if file.filename:
                file_key = f"attachments/{secure_filename(file.filename)}"
                try:
                    s3.upload_fileobj(file, S3_BUCKET, file_key)
                    add_attachment(ticket_id, file_key, file.filename)
                except Exception as e:
                    print(f"Error uploading file: {e}")

        return jsonify({
            'message': 'Ticket created',
            'ticket_id': ticket_id,
            'priority': priority
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error creating ticket', 'error': str(e)}), 500
    
@app.route('/tickets/<int:ticket_id>/close', methods=['PUT'])
def close_ticket(ticket_id):
    data = request.get_json()
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "UPDATE tickets SET status = 'closed', closed_by = %s WHERE id = %s",
            (data.get('closed_by'), ticket_id)
        )
        mysql.connection.commit()
        cursor.execute(
            "SELECT id, status, feedback_given FROM tickets WHERE id = %s",
            (ticket_id,)
        )
        ticket = cursor.fetchone()
        cursor.close()
        return jsonify({
            "message": "Ticket closed",
            "ticket": ticket
        })
    except Exception as e:
        print("Error in close_ticket:", str(e)) 
        return jsonify({"message": "Error closing ticket", "error": str(e)}), 500

@app.route('/tickets/<int:ticket_id>/feedback', methods=['POST'])
def submit_feedback(ticket_id):
    data = request.get_json()
    feedback = data.get('feedback')
    
    if not feedback:
        return jsonify({"message": "Feedback is required", "success": False}), 400

    cursor = mysql.connection.cursor()
    try:
        # Only update feedback for closed tickets
        cursor.execute(
            "UPDATE tickets SET feedback = %s, feedback_given = TRUE WHERE id = %s AND status = 'closed'",
            (feedback, ticket_id)
        )
        
        if cursor.rowcount == 0:
            cursor.close()
            return jsonify({
                "message": "Ticket not found or not closed",
                "success": False
            }), 404
        
        mysql.connection.commit()
        
        # Return updated ticket data
        cursor.execute(
            "SELECT id, status, feedback, feedback_given FROM tickets WHERE id = %s",
            (ticket_id,)
        )
        ticket = cursor.fetchone()
        cursor.close()
        
        return jsonify({
            "message": "Feedback submitted successfully",
            "ticket": ticket,
            "success": True
        })
    except Exception as e:
        return jsonify({
            "message": "Error submitting feedback",
            "error": str(e),
            "success": False
        }), 500
    
@app.route('/admin/tickets/<int:ticket_id>/feedback', methods=['POST'])
def admin_feedback(ticket_id):
    data = request.json
    feedback = data.get('feedback')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "UPDATE tickets SET admin_feedback=%s WHERE id=%s",
            (feedback, ticket_id)
        )
        mysql.connection.commit()
        cursor.close()
        return jsonify({"message": "Feedback submitted"}), 200
    except Exception as e:
        cursor.close()
        return jsonify({"message": "Error submitting feedback", "error": str(e)}), 500

@app.route('/tickets', methods=['GET'])
def list_tickets():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "Missing user_id"}), 400
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
        "SELECT id, title, description, category, status, priority, created_at, updated_at, assigned_to, feedback_given FROM tickets WHERE created_by = %s",
        (user_id,)
        )
        tickets = cursor.fetchall()
        cursor.close()
        return jsonify({"tickets": tickets})
    except Exception as e:
        print("Error in /tickets:", e) 
        return jsonify({"message": "Error listing tickets", "error": str(e)}), 500
    
@app.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "SELECT * FROM tickets WHERE id = %s",
            (ticket_id,)
        )
        ticket = cursor.fetchone()
        cursor.close()
        if ticket:
            return jsonify({"ticket": ticket}), 200
        else:
            return jsonify({"message": "Ticket not found"}), 404
    except Exception as e:
        return jsonify({"message": "Error fetching ticket", "error": str(e)}), 500

@app.route('/tickets/<int:ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    data = request.get_json()
    status = data.get('status')
    assigned_to = data.get('assigned_to')
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "UPDATE tickets SET status = %s, assigned_to = %s WHERE id = %s",
            (status, assigned_to, ticket_id)
        )
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Ticket updated'}), 200
    except Exception as e:
        return jsonify({'message': 'Error updating ticket', 'error': str(e)}), 500
    
def add_attachment(ticket_id, s3_key, original_filename):
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO attachments (ticket_id, s3_key, original_filename) VALUES (%s, %s, %s)",
            (ticket_id, s3_key, original_filename)
        )
        mysql.connection.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"Error adding attachment: {e}")
        return False

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    # Generate a unique key for the file
    file_key = f"attachments/{file.filename}"
    try:
        s3.upload_fileobj(file, S3_BUCKET, file_key)
        return jsonify({'message': 'File uploaded successfully', 's3_key': file_key}), 200
    except Exception as e:
        return jsonify({'message': 'Error uploading file', 'error': str(e)}), 500

def send_otp_email_ses(email, otp):
    ses = boto3.client(
        'ses',
        region_name=os.getenv('AWS_REGION'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    try:
        response = ses.send_email(
            Source='nkusumas@amazon.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Your OTP Code'},
                'Body': {
                    'Text': {'Data': f'Your OTP code is: {otp}'}
                }
            }
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(name, username, email, password, role='user'):
    password_hash = hash_password(password)
    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, username, email, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
            (name, username, email, password_hash, role)
        )
        mysql.connection.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False

def user_exists(email=None, username=None):
    cursor = mysql.connection.cursor()
    if email:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    elif username:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    else:
        return False
    result = cursor.fetchone()
    cursor.close()
    return result is not None

def store_otp(email, otp):
    cursor = mysql.connection.cursor()
    expiry = time.time() + 300  # 5 minutes from now
    cursor.execute(
        "INSERT INTO otp_store (email, otp_code, expiry) VALUES (%s, %s, FROM_UNIXTIME(%s))",
        (email, otp, expiry)
    )
    mysql.connection.commit()
    cursor.close()

def verify_otp_db(email, otp):
    cursor = mysql.connection.cursor()
    cursor.execute(
        "SELECT COUNT(*) as count FROM otp_store WHERE email = %s AND otp_code = %s AND expiry > NOW()",
        (email, otp)
    )
    result = cursor.fetchone()
    cursor.close()
    return result['count'] > 0

def delete_otps_for_user(email):
    cursor = mysql.connection.cursor()
    cursor.execute(
        "DELETE FROM otp_store WHERE email = %s",
        (email,)
    )
    mysql.connection.commit()
    cursor.close()

@app.route('/admin/signup', methods=['POST'])
def admin_signup():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if user_exists(email=email) or user_exists(username=username):
        return jsonify({'message': 'User already exists'}), 400

    otp = str(random.randint(100000, 999999))

    try:
        store_otp(email, otp)
        if not send_otp_email_ses(email, otp):
            return jsonify({'message': 'Failed to send OTP email'}), 500
        return jsonify({'message': 'OTP sent to email', 'otp': otp}), 200  
    except Exception as e:
        return jsonify({'message': 'Error storing OTP', 'error': str(e)}), 500
    
@app.route('/admin/verify-otp', methods=['POST'])
def admin_verify_otp():
    data = request.get_json()
    email = data['email']
    otp = data['otp']
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')

    if not password:
        return jsonify({'message': 'Password is required'}), 400

    if verify_otp_db(email, otp):
        if create_user(name, username, email, password, role='admin'):
            delete_otps_for_user(email)
            cursor = mysql.connection.cursor()
            cursor.execute("SELECT id, role, name, username FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            cursor.close()
            return jsonify({
                'user_id': user['id'],
                'role': user['role'],
                'name': user['name'],
                'username': user['username']
            }), 200
        else:
            return jsonify({'message': 'Error creating admin user'}), 500
    return jsonify({'message': 'Invalid OTP'}), 400

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if user_exists(email=email) or user_exists(username=username):
        return jsonify({'message': 'User already exists'}), 400

    otp = str(random.randint(100000, 999999))

    try:
        store_otp(email, otp)
        if not send_otp_email_ses(email, otp):
            return jsonify({'message': 'Failed to send OTP email'}), 500
        return jsonify({'message': 'OTP sent to email', 'otp': otp}), 200  # Remove 'otp' in production!
    except Exception as e:
        return jsonify({'message': 'Error storing OTP', 'error': str(e)}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data['email']
    otp = data['otp']
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')

    if not password:
        return jsonify({'message': 'Password is required'}), 400

    if verify_otp_db(email, otp):
        if create_user(name, username, email, password):
            delete_otps_for_user(email)
            cursor = mysql.connection.cursor()
            cursor.execute("SELECT id, role, name, username FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            cursor.close()
            return jsonify({
                'user_id': user['id'],
                'role': user['role'],
                'name': user['name'],
                'username': user['username']
            }), 200
        else:
            return jsonify({'message': 'Error creating user'}), 500
    return jsonify({'message': 'Invalid OTP'}), 400

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT password_hash, role FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user['role'] != 'admin':
        return jsonify({'message': 'Not an admin account'}), 403

    if hash_password(password) == user['password_hash']:
        otp = str(random.randint(100000, 999999))
        store_otp(email, otp)
        send_otp_email_ses(email, otp)
        return jsonify({'message': 'OTP sent to email'}), 200
    else:
        return jsonify({'message': 'Incorrect password'}), 401
    
@app.route('/admin/verify-otp-login', methods=['POST'])
def admin_verify_otp_login():
    data = request.get_json()
    email = data['email']
    otp = data['otp']
    if verify_otp_db(email, otp):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id, role, name, username FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        delete_otps_for_user(email)
        return jsonify({
            'user_id': user['id'],
            'role': user['role'],
            'name': user['name'],
            'username': user['username']
        }), 200
    return jsonify({'message': 'Invalid OTP'}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if hash_password(password) == user['password_hash']:
        otp = str(random.randint(100000, 999999))
        try:
            store_otp(email, otp)
            if not send_otp_email_ses(email, otp):
                return jsonify({'message': 'Error sending OTP email'}), 500
            return jsonify({'message': 'OTP sent to email', 'otp': otp}), 200  # Remove 'otp' in production!
        except Exception as e:
            return jsonify({'message': 'Error storing OTP', 'error': str(e)}), 500
    else:
        return jsonify({'message': 'Invalid password'}), 401
    
@app.route('/verify-otp-login', methods=['POST'])
def verify_otp_login():
    data = request.get_json()
    email = data['email']
    otp = data['otp']
    if verify_otp_db(email, otp):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id, role, name, username FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        delete_otps_for_user(email)
        return jsonify({
            'user_id': user['id'],
            'role': user['role'],
            'name': user['name'],
            'username': user['username']
        }), 200
    return jsonify({'message': 'Invalid OTP'}), 400
    
@app.route('/analytics/tickets', methods=['GET'])
def ticket_analytics():
    cursor = mysql.connection.cursor()
    try:
        # Example: Average resolution time
        cursor.execute("""
            SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
            FROM tickets
            WHERE resolved_at IS NOT NULL
        """)
        avg_resolution = cursor.fetchone()

        # Example: Ticket count by category
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM tickets
            GROUP BY category
        """)
        category_counts = cursor.fetchall()

        cursor.close()
        return jsonify({
            'avg_resolution_hours': avg_resolution['avg_resolution_hours'],
            'category_counts': category_counts
        })
    except Exception as e:
        return jsonify({'message': 'Error fetching analytics', 'error': str(e)}), 500
    
@app.route('/analytics/frequent-issues', methods=['GET'])
def frequent_issues():
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT title as issue, COUNT(*) as count
        FROM tickets
        GROUP BY title
        ORDER BY count DESC
        LIMIT 5
    """)
    issues = cursor.fetchall()
    cursor.close()
    return jsonify({"issues": issues})
    
@app.route('/users/<int:user_id>/tickets')
def get_user_tickets(user_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM tickets WHERE created_by = %s", (user_id,))
    tickets = cursor.fetchall()
    cursor.close()
    return jsonify({"tickets": tickets})

@app.route('/users/<int:user_id>/profile', methods=['PUT'])
def update_profile(user_id):
    data = request.get_json()
    name = data.get("name")
    username = data.get("username")
    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    cursor = mysql.connection.cursor()
    try:
        if new_password:
            cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user or not check_password_hash(user[0], current_password):
                return jsonify({"message": "Current password is incorrect"}), 400
            cursor.execute(
                "UPDATE users SET name=%s, username=%s, email=%s, password_hash=%s WHERE id=%s",
                (name, username, email, generate_password_hash(new_password), user_id)
            )
        else:
            cursor.execute(
                "UPDATE users SET name=%s, username=%s, email=%s WHERE id=%s",
                (name, username, email, user_id)
            )
        mysql.connection.commit()

        # Fetch the updated user
        cursor.execute("SELECT id, name, username, email, role FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        if user_data:
            columns = [col[0] for col in cursor.description]
            updated_user = user_data
        else:
            updated_user = None

        return jsonify({
            "message": "Profile updated successfully!",
            "user": updated_user
        })
    except Exception as e:
        return jsonify({"message": "Error updating profile", "error": str(e)}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
