from http import HTTPStatus
from typing import Any, DefaultDict

from flask import jsonify
from webargs import ValidationError


def flatten_error_messages(errors: dict[str, Any]) -> dict[str, list[str]]:
    result: dict[str, set[str]] = DefaultDict(set)

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


def custom_error_handler(error: ValidationError):
    data = getattr(error, 'data', {}) or {}

    code = getattr(error, 'code', HTTPStatus.INTERNAL_SERVER_ERROR)
    status = getattr(error, 'name', HTTPStatus.INTERNAL_SERVER_ERROR.phrase)

    payload = {
        'code': code,
        'status': status,
    }

    if 'message' in data:
        payload['message'] = data['message']

    errors = data.get('errors') or data.get('messages')
    if not errors:
        return jsonify(payload), code

    if isinstance(errors, dict):
        payload['errors'] = flatten_error_messages(errors)
    else:
        payload['errors'] = [str(errors)]

    return jsonify(payload), code
