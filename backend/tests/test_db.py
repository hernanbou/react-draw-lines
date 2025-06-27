from dataclasses import asdict
from datetime import datetime

from database.models import User
from sqlalchemy import select
from sqlalchemy.orm import Session


def test_create_user(session: Session, mock_db_time):
    with mock_db_time(model=User, time=datetime.now()) as time:
        new_user = User(
            username='Alfa Sense',
            password='alfasense',
        )
        session.add(new_user)
        session.commit()

        user: User | None = session.scalar(
            select(User).where(User.username == 'Alfa Sense')
        )
        assert user is not None
        assert asdict(user) == {
            'id': 1,
            'username': 'Alfa Sense',
            'password': 'alfasense',
            'created_at': time,
            'updated_at': time,
        }
