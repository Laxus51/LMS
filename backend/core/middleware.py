import time
from datetime import datetime, timezone
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core import config
from core.logging_config import get_logger

logger = get_logger()

class ResponseTimeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000  # milliseconds

        # Add header (preserve existing functionality)
        response.headers["X-Response-Time"] = f"{process_time:.2f}ms"

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Structured logging for all requests
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "method": request.method,
            "path": str(request.url.path),
            "status_code": response.status_code,
            "process_time_ms": round(process_time, 2),
            "client_ip": client_ip,
            "query_params": str(request.url.query) if request.url.query else None,
            "user_agent": request.headers.get("user-agent", "unknown")
        }
        
        logger.info("Request processed", **log_data)

        # Legacy logging (preserve existing functionality)
        if config.LOG_RESPONSE_TIME:
            print(f"{request.method} {request.url.path} took {process_time:.2f}ms")

        return response
