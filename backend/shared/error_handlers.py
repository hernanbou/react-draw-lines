from collections import defaultdict
from http import HTTPStatus
from typing import Any

from flask import jsonify
from flask.typing import ResponseReturnValue
from webargs import ValidationError
from werkzeug.exceptions import HTTPException


def flatten_error_messages(errors: dict[str, Any]) -> dict[str, list[str]]:
    result: dict[str, set[str]] = defaultdict(set)

    for loc_errors in errors.values():
        if not isinstance(loc_errors, dict):
            continue

        for field, msgs in loc_errors.items():
            msgs_list = (
                [str(msg) for msg in msgs]
                if isinstance(msgs, list)
                else [str(msgs)]
            )
            result[field].update(msgs_list)

    return {k: sorted(v) for k, v in result.items()}


def unified_error_handler(error: Any) -> ResponseReturnValue:
    """Handler para validação, HTTPException e erros genéricos."""
    payload = {
        'code': HTTPStatus.INTERNAL_SERVER_ERROR,
        'status': 'Internal Server Error',
        'message': 'Unexpected error',
    }

    # 1. ValidationError (webargs)
    if isinstance(error, ValidationError):
        payload['code'] = HTTPStatus.UNPROCESSABLE_ENTITY
        payload['status'] = 'Unprocessable Entity'
        payload['message'] = (
            error.messages
            if isinstance(error.messages, str)
            else 'Validation failed'
        )

        # Tenta extrair mensagens
        if error.messages:
            if isinstance(error.messages, dict):
                payload['errors'] = flatten_error_messages(error.messages)
            elif isinstance(error.messages, list):
                payload['errors'] = {'_schema': error.messages}
            elif isinstance(error.messages, str):
                payload['errors'] = {'_schema': [error.messages]}
            else:
                payload['errors'] = {'_schema': ['Validation failed.']}

        return jsonify(payload), HTTPStatus.UNPROCESSABLE_ENTITY

    # 2. HTTP Exceptions (401, 403, 404, etc)
    if isinstance(error, HTTPException):
        code = (
            error.code
            if error.code is not None
            else HTTPStatus.INTERNAL_SERVER_ERROR
        )
        print(error.description)
        payload['code'] = code
        payload['status'] = error.name or 'HTTP Error'
        payload['message'] = error.description or str(error)

        return jsonify(payload), code

    # 3. Outros erros inesperados
    return jsonify(payload), HTTPStatus.INTERNAL_SERVER_ERROR
