from app import create_app, models

app = create_app('development')  # Or 'production' when deploying

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Initialize the database if it doesn't exist
    app.run(debug=True)
