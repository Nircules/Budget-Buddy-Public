from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Expense, Budget


@receiver(pre_save, sender=Expense)
def store_old_expense_data(sender, instance, **kwargs):
    """
    Before updating an expense, store the old budget and amount
    so we can properly adjust budgets
    """
    if instance.pk:  # Only for updates, not new instances
        try:
            old_expense = Expense.objects.get(pk=instance.pk)
            instance._old_budget = old_expense.budget
            instance._old_amount = old_expense.amount
        except Expense.DoesNotExist:
            instance._old_budget = None
            instance._old_amount = None
    else:
        instance._old_budget = None
        instance._old_amount = None


@receiver(post_save, sender=Expense)
def update_budget_on_expense(sender, instance, created, **kwargs):
    """
    When an expense is created or updated, adjust the associated budget's remaining_amount
    """
    if created:
        # New expense - deduct from budget
        if instance.budget:
            budget = instance.budget
            budget.remaining_amount -= instance.amount
            budget.save()
    else:
        # Updated expense - handle budget changes
        old_budget = getattr(instance, '_old_budget', None)
        old_amount = getattr(instance, '_old_amount', None)

        # Case 1: Budget changed (moved from one budget to another or added/removed budget)
        if old_budget != instance.budget:
            # Add old amount back to old budget
            if old_budget:
                old_budget.remaining_amount += old_amount
                old_budget.save()

            # Deduct new amount from new budget
            if instance.budget:
                instance.budget.remaining_amount -= instance.amount
                instance.budget.save()

        # Case 2: Same budget, but amount changed
        elif instance.budget and old_amount != instance.amount:
            # Calculate the difference and adjust once
            difference = instance.amount - old_amount
            instance.budget.remaining_amount -= difference
            instance.budget.save()


@receiver(post_delete, sender=Expense)
def update_budget_on_expense_delete(sender, instance, **kwargs):
    """
    When an expense is deleted, add the amount back to the budget
    """
    if instance.budget:
        budget = instance.budget
        budget.remaining_amount += instance.amount
        budget.save()
