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

    name = data.get("name", "").strip()
    role = data.get("role", "").strip()
    advice = data.get("advice", "").strip()
    social_link = data.get("social_link", "").strip()

    if not name:
        return {
            "status": "error",
            "message": "Name is required"
        }, 400

    if len(name) < 2:
        return {
            "status": "error",
            "message": "Name must be at least 2 characters"
        }, 400

    if not advice:
        return {
            "status": "error",
            "message": "Advice is required"
        }, 400

    if len(advice) < 10:
        return {
            "status": "error",
            "message": "Advice must be at least 10 characters"
        }, 400

    if social_link and not social_link.startswith(("http://", "https://")):
        return {
            "status": "error",
            "message": "Social link must start with http:// or https://"
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

    if "name" in data:
        name = data.get("name", "").strip()

        if not name:
            return {
                "status": "error",
                "message": "Name cannot be empty"
            }, 400

        if len(name) < 2:
            return {
                "status": "error",
                "message": "Name must be at least 2 characters"
            }, 400

        comment.name = name

    if "role" in data:
        comment.role = data.get("role", "").strip()

    if "advice" in data:
        advice = data.get("advice", "").strip()

        if not advice:
            return {
                "status": "error",
                "message": "Advice cannot be empty"
            }, 400

        if len(advice) < 10:
            return {
                "status": "error",
                "message": "Advice must be at least 10 characters"
            }, 400

        comment.advice = advice

    if "social_link" in data:
        social_link = data.get("social_link", "").strip()

        if social_link and not social_link.startswith(("http://", "https://")):
            return {
                "status": "error",
                "message": "Social link must start with http:// or https://"
            }, 400

        comment.social_link = social_link

    db.session.commit()

    return {
        "status": "success",
        "message": "Comment updated successfully",
        "data": {
            "comment": comment.to_dict()
        }
    }, 200

if __name__ == "__main__":
    app.run(debug=True, port=5001)
