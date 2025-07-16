import firebase_admin
from firebase_admin import firestore, credentials

creds = credentials.Certificate('creds/firebase_key.json')
firebase_admin.initialize_app(creds)

db = firestore.client()

collections = db.collections()
for collection in collections:
    print(f'Collection: {collection.id}')
