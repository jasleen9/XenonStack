import os
from flask import Flask

from flask_restful import Resource, Api
from flask_jwt_extended import JWTManager

from flask_security import Security, SQLAlchemySessionUserDatastore, SQLAlchemyUserDatastore

from application import config
from application.config import LocalDevelopmentConfig
from application.database import db

from application import workers

from application.models import User
from application.models import Role



import logging
logging.basicConfig(filename='debug.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')


app = None
api=None
jwt = None
celery = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    
    if os.getenv('ENV', "development") == "production":
      raise Exception("Currently no production config is setup.")
    
    else:
      app.logger.info("Staring Local Development.")
      print("Staring Local Development")
      app.config.from_object(LocalDevelopmentConfig)
    
    db.init_app(app)
    api= Api(app)
    jwt = JWTManager(app)
    app.app_context().push()
    
    celery = workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone=app.config['CELERY_TIMEZONE']
    )

    celery.Task = workers.ContextTask
    app.app_context().push()
    
    app.logger.info("App setup complete")
    # Setup Flask-Security
    user_datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    security = Security(app, user_datastore)
    
    return app , api , jwt , celery

app , api  ,jwt , celery = create_app()


import application.controllers.default
import application.controllers.api.auth
from application.controllers.api.show import ShowAPI , ShowListAPI , NewShowAPI 
from application.controllers.api.theatre import TheatreAPI , TheatreListAPI
from application.controllers.api.booking import UserBookingAPI , BookingAPI , UpdateBookingAPI , AllBookingAPI

api.add_resource(TheatreListAPI, "/api/theatre")     #get,post
api.add_resource(TheatreAPI , "/api/theatre/<int:id>")   #get,put,delete

api.add_resource(ShowListAPI, "/api/show")  #get
api.add_resource(ShowAPI , "/api/show/<int:id>")   #get,put,delete
api.add_resource(NewShowAPI , "/api/theatre/<int:theatre_id>/show")   #get,post

api.add_resource(UserBookingAPI , "/api/userbookings")     #get
api.add_resource(BookingAPI , "/api/book/show/<int:show_id>")    #get, post
api.add_resource(UpdateBookingAPI , "/api/add_rating/<int:id>")           #put
api.add_resource(AllBookingAPI, "/api/bookings")



if __name__ == '__main__':
  # Run the Flask app
  app.run(debug=True,host='0.0.0.0',port=8080)