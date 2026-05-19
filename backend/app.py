from flask import Flask, request
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config
from models import db, Comment

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return {
        "status": "success",
        "message": "Resume feedback API is running"
    }, 200

@app.route("/comments", methods=["POST"])
def create_comment():
    data = request.get_json()

    if not data:
        return {
            "status": "error",
            "message": "Request body is required"
        }, 400
    
    name = data.get("name")
    role = data.get("role")
    advice = data.get("advice")
    social_link = data.get("social_link")

    if not name:
        return {
            "status": "error",
            "message": "Name is required"
        }, 400
    
    if not advice:
        return {
            "status": "error",
            "message": "Advice is required"
        }, 400
    
    comment = Comment(
        name=name,
        role=role,
        advice=advice,
        social_link=social_link
    )
    db.session.add(comment)
    db.session.commit()

    return {
        "status": "success",
        "message": "Comment created successfully",
        "data": {
            "comment": comment.to_dict()
        }
    }, 201

@app.route("/comments", methods=["GET"])
def get_comment():

    comments = Comment.query.order_by(Comment.created_at.desc()).all()
    result = [comment.to_dict() for comment in comments]

    return {
        "status": "success",
        "message": "Comments fetched successfully",
        "data": {
            "comments": result
        }
    }, 200

@app.route("/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)

    if not comment:
        return {
            "status": "error",
            "message": "Comment not found"
        }, 404
    
    db.session.delete(comment)
    db.session.commit()

    return {
        "status": "success",
        "message": "Comment deleted successfully"
    }

@app.route("/comments/<int:comment_id>", methods=["PATCH"])
def update_comment(comment_id):
    comment = Comment.query.get(comment_id)

    if not comment:
        return {
            "status": "error",
            "message": "Comment not found"
        }, 404
    
    data = request.get_json()
    if not data:
        return {
            "status": "error",
            "message": "Request body is required"
        }, 400
    
    name = data.get("name")
    role = data.get("role")
    advice = data.get("advice")
    social_link = data.get("social_link")

    if name:
        comment.name = name
    if role:
        comment.role = role
    if advice:
        comment.advice = advice
    if social_link:
        comment.social_link = social_link

    db.session.commit()
    return {
        "status": "success",
        "message": "Comment is updated successfully",
        "data": {
            "comment": comment.to_dict()
        }
    }, 200

if __name__ == "__main__":
    app.run(debug=True, port=5001)
