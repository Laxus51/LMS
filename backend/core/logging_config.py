"""Logging configuration using loguru for structured JSON logs."""

import sys
from pathlib import Path
from loguru import logger


def setup_logging():
    """Configure loguru for structured JSON logging."""
    
    # Remove default handler
    logger.remove()
    
    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Add stdout handler for development with JSON format
    logger.add(
        sys.stdout,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} | {message}",
        level="INFO",
        serialize=True,  # JSON format
        colorize=False,
        backtrace=True,
        diagnose=True
    )
    
    # Add file handler with rotation and JSON format
    log_file_path = logs_dir / "app.log"
    logger.add(
        str(log_file_path),
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} | {message}",
        level="INFO",
        serialize=True,  # JSON format
        rotation="1 day",  # Rotate daily
        retention="7 days",  # Keep logs for 7 days
        compression="zip",  # Compress old logs
        backtrace=True,
        diagnose=True
    )
    
    # Log configuration complete
    
    logger.info("Logging configuration initialized")


def get_logger():
    """Get the configured logger instance."""
    setup_logging()
    return logger