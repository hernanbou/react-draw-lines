from http import HTTPStatus

from flask import abort
from flask.views import MethodView
from flask_smorest import Blueprint
from sqlalchemy.orm import Session

from backend.database.base import session
from backend.routes.users.schemas import (
    UserResponseFields,
    UsersResponseFieldsArray,
)
from backend.shared.utils import is_valid_uuidv4

users = Blueprint('Users', 'users', url_prefix='/users')


@users.route('/<user_id>')
class UsersById(MethodView):
    session: Session

    def __init__(self):
        self.session = next(session())

    @users.response(200, UserResponseFields)
    def get(self, user_id: str):
        if not is_valid_uuidv4(user_id):
            abort(
                HTTPStatus.BAD_REQUEST,
                # TODO -> ADICIONAR MULTILINGUAGEM
                description='O id do usuário deve ser do tipo UUID',
            )
        print(user_id)
        pass

    pass


@users.route('/')
class UsersRootResource(MethodView):
    @users.response(HTTPStatus.OK, UsersResponseFieldsArray)
    def get(self):
        try:
            print('User Get')
        except Exception as error:
            print(f'Exception occurred {error}')
            abort(HTTPStatus.INTERNAL_SERVER_ERROR, message='Unexpected Error')
