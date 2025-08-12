# core/response.py

from fastapi.responses import JSONResponse

def success_response(data=None, message="Success", status_code=200):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "data": data,
            "message": message
        }
    )

def error_response(message="An error occurred", status_code=400, data=None):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "data": data,
            "message": message
        }
    )
