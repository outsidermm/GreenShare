from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from os import environ

app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL')
print("DATABASE_URL:", app.config['SQLALCHEMY_DATABASE_URI'])

db = SQLAlchemy(app)