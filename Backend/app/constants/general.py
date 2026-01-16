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
    INVALID_STATUS = "Invalid status. Must be 'todo', 'in_progress', 'review', or 'done'."
    PROJECT_NOT_FOUND = "Project not found or archived."
    ASSIGNEE_NOT_FOUND = "Assignee not found."
    TASK_NOT_FOUND = "Task not found."
    TASK_MODIFIED = "Task has been modified by another user. Please refresh and try again."
    USER_EXISTS = "User with this email already exists."
    INVALID_CREDENTIALS = "Invalid email or password."
    USER_NOT_FOUND = "User not found."
    INVALID_OTP = "Invalid OTP."
    USER_NOT_AUTHENTICATED = "User not authenticated."
    INVALID_REFRESH_TOKEN = "Invalid refresh token."
    INVALID_TOKEN_TYPE = "Invalid token type."
    TOKEN_EXPIRED = "Token has expired."
    INVALID_TOKEN = "Invalid token."
    NO_PROJECT_ACCESS = "You do not have access to this project."