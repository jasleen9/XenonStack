from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from flask_login import login_manager

roles_users = db.Table('roles_users',
        db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
        db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))    

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    roles = db.relationship('Role', secondary=roles_users,backref=db.backref('users', lazy='dynamic'))  
    user_bookings = db.relationship('Booking', backref='user', lazy="subquery") #user.user_bookings will return a list of booking objects that are related to the user object

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Theatre(db.Model):
    __tablename__ = 'theatre'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    address = db.Column(db.String(256), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    shows = db.relationship('Show', backref='theatre', lazy="subquery")   #theatre.shows will return a list of show objects that are related to the theatre object
    

class Show(db.Model):
    __tablename__ = 'show'
    id = db.Column(db.Integer, primary_key=True)
    theatre_id = db.Column(db.Integer, db.ForeignKey('theatre.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    price = db.Column(db.Float, nullable=False)
    tags = db.Column(db.String(256), nullable=False)
    show_capacity = db.Column(db.Integer, nullable=False)
    show_bookings = db.relationship('Booking', backref='show', lazy="subquery")

class Booking(db.Model):
    __tablename__ = 'booking'
    id = db.Column(db.Integer, primary_key=True)
    show_id = db.Column(db.Integer, db.ForeignKey('show.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    booking_time = db.Column(db.DateTime, nullable=False, default=datetime.now)
    seats = db.Column(db.Integer, nullable=False)
    user_rating = db.Column(db.Integer, nullable=False)



