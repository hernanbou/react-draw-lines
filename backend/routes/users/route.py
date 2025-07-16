from http import HTTPStatus

from flask.views import MethodView
from flask_smorest import Blueprint, abort

from backend.routes.users.schemas import UsersResponseFieldsArray

users = Blueprint('Users', 'users', url_prefix='/users')


@users.route('/')
class UsersRootResource(MethodView):
    @users.response(HTTPStatus.OK, UsersResponseFieldsArray)
    def get(self):
        try:
            print('User Get')
        except Exception as error:
            print(f'Exception occurred {error}')
            abort(HTTPStatus.INTERNAL_SERVER_ERROR, message='Unexpected Error')
