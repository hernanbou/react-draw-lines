from uuid import UUID

from bcrypt import checkpw, gensalt, hashpw

from backend.database.models import User

UUID_SYSTEM_VERSION = 4


def hash_password(plain_password: str) -> str:
    plain_password_bytes = plain_password.encode('utf-8')

    return hashpw(password=plain_password_bytes, salt=gensalt()).decode(
        'utf-8'
    )


def verify_password_match(
    login_user: User,
    found_user: User,
) -> bool:
    login_user_password_bytes = login_user.password.encode('utf-8')
    found_user_password_bytes = found_user.password.encode('utf-8')
    return checkpw(
        password=login_user_password_bytes,
        hashed_password=found_user_password_bytes,
    )


def is_valid_uuidv4(uuid_string: str) -> bool:
    try:
        u = UUID(uuid_string)
        return u.version == UUID_SYSTEM_VERSION
    except (ValueError, AttributeError):
        return False
