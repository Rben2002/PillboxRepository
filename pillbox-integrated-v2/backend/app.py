''' app.py Brayden Gardner, Ryan Kluttz, Rami Benhamida, Adam Bowman, Ajani Nembhard Virginia Tech October 1, 2024
This file serves as the flask web service backend, providing 
APIs to manage user's medication schedules and retrieve drug information.
* Modified November 27, 2024 to add delete functionality
'''

import requests 
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import UserDatabaseManager, PrescriptionDatabaseManager

load_dotenv()
app = Flask(__name__)

# This lets the frontend , which is on a different domain, to make reqeusts to the flask backend domain
CORS(app)  # enable CORS for all routes

# api keys and constants
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
CUSTOM_SEARCH_ENGINE_ID = os.getenv('CUSTOM_SEARCH_ENGINE_ID')


# Ryan: I did anything related to schedule
@app.route('/add_medication_schedule', methods=['POST'])
def add_medication_schedule():
    data = request.json
    user_id = data.get('user_id')
    medication_id = data.get('medication_id')
    days_of_week = data.get('days_of_week')  # has to be a list or comma separated string
    dosage = data.get('dosage')
    times = data.get('times')  # also has to be a list or comma separated string

    if not all([user_id, medication_id, days_of_week, dosage, times]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        # add the medication schedule
        schedule = prescription_db.add_medication_schedule(user_id, medication_id, days_of_week, dosage, times)
        return jsonify({"message": "Medication schedule added successfully", "schedule_id": schedule.id}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 403
    except Exception as e:
        print(f"Error adding medication schedule: {e}")
        return jsonify({"error": "An error occurred while adding medication schedule"}), 500

@app.route('/get_medication_schedules', methods=['GET'])
def get_medication_schedules():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    schedules = prescription_db.get_medication_schedules(user_id)
    return jsonify({"schedules": schedules}), 200

@app.route('/delete_medication_schedule', methods=['POST'])
def delete_medication_schedule():
    data = request.json
    schedule_id = data.get('schedule_id')

    if not schedule_id:
        return jsonify({"error": "Schedule ID is required"}), 400

    try:
        deleted = prescription_db.delete_medication_schedule(schedule_id)
        if deleted:
            return jsonify({"message": "Medication schedule deleted successfully"}), 200
        else:
            return jsonify({"error": "Medication schedule not found"}), 404
    except Exception as e:
        print(f"Error deleting medication schedule: {e}")
        return jsonify({"error": "An error occurred while deleting medication schedule"}), 500



# Brayden: I implemented this function
@app.route('/get_drug_info', methods=['POST'])
def get_drug_info():
    data = request.json
    substance_name = data.get('substance_name')

    # check if substance_name is provided
    if not substance_name:
        return jsonify({"error": "No substance name provided"}), 400

    # FDA API call to get drug information
    fda_url = "https://api.fda.gov/drug/drugsfda.json"
    fda_params = {
        "search": f'products.active_ingredients.name:"{substance_name}"',
        "limit": 1
    }

    try:
        fda_response = requests.get(url=fda_url, params=fda_params)
        fda_response.raise_for_status()  # raise exception for HTTP errors
    except requests.exceptions.RequestException as e:
        print(f"FDA API request failed: {e}")
        return jsonify({"error": "FDA API request failed"}), 500

    fda_data = fda_response.json()
    if 'results' not in fda_data or not fda_data['results']:
        return jsonify({"error": "No results found"}), 404

    result = fda_data['results'][0]
    application_number = result.get('application_number', '')
    sponsor_name = result.get('sponsor_name', '')

    products = result.get('products', [])
    output = []
    for product in products:
        active_ingredients = product.get('active_ingredients', [])
        dosage_form = product.get('dosage_form', '')
        brand_name = product.get('brand_name', '')
        marketing_status = product.get('marketing_status', '')
        product_number = product.get('product_number', '')
        route = product.get('route', '')
        for ingredient in active_ingredients:
            name = ingredient.get('name', '')
            strength = ingredient.get('strength', '')
            output.append({
                'application_number': application_number,
                'brand_name': brand_name,
                'generic_name': name,
                'strength': strength,
                'dosage_form': dosage_form,
                'route': route,
                'marketing_status': marketing_status,
                'manufacturer_name': sponsor_name,
                'product_number': product_number
            })

    # get image URL from Google Custom Search API
    image_url = get_drug_image(substance_name)

    return jsonify({"output": output, "image_url": image_url})

#Ajani: I implemented this
def get_drug_image(drug_name):
    api_url = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'q': f'{drug_name} pill',
        'cx': CUSTOM_SEARCH_ENGINE_ID,
        'searchType': 'image',
        'num': 1,
        'key': GOOGLE_API_KEY,
        'safe': 'active',
        'imgSize': 'medium',
        'fileType': 'jpg,png',
        'rights': 'cc_publicdomain'
    }
    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status() 
        data = response.json()
        if 'items' in data:
            return data['items'][0]['link']
    except Exception as e:
        print(f"Error fetching image from Google Custom Search API: {e}")
    return None

# database additions
user_db = UserDatabaseManager()
prescription_db = PrescriptionDatabaseManager()


# Brayden : I implemented this
# endpoint for user registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data['name']
    age = data['age']
    email = data['email']
    password = data['password']

    # check is user already exits
    user = user_db.find_user_by_email(email)
    if user and user.password == password:
        return jsonify({"message": "Account aready exits"}), 202
    # insert user into the database
    user_db.insert_user(name, age, email, password)
    return jsonify({"message": "User registered successfully"}), 201


#Brayden: I implemented this
@app.route('/login', methods=['POST'])
def login():
    data = request.json 
    email = data['email']
    password = data['password']

    user = user_db.find_user_by_email(email)

    # check if the user exists and that the password matches
    if user and user.password == password:
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


#Brayden: I implemented this
@app.route('/users', methods=['GET'])
def get_users():
    users = user_db.query_all_users()  
    users_list = [{"id": user.id, "name": user.name, "age": user.age, "email": user.email} for user in users]
    return jsonify(users_list), 200



# prescription endpoint
#Rami: I implemented this
@app.route('/prescriptions', methods=['POST'])
def add_prescription():
    data = request.json
    owner = data['owner']
    frequency = data['frequency']
    method = data['method']
    manufacturer = data['manufacturer']
    dosage = data['dosage']

    prescription_db.insert_prescription(owner, frequency, method, manufacturer, dosage)
    return jsonify({"message": "Prescription added successfully"}), 201


# add medication to pillbox endpoint
#Rami: I implemented this
@app.route('/add_to_pillbox', methods=['POST'])
def add_to_pillbox():
    data = request.json
    user_id = data.get('user_id')
    medication_data = data.get('medication')

    if not user_id or not medication_data:
        return jsonify({"error": "User ID and medication data are required"}), 400

    # check if it alr exists in db
    medication = prescription_db.find_medication(medication_data)
    if not medication:
        # insert medication into the database
        medication = prescription_db.insert_medication(medication_data)

    # add to the user's pillbox
    pillbox_entry = prescription_db.add_to_pillbox(user_id, medication.id)

    return jsonify({"message": "Medication added to pillbox"}), 201


@app.route('/create_medication', methods=['POST'])
#Rami: I implemented this
def create_medication():
    data = request.json
    user_id = data.get('user_id')
    medication_data = data.get('medication')

    if not user_id or not medication_data:
        return jsonify({"error": "User ID and medication data are required"}), 400
    # insert medication into the database
    medication = prescription_db.insert_medication(medication_data)
    prescription_db.add_to_pillbox(user_id, medication.id)

    return jsonify({"message": "Medication created and added to pillbox"}), 201



# update medication endpoint
@app.route('/update_medication', methods=['POST'])
#Rami: I implemented this
def update_medication():
    data = request.json
    user_id = data.get('user_id')
    medication_id = data.get('medication_id')
    updated_medication_data = data.get('medication')

    print(data)
    print(medication_id)

    if not user_id or not medication_id or not updated_medication_data:
        return jsonify({"error": "User ID, medication ID, and updated data are required"}), 400

    try:
        # verify that the user owns the medication
        owns_medication = prescription_db.user_owns_medication(user_id, medication_id)
        if not owns_medication:
            return jsonify({"error": "Unauthorized"}), 403

        # update the medication's row in the prescriptions table 
        updated_medication = prescription_db.update_medication(medication_id, updated_medication_data)
        if not updated_medication:
            return jsonify({"error": "Medication not found"}), 404

        return jsonify({"message": "Medication updated successfully"}), 200
    except Exception as e:
        print(f"Error updating medication: {e}")
        return jsonify({"error": "An error occurred while updating medication"}), 500


# deleting medication from pillbox endpoint
#Rami: I implemented this
@app.route('/delete_medication', methods=['POST'])
def delete_medication():
    data = request.json
    user_id = data.get('user_id')
    medication_id = data.get('medication_id')

    if not user_id or not medication_id:
        return jsonify({"error": "User ID and medication ID are required"}), 400

    try:
        # make sure user owns it
        owns_medication = prescription_db.user_owns_medication(user_id, medication_id)
        if not owns_medication:
            return jsonify({"error": "Unauthorized"}), 403

        # delete medication from user's pillbox
        prescription_db.remove_from_pillbox(user_id, medication_id)

        return jsonify({"message": "Medication deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting medication: {e}")
        return jsonify({"error": "An error occurred while deleting medication"}), 500

# retrieve a users pillbox endpoint
#Brayden: I implemented this
@app.route('/get_pillbox', methods=['GET'])
def get_pillbox():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    medications = prescription_db.get_user_pillbox(user_id)
    print(f"Medications: {medications}")
    return jsonify({"medications": medications}), 200

if __name__ == "__main__":
    app.run(debug=True)


