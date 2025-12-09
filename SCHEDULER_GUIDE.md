0# Budget Reset Scheduler - Setup Guide

## 🎯 What This Does

Automatically resets user budgets every day at midnight (00:00) for users whose `pay_day` matches the current date.

## ✅ Cross-Platform Solution

Works on **Windows**, **Linux**, and **macOS** using APScheduler - no OS-specific configuration needed!

## 📦 What Was Installed

-   **APScheduler 3.10.4** - Python scheduling library that works everywhere

## 📁 Files Created/Modified

1. **`base/scheduler.py`** - Contains the scheduling logic
2. **`base/apps.py`** - Modified to start scheduler when Django starts
3. **`backend/settings.py`** - Updated INSTALLED_APPS to use BaseConfig
4. **`requirements.txt`** - Added APScheduler dependency

## 🚀 How It Works

1. When you run `python manage.py runserver`, Django calls `BaseConfig.ready()`
2. `ready()` starts the APScheduler in the background
3. APScheduler runs `reset_budgets` management command every day at midnight
4. The command checks all users and resets budgets for those whose `pay_day` is today

## 🧪 Testing the Scheduler

### Test the management command manually:

```bash
python manage.py reset_budgets
```

### Test the scheduler:

```bash
# Start the Django server - scheduler starts automatically
python manage.py runserver
```

You should see in the console:

```
Budget reset scheduler started - will run daily at midnight
```

### Force run the scheduled job (for testing):

```python
# In Django shell
python manage.py shell

from base.scheduler import reset_budgets_job
reset_budgets_job()  # Runs immediately
```

## 📅 Scheduling Details

-   **Frequency**: Daily at 00:00 (midnight)
-   **Timezone**: Uses Django's TIME_ZONE setting (currently UTC)
-   **Persistence**: Runs in memory - starts when server starts

## 🔧 Customization

### Change the time (edit `base/scheduler.py`):

```python
scheduler.add_job(
    reset_budgets_job,
    'cron',
    hour=2,      # 2 AM instead of midnight
    minute=30,   # At 2:30 AM
    id='reset_budgets_daily',
    replace_existing=True
)
```

### Run multiple times per day:

```python
# Run every 6 hours
scheduler.add_job(
    reset_budgets_job,
    'interval',
    hours=6,
    id='reset_budgets_6h',
    replace_existing=True
)
```

## 🌍 Production Deployment

### Option 1: Keep APScheduler (Recommended for simplicity)

-   Works everywhere
-   No additional setup needed
-   Runs inside Django process

### Option 2: Use system scheduler + Django command

If you prefer OS-level scheduling:

**Linux/macOS (cron)**:

```bash
0 0 * * * cd /path/to/backend && /path/to/python manage.py reset_budgets
```

**Windows (Task Scheduler)**:

```powershell
$action = New-ScheduledTaskAction -Execute "python.exe" -Argument "manage.py reset_budgets" -WorkingDirectory "C:\path\to\backend"
$trigger = New-ScheduledTaskTrigger -Daily -At "00:00"
Register-ScheduledTask -TaskName "ResetBudgets" -Action $action -Trigger $trigger
```

## ⚠️ Important Notes

1. **Timezone**: Make sure `TIME_ZONE` in settings.py matches your users' timezone
2. **Multiple Workers**: If using Gunicorn with multiple workers, only one worker should run the scheduler (use `--preload` flag)
3. **Migrations/Tests**: Scheduler only runs during `runserver` or `gunicorn`, not during migrations or tests

## 🎉 You're All Set!

The scheduler is now ready. Just run your Django server normally and budgets will reset automatically every midnight!
