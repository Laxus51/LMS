import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core import config

class ResponseTimeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000  # milliseconds

        # Add header
        response.headers["X-Response-Time"] = f"{process_time:.2f}ms"

        # Log only if enabled
        if config.LOG_RESPONSE_TIME:
            print(f"{request.method} {request.url.path} took {process_time:.2f}ms")

        return response
