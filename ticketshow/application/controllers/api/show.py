from flask import current_app as app
from flask import request , jsonify
from sqlalchemy import create_engine

from flask_restful import Resource, Api , abort
from flask_restful import fields, marshal_with
from flask_restful import reqparse
from application.database import db
from application.models import Show , Theatre
from datetime import datetime
from flask_jwt_extended import jwt_required
from application.helpers import admin_required 

import application.data_access as da

DATETIME_FORMAT = "%Y-%m-%dT%H:%M"  #To be written like this : "2023-07-19T14:30"

show_fields = {
    'id': fields.Integer,
    'theatre_id': fields.Integer,
    'name': fields.String,
    'rating': fields.Float,
    'start_time': fields.String,
    'end_time': fields.String,
    'price': fields.Float,
    'tags': fields.String,
    'show_capacity' : fields.Integer
}

show_parser = reqparse.RequestParser()
#show_parser.add_argument('theatre_id', type=int, required=True)
show_parser.add_argument('name', type=str, required=True)
#show_parser.add_argument('rating', type=float)
show_parser.add_argument('start_time', type=lambda x: datetime.strptime(x, DATETIME_FORMAT), required=True , help='Start time should be in the format %Y-%m-%dT%H:%M')
show_parser.add_argument('end_time', type=lambda x: datetime.strptime(x, DATETIME_FORMAT), required=True , help='End time should be in the format %Y-%m-%dT%H:%M')
show_parser.add_argument('price', type=float, required=True)
show_parser.add_argument('tags', type=str, required=True , help='Write all tags with commas in between')

update_show_parser = reqparse.RequestParser()
#update_show_parser.add_argument('theatre_id', type=int, required=True)
update_show_parser.add_argument('name', type=str, required=True)
update_show_parser.add_argument('start_time', type=lambda x: datetime.strptime(x, DATETIME_FORMAT), required=True , help='Start time should be in the format %Y-%m-%dT%H:%M')
update_show_parser.add_argument('end_time', type=lambda x: datetime.strptime(x, DATETIME_FORMAT), required=True , help='End time should be in the format %Y-%m-%dT%H:%M')
update_show_parser.add_argument('price', type=float, required=True)
update_show_parser.add_argument('tags', type=str, required=True , help='Write all tags with commas in between')

search_show_parser = reqparse.RequestParser()
search_show_parser.add_argument('tags', type=str, required=True , help='Enter a tag to search')


# get all shows
class ShowListAPI(Resource):
    @marshal_with(show_fields)
    @jwt_required()
    def get(self):
        shows = Show.query.all()
        return shows , 200


class NewShowAPI(Resource):
    
    @marshal_with(show_fields)
    @jwt_required()
    # to get shows of a specific theatre
    def get(self , theatre_id):
        theatre = Theatre.query.get(theatre_id)
        if theatre:
            shows = da.get_shows_by_theatreid(theatre_id)
            return shows , 200
        else:
            abort(404, description="Theatre does not exist")

    
    
    
    
    @marshal_with(show_fields)
    @admin_required()
    # to create new show in a specific theatre
    def post(self , theatre_id):
        args = show_parser.parse_args()
        theatre = Theatre.query.get(theatre_id)
        if not theatre:
            abort(404, description="Theatre Not Found")
        else:
            total_seats = theatre.capacity
        
        if args['end_time'] <= args['start_time']:
            abort(403, description="show end time must be after start time")        
        if args['start_time'] < datetime.now():
            abort(403, description="show start time must be after current time")            
        #check if show overlaps with existing show
        c1 = Show.query.filter(Show.theatre_id == theatre_id, Show.start_time <= args['start_time'], Show.end_time >= args['start_time']).first()
        c2 = Show.query.filter(Show.theatre_id == theatre_id, Show.start_time <= args['end_time'], Show.end_time >= args['end_time']).first()
        c3 = Show.query.filter(Show.theatre_id == theatre_id, Show.start_time >= args['start_time'], Show.end_time <= args['end_time']).first()
        c4 = Show.query.filter(Show.theatre_id == theatre_id, Show.start_time <= args['start_time'], Show.end_time >= args['end_time']).first()
        if c1 or c2 or c3 or c4:
            abort(403, description="Show overlaps with another show")
        
        if args['price']<0:
            abort(403, description="Price cannot be negative")
        
        # Split the tags string into individual tags using commas as separators
        tags_list = [tag.strip() for tag in args['tags'].split(',')]
        # Join the tags back into a comma-separated string
        args['tags'] = ', '.join(tags_list)
        
        show = Show(theatre_id =theatre_id,  name= args['name'] , rating = 0, start_time = args['start_time'] , end_time = args['end_time'] , price = args['price'] , tags = args['tags'] , show_capacity = total_seats)
        db.session.add(show)
        db.session.commit()
        da.cache.delete_memoized(da.get_shows_by_theatreid, theatre_id)
        da.cache.delete_memoized(da.get_all_theatres)
        return show , 201


       
        
class ShowAPI(Resource):
    @jwt_required()
    #to get show with specific id
    @marshal_with(show_fields)
    def get(self, id):
        show = Show.query.get(id)
        if not show:
            abort(404, description="Show not Found" )
        return show , 200

        
    
    @marshal_with(show_fields)
    @admin_required()
    # to create new show in a specific theatre
    def put(self , id):
        args = update_show_parser.parse_args()
        show = Show.query.get(id)
        if not show:
            abort(404, description="Show does not exist")

        if args['end_time'] <= args['start_time']:
            abort(403, description="show end time must be after start time")        
        if args['start_time'] < datetime.now():
            abort(403, description="show start time must be after current time")            
        #check if show overlaps with existing show
        c1 = Show.query.filter(Show.theatre_id == show.id, Show.id != id , Show.start_time <= args['start_time'], Show.end_time >= args['start_time']).first()
        c2 = Show.query.filter(Show.theatre_id == show.id, Show.id != id,Show.start_time <= args['end_time'], Show.end_time >= args['end_time']).first()
        c3 = Show.query.filter(Show.theatre_id == show.id, Show.id != id, Show.start_time >= args['start_time'], Show.end_time <= args['end_time']).first()
        c4 = Show.query.filter(Show.theatre_id == show.id,  Show.id != id, Show.start_time <= args['start_time'], Show.end_time >= args['end_time']).first()
        if c1 or c2 or c3 or c4:
            abort(403, description="Show overlaps with another show")
        
        if args['price']<0:
            abort(403, description="Price cannot be negative")
        
        # Split the tags string into individual tags using commas as separators
        tags_list = [tag.strip() for tag in args['tags'].split(',')]
        # Join the tags back into a comma-separated string
        args['tags'] = ', '.join(tags_list)
        show.name = args.get("name", show.name)
        show.start_time = args.get("start_time", show.start_time)  
        show.end_time = args.get("end_time", show.end_time)
        show.price = args.get("price", show.price)
        show.tags = args.get("tags" , show.tags) 
        theatre_id = show.theatre_id           
        db.session.commit()
        da.cache.delete_memoized(da.get_shows_by_theatreid , theatre_id )
        da.cache.delete_memoized(da.get_all_theatres)
        return show , 201
        
        
    @admin_required() 
    def delete(self, id):
        show = Show.query.get(id)
        if not show:
            abort(404, description="Show not found!")
        
        theatre_id = show.theatre_id
        for booking in show.show_bookings:
           db.session.delete(booking)
        
        db.session.delete(show)
        db.session.commit()
        da.cache.delete_memoized(da.get_shows_by_theatreid, theatre_id)
        da.cache.delete_memoized(da.get_all_theatres)
        return {'message': 'Show deleted successfully'}, 200  
        
            



@app.route('/api/search/shows', methods=['GET'])
def search_shows_by_tag():
    tag = request.args.get('tag')
    
    if tag:
        shows = Show.query.filter(Show.tags.contains(tag)).all()
        result = [{"id": show.id, "name": show.name, "tags": show.tags.split(', ')} for show in shows]
        
        return jsonify(result)
    else:
        return jsonify([])