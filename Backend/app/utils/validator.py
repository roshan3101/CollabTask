from pydantic import ValidationError
from app.exceptions.exception import BadRequestException, NotFoundException
import uuid
import re
from typing import Optional


class Validator:
    @staticmethod
    def validate_schema(schema_class, payload):
        try:
            validated = schema_class(**payload)
            return validated.dict()
        except ValidationError as e:
            raise BadRequestException(str(e))

    @staticmethod
    def validate_uuid(value: str, field_name: str = "ID") -> str:
        if not value or not isinstance(value, str):
            raise BadRequestException(f"Invalid {field_name}: must be a valid UUID string")
        
        value = value.strip()
        if not value:
            raise BadRequestException(f"Invalid {field_name}: cannot be empty")
        
        try:
            uuid.UUID(value)
            return value
        except ValueError:
            raise BadRequestException(f"Invalid {field_name}: must be a valid UUID format")

    @staticmethod
    def validate_non_empty_string(value: Optional[str], field_name: str, max_length: Optional[int] = None) -> str:
        if value is None:
            raise BadRequestException(f"{field_name} is required")
        
        if not isinstance(value, str):
            raise BadRequestException(f"{field_name} must be a string")
        
        value = value.strip()
        if not value:
            raise BadRequestException(f"{field_name} cannot be empty")
        
        if max_length and len(value) > max_length:
            raise BadRequestException(f"{field_name} exceeds maximum length of {max_length} characters")
        
        return value

    @staticmethod
    def validate_optional_string(value: Optional[str], field_name: str, max_length: Optional[int] = None) -> Optional[str]:
        if value is None:
            return None
        
        if not isinstance(value, str):
            raise BadRequestException(f"{field_name} must be a string")
        
        value = value.strip()
        if max_length and len(value) > max_length:
            raise BadRequestException(f"{field_name} exceeds maximum length of {max_length} characters")
        
        return value if value else None

    @staticmethod
    def validate_positive_integer(value: int, field_name: str, min_value: int = 1, max_value: Optional[int] = None) -> int:

        if not isinstance(value, int):
            raise BadRequestException(f"{field_name} must be an integer")
        
        if value < min_value:
            raise BadRequestException(f"{field_name} must be at least {min_value}")
        
        if max_value and value > max_value:
            raise BadRequestException(f"{field_name} must be at most {max_value}")
        
        return value

    @staticmethod
    def validate_enum(value: str, valid_values: list, field_name: str) -> str:

        if not isinstance(value, str):
            raise BadRequestException(f"{field_name} must be a string")
        
        value = value.strip().lower()
        if value not in [v.lower() for v in valid_values]:
            raise BadRequestException(
                f"Invalid {field_name}. Must be one of: {', '.join(valid_values)}"
            )
        
        # Return the original case value from valid_values
        for v in valid_values:
            if v.lower() == value:
                return v
        
        return value