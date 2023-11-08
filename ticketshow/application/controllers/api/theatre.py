from flask import request, jsonify , make_response

from flask_restful import Resource, Api
from flask_restful import fields, marshal_with , abort
from flask_restful import reqparse
from application.database import db
from application.models import Theatre , Show , Booking
from flask import current_app as app
from flask_jwt_extended import jwt_required
from application.helpers import admin_required
from application.tasks import export_theatre_pdf, export_theatre_csv

import application.data_access as da


theatre_fields = {
    'id' : fields.Integer,
    'name': fields.String,
    'address': fields.String,
    'city': fields.String,
    'capacity': fields.Integer,
}

theatre_parser = reqparse.RequestParser()
theatre_parser.add_argument('name', type=str, required=True, help='Name of the venue is required')
theatre_parser.add_argument('address', type=str, required=True, help='Address of the venue is required')
theatre_parser.add_argument('city', type=str, required=True, help='City of the venue is required')
theatre_parser.add_argument('capacity', type=int, required=True, help='Capacity of the venue is required')

update_theatre_parser = reqparse.RequestParser()
update_theatre_parser.add_argument('name', type=str)
update_theatre_parser.add_argument('address', type=str)
update_theatre_parser.add_argument('city', type=str)
update_theatre_parser.add_argument('capacity', type=int)

search_theatre_parser = reqparse.RequestParser()
search_theatre_parser.add_argument('city', type=str, required=True, help='City of the venue is required')

class TheatreListAPI(Resource):
    
    @jwt_required()
    @marshal_with(theatre_fields)
    def get(self):
        #theatres = Theatre.query.all()
        theatres = da.get_all_theatres()
        return theatres , 200
        
        
        
    @admin_required()
    @marshal_with(theatre_fields)
    def post(self): 
        args = theatre_parser.parse_args()
        name = args.get("name")
        address = args.get("address")  
        city = args.get("city")
        capacity = args.get("capacity")
        
        if capacity <= 0 :
            abort(403, description="Capacity should be more than 0")
        else:
            pass
        
        theatre = Theatre(name=name, address=address, city=city, capacity=capacity)
        db.session.add(theatre)
        db.session.commit()
        da.cache.delete_memoized(da.get_all_theatres)
        return theatre , 201
        

class TheatreAPI(Resource):
    
    
    @marshal_with(theatre_fields)
    @jwt_required()
    def get(self, id):
        theatre = da.get_theatre_by_id(id)
        if theatre:
            return theatre , 200
        else:
            abort(404 , description="Theatre not found")
        
        
        
    
    @marshal_with(theatre_fields)
    @admin_required()
    def put(self, id):
        theatre = Theatre.query.get(id)
        if not theatre:
            abort(404 , description="Theatre not found")
        
        args = update_theatre_parser.parse_args()
        if args['capacity'] <=0 :
            abort(403, description="Capacity should be more than 0")
        else:
            new_capacity = args['capacity']
            if (theatre.capacity != new_capacity):
                for show in theatre.shows:
                    seats_booked = theatre.capacity - show.show_capacity
                    show.show_capacity = new_capacity - seats_booked
        theatre.name = args.get("name", theatre.name)
        theatre.address = args.get("address", theatre.address)  
        theatre.city = args.get("city", theatre.city)
        theatre.capacity = args.get("capacity", theatre.capacity)
        db.session.commit()
        da.cache.delete_memoized(da.get_all_theatres)
        da.cache.delete_memoized(da.get_shows_by_theatreid ,id)
        return theatre , 201
        
    
    @marshal_with(theatre_fields)
    @admin_required()
    def delete(self, id):
        
        theatre = Theatre.query.get(id)
        if not theatre:
            abort(404 , description="Theatre not found")
        
        # delete related booking and shows
        else:
            for show in theatre.shows:
                Booking.query.filter_by(show_id=show.id).delete()
                db.session.delete(show)
                
                
        db.session.delete(theatre)
        db.session.commit()
        da.cache.delete_memoized(da.get_all_theatres)
        da.cache.delete_memoized(da.get_shows_by_theatreid ,id)
        return {'message': 'Theatre deleted successfully'}, 200           
        

#for search 
@app.route('/api/search/theatres', methods=['GET'])
def search_theatres():
    city = request.args.get('city')

    if not city:
        abort(400 , description="city parameter required")
    else:
        city = city.lower()
    # Perform the database query to search for theaters based on the city
    theaters = Theatre.query.filter(Theatre.city.ilike(f'%{city}%')).all()

    # Convert the theaters to a list of dictionaries for JSON serialization
    theaters_data = [{"id": theatre.id, "name": theatre.name, "city": theatre.city} for theatre in theaters]

    return jsonify(theaters_data)



#--------------------------------------EXPORT JOB-------------------------------------------------------------------------------------------


@admin_required()
@app.route('/api/export_theatre_pdf/<int:theatre_id>', methods=['GET'])
def initiate_export_theatre_pdf(theatre_id):
    export_theatre_pdf.apply_async(args=[theatre_id])
    return jsonify(message=f"Export PDF task for theatre {theatre_id} initiated") , 200

@admin_required()
@app.route('/api/export_theatre_csv/<int:theatre_id>', methods=['GET'])
def initiate_export_theatre_csv(theatre_id):
    export_theatre_csv.apply_async(args=[theatre_id])
    return jsonify(message=f"Export CSV task for theatre {theatre_id} initiated") , 200