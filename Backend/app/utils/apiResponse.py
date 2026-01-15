def ApiResponse(success: bool, message: str, data: dict = None) -> dict:
    response = {
        "success": success,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return response