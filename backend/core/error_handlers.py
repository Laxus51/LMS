# core/error_handlers.py
import traceback
from datetime import datetime, timezone
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from core.response import error_response
from core.logging_config import get_logger

logger = get_logger()


def _log_error(request: Request, status_code: int, error_message: str, stack_trace: str = None):
    """Log error with structured format."""
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    log_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "path": str(request.url.path),
        "method": request.method,
        "status_code": status_code,
        "error_message": error_message,
        "client_ip": client_ip,
        "query_params": str(request.url.query) if request.url.query else None,
        "user_agent": request.headers.get("user-agent", "unknown")
    }
    
    if stack_trace:
        log_data["stack_trace"] = stack_trace
    
    # Log as error for 5xx, warning for 4xx
    if status_code >= 500:
        logger.error("Server error occurred", **log_data)
    else:
        logger.warning("Client error occurred", **log_data)


def init_error_handlers(app):

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        # Log the HTTP exception
        _log_error(
            request=request,
            status_code=exc.status_code,
            error_message=exc.detail
        )
        
        # Return existing error response format
        return error_response(
            message=exc.detail,
            status_code=exc.status_code
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        error_msg = "Invalid request format"
        
        # Log the validation error
        _log_error(
            request=request,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_message=f"{error_msg}: {str(exc.errors())}"
        )
        
        # Return existing error response format
        return error_response(
            message=error_msg,
            status_code=status.HTTP_400_BAD_REQUEST,
            data=exc.errors()
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        error_msg = "An unexpected error occurred"
        stack_trace = traceback.format_exc()
        
        # Log the unexpected error with stack trace
        _log_error(
            request=request,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_message=f"{error_msg}: {str(exc)}",
            stack_trace=stack_trace
        )
        
        # Return existing error response format (preserve existing behavior)
        return error_response(
            message=error_msg,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
