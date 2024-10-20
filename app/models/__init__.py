from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, default=0)

class Competition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    player_one_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    player_two_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    unique_code = db.Column(db.String(50), unique=True, nullable=False)

    player_one = db.relationship('User', foreign_keys=[player_one_id])
    player_two = db.relationship('User', foreign_keys=[player_two_id])
