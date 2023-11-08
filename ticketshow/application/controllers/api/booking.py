from flask_restful import Resource, Api
from flask_restful import fields, marshal_with
from flask_restful import reqparse
from flask import make_response , jsonify
from application.database import db
from application.models import Theatre , Show , Booking , User
from flask import current_app as app
from datetime import datetime

from flask_jwt_extended import jwt_required, get_jwt_identity ######
from traceback import print_exc
from flask_restful import abort
from application.helpers import admin_required

import application.data_access as da
from time import perf_counter_ns

from werkzeug.exceptions import HTTPException

booking_fields = {
    'id': fields.Integer,
    'show_id': fields.Integer,
    'user_id': fields.Integer,
    'booking_time': fields.String,  # We'll format the datetime for output
    'seats': fields.Integer,
    'user_rating': fields.Integer
}

# Define the request parser for POST method
booking_parser = reqparse.RequestParser()
#booking_parser.add_argument('show_id', type=int, required=True)
#booking_parser.add_argument('user_id', type=int, required=True)
booking_parser.add_argument('seats', type=int, required=True)
#booking_parser.add_argument('user_rating', type=int)

update_booking_parser = reqparse.RequestParser()
update_booking_parser.add_argument('user_rating', type=int , help='rating must be between 1 - 5')


#get method for shows of particular user

class UserBookingAPI(Resource):
    @jwt_required()     ######
    @marshal_with(booking_fields)
    def get(self):
        user_id = get_jwt_identity()      ######      
        user = User.query.get(user_id)
        if not user:
            abort(404 , description="User not found")
        else:
            start = perf_counter_ns()
            user_bookings = da.get_bookings_by_user_id(user_id)
            stop = perf_counter_ns()
            print("time taken :" , stop - start)
            return user_bookings , 200
        
        
        
class AllBookingAPI(Resource):
    @jwt_required()     ######
    @marshal_with(booking_fields)
    def get(self):
        bookings = Booking.query.all()      ######      
        return bookings , 200
        
          
# GET method for new booking

class BookingAPI(Resource):
    @jwt_required()       ######
    @marshal_with(booking_fields)
    def post(self,show_id):
        #try:
        user_id = get_jwt_identity()    ######
        args = booking_parser.parse_args()
        
        if not (User.query.get(user_id)):
            abort(404 , description="User not found")
        
        show = Show.query.get(show_id)
        #show = da.get_show_by_show_id(show_id)
        if not show:
            abort(404, description="Show not found")
        
        if show.show_capacity == 0 :
            abort(403 , description="Housefull!")
        elif show.show_capacity < args['seats']:
            abort(403 , description="Enough seats not available!")
        else:
            show.show_capacity = show.show_capacity - args['seats']
        
        booking = Booking(show_id=show_id,user_id=user_id, booking_time=datetime.now() , seats = args['seats'] , user_rating = 0)
        db.session.add(booking)
        db.session.commit()
        da.cache.delete_memoized(da.get_bookings_by_user_id , user_id)
        da.cache.delete_memoized(da.get_shows_by_theatreid , show.theatre_id)
        return booking
        
 

class UpdateBookingAPI(Resource):
    @marshal_with(booking_fields)
    @jwt_required()
    def put(self, id):
        user_id = get_jwt_identity()
        booking = Booking.query.get(id)
        if not booking:
            abort(404 , description="Booking not found")

        args = update_booking_parser.parse_args()
    
        # Update user_rating if provided
        if 'user_rating' in args:
            booking.user_rating = args['user_rating']

            # Update the average rating for the show
            bookings = Booking.query.filter_by(show_id=booking.show_id).all()
            show = Show.query.get(booking.show_id)

            if not bookings:
                #show = Show.query.get(booking.show_id)
                show.rating =0.0
            else:
                total_rating = sum(booking.user_rating for booking in bookings)
                average_rating = total_rating / len(bookings)

                #show = Show.query.get(booking.show_id)
                show.rating = average_rating

            db.session.commit()
            da.cache.delete_memoized(da.get_bookings_by_user_id , user_id)
            da.cache.delete_memoized(da.get_shows_by_theatreid , show.theatre_id)
            

        return booking 


