from flask import Blueprint, render_template, redirect, request, url_for, flash
from app.models import db, User, Competition
from flask_login import login_required, current_user
import random, string

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('home.html')

@login_required
@main.route('/create_competition', methods=['GET', 'POST'])
def create_competition():
    if request.method == 'POST':
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        competition = Competition(player_one=current_user, unique_code=code)
        db.session.add(competition)
        db.session.commit()
        return render_template('create_competition.html', code=code)
    return render_template('create_competition.html')

@login_required
@main.route('/join_competition', methods=['GET', 'POST'])
def join_competition():
    if request.method == 'POST':
        code = request.form.get('code')
        competition = Competition.query.filter_by(unique_code=code).first()
        if competition and competition.player_two is None:
            competition.player_two = current_user
            db.session.commit()
            return redirect(url_for('main.play_game', competition_id=competition.id))
        flash('Invalid code or competition full.')
    return render_template('join_competition.html')

