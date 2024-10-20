from flask import Flask
from config import config  # Import the config dictionary


from flask import Flask
from app.models import db
from flask_login import LoginManager

def create_app(config_name):
    app = Flask(__name__)
    # app.config.from_object(f'config.{config_name}')
    app.config.from_object(config[config_name]) 

    # Initialize extensions
    db.init_app(app)
    login_manager = LoginManager(app)
    login_manager.login_view = 'auth.login'

    from app.auth.routes import auth
    from app.main.routes import main

    # Register the user_loader function for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))  # Load user from the database by ID

    # Register Blueprints
    app.register_blueprint(auth)
    app.register_blueprint(main)

    return app


