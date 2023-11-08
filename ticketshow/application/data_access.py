from flask import current_app
from application.models import *
from flask_caching import Cache
from datetime import datetime, date , timedelta
import calendar, traceback 

cache = Cache(current_app)
current_app.app_context().push()

@cache.memoize(10)
def get_all_theatres():
    theatres = Theatre.query.all()
    return theatres


@cache.memoize(10)
def get_theatre_by_id(theatre_id):
    theatre = Theatre.query.get(theatre_id)
    return theatre


@cache.memoize(10)
def get_shows_by_theatreid(theatre_id):
    theatre = Theatre.query.get(theatre_id)
    shows = theatre.shows
    return shows


@cache.memoize(10)
def get_bookings_by_user_id(user_id):
    user = User.query.get(user_id)
    return user.user_bookings






