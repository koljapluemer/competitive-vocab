from flask import Blueprint, redirect, url_for
from flask_dance.contrib.github import make_github_blueprint, github
from app.models import db, User
from flask_login import login_user, logout_user, current_user, login_required

auth = Blueprint('auth', __name__)

# Setup GitHub OAuth
github_bp = make_github_blueprint(client_id='GITHUB_CLIENT_ID', client_secret='GITHUB_SECRET')
auth.register_blueprint(github_bp, url_prefix='/github_login')

@auth.route("/login")
def login():
    if not github.authorized:
        return redirect(url_for("github.login"))
    
    resp = github.get("/user")
    assert resp.ok, resp.text
    github_info = resp.json()

    # Use GitHub ID as a unique identifier
    user = User.query.filter_by(github_id=github_info["id"]).first()
    if not user:
        user = User(github_id=github_info["id"], username=github_info["login"], score=0)
        db.session.add(user)
        db.session.commit()

    login_user(user)
    return redirect(url_for("main.home"))

@auth.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("main.home"))
