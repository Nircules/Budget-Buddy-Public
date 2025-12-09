from django.apps import AppConfig


class BaseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "base"

    def ready(self):
        """
        Called when Django starts
        This is where we initialize the scheduler
        """
        import base.signals  # Import signals to register them

        # Only start scheduler in production or when running the server
        # Avoid starting it during migrations, tests, etc.
        import sys
        if 'runserver' in sys.argv or 'gunicorn' in sys.argv[0]:
            from base.scheduler import start_scheduler
            start_scheduler()
