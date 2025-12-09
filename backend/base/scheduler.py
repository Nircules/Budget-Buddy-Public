"""
Budget Reset Scheduler - Cross-platform solution using APScheduler
Works on Windows, Linux, and macOS
"""
from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
from django.conf import settings
import logging
import pytz

logger = logging.getLogger(__name__)


def reset_budgets_job():
    """
    Job function that runs the reset_budgets management command
    This will be executed daily at midnight
    """
    try:
        logger.info("Running scheduled budget reset...")
        call_command('reset_budgets')
        logger.info("Budget reset completed successfully")
    except Exception as e:
        logger.error(f"Error running budget reset: {e}")


def start_scheduler():
    """
    Initialize and start the APScheduler
    Runs daily at midnight (00:00) Israel Time
    """
    israel_tz = pytz.timezone('Asia/Jerusalem')
    scheduler = BackgroundScheduler(timezone=israel_tz)

    # Schedule the job to run every day at midnight Israel Time
    scheduler.add_job(
        reset_budgets_job,
        'cron',
        hour=0,
        minute=0,
        timezone=israel_tz,
        id='reset_budgets_daily',
        replace_existing=True
    )

    scheduler.start()
    logger.info(
        "Budget reset scheduler started - will run daily at midnight Israel Time (Asia/Jerusalem)")
