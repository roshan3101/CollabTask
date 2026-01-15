from pydantic import ValidationError
from app.exceptions.exception import BadRequestException

class Validator:
    @staticmethod
    def validate_schema(schema_class, payload):
        try:
            validated = schema_class(**payload)
            return validated.dict()
        except ValidationError as e:
            raise BadRequestException(str(e))