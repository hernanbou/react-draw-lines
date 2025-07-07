from http import HTTPStatus

from flask import abort
from flask.views import MethodView
from flask_smorest import Blueprint

from backend.routes.auth.schemas import AuthLoginInput, AuthLoginOutput

auth = Blueprint('Auth', 'auth', url_prefix='/auth')


@auth.route('/login')
class AuthLoginResource(MethodView):
    @auth.arguments(AuthLoginInput)
    @auth.response(HTTPStatus.OK, AuthLoginOutput)
    def post(self, data):
        try:
            print('Auth Login Post')

            return {
                'message': 'Auth Login Post',
                'data': {'username': 'alfa', 'password': 'password'},
            }
        # try:
        except Exception as error:
            print(f'Exception occurred {error}')
            abort(HTTPStatus.INTERNAL_SERVER_ERROR, message='Unexpected Error')
