from http import HTTPStatus

from flask import abort
from flask.views import MethodView
from flask_smorest import Blueprint
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database.base import session
from backend.database.models import User
from backend.routes.auth.schemas import AuthLoginInput, AuthLoginOutput
from backend.shared.utils import verify_password_match

auth = Blueprint('Auth', 'auth', url_prefix='/auth')


@auth.route('/login')
class AuthLoginResource(MethodView):
    session: Session

    def __init__(self):
        self.session = next(session())

    @auth.arguments(AuthLoginInput)
    @auth.response(HTTPStatus.OK, AuthLoginOutput)
    def post(self, data):
        print('Auth Login Post', data)
        login_user = User(**data)

        found_user = self.session.scalar(
            select(User).where(
                User.username == login_user.username,
            )
        )
        if found_user is None:
            abort(
                HTTPStatus.UNAUTHORIZED, description='Usuário não encontrado'
            )

        if not verify_password_match(
            login_user=login_user, found_user=found_user
        ):
            abort(HTTPStatus.UNAUTHORIZED, description='Credênciais inválidas')
        return {
            'message': 'Usuário conectado com sucesso',
            'data': {
                'id': found_user.id,
                'username': found_user.username,
            },
        }
