from django.core.management.base import BaseCommand
from django.utils import timezone
from base.models import Budget, UserProfile
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Reset budget remaining_amount for users whose pay_date is today'

    def handle(self, *args, **kwargs):
        # Get today's date in UTC+2 (Israel Time)
        utc_now = timezone.now()
        israel_time = utc_now + timedelta(hours=2)
        today = israel_time.date()
        today_day = today.day

        # Get all user profiles where pay_day matches today's day
        profiles = UserProfile.objects.filter(pay_day=str(today_day).zfill(2))

        reset_count = 0
        for profile in profiles:
            # Reset all budgets for this user
            budgets = Budget.objects.filter(user=profile.user)
            for budget in budgets:
                budget.remaining_amount = budget.amount
                budget.save()
                reset_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully reset {reset_count} budgets for {len(profiles)} users'
            )
        )
