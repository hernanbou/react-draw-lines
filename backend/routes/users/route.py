from http import HTTPStatus

from flask.views import MethodView
from flask_smorest import Blueprint, abort

users = Blueprint('Users', 'users', url_prefix='/users')


@users.route('/')
class UsersRootResource(MethodView):
    def get(self):
        try:
            print('User Get')
        except Exception as error:
            print(f'Exception occurred {error}')
            abort(HTTPStatus.INTERNAL_SERVER_ERROR, message='Unexpected Error')
