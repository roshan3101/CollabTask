class GeneralConstants:
    # Task statuses
    TASK_STATUSES = ["todo", "in_progress", "review", "done"]
    
    # Activity limits
    DEFAULT_ACTIVITY_LIMIT = 50
    ORG_ACTIVITY_LIMIT = 100
    
    # OTP
    OTP_LENGTH = 6
    OTP_MIN = 100000
    OTP_MAX = 999999

class ErrorMessages:
    # Task errors
    INVALID_STATUS = "Invalid status. Must be 'todo', 'in_progress', 'review', or 'done'."
    PROJECT_NOT_FOUND = "Project not found or archived."
    PROJECT_ARCHIVED = "This project has been archived and is no longer accessible."
    ASSIGNEE_NOT_FOUND = "Assignee not found."
    TASK_NOT_FOUND = "Task not found."
    TASK_NOT_IN_PROJECT = "Task does not belong to this project."
    TASK_MODIFIED = "Task has been modified by another user. Please refresh and try again."
    TASK_VERSION_MISMATCH = "Task version mismatch. The task has been updated by another user. Please refresh and try again."
    
    # User errors
    USER_EXISTS = "User with this email already exists."
    INVALID_CREDENTIALS = "Invalid email or password."
    USER_NOT_FOUND = "User not found."
    
    # Auth errors
    INVALID_OTP = "Invalid OTP."
    USER_NOT_AUTHENTICATED = "User not authenticated."
    INVALID_REFRESH_TOKEN = "Invalid refresh token."
    INVALID_TOKEN_TYPE = "Invalid token type."
    TOKEN_EXPIRED = "Token has expired."
    INVALID_TOKEN = "Invalid token."
    
    # Access errors
    NO_PROJECT_ACCESS = "You do not have access to this project."
    NO_ORG_MEMBERSHIP = "You are not a member of this organization."
    INSUFFICIENT_PERMISSIONS = "You do not have sufficient permissions to perform this action."
    MEMBERSHIP_REQUIRED = "Organization membership is required for this action."
    
    # Validation errors
    INVALID_UUID = "Invalid UUID format."
    INVALID_INPUT = "Invalid input provided."
    MISSING_REQUIRED_FIELD = "Required field is missing."
    FIELD_TOO_LONG = "Field exceeds maximum length."
    
    # General errors
    INTERNAL_ERROR = "An internal error occurred. Please try again later."