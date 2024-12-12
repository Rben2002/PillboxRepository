from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

''' models.py Rami Benhamida Virginia Tech September 28, 2024
This file holds the functionality for managing tables and the CRUD
operations inside of the database for the entire application. 
Modified December 10, 2024 to clean up code
'''

# base class for the declarative model
Base = declarative_base()

# define the User class as the model for the 'users' table
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)

    def __repr__(self):
        return f"<User(name='{self.name}', age={self.age}, email={self.email}, password={self.password})>"

# define prescription class as model for 'prescriptions' table
class Prescription(Base):
    __tablename__ = 'prescriptions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    method = Column(String, nullable=False)
    manufacturer = Column(String)
    dosage = Column(String)



class UserDatabaseManager:
    def __init__(self, db_url='sqlite:///users.db'):
        # create an SQLite database engine
        self.engine = create_engine(db_url, echo=False)

        # create a session factory
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        # create the users table if it doesn't already exist
        Base.metadata.create_all(self.engine)

    # funct to insert a new user
    def insert_user(self, name, age, email, password):
        new_user = User(name=name, age=age, email=email, password=password)
        self.session.add(new_user)
        self.session.commit()
        print(f"Inserted: {new_user}")
        return True

    # function to delete a user by name
    def delete_user(self, name):
        user = self.session.query(User).filter_by(name=name).first()
        if user:
            self.session.delete(user)
            self.session.commit()
            print(f"Deleted: {user}")
        else:
            print(f"User with name '{name}' not found.")

    # return all users
    def query_all_users(self):
        return self.session.query(User).all()

    #  find a user by name
    def find_user_by_name(self, name):
        return self.session.query(User).filter_by(name=name).first()
    
    def find_user_by_email(self, email):
        return self.session.query(User).filter_by(email=email).first()
        
    

    # close the session when done
    def close(self):
        self.session.close()

class PrescriptionDatabaseManager:
    def __init__(self, db_url='sqlite:///prescriptions.db'):
        self.engine = create_engine(db_url, echo=False)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        Base.metadata.create_all(self.engine)

    def insert_prescription(self, owner, frequency, method, manufacturer, dosage):
        new_prescription = Prescription(owner=owner, frequency=frequency, method=method, manufacturer=manufacturer, dosage=dosage)
        self.session.add(new_prescription)
        self.session.commit()
        print(f"Inserted: {new_prescription}")
        return True
    
    def find_medication(self, medication_data):
        return self.session.query(Medication).filter_by(
            brand_name=medication_data['brand_name'],
            generic_name=medication_data['generic_name'],
            # add other fields as necessary
        ).first()

    def insert_medication(self, medication_data):
        allowed_fields = {
            'brand_name',
            'generic_name',
            'strength',
            'dosage_form',
            'route',
            'manufacturer_name',
            'marketing_status',
            'image_url'
        }
        filtered_data = {key: medication_data[key] for key in allowed_fields if key in medication_data}
        new_medication = Medication(**filtered_data)
        self.session.add(new_medication)
        self.session.commit()
        return new_medication


    def add_to_pillbox(self, user_id, medication_id):
        new_entry = UserPillbox(user_id=user_id, medication_id=medication_id)
        self.session.add(new_entry)
        self.session.commit()
        return new_entry


    def get_user_pillbox(self, user_id):
        entries = self.session.query(UserPillbox).filter_by(user_id=user_id).all()
        medications = []
        for entry in entries:
            medication = self.session.query(Medication).filter_by(id=entry.medication_id).first()
            medications.append({
                'id': medication.id,
                'brand_name': medication.brand_name,
                'generic_name': medication.generic_name,
                'strength': medication.strength,
                'dosage_form': medication.dosage_form,
                'route': medication.route,
                'manufacturer_name': medication.manufacturer_name,
                'marketing_status': medication.marketing_status,
                'image_url': medication.image_url,  # Include image_url
            })
        return medications
    

    def user_owns_medication(self, user_id, medication_id):
        pillbox_entry = self.session.query(UserPillbox).filter_by(user_id=user_id, medication_id=medication_id).first()
        return pillbox_entry is not None

    def update_medication(self, medication_id, updated_data):
        medication = self.session.query(Medication).filter_by(id=medication_id).first()
        if not medication:
            return None

        # update medication fields
        for key, value in updated_data.items():
            if hasattr(medication, key):
                setattr(medication, key, value)

        self.session.commit()
        return medication
    
    def remove_from_pillbox(self, user_id, medication_id):
        entry = self.session.query(UserPillbox).filter_by(user_id=user_id, medication_id=medication_id).first()
        if entry:
            self.session.delete(entry)
            self.session.commit()
            return True
        else:
            return False
        
    def add_medication_schedule(self, user_id, medication_id, days_of_week, dosage, times):
        # check if the user owns the medication
        if not self.user_owns_medication(user_id, medication_id):
            raise ValueError("User does not own the medication")

        # convert lists to comma separated strings if needed
        days_str = ','.join(days_of_week) if isinstance(days_of_week, list) else days_of_week
        times_str = ','.join(times) if isinstance(times, list) else times

        new_schedule = MedicationSchedule(
            user_id=user_id,
            medication_id=medication_id,
            days_of_week=days_str,
            dosage=dosage,
            times=times_str
        )
        self.session.add(new_schedule)
        self.session.commit()
        return new_schedule

    def get_medication_schedules(self, user_id):
        schedules = self.session.query(MedicationSchedule).filter_by(user_id=user_id).all()
        schedule_list = []
        for schedule in schedules:
            medication = self.session.query(Medication).filter_by(id=schedule.medication_id).first()
            schedule_list.append({
                'id': schedule.id,
                'medication_id': schedule.medication_id,
                'medication_name': medication.brand_name or medication.generic_name,
                'days_of_week': schedule.days_of_week,
                'dosage': schedule.dosage,
                'times': schedule.times,
            })
        return schedule_list

    def delete_medication_schedule(self, schedule_id):
        schedule = self.session.query(MedicationSchedule).filter_by(id=schedule_id).first()
        if schedule:
            self.session.delete(schedule)
            self.session.commit()
            return True
        return False


    


class Medication(Base):
    __tablename__ = 'medications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    brand_name = Column(String)
    generic_name = Column(String)
    strength = Column(String)
    dosage_form = Column(String)
    route = Column(String)
    manufacturer_name = Column(String)
    marketing_status = Column(String)
    image_url = Column(String)  


    def __repr__(self):
        return f"<Medication(brand_name='{self.brand_name}', generic_name='{self.generic_name}')>"

class UserPillbox(Base):
    __tablename__ = 'user_pillboxes'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    medication_id = Column(Integer, nullable=False)

    def __repr__(self):
        return f"<UserPillbox(user_id={self.user_id}, medication_id={self.medication_id})>"
    
class MedicationSchedule(Base):
    __tablename__ = 'medication_schedules'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    medication_id = Column(Integer, nullable=False)
    days_of_week = Column(String, nullable=False)  # e.g., 'Monday,Wednesday,Friday'
    dosage = Column(String, nullable=False)
    times = Column(String, nullable=False)  # e.g., '08:00 AM,12:00 PM,06:00 PM'

    def __repr__(self):
        return f"<MedicationSchedule(user_id={self.user_id}, medication_id={self.medication_id}, days_of_week='{self.days_of_week}', times='{self.times}', dosage='{self.dosage}')>"



